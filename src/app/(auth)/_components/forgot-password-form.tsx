"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { requestPasswordReset } from "~/lib/auth-client";
import { AuthCard } from "./auth-card";
import { useAuthForm } from "~/hooks/use-auth-form";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { error, success, loading, formAction } = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await formAction(async () => {
      const result = await requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (result.error) {
        return { error: result.error };
      }
      return {
        successMessage: "If an account with that email exists, we've sent a password reset link.",
      };
    });
  };

  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email and we'll send you a link to reset your password."
      footerText="Remember your password?"
      footerLinkText="Login"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </AuthCard>
  );
}
