"use server";

import { auth, db } from "@/firebase/admin";
import { error } from "console";
import { cookies } from "next/headers";
import { use } from "react";

const ONE_WEEK = 60 * 60 * 24 * 7; // 7 days

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead.",
      };
    }

    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    return {
      success: true,
      message: "User created successfully. You can now sign in.",
    };
  } catch (e: any) {
    console.error("Error creating a user:", e);

    if (e.code === "auth/email-already-exists") {
      return {
        sucess: false,
        message: "Email already exists. Please try another email.",
      };
    }

    return {
      success: false,
      message:
        "An error occurred while creating the user. Please try again later.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User not found. Create an account instead.",
      };
    }

    await setSessionCookies(idToken);
  } catch (e: any) {
    console.log(e);

    return {
      success: false,
      message: "An error occurred while signing in. Please try again later.",
    };
  }
}

export async function setSessionCookies(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) {
      return null;
    }
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (e: any) {
    console.log(e);

    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}
