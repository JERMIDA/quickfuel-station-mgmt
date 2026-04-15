import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { supabase } from "@/src/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/Card";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset failed", err);
      
      const isConfigError = !import.meta.env.VITE_SUPABASE_URL || 
                            err.message?.includes("URL") ||
                            err.message?.includes("fetch");
                            
      if (isConfigError) {
        setError("Supabase auth not fully configured. Cannot send reset email in Demo Mode.");
      } else {
        setError(err.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {success ? (
            <div className="p-4 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
              <p className="font-medium flex items-center gap-2">
                <Mail size={18} />
                Check your email
              </p>
              <p className="text-sm mt-1">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="email"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!success && (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          )}
          
          <div className="text-sm text-center text-slate-500">
            <Link
              to="/login"
              className="text-amber-600 hover:underline font-medium flex items-center justify-center gap-1"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
