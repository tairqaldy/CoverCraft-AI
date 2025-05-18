
"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TestTube2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { activateSkipLogin } = useAuth();
  const router = useRouter();

  const handleSkipLogin = () => {
    activateSkipLogin();
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center space-y-6">
       <Link href="/" className="flex items-center text-foreground hover:text-primary transition-colors">
        <FileText className="mr-3 h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold">CoverCraft AI</h1>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Sign in or create an account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm />
          <Button variant="outline" className="w-full" onClick={handleSkipLogin}>
            <TestTube2 className="mr-2 h-4 w-4" />
            Skip Login for Testing
          </Button>
        </CardContent>
      </Card>
       <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CoverCraft AI. All rights reserved.
      </p>
    </div>
  );
}
