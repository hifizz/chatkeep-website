"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { resetPassword } from "~/lib/auth-client";
import { AuthCard } from "./auth-card";
import { useAuthForm } from "~/hooks/use-auth-form";

function ResetPasswordFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { error, success, loading, formAction } = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // This is a client-side validation, so we can set error directly
      // without using formAction.
      alert("Passwords do not match."); // Or use a more sophisticated notification
      return;
    }

    if (!token) {
      alert("Invalid or missing reset token.");
      return;
    }

    await formAction(async () => {
      const result = await resetPassword({
        newPassword: password,
        token,
      });
      if (result.error) {
        return { error: result.error };
      }
      setTimeout(() => router.push("/login"), 3000);
      return {
        successMessage: "Your password has been reset successfully. You can now log in.",
      };
    });
  };

  return (
    <AuthCard
      title="Reset Password"
      description="Enter your new password below."
      footerText="Remember your password?"
      footerLinkText="Login"
      footerLinkHref="/login"
    >
      {success ? (
        <div className="text-center text-green-500">
          <p>{success}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormComponent />
    </Suspense>
  );
}
