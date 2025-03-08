"use client";

import React, { useState } from "react";
import { format,parse,isValid } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, Trash2, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/components/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TaskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // Simple form state without react-hook-form
  const [formData, setFormData] = useState({
    goalName: "",
    goalDeadline: undefined,
    userPrompt: "",
    numberOfTasks: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      goalDeadline: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.goalName) {
        toast.error("Please enter a goal name");
        setIsLoading(false);
        return;
      }

      // Format goal deadline to string if it exists
      const goalDeadline = formData.goalDeadline
        ? format(formData.goalDeadline, "yyyy-MM-dd'T'HH:mm:ss.SSSX")
        : "";

      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalName: formData.goalName,
          goalDeadline: goalDeadline,
          userPrompt: formData.userPrompt,
          numberOfTask: formData.numberOfTasks
            ? parseInt(formData.numberOfTasks)
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tasks");
      }

      const data = await response.json();
      setTasks(data.tasks || []);
      setInitialized(true);

      // Show success message
      toast.success(
        `Tasks generated successfully: ${
          data.tasks?.length || 0
        } tasks have been created.`
      );
    } catch (error) {
      console.error("Error generating tasks:", error);
      toast.error(`Error generating tasks: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
    toast.success("Task deleted");
  };

  const addTodo = (taskIndex) => {
    const updatedTasks = [...tasks];
    if (!updatedTasks[taskIndex].taskTodos) {
      updatedTasks[taskIndex].taskTodos = [];
    }
    updatedTasks[taskIndex].taskTodos.push(
       "New todo item"
    );
    setTasks(updatedTasks);
  };

  const updateTodo = (taskIndex, todoIndex, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].taskTodos[todoIndex]= value;
    setTasks(updatedTasks);
  };

  const deleteTodo = (taskIndex, todoIndex) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].taskTodos.splice(todoIndex, 1);
    setTasks(updatedTasks);
  };

  const updateTaskField = (taskIndex, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex][field] = value;
    setTasks(updatedTasks);
  };

  const saveTasks = async () => {
   
    try {
        const transformedTasks = tasks.map((task) => ({
            ...task,
            taskTodos: task.taskTodos.map((description) => ({
            
              description: description,
            
            })),
          }));
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedTasks),
      });

      if (!response.ok) {
        throw new Error("Failed to save tasks");
      }

      toast.success(
        `Tasks saved successfully: ${tasks.length} tasks have been saved.`
      );

      // Optionally redirect to task list page after successful save
      // router.push('/tasks');
    } catch (error) {
      console.error("Error saving tasks:", error);
      toast.error(`Error saving tasks: ${error.message}`);
    } finally {
     router.push("/home");
    }
  };

  return (
    <div className="container max-w-5xl ">
      <Toaster />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create A Roadmap</CardTitle>
          <CardDescription>
            Enter your roadmap goal and we'll generate a structured plan for
            you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-4">
              {/* Goal Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Name*</label>
                <Input
                  name="goalName"
                  placeholder="e.g., Learn Arabic"
                  value={formData.goalName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Goal Deadline Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Goal Deadline (Optional)
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !formData.goalDeadline && "text-muted-foreground"
                      )}
                      type="button"
                    >
                      {formData.goalDeadline ? (
                        format(formData.goalDeadline, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.goalDeadline}
                      onSelect={handleDateChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500">
                  When do you want to complete this goal?
                </p>
              </div>

              {/* Number of Tasks Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Number of Tasks (1-7)
                </label>
                <Input
                  name="numberOfTasks"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.numberOfTasks}
                  onChange={handleInputChange}
                  min="1"
                  max="7"
                />
              </div>

              {/* User Prompt Textarea */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Your Prompt (Optional)
                </label>
                <Textarea
                  name="userPrompt"
                  placeholder="Provide additional details for a personalized roadmap"
                  className="resize-none"
                  rows={4}
                  value={formData.userPrompt}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Tasks...
                </>
              ) : (
                "Generate Learning Plan"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {initialized && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Roadmap</h2>
            <div className="flex space-x-3">
              <Button
                onClick={saveTasks}
                disabled={isLoading || tasks.length === 0}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save All Tasks
              </Button>
            </div>
          </div>

          <Accordion
            type="multiple"
            defaultValue={tasks.map((_, i) => `task-${i}`)}
          >
            {tasks.map((task, taskIndex) => (
              <AccordionItem
                key={taskIndex}
                value={`task-${taskIndex}`}
                className="mb-4"
              >
                <div className="flex justify-between items-center">
                  <AccordionTrigger className="py-4 text-lg font-medium">
                    {task.taskName}
                  </AccordionTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-4 hover:bg-red-100 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(taskIndex);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <div className="mb-4">
                            <label className="block mb-2 font-medium">
                              Task Name
                            </label>
                            <Input
                              value={task.taskName || ""}
                              onChange={(e) =>
                                updateTaskField(
                                  taskIndex,
                                  "taskName",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="mb-4">
                            <label className="block mb-2 font-medium">
                              Task Description
                            </label>
                            <Textarea
                              value={task.taskDescription || ""}
                              onChange={(e) =>
                                updateTaskField(
                                  taskIndex,
                                  "taskDescription",
                                  e.target.value
                                )
                              }
                              className="resize-none"
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block mb-2 font-medium">
                              Category
                            </label>
                            <Select
                              value={task.taskCategory || "General"}
                              onValueChange={(value) =>
                                updateTaskField(
                                  taskIndex,
                                  "taskCategory",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Development">
                                  Development
                                </SelectItem>
                                <SelectItem value="Design">Design</SelectItem>
                                <SelectItem value="Marketing">
                                  Marketing
                                </SelectItem>
                                <SelectItem value="Research">
                                  Research
                                </SelectItem>
                                <SelectItem value="QA">QA & Testing</SelectItem>
                                <SelectItem value="Documentation">
                                  Documentation
                                </SelectItem>
                                <SelectItem value="DevOps">DevOps</SelectItem>
                                <SelectItem value="Planning">
                                  Planning
                                </SelectItem>
                                <SelectItem value="Support">
                                  Customer Support
                                </SelectItem>
                                <SelectItem value="Administrative">
                                  Administrative
                                </SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block mb-2 font-medium">
                                Priority
                              </label>
                              <Select
                                value={task.taskPriority || "Medium"}
                                onValueChange={(value) =>
                                  updateTaskField(
                                    taskIndex,
                                    "taskPriority",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block mb-2 font-medium">
                                Visibility
                              </label>
                              <Select
                                value={task.taskVisibilityStatus || "Public"}
                                onValueChange={(value) =>
                                  updateTaskField(
                                    taskIndex,
                                    "taskVisibilityStatus",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Public">Public</SelectItem>
                                  <SelectItem value="Private">
                                    Private
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
  <label className="block mb-2 font-medium">Deadline</label>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant={'outline'}
        className="w-full justify-start text-left font-normal"
      >
        {task.taskDeadline
          ? format(new Date(task.taskDeadline), "PPp")
          : "Pick Date & Time"}
        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <div className="flex flex-col gap-4 p-4">
        <Calendar
          mode="single"
          selected={task.taskDeadline ? new Date(task.taskDeadline) : undefined}
          onSelect={(date) => {
            if (date) {
              // Merge existing time with new date
              const existingDate = task.taskDeadline ? new Date(task.taskDeadline) : new Date();
              const mergedDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                existingDate.getHours(),
                existingDate.getMinutes()
              );
              
              updateTaskField(
                taskIndex,
                'taskDeadline',
                mergedDate.toISOString()
              );
            }
          }}
          initialFocus
        />
        <div className="flex gap-2 items-center">
          <Label>Time</Label>
          <Input
            type="time"
            value={task.taskDeadline 
              ? format(new Date(task.taskDeadline), "HH:mm")
              : format(new Date(), "HH:mm")}
            onChange={(e) => {
              const time = e.target.value;
              if (task.taskDeadline) {
                const currentDate = new Date(task.taskDeadline);
                const [hours, minutes] = time.split(':');
                currentDate.setHours(parseInt(hours));
                currentDate.setMinutes(parseInt(minutes));
                updateTaskField(taskIndex, 'taskDeadline', currentDate.toISOString());
              }
            }}
          />
        </div>
      </div>
    </PopoverContent>
  </Popover>
</div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-base font-semibold">
                            Todo Items
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTodo(taskIndex)}
                            className="flex items-center gap-1"
                          >
                            Add Todo
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {task.taskTodos &&
                            task.taskTodos.map((todo, todoIndex) => (
                              <div
                                key={todoIndex}
                                className="flex gap-2 items-start"
                              >
                                <Input
                                  value={todo || ""}
                                  onChange={(e) =>
                                    updateTodo(
                                      taskIndex,
                                      todoIndex,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="flex-shrink-0 hover:bg-red-100 hover:text-red-600"
                                  onClick={() =>
                                    deleteTodo(taskIndex, todoIndex)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}
    </div>
  );
}
