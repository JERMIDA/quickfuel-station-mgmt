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
import { Car, Fuel, ShieldCheck, Building } from "lucide-react";

type Role = "driver" | "operator" | "admin" | "station_owner";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("driver");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
    const savedIdentifier = localStorage.getItem("rememberedIdentifier");
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

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
          role: selectedRole,
          full_name: userInfo.name || "Google User",
          email: userInfo.email,
          phone: "",
        };
        login(userData, "mock-jwt-token");
        
        if (selectedRole === "admin") navigate("/admin");
        else if (selectedRole === "station_owner") navigate("/station-owner");
        else if (selectedRole === "operator") navigate("/operator");
        else navigate("/dashboard");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedRole, login, navigate]);

  const handleGoogleLogin = async () => {
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

  const handleSuccessfulLogin = (userData: any, token: string, role: string) => {
    if (rememberMe) {
      localStorage.setItem("rememberedIdentifier", identifier);
    } else {
      localStorage.removeItem("rememberedIdentifier");
    }
    login(userData, token);
    if (role === "admin") navigate("/admin");
    else if (role === "station_owner") navigate("/station-owner");
    else if (role === "operator") navigate("/operator");
    else navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formattedIdentifier = isEmail(identifier) ? identifier : formatPhone(identifier);

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
          // Fetch profile to get role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            // Fallback to selected role if profile doesn't exist
            const userData = {
              id: data.user.id,
              role: selectedRole,
              full_name: data.user.user_metadata?.full_name || "User",
              phone: identifier,
            };
            handleSuccessfulLogin(userData, data.session?.access_token || "", selectedRole);
          } else {
            const role = profile?.role || selectedRole;
            handleSuccessfulLogin(profile, data.session?.access_token || "", role);
          }
        }
        return;
      }

      if (isEmail(formattedIdentifier)) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formattedIdentifier,
          password: password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) console.error("Profile fetch error:", profileError);

          const userData = profile || {
            id: data.user.id,
            role: selectedRole,
            full_name: data.user.user_metadata?.full_name || "User",
            email: formattedIdentifier,
            phone: ""
          };

          const role = userData.role;
          handleSuccessfulLogin(userData, data.session?.access_token || "", role);
        }
      } else {
        // Phone login via OTP
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: formattedIdentifier,
        });

        if (otpError) throw otpError;
        setShowOtp(true);
      }
    } catch (error: any) {
      console.error("Login failed", error);
      
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
          role: selectedRole,
          full_name: "Demo User",
          ...(isEmail(formattedIdentifier) ? { email: formattedIdentifier, phone: "" } : { phone: formattedIdentifier }),
        };
        handleSuccessfulLogin(userData, "demo-jwt-token", selectedRole);
        return;
      }

      if (error.message === "Invalid login credentials") {
        setError("Invalid credentials. If you just registered, please check your email to verify your account, or ensure your password is correct.");
      } else {
        setError(error.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Select your role and enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {!showOtp && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("driver")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedRole === "driver"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 hover:border-amber-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Car className="mb-2" size={24} />
                <span className="text-xs font-medium">Driver</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("operator")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedRole === "operator"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 hover:border-amber-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Fuel className="mb-2" size={24} />
                <span className="text-xs font-medium">Operator</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("station_owner")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedRole === "station_owner"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 hover:border-amber-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Building className="mb-2" size={24} />
                <span className="text-xs font-medium">Owner</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  selectedRole === "admin"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 hover:border-amber-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <ShieldCheck className="mb-2" size={24} />
                <span className="text-xs font-medium">Admin</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            {!showOtp ? (
              <>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="identifier"
                  >
                    Phone Number or Email
                  </label>
                  <Input
                    id="identifier"
                    placeholder="e.g. +251911234567 or user@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={isEmail(identifier)}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-amber-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="otp">
                  Enter OTP sent to {identifier}
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
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : showOtp ? "Verify OTP" : "Login"}
          </Button>
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
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

          <Button 
            type="button" 
            variant="secondary" 
            className="w-full"
            onClick={() => {
              const userData = {
                id: "demo-user-1",
                role: selectedRole,
                full_name: "Demo User",
                email: "demo@example.com",
                phone: "+251911234567",
              };
              login(userData, "demo-jwt-token");
              if (selectedRole === "admin") navigate("/admin");
              else if (selectedRole === "station_owner") navigate("/station-owner");
              else if (selectedRole === "operator") navigate("/operator");
              else navigate("/dashboard");
            }}
          >
            Bypass Login (Demo Mode)
          </Button>

          <div className="text-sm text-center text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-amber-600 hover:underline font-medium"
            >
              Register
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
