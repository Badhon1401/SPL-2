"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormLabel, FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, FormProvider } from "react-hook-form";

const CreateTeamForm = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const methods = useForm({
    defaultValues: {
      teamName: "",
      teamDescription: "",
      teamVisibility: "public", // Default visibility is public
    },
  });

  const { handleSubmit, control, setValue, getValues, trigger } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setIsProcessing(true);
    setError("");

    // Validation to ensure team name is not empty
    if (!data.teamName) {
      setError("Team name is required.");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch("/api/teams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create team.");
      }

      const result = await response.json();
      console.log("Team created successfully:", result);
      router.push("/home/team"); // Redirect to the team list page
    } catch (error) {
      console.error("Error submitting team:", error);
      setError("Failed to create team. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  });

  return (
    <FormProvider {...methods}>
      <Card className="w-3/4 max-w-4xl mx-auto bg-card mt-12 dark">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Create New Team</CardTitle>
          <CardDescription>Fill in the details to create a new team</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter team name"
                      className="dark:bg-gray-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="teamDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter team description"
                      className="dark:bg-gray-800"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="teamVisibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="dark:bg-gray-800">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};

export default CreateTeamForm;
