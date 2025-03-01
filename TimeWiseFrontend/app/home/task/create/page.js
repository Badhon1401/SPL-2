"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, X,RefreshCcw } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { format } from "date-fns";
import { cn } from "@/components/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const steps = [
  { id: 1, title: "Task Details", description: "Basic task information" },
  { id: 2, title: "Task Settings", description: "Priority, visibility, and deadline" },
  { id: 3, title: "Task Todos", description: "Add todos for the task" },
];

const CreateTaskForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const methods = useForm({
    defaultValues: {
      taskName: "",
      taskCategory: "",
      taskDescription: "",
      taskPriority: "",
      taskVisibilityStatus: "",
      taskDeadline: null,
      taskGoal: "",
      taskTodos: [{ description: "", status: "Incomplete" }],
    },
  });

  const { handleSubmit, control, setValue, getValues, trigger } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setIsProcessing(true);
    setError("");

    if (!data.taskName || !data.taskDeadline) {
      setError("Task name and deadline are required fields.");
      return;
    }

    if (!data.taskTodos || data.taskTodos.length === 0 || !data.taskTodos[0].description) {
      setError("At least one task todo is required.");
      return;
    }

    try {
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([data]),
      });

      if (!response.ok) {
        throw new Error("Failed to create task.");
      }

      const result = await response.json();
      console.log("Task created successfully:", result);
      router.push("/home/task/mytasks");
    } catch (error) {
      console.error("Error submitting task:", error);
      setError("Failed to create task. Please try again.");
    }
    finally {
      setIsProcessing(false);
    }
  });

  const addTodo = () => {
    const currentTodos = getValues("taskTodos");
    setValue("taskTodos", [...currentTodos, { description: "", status: "Incomplete" }]);
  };

  const removeTodo = (index) => {
    const currentTodos = getValues("taskTodos");
    if (currentTodos.length > 1) {
      const newTodos = currentTodos.filter((_, i) => i !== index);
      setValue("taskTodos", newTodos);
    }
  };

  const updateTodo = (index, description) => {
    const currentTodos = getValues("taskTodos");
    const newTodos = currentTodos.map((todo, i) =>
      i === index ? { ...todo, description } : todo
    );
    setValue("taskTodos", newTodos);
  };

  const handleNextStep = async () => {
    const currentFields = getCurrentStepFields();
    const isValid = await trigger(currentFields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 1:
        return ["taskName", "taskCategory", "taskDescription"];
      case 2:
        return ["taskPriority", "taskVisibilityStatus", "taskDeadline", "taskGoal"];
      case 3:
        return ["taskTodos"];
      default:
        return [];
    }
  };

  return (
    <FormProvider {...methods}>
      <Card className="w-3/4 max-w-4xl mx-auto bg-card mt-12">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Create New Task</CardTitle>
          <CardDescription>Fill in the details to create a new task</CardDescription>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
                      control={control}
                      name="taskName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task name" className="dark:bg-black" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="taskGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task goal" className="dark:bg-black" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

<FormField
                      control={control}
                      name="taskCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="dark:bg-black">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="max-h-80">
                                  <SelectItem value="General">General</SelectItem> {/* Make General the first option */}
                                  <SelectItem value="Development">Development</SelectItem>
                                  <SelectItem value="Design">Design</SelectItem>
                                  <SelectItem value="Marketing">Marketing</SelectItem>
                                  <SelectItem value="Research">Research</SelectItem>
                                  <SelectItem value="QA">QA & Testing</SelectItem>
                                  <SelectItem value="Documentation">Documentation</SelectItem>
                                  <SelectItem value="DevOps">DevOps</SelectItem>
                                  <SelectItem value="Planning">Planning</SelectItem>
                                  <SelectItem value="Support">Customer Support</SelectItem>
                                  <SelectItem value="Administrative">Administrative</SelectItem>
                                  <SelectItem value="Finance">Finance & Accounting</SelectItem>
                                  <SelectItem value="HR">Human Resources</SelectItem>
                                  <SelectItem value="Training">Training</SelectItem>
                                  <SelectItem value="Analytics">Analytics & Data</SelectItem>
                                  <SelectItem value="Legal">Legal</SelectItem>
                                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                  <SelectItem value="Security">Security</SelectItem>
                                  <SelectItem value="ContentCreation">Content Creation</SelectItem>
                                  <SelectItem value="ProductManagement">Product Management</SelectItem>
                                  <SelectItem value="UXResearch">UX Research</SelectItem>
                                  <SelectItem value="SEO">SEO</SelectItem>
                                  <SelectItem value="SocialMedia">Social Media</SelectItem>
                                  <SelectItem value="BusinessDevelopment">Business Development</SelectItem>
                                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                                  <SelectItem value="Compliance">Compliance</SelectItem>
                                  <SelectItem value="CustomerSuccess">Customer Success</SelectItem>
                                  <SelectItem value="ProjectManagement">Project Management</SelectItem>
                                  <SelectItem value="Sales">Sales</SelectItem>
                                  <SelectItem value="Innovation">Innovation & R&D</SelectItem>
                                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                                  <SelectItem value="Procurement">Procurement</SelectItem>
                                  <SelectItem value="Events">Events</SelectItem>
                                  <SelectItem value="Translation">Translation & Localization</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="taskDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter task description" className="dark:bg-black" {...field} />
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
                      control={control}
                      name="taskPriority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="dark:bg-black">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="taskVisibilityStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visibility Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="dark:bg-black">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Public">Public</SelectItem>
                              <SelectItem value="Private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="taskDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal dark:bg-black",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={control}
                      name="taskTodos"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <FormLabel>Task Todos *</FormLabel>
                              <Button
                                type="button"
                                onClick={addTodo}
                                variant="outline"
                                size="sm"
                                className="dark:bg-black"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Todo
                              </Button>
                            </div>
                            {field.value.map((todo, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  placeholder="Enter todo description"
                                  value={todo.description}
                                  onChange={(e) => updateTodo(index, e.target.value)}
                                  className="dark:bg-gray-800"
                                />
                                {field.value.length > 1 && (
                                  <Button
                                    type="button"
                                    onClick={() => removeTodo(index)}
                                    variant="destructive"
                                    size="icon"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                >
                  Previous
                </Button>
              )}
              {currentStep < steps.length && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNextStep}
                >
                  Next
                </Button>
              )}
              {currentStep === steps.length && (
                <Button type="submit" variant="primary">
                  {isProcessing ? (
                              <>
                                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Create Task"
                            )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};

export default CreateTaskForm;