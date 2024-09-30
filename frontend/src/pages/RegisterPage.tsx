import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { validateEmail, validatePassword } from "@/utils/validate";
import { sanitizeInput } from "@/utils/sanitize";
import { useAuth } from "@/providers/AuthProvider";

export const description =
  "A simple login form with email and password. The submit button says 'Sign in'.";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  let navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!validateEmail(sanitizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePassword(sanitizedPassword)) {
      toast.error(
        "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"
      );
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`http://10.0.0.216:5001/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: sanitizedPassword,
          user_id: userId,
        }),
      });
      if (!response.ok) {
        if (response.status === 400) {
          toast.error(
            "An account with this email is already created. Try to log in",
            {
              action: {
                label: "go to login",
                onClick: () => navigate("/login"),
              },
            }
          );
        }
        throw new Error("HTTP error " + response.status);
      }
      if (response.ok) {
        toast.success("Account created successfully! Please log in.");
        navigate("/login");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } catch (error: any) {
      console.error("Authentication error:", error.message);
    }
  };
  return (
    <div className="flex justify-center mt-40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>
            Enter your email below to create an account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2 mt-0.5">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full">Sign up</Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
