import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/src/store/authStore";
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

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    identifier: "",
    password: "",
    confirmPassword: "",
    licenseCardId: "",
    vehiclePlateNo: "",
    vehicleMake: "",
    nationalId: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const isEmail = (val: string) => val.includes("@");

  const formatPhone = (phone: string) => {
    let cleaned = phone.replace(/[\s-]/g, '');
    if (cleaned.startsWith('0')) return '+251' + cleaned.substring(1);
    if (!cleaned.startsWith('+')) return '+' + cleaned.replace(/\D/g, '');
    return cleaned;
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const userInfo = event.data.user;
        const userData = {
          id: userInfo.id || "google-1",
          role: "driver" as const, // Default role for registration
          full_name: userInfo.name || "Google User",
          email: userInfo.email,
          phone: "",
        };
        login(userData, "mock-jwt-token");
        navigate("/dashboard");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login, navigate]);

  const handleGoogleRegister = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!showOtp && step === 1) {
      if (formData.identifier.includes("@") && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setStep(2);
      return;
    }

    if (!showOtp && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const formattedIdentifier = isEmail(formData.identifier) ? formData.identifier : formatPhone(formData.identifier);

    try {
      if (showOtp) {
        // Verify OTP
        const { data, error: otpError } = await supabase.auth.verifyOtp({
          phone: formattedIdentifier,
          token: otp,
          type: 'sms'
        });

        if (otpError) throw otpError;

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                full_name: formData.fullName, 
                role: 'driver',
                phone: formattedIdentifier,
                license_card_id: formData.licenseCardId,
                license_plate: formData.vehiclePlateNo,
                vehicle_make: formData.vehicleMake,
                national_id: formData.nationalId
              }
            ]);
          
          if (profileError) console.error("Profile creation error:", profileError);

          login({
            id: data.user.id,
            role: 'driver',
            full_name: formData.fullName,
            phone: formattedIdentifier,
            license_card_id: formData.licenseCardId,
            license_plate: formData.vehiclePlateNo,
            vehicle_make: formData.vehicleMake,
            national_id: formData.nationalId
          }, data.session?.access_token || "");
          
          navigate("/dashboard");
        }
        return;
      }
      
      if (isEmail(formattedIdentifier)) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formattedIdentifier,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: 'driver'
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Create profile record
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                full_name: formData.fullName, 
                role: 'driver',
                phone: "",
                license_card_id: formData.licenseCardId,
                license_plate: formData.vehiclePlateNo,
                vehicle_make: formData.vehicleMake,
                national_id: formData.nationalId
              }
            ]);
          
          if (profileError) console.error("Profile creation error:", profileError);

          setError("Registration successful! Please check your email for verification.");
          // For demo purposes, we might want to auto-login if email confirmation is disabled
          if (data.session) {
            login({
              id: data.user.id,
              role: 'driver',
              full_name: formData.fullName,
              email: formattedIdentifier,
              phone: "",
              license_card_id: formData.licenseCardId,
              license_plate: formData.vehiclePlateNo,
              vehicle_make: formData.vehicleMake,
              national_id: formData.nationalId
            }, data.session.access_token);
            navigate("/dashboard");
          }
        }
      } else {
        // Phone registration via OTP
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: formattedIdentifier,
        });

        if (otpError) throw otpError;
        setShowOtp(true);
      }
    } catch (error: any) {
      console.error("Registration failed", error);
      
      // Fallback for unconfigured Supabase projects (Demo Mode)
      const isConfigError = !import.meta.env.VITE_SUPABASE_URL || 
                            error.message?.includes("provider") || 
                            error.message?.includes("Twilio") ||
                            error.message?.includes("URL") ||
                            error.message?.includes("fetch");
                            
      if (error.message?.includes("Email logins are disabled") || error.message?.includes("Signups not allowed")) {
        setError("Email logins are disabled in your Supabase project. Please enable them in the Supabase dashboard (Authentication -> Providers -> Email).");
        setIsLoading(false);
        return;
      }
                            
      if (isConfigError) {
        console.warn("Supabase auth not fully configured. Falling back to Demo Mode.");
        const userData = {
          id: "demo-user-1",
          role: "driver" as const,
          full_name: formData.fullName || "Demo User",
          license_card_id: formData.licenseCardId,
          license_plate: formData.vehiclePlateNo,
          vehicle_make: formData.vehicleMake,
          national_id: formData.nationalId,
          ...(isEmail(formattedIdentifier) ? { email: formattedIdentifier, phone: "" } : { phone: formattedIdentifier }),
        };
        login(userData, "demo-jwt-token");
        navigate("/dashboard");
        return;
      }

      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          Create a new account to start using QuickFuel.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {!showOtp ? (
            <>
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="fullName"
                    >
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="identifier">
                      Phone Number or Email
                    </label>
                    <Input
                      id="identifier"
                      placeholder="e.g. +251911234567 or user@example.com"
                      value={formData.identifier}
                      onChange={(e) =>
                        setFormData({ ...formData, identifier: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={formData.identifier.includes("@")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium leading-none"
                      htmlFor="confirmPassword"
                    >
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      required={formData.identifier.includes("@")}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="nationalId">
                      National ID
                    </label>
                    <Input
                      id="nationalId"
                      placeholder="National ID Number"
                      value={formData.nationalId}
                      onChange={(e) =>
                        setFormData({ ...formData, nationalId: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="licenseCardId">
                      License Card ID
                    </label>
                    <Input
                      id="licenseCardId"
                      placeholder="License Card Number"
                      value={formData.licenseCardId}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseCardId: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="vehiclePlateNo">
                      Vehicle Plate Number
                    </label>
                    <Input
                      id="vehiclePlateNo"
                      placeholder="e.g. AA 12345"
                      value={formData.vehiclePlateNo}
                      onChange={(e) =>
                        setFormData({ ...formData, vehiclePlateNo: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="vehicleMake">
                      Vehicle Make & Model
                    </label>
                    <Input
                      id="vehicleMake"
                      placeholder="e.g. Toyota Corolla"
                      value={formData.vehicleMake}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicleMake: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="otp">
                Enter OTP sent to {formData.identifier}
              </label>
              <Input
                id="otp"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}
          {error && <p className={`text-sm ${error.includes("successful") ? "text-amber-600" : "text-red-500"}`}>{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!showOtp && step === 2 ? (
            <div className="flex gap-2 w-full">
              <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" className="w-2/3" disabled={isLoading}>
                {isLoading ? "Processing..." : "Register"}
              </Button>
            </div>
          ) : (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : showOtp ? "Verify OTP" : "Next"}
            </Button>
          )}

          {(!showOtp && step === 1) && (
            <>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or register with</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleRegister}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Google
              </Button>
            </>
          )}

          <div className="text-sm text-center text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-600 hover:underline font-medium"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
