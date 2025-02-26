"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
  Save,
  Square,
  Plus,
  X,
} from "lucide-react";
import { format } from "date-fns";

const scenarioOptions = [
  {
    id: 1,
    name: "Beach Sunset",
    description: "Calming waves and ocean sounds",
    backgroundColor: "bg-blue-100",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // Valid Unsplash image
    sound: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Replaced with a working audio link
  },
  {
    id: 2,
    name: "Forest Meditation",
    description: "Peaceful forest ambiance",
    backgroundColor: "bg-green-100",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b", // Valid Unsplash image
    sound: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", // Replaced with a working audio link
  },
  {
    id: 3,
    name: "Mountain Peak",
    description: "Serene mountain atmosphere",
    backgroundColor: "bg-gray-100",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", // Valid Unsplash image
    sound: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", // Replaced with a working audio link
  },
  {
    id: 4,
    name: "Zen Garden",
    description: "Traditional meditation bells",
    backgroundColor: "bg-purple-100",
    image: "https://images.unsplash.com/photo-1505245208761-ba872912fac0", // Valid Unsplash image
    sound: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", // Replaced with a working audio link
  },
];

const SessionPage = () => {
  // State for current session
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    duration: 30,
    sessionGoal: "",
  });
  const [newTask, setNewTask] = useState("");

  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const router = useRouter();

  // Scenario and sound states
  const [currentScenario, setCurrentScenario] = useState(scenarioOptions[0]);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [breakInterval, setBreakInterval] = useState(0);
  const [breakDuration, setBreakDuration] = useState(5);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(null);

  // Session completion form
  const [completionForm, setCompletionForm] = useState({
    sessionOutcome: "",
    tasksOperated: new Set(),
    sessionEfficiency: 50,
  });

  // UI states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining]);

  const handleStartSession = () => {
    if (!sessionForm.sessionGoal) {
      alert("Please set a session goal");
      return;
    }

    const newSession = {
      sessionCreator: "user",
      sessionTimeStamp: new Date(),
      duration: sessionForm.duration,
      sessionGoal: sessionForm.sessionGoal,
    };

    setCurrentSession(newSession);
    setTimeRemaining(sessionForm.duration * 60);
    setIsRunning(true);
    setIsSoundPlaying(true);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    setIsSoundPlaying(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsSoundPlaying(false);
    setShowCompletionForm(true);
  };

  const handleSessionComplete = () => {
    setIsRunning(false);
    setIsSoundPlaying(false);
    setShowCompletionForm(true);
  };

  const handleScenarioChange = (scenario) => {
    // Pause current audio if playing
    if (audioRef.current && isSoundPlaying) {
      audioRef.current.pause();
      setIsSoundPlaying(false);
    }

    setCurrentScenario(scenario);

    // Reset audio element
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  const handleSaveSession = async () => {
    const sessionData = {
      ...currentSession,
      sessionOutcome: completionForm.sessionOutcome,
      tasksOperated: Array.from(completionForm.tasksOperated),
      sessionEfficiency: completionForm.sessionEfficiency,
      scenario: currentScenario.name,
    };

    try {
      const response = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        setCurrentSession(null);
        setShowCompletionForm(false);
        setSessionForm({ duration: 30, sessionGoal: "" });
        setCompletionForm({
          sessionOutcome: "",
          tasksOperated: new Set(),
          sessionEfficiency: 50,
        });
        window.location.href = "/session/previous";
      }
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  // Audio handling
  // Effect to update the volume without reloading the audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Effect to update the audio source and handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      // Only update and load when the sound source changes
      audioRef.current.src = currentScenario.sound;
      audioRef.current.load();

      if (isSoundPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Audio playback failed:", error);
            setIsSoundPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentScenario, isSoundPlaying]);

  return (
    <div className="container mx-auto py-3 mt-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Meditation Session</h1>
            <p className="text-muted-foreground">
              Focus, breathe, and track your progress
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/session/previous")}
          >
            Previous Sessions
          </Button>
          {currentSession && (
            <Button variant="outline" onClick={handleStop}>
              End Session
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Session</CardTitle>
            <CardDescription>
              {currentSession
                ? "Ongoing meditation session"
                : "Start a new session"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentSession && !showCompletionForm ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="duration">Session Duration (minutes)</Label>
                  <Slider
                    id="duration"
                    min={5}
                    max={120}
                    step={5}
                    value={[sessionForm.duration]}
                    onValueChange={([value]) =>
                      setSessionForm((prev) => ({ ...prev, duration: value }))
                    }
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {sessionForm.duration} minutes
                  </p>
                </div>

                <div>
                  <Label htmlFor="goal">Session Goal</Label>
                  <textarea
                    id="goal"
                    placeholder="What do you want to achieve in this session?"
                    value={sessionForm.sessionGoal}
                    onChange={(e) =>
                      setSessionForm((prev) => ({
                        ...prev,
                        sessionGoal: e.target.value,
                      }))
                    }
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Choose Environment</Label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    {scenarioOptions.map((scenario) => (
                      <div
                        key={scenario.id}
                        className={`p-4 rounded-lg cursor-pointer ${
                          currentScenario.id === scenario.id
                            ? "ring-2 ring-primary"
                            : ""
                        } ${scenario.backgroundColor}`}
                        onClick={() => handleScenarioChange(scenario)}
                      >
                        <h3 className="font-medium">{scenario.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {scenario.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleStartSession} className="w-full">
                  <Play className="mr-2" size={16} />
                  Start Session
                </Button>
              </div>
            ) : showCompletionForm ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="outcome">Session Outcome</Label>
                  <textarea
                    id="outcome"
                    placeholder="What did you achieve?"
                    value={completionForm.sessionOutcome}
                    onChange={(e) =>
                      setCompletionForm((prev) => ({
                        ...prev,
                        sessionOutcome: e.target.value,
                      }))
                    }
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="efficiency">Session Efficiency</Label>
                  <Slider
                    id="efficiency"
                    min={0}
                    max={100}
                    value={[completionForm.sessionEfficiency]}
                    onValueChange={([value]) =>
                      setCompletionForm((prev) => ({
                        ...prev,
                        sessionEfficiency: value,
                      }))
                    }
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {completionForm.sessionEfficiency}%
                  </p>
                </div>

                <Button onClick={handleSaveSession} className="w-full">
                  <Save className="mr-2" size={16} />
                  Save Session
                </Button>
              </div>
            ) : (
              <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={currentScenario.image}
                      alt={currentScenario.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-4 right-4 space-x-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setIsSoundPlaying(!isSoundPlaying)}
                      >
                        {isSoundPlaying ? (
                          <Volume2 size={16} />
                        ) : (
                          <VolumeX size={16} />
                        )}
                      </Button>
                      {isSoundPlaying && (
                        <Slider
                          className="w-32"
                          value={[volume]}
                          onValueChange={([value]) => setVolume(value)}
                          min={0}
                          max={100}
                        />
                      )}
                    </div>
                  </div>

                  <Select
                    value={currentScenario.id.toString()}
                    onValueChange={(value) =>
                      setCurrentScenario(
                        scenarioOptions.find((s) => s.id.toString() === value)
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarioOptions.map((scenario) => (
                        <SelectItem
                          key={scenario.id}
                          value={scenario.id.toString()}
                        >
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-1">
                    <Progress
                      value={
                        ((sessionForm.duration * 60 - timeRemaining) /
                          (sessionForm.duration * 60)) *
                        100
                      }
                    />
                    <p className="text-center text-2xl font-bold">
                      {formatTime(timeRemaining)}
                    </p>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePauseResume}
                    >
                      {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleStop}>
                      <Square size={16} />
                    </Button>
                  </div>
                </div>

                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full mt-2">
                    {isCollapsed ? "Show Session" : "Minimize Session"}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Session Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Goal:</span>
                              <span className="text-sm text-muted-foreground">
                                {currentSession?.sessionGoal}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                Duration:
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {currentSession?.duration} minutes
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                Started:
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {format(
                                  new Date(currentSession?.sessionTimeStamp),
                                  "pp"
                                )}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Quick Tasks</CardTitle>
                          <CardDescription>
                            Track what you're working on
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add a task"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter" && newTask.trim()) {
                                    const updatedTasks = new Set(
                                      completionForm.tasksOperated
                                    );
                                    updatedTasks.add(newTask.trim());
                                    setCompletionForm((prev) => ({
                                      ...prev,
                                      tasksOperated: updatedTasks,
                                    }));
                                    setNewTask("");
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                onClick={() => {
                                  if (newTask.trim()) {
                                    const updatedTasks = new Set(
                                      completionForm.tasksOperated
                                    );
                                    updatedTasks.add(newTask.trim());
                                    setCompletionForm((prev) => ({
                                      ...prev,
                                      tasksOperated: updatedTasks,
                                    }));
                                    setNewTask("");
                                  }
                                }}
                              >
                                <Plus size={16} />
                              </Button>
                            </div>

                            <ScrollArea className="h-48">
                              {Array.from(completionForm.tasksOperated).map(
                                (task, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                                  >
                                    <span className="text-sm">{task}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const updatedTasks = new Set(
                                          completionForm.tasksOperated
                                        );
                                        updatedTasks.delete(task);
                                        setCompletionForm((prev) => ({
                                          ...prev,
                                          tasksOperated: updatedTasks,
                                        }));
                                      }}
                                    >
                                      <X size={16} />
                                    </Button>
                                  </div>
                                )
                              )}
                            </ScrollArea>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Session Controls</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <Label>Break Intervals</Label>
                              <Select
                                value={breakInterval.toString()}
                                onValueChange={(value) =>
                                  setBreakInterval(parseInt(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select break interval" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">No breaks</SelectItem>
                                  <SelectItem value="15">
                                    Every 15 minutes
                                  </SelectItem>
                                  <SelectItem value="25">
                                    Every 25 minutes
                                  </SelectItem>
                                  <SelectItem value="30">
                                    Every 30 minutes
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label>Break Duration</Label>
                              <Slider
                                value={[breakDuration]}
                                onValueChange={([value]) =>
                                  setBreakDuration(value)
                                }
                                min={1}
                                max={10}
                                step={1}
                                className="mt-1"
                              />
                              <p className="text-sm text-muted-foreground">
                                {breakDuration} minutes
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                Time Elapsed
                              </p>
                              <p className="text-2xl font-bold">
                                {formatTime(
                                  sessionForm.duration * 60 - timeRemaining
                                )}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                Time Remaining
                              </p>
                              <p className="text-2xl font-bold">
                                {formatTime(timeRemaining)}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                Session Progress
                              </p>
                              <Progress
                                value={
                                  ((sessionForm.duration * 60 - timeRemaining) /
                                    (sessionForm.duration * 60)) *
                                  100
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Tasks Added</p>
                              <p className="text-2xl font-bold">
                                {completionForm.tasksOperated.size}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>

        <audio ref={audioRef} src={currentScenario.sound} loop preload="auto" />
      </div>
    </div>
  );
};

export default SessionPage;
