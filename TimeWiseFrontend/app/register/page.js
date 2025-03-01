"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/components/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Lock, Eye, EyeOff, RefreshCcw } from "lucide-react";

const steps = [
  { id: 1, title: "Basic Info", description: "Personal details" },
  { id: 2, title: "Account Setup", description: "Security details" },
  { id: 3, title: "Verification", description: "Email verification" },
];

const formSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().optional(),
  biodata: z.string().optional(),
  verificationCode: z.string().optional(),
});

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isCodeRequested, setIsCodeRequested] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      biodata: "",
      verificationCode: "",
    },
  });

  const validatePassword = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
    return {
      score: Object.values(criteria).filter(Boolean).length * 20,
      criteria,
    };
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 20) return "bg-destructive";
    if (score <= 40) return "bg-orange-500";
    if (score <= 60) return "bg-yellow-500";
    if (score <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleNextStep = async () => {
    const currentFields = getCurrentStepFields();
    const isValid = await form.trigger(currentFields);

    if (isValid) {
      if (currentStep == 2) {
        handleVerificationCodeRequest();
      }
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 1:
        return ["name", "email"];
      case 2:
        return ["password", "role", "biodata"];
      case 3:
        return ["verificationCode"];
      default:
        return [];
    }
  };

  const handleVerificationCodeRequest = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/no-auth/register/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: form.getValues("name"),
          userEmail: form.getValues("email"),
          password: form.getValues("password"),
          shortBiodata: form.getValues("biodata"),
          role: form.getValues("role"),
          userStatus: "Active",
          accountVisibility: "Public",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request verification code");
      }

      setIsCodeRequested(true);
      //  alert("Verification code sent to your email.");
    } catch (error) {
      setError("Failed to request verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (currentStep < 3) {
      handleNextStep();
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch(
        `/api/no-auth/register/complete?code=${data.verificationCode}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: data.name,
            userEmail: data.email,
            password: data.password,
            shortBiodata: data.biodata,
            role: data.role,
            userStatus: "Active",
            accountVisibility: "Public",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      router.push("/home");
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCcw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* <Image
            src="/images/timewise_logo.png"
            alt="TimeWise Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          /> */}
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            TimeWise
          </h1>
          <h1 className="text-4xl font-bold text-center">
          Registration
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {currentStep} of {steps.length}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
            <Progress
              value={(currentStep / steps.length) * 100}
              className="h-2"
            />
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="space-y-4"
                  >
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    className="pl-10"
                                    placeholder="Enter username"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    type="email"
                                    className="pl-10"
                                    placeholder="Enter email"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    className="pl-10 pr-10"
                                    placeholder="Enter password"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-3"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <Progress
                                value={validatePassword(field.value).score}
                                className={`h-1 ${getPasswordStrengthColor(
                                  validatePassword(field.value).score
                                )}`}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="student">
                                    Student
                                  </SelectItem>
                                  <SelectItem value="professional">
                                    Professional
                                  </SelectItem>
                                  <SelectItem value="teacher">
                                    Teacher
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="biodata"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Short bio" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-4">
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <Alert>
                          <AlertDescription>
                            Enter the verification code sent to your email
                          </AlertDescription>
                        </Alert>
                        <FormField
                          control={form.control}
                          name="verificationCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Verification Code"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-4">
                {/* Navigation buttons */}
                <div className="flex w-full justify-between">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                  )}
                  {currentStep < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleNextStep}
                    >
                      Next
                    </Button>
                  )}
                </div>

                {/* Resend Code & Complete Registration (only at step 3) */}
                {currentStep === 3 && (
                  <div className="flex flex-col items-center space-y-2 w-full">
                 
                          <Button
                            type="button"
                            onClick={handleVerificationCodeRequest}
                            variant="outline"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "Resend verification Code"
                            )}
                          </Button>
                       
                    <Button type="submit" variant="primary">
                    {isProcessing ? (
                              <>
                                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Complete Registration"
                            )}
                    </Button>
                  </div>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already registered?{" "}
            <Button
              variant="link"
              className="p-0 text-sm"
              onClick={() => router.push("/login")}
            >
              Log in
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
