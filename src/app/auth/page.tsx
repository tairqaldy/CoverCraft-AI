
"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
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
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
       <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CoverCraft AI. All rights reserved.
      </p>
    </div>
  );
}

