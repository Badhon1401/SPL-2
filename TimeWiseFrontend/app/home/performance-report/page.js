"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  Clock,
  MessageSquare,
  Star,
  Target,
  Calendar,
  CheckCircle,
  XCircle,
  Timer,
  Zap,
  Heart,
  Share2,
  TrendingUp,
  Award,
} from "lucide-react";
import { format } from "date-fns";

// Custom hook for historical data analysis
const useHistoricalAnalysis = (currentReport, previousReports) => {
  return useMemo(() => {
    if (!currentReport || !previousReports?.length) return null;

    const trends = {
      sessionEfficiency: {
        current: currentReport.usersSessionStatistics.averageSessionEfficiency,
        historical: previousReports.map(
          (report) => report.usersSessionStatistics.averageSessionEfficiency
        ),
        improvement:
          currentReport.usersSessionStatistics.averageSessionEfficiency -
          previousReports[0].usersSessionStatistics.averageSessionEfficiency,
      },
      feedbackScore: {
        current: currentReport.usersFeedbackStatistics.averageFeedbackScore,
        historical: previousReports.map(
          (report) => report.usersFeedbackStatistics.averageFeedbackScore
        ),
        improvement:
          currentReport.usersFeedbackStatistics.averageFeedbackScore -
          previousReports[0].usersFeedbackStatistics.averageFeedbackScore,
      },
      taskCompletion: {
        current:
          currentReport.usersTaskStatistics.tasksCompletedBeforeDeadline
            .length /
          (currentReport.usersTaskStatistics.tasksCompletedBeforeDeadline
            .length +
            currentReport.usersTaskStatistics.tasksCompletedAfterDeadline
              .length),
        historical: previousReports.map(
          (report) =>
            report.usersTaskStatistics.tasksCompletedBeforeDeadline.length /
            (report.usersTaskStatistics.tasksCompletedBeforeDeadline.length +
              report.usersTaskStatistics.tasksCompletedAfterDeadline.length)
        ),
      },
    };

    return trends;
  }, [currentReport, previousReports]);
};

// Performance Overview Component
const PerformanceOverview = ({ currentReport }) => {
  const stats = [
    {
      title: "Session Efficiency",
      value: `${currentReport.usersSessionStatistics.averageSessionEfficiency.toFixed(
        1
      )}%`,
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Average Feedback",
      value:
        currentReport.usersFeedbackStatistics.averageFeedbackScore.toFixed(1),
      icon: Star,
      color: "text-purple-500",
    },
    {
      title: "Tasks On Time",
      value:
        currentReport.usersTaskStatistics.tasksCompletedBeforeDeadline.length,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Active Sessions",
      value: currentReport.usersSessionStatistics.numberOfSession,
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Teams Joined",
      value: currentReport.usersAccountStatistics.teamsParticipated,
      icon: Users,
      color: "text-indigo-500",
    },
    {
      title: "Messages",
      value:
        currentReport.usersAccountStatistics.numberOfMessagesSent +
        currentReport.usersAccountStatistics.numberOfMessagesReceived,
      icon: MessageSquare,
      color: "text-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Session Analysis Component
const SessionAnalysis = ({ currentReport, previousReports }) => {
  const sessionData = useMemo(() => {
    return currentReport.usersSessionStatistics.sessionNames.map(
      (name, index) => ({
        name,
        efficiency:
          currentReport.usersSessionStatistics.previousSessionsEfficiencyScores[
            index
          ],
        tasks: Math.round(
          currentReport.usersSessionStatistics.totalTasksOperated /
            currentReport.usersSessionStatistics.numberOfSession
        ),
      })
    );
  }, [currentReport]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Session Performance Analysis</CardTitle>
        <CardDescription>
          Average session efficiency:{" "}
          {currentReport.usersSessionStatistics.averageSessionEfficiency.toFixed(
            1
          )}
          %
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={sessionData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Efficiency"
                dataKey="efficiency"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Radar
                name="Tasks"
                dataKey="tasks"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Task Performance Component
const TaskPerformance = ({ currentReport }) => {
  const taskData = {
    onTime:
      currentReport.usersTaskStatistics.tasksCompletedBeforeDeadline.length,
    late: currentReport.usersTaskStatistics.tasksCompletedAfterDeadline.length,
    pending:
      currentReport.usersTaskStatistics.deadlineUncrossedAndUnfinishedTasks
        .length,
    overdue:
      currentReport.usersTaskStatistics.deadlineCrossedAndUnfinishedTasks
        .length,
  };

  const pieData = Object.entries(taskData).map(([key, value]) => ({
    name: key,
    value,
  }));

  const COLORS = {
    onTime: "#10B981",
    late: "#F59E0B",
    pending: "#3B82F6",
    overdue: "#EF4444",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {Object.entries(taskData).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[key] }}
              />
              <span className="capitalize">{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Feedback Analysis Component
const FeedbackAnalysis = ({ currentReport }) => {
  const feedbackData =
    currentReport.usersFeedbackStatistics.previousFeedbackScores.map(
      (score, index) => ({
        id: index + 1,
        score,
      })
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Analysis</CardTitle>
        <CardDescription>
          Average Score:{" "}
          {currentReport.usersFeedbackStatistics.averageFeedbackScore.toFixed(
            1
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={feedbackData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <ScrollArea className="h-40">
            {currentReport.usersFeedbackStatistics.feedbackMessages.map(
              (message, index) => (
                <Alert key={index} className="mb-2">
                  <MessageSquare className="h-4 w-4" />
                  <AlertTitle>Feedback {index + 1}</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

// Historical Trends Component
const HistoricalTrends = ({ trends }) => {
  if (!trends) return null;

  const trendData = [
    {
      name: "Session Efficiency",
      current: trends.sessionEfficiency.current * 100,
      improvement: trends.sessionEfficiency.improvement * 100,
      icon: Timer,
      color: "text-blue-500",
    },
    {
      name: "Feedback Score",
      current: trends.feedbackScore.current,
      improvement: trends.feedbackScore.improvement,
      icon: Star,
      color: "text-yellow-500",
    },
    {
      name: "Task Completion Rate",
      current: trends.taskCompletion.current * 100,
      improvement:
        (trends.taskCompletion.current - trends.taskCompletion.historical[0]) *
        100,
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {trendData.map((trend, index) => {
            const Icon = trend.icon;
            const isPositive = trend.improvement >= 0;
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${trend.color}`} />
                    <span className="font-medium">{trend.name}</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpCircle className="h-4 w-4" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4" />
                    )}
                    <span>
                      {Math.abs(trend.improvement).toFixed(1)}% change
                    </span>
                  </div>
                </div>
                <Progress
                  value={trend.current}
                  className="h-2"
                  indicatorClassName={
                    isPositive ? "bg-green-500" : "bg-red-500"
                  }
                />
                <div className="text-sm text-gray-500">
                  Current: {trend.current.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Account Activity Component
const AccountActivity = ({ currentReport }) => {
  const accountStats = [
    {
      category: "Network",
      stats: [
        {
          label: "Following",
          value: currentReport.usersAccountStatistics.numberOfUserFollowing,
          icon: Users,
        },
        {
          label: "Teams",
          value: currentReport.usersAccountStatistics.teamsParticipated,
          icon: Share2,
        },
      ],
    },
    {
      category: "Engagement",
      stats: [
        {
          label: "Messages Sent",
          value: currentReport.usersAccountStatistics.numberOfMessagesSent,
          icon: MessageSquare,
        },
        {
          label: "Messages Received",
          value: currentReport.usersAccountStatistics.numberOfMessagesReceived,
          icon: Heart,
        },
      ],
    },
    {
      category: "Participation",
      stats: [
        {
          label: "Tasks",
          value: currentReport.usersAccountStatistics.numberOfTasksParticipated,
          icon: CheckCircle,
        },
        {
          label: "Sessions",
          value: currentReport.usersAccountStatistics.numberOfSessionsCreated,
          icon: Calendar,
        },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Activity Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {accountStats.map((category, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="font-medium text-sm text-gray-500">
                {category.category}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {category.stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg"
                    >
                      <Icon className="h-5 w-5 text-gray-60" />
                      <div>
                        <p className="text-sm text-gray-60">{stat.label}</p>
                        <p className="text-lg font-semibold">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Performance Insights Component
const PerformanceInsights = ({ currentReport, previousReports }) => {
  const generateInsights = () => {
    const insights = [];

    // Session Efficiency Insights
    const currentEfficiency =
      currentReport.usersSessionStatistics.averageSessionEfficiency;
    const previousEfficiency =
      previousReports[0]?.usersSessionStatistics.averageSessionEfficiency;

    if (previousEfficiency) {
      const efficiencyChange =
        ((currentEfficiency - previousEfficiency) / previousEfficiency) * 100;
      insights.push({
        category: "Session Efficiency",
        type: efficiencyChange >= 0 ? "positive" : "negative",
        message: `Session efficiency has ${
          efficiencyChange >= 0 ? "improved" : "decreased"
        } by ${Math.abs(efficiencyChange).toFixed(1)}%`,
        icon: Timer,
        priority: Math.abs(efficiencyChange) > 10 ? "high" : "medium",
      });
    }

    // Task Completion Insights
    const onTimeTasks =
      currentReport.usersTaskStatistics.tasksCompletedBeforeDeadline.length;
    const lateTasks =
      currentReport.usersTaskStatistics.tasksCompletedAfterDeadline.length;
    const completionRate = onTimeTasks / (onTimeTasks + lateTasks);

    insights.push({
      category: "Task Management",
      type: completionRate >= 0.8 ? "positive" : "warning",
      message: `${(completionRate * 100).toFixed(
        1
      )}% of completed tasks were delivered on time`,
      icon: Target,
      priority: completionRate < 0.7 ? "high" : "medium",
    });

    // Feedback Insights
    const currentFeedback =
      currentReport.usersFeedbackStatistics.averageFeedbackScore;
    const previousFeedback =
      previousReports[0]?.usersFeedbackStatistics.averageFeedbackScore;

    if (previousFeedback) {
      const feedbackChange = currentFeedback - previousFeedback;
      insights.push({
        category: "Feedback",
        type: feedbackChange >= 0 ? "positive" : "negative",
        message: `Average feedback score has ${
          feedbackChange >= 0 ? "increased" : "decreased"
        } by ${Math.abs(feedbackChange).toFixed(1)} points`,
        icon: Star,
        priority: Math.abs(feedbackChange) > 1 ? "high" : "medium",
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Insights</CardTitle>
        <CardDescription>
          Key observations from your performance data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Alert
              key={index}
              variant={insight.type === "positive" ? "default" : "destructive"}
              className={`
                  ${insight.priority === "high" ? "border-l-4" : ""}
                  ${
                    insight.type === "positive"
                      ? "border-green-500"
                      : insight.type === "warning"
                      ? "border-yellow-500"
                      : "border-red-500"
                  }
                `}
            >
              <insight.icon className="h-4 w-4" />
              <AlertTitle>{insight.category}</AlertTitle>
              <AlertDescription>{insight.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Time Distribution Chart
const TimeDistributionChart = ({ currentReport }) => {
  const totalTasksCompleted =
    currentReport.usersTaskStatistics.tasksCompletedBeforeDeadline.length +
    currentReport.usersTaskStatistics.tasksCompletedAfterDeadline.length;

  const taskEfficiency =
    totalTasksCompleted > 0
      ? (currentReport.usersTaskStatistics.tasksCompletedBeforeDeadline.length /
          totalTasksCompleted) *
        100
      : 0;

  const timeData = [
    {
      name: "Sessions",
      time: currentReport.usersSessionStatistics.totalSessionTime || 0,
      efficiency:
        currentReport.usersSessionStatistics.averageSessionEfficiency || 0,
    },
    {
      name: "Tasks",
      count: totalTasksCompleted || 0,
      efficiency: taskEfficiency, 
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time & Efficiency Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar
                yAxisId="left"
                dataKey="time"
                fill="#8884d8"
                name="Time (hours)"
              />
              <Bar
                yAxisId="right"
                dataKey="efficiency"
                fill="#82ca9d"
                name="Efficiency %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Performance Report Page Component
export default function PerformanceReportPage() {
  const [currentReport, setCurrentReport] = useState(null);
  const [previousReports, setPreviousReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(true);
  const [days, setDays] = useState("30");
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  const fetchPerformanceData = async (numberOfDays) => {
    try {
      setLoading(true);
      const [currentResponse, previousResponse] = await Promise.all([
        fetch(
          `/api/performance-report/current?previousNumberOfDays=${numberOfDays}`
        ),
        fetch(`/api/performance-report/previous`),
      ]);

      if (!currentResponse.ok || !previousResponse.ok) {
        throw new Error("Failed to fetch performance data");
      }

      const currentData = await currentResponse.json();
      const previousData = await previousResponse.json();

      setCurrentReport(currentData);
      setPreviousReports(previousData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const trends = useHistoricalAnalysis(currentReport, previousReports);

  const handleDaysSubmit = (e) => {
    e.preventDefault();
    const daysNum = parseInt(days);
    if (daysNum > 0) {
      setShowDialog(false);
      fetchPerformanceData(daysNum);
    }
  };

  if (showDialog) {
    return (
      <AlertDialog open={showDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Select Time Period</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the number of previous days to analyze
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleDaysSubmit} className="space-y-4 pt-4">
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
              placeholder="Enter number of days"
              className="w-full"
            />
            <AlertDialogFooter>
              <Button type="submit" className="w-full">
                Load Performance Report
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen mt-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4 mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!currentReport) {
    return (
      <Alert className="m-4 mt-8">
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No performance report data available.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Performance Report</h1>
            <p className="text-gray-500">Last {days} days performance</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            Change Time Period
          </Button>
        </div>

        <PerformanceOverview currentReport={currentReport} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HistoricalTrends trends={trends} />
              <TimeDistributionChart currentReport={currentReport} />
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TaskPerformance currentReport={currentReport} />
              <Card>
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {[
                      ...currentReport.usersTaskStatistics.tasksCompletedBeforeDeadline.map(
                        (task) => ({ name: task, status: "On Time" })
                      ),
                      ...currentReport.usersTaskStatistics.tasksCompletedAfterDeadline.map(
                        (task) => ({ name: task, status: "Late" })
                      ),
                      ...currentReport.usersTaskStatistics.deadlineUncrossedAndUnfinishedTasks.map(
                        (task) => ({ name: task, status: "Upcoming" })
                      ),
                      ...currentReport.usersTaskStatistics.deadlineCrossedAndUnfinishedTasks.map(
                        (task) => ({ name: task, status: "Overdue" })
                      ),
                    ].length > 0 ? (
                      [
                        ...currentReport.usersTaskStatistics.tasksCompletedBeforeDeadline.map(
                          (task) => ({ name: task, status: "On Time" })
                        ),
                        ...currentReport.usersTaskStatistics.tasksCompletedAfterDeadline.map(
                          (task) => ({ name: task, status: "Late" })
                        ),
                        ...currentReport.usersTaskStatistics.deadlineUncrossedAndUnfinishedTasks.map(
                          (task) => ({ name: task, status: "Upcoming" })
                        ),
                        ...currentReport.usersTaskStatistics.deadlineCrossedAndUnfinishedTasks.map(
                          (task) => ({ name: task, status: "Overdue" })
                        ),
                      ].map((task, index) => (
                        <div
                          key={index}
                          className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <span>{task.name || "Unnamed Task"}</span>
                            <Badge
                              variant={
                                task.status === "On Time"
                                  ? "success"
                                  : task.status === "Late"
                                  ? "warning"
                                  : task.status === "Upcoming"
                                  ? "info"
                                  : "destructive"
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No tasks available
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SessionAnalysis
                currentReport={currentReport}
                previousReports={previousReports}
              />
              <TimeDistributionChart currentReport={currentReport} />
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeedbackAnalysis currentReport={currentReport} />
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={currentReport.usersFeedbackStatistics.previousFeedbackScores.map(
                          (score, index) => ({
                            index: index + 1,
                            score,
                          })
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AccountActivity currentReport={currentReport} />
              <PerformanceInsights
                currentReport={currentReport}
                previousReports={previousReports}
              />
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PerformanceInsights
                currentReport={currentReport}
                previousReports={previousReports}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive analysis of your performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Efficiency Metrics</h3>
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-60">
                              Session Efficiency
                            </span>
                            <Badge variant="outline">
                              {currentReport.usersSessionStatistics.averageSessionEfficiency.toFixed(
                                1
                              )}
                              %
                            </Badge>
                          </div>
                          <Progress
                            value={
                              currentReport.usersSessionStatistics
                                .averageSessionEfficiency * 100
                            }
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">Task Completion</h3>
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-60">
                                  Success Rate
                                </span>
                                <span className="font-medium">
                                  {(
                                    (currentReport.usersTaskStatistics
                                      .tasksCompletedBeforeDeadline.length /
                                      (currentReport.usersTaskStatistics
                                        .tasksCompletedBeforeDeadline.length +
                                        currentReport.usersTaskStatistics
                                          .tasksCompletedAfterDeadline
                                          .length)) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="font-medium mb-4">Engagement Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg">
                          <Users className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-60">Network Size</p>
                            <p className="text-xl font-semibold">
                              {
                                currentReport.usersAccountStatistics
                                  .numberOfUserFollowing
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg">
                          <MessageSquare className="h-8 w-8 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-60">
                              Total Messages
                            </p>
                            <p className="text-xl font-semibold">
                              {currentReport.usersAccountStatistics
                                .numberOfMessagesSent +
                                currentReport.usersAccountStatistics
                                  .numberOfMessagesReceived}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg">
                          <Target className="h-8 w-8 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-60">
                              Tasks Completed
                            </p>
                            <p className="text-xl font-semibold">
                              {currentReport.usersTaskStatistics
                                .tasksCompletedBeforeDeadline.length +
                                currentReport.usersTaskStatistics
                                  .tasksCompletedAfterDeadline.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
