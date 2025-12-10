import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Please enter your full name"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/select-school" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const validation = signupSchema.safeParse({ email, password, fullName });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }
        toast.success("Account created successfully!");
        navigate("/select-school");
      } else {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }
        navigate("/select-school");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-10 text-sidebar-accent-foreground w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-lg text-primary-foreground">S</span>
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg">SEED Assist</h1>
              <p className="text-xs text-sidebar-foreground">Client Portal</p>
            </div>
          </div>

          {/* Center Content */}
          <div className="space-y-6 max-w-md">
            <div className="space-y-3">
              <h2 className="font-display text-3xl lg:text-4xl font-semibold leading-tight tracking-tight">
                Your Gateway to<br />
                <span className="text-primary">Global Education</span><br />
                Excellence
              </h2>
              <p className="text-sm text-sidebar-foreground leading-relaxed">
                Access comprehensive reports, track leads, manage scholarships, and derive holistic ROI insights — all in one powerful platform.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="space-y-0.5">
                <p className="text-2xl font-display font-semibold">110+</p>
                <p className="text-xs text-sidebar-foreground">Partner Universities</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-display font-semibold">35K+</p>
                <p className="text-xs text-sidebar-foreground">Students Helped</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-display font-semibold">8+</p>
                <p className="text-xs text-sidebar-foreground">Study Destinations</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-sidebar-foreground">
            Trusted by leading business schools worldwide
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-lg text-primary-foreground">S</span>
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg">SEED Assist</h1>
              <p className="text-xs text-muted-foreground">Client Portal</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-semibold">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Enter your details to create your account"
                : "Enter your credentials to access your dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9"
                      inputSize="lg"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    inputSize="lg"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  {!isSignUp && (
                    <Button variant="link" className="px-0 h-auto text-xs text-primary">
                      Forgot password?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Create a password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    inputSize="lg"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" disabled={loading} />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Keep me signed in for 30 days
                </Label>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="px-0.5 h-auto text-sm text-primary"
                  onClick={() => setIsSignUp(false)}
                  disabled={loading}
                >
                  Sign in
                </Button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="px-0.5 h-auto text-sm text-primary"
                  onClick={() => setIsSignUp(true)}
                  disabled={loading}
                >
                  Create one
                </Button>
              </>
            )}
          </p>

          <p className="text-center text-xs text-muted-foreground">
            By {isSignUp ? "signing up" : "signing in"}, you agree to our{" "}
            <Button variant="link" className="px-0 h-auto text-xs">Terms</Button>
            {" "}and{" "}
            <Button variant="link" className="px-0 h-auto text-xs">Privacy Policy</Button>
          </p>
        </div>
      </div>
    </div>
  );
}
