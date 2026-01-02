"use client";

import { createAuthClient } from "better-auth/react";
import { creemClient } from "@creem_io/better-auth/client";

export const { signIn, signUp, useSession, signOut, requestPasswordReset, resetPassword } =
  createAuthClient({
    plugins: [creemClient()],
  });
