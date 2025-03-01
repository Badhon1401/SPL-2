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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Filter,
  Download,
  Share2,
  PieChart,
  BarChart2,
  Timer,
  Users,
  Target,
  Flag,
  Calendar,
} from "lucide-react";
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
  PieChart as RechartsePieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

// Custom hook for search and filtering
const useFilteredData = (data, searchTerm, filters) => {
  return useMemo(() => {
    if (!data) return null;

    let filtered = data.taskStatuses;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.taskOwner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.priority.length) {
      filtered = filtered.filter((task) =>
        filters.priority.toLowerCase().includes(task.taskPriority.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((task) => {
        switch (filters.status) {
          case "overdue":
            return task.isDeadlineCrossed;
          case "onTrack":
            return !task.isDeadlineCrossed && task.tasksCurrentProgress < 100;
          case "completed":
            return task.tasksCurrentProgress === 100;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, filters]);
};

// Enhanced Priority Badge Component
const TaskPriorityBadge = ({ priority }) => {
  const priorityConfig = {
    HIGH: {
      color: "bg-red-500",
      icon: ArrowUpCircle,
      label: "High Priority",
    },
    MEDIUM: {
      color: "bg-yellow-500",
      icon: Activity,
      label: "Medium Priority",
    },
    LOW: {
      color: "bg-green-500",
      icon: ArrowDownCircle,
      label: "Low Priority",
    },
  };

  const config = priorityConfig[priority.toUpperCase()];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} text-white flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
};


// Enhanced Task Progress Card
const TaskProgressCard = ({ task }) => {
  const isOverdue = task.isDeadlineCrossed;
  const progressColor = isOverdue ? "bg-red-500" : "bg-blue-500";

  const daysUntilDeadline = Math.ceil(
    (new Date(task.taskDeadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="w-full mb-4 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{task.taskName}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Owned by {task.taskOwner}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <TaskPriorityBadge priority={task.taskPriority} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Progress
              value={task.tasksCurrentProgress}
              className={progressColor}
            />
            <span className="text-sm font-medium">
              {task.tasksCurrentProgress}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>
                Created: {format(new Date(task.taskCreationDate), "PPP")}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-gray-500" />
              <span>
                {daysUntilDeadline > 0
                  ? `${daysUntilDeadline} days remaining`
                  : `${Math.abs(daysUntilDeadline)} days overdue`}
              </span>
            </div>
          </div>

          {isOverdue && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Overdue</AlertTitle>
              <AlertDescription>
                This task has passed its deadline by{" "}
                {Math.abs(daysUntilDeadline)} days
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Progress Over Time Chart
const ProgressOverTimeChart = ({ reports }) => {
  const [chartType, setChartType] = useState("line");

  const chartData = reports.map((report) => ({
    date: format(new Date(report.timeStamp), "PP"),
    completionRate:
      report.taskStatuses.reduce(
        (acc, task) => acc + task.tasksCurrentProgress,
        0
      ) / report.taskStatuses.length,
    overdueTasks: report.taskStatuses.filter((t) => t.isDeadlineCrossed).length,
    totalTasks: report.taskStatuses.length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button
          variant={chartType === "line" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("line")}
        >
          <LineChart className="w-4 h-4 mr-2" />
          Line
        </Button>
        <Button
          variant={chartType === "bar" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("bar")}
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          Bar
        </Button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer>
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="#2563eb"
                name="Completion Rate"
              />
              <Line
                type="monotone"
                dataKey="overdueTasks"
                stroke="#ef4444"
                name="Overdue Tasks"
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="completionRate"
                fill="#2563eb"
                name="Completion Rate"
              />
              <Bar dataKey="overdueTasks" fill="#ef4444" name="Overdue Tasks" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Enhanced Task Statistics Component
const TaskStatistics = ({ currentReport }) => {
  const stats = {
    totalTasks: currentReport.taskStatuses.length,
    overdueTasks: currentReport.taskStatuses.filter((t) => t.isDeadlineCrossed)
      .length,
    avgProgress: Math.round(
      currentReport.taskStatuses.reduce(
        (acc, task) => acc + task.tasksCurrentProgress,
        0
      ) / currentReport.taskStatuses.length
    ),
    onTrackTasks: currentReport.taskStatuses.filter(
      (t) => !t.isDeadlineCrossed && t.tasksCurrentProgress < 100
    ).length,
    completedTasks: currentReport.taskStatuses.filter(
      (t) => t.tasksCurrentProgress === 100
    ).length,
    urgentTasks: currentReport.taskStatuses.filter(
      (t) => t.taskPriority === "HIGH" && t.tasksCurrentProgress < 100
    ).length,
  };

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.totalTasks,
      icon: Target,
      color: "text-blue-500",
    },
    {
      label: "Overdue Tasks",
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      label: "Average Progress",
      value: `${stats.avgProgress}%`,
      icon: Activity,
      color: "text-green-500",
    },
    {
      label: "On Track",
      value: stats.onTrackTasks,
      icon: CheckCircle,
      color: "text-emerald-500",
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      icon: Flag,
      color: "text-purple-500",
    },
    {
      label: "Urgent Tasks",
      value: stats.urgentTasks,
      icon: Timer,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Icon className={`h-6 w-6 ${stat.color}`} />
                <div>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Enhanced Priority Distribution Component
const PriorityDistribution = ({ currentReport }) => {
  const [viewType, setViewType] = useState("pie");

  const distribution = currentReport.taskStatuses.reduce((acc, task) => {
    acc[task.taskPriority] = (acc[task.taskPriority] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(distribution).map(([priority, count]) => ({
    name: priority,
    value: count,
  }));

  const barData = Object.entries(distribution).map(([priority, count]) => ({
    priority,
    count,
    progress: Math.round(
      currentReport.taskStatuses
        .filter((t) => t.taskPriority === priority)
        .reduce((acc, t) => acc + t.tasksCurrentProgress, 0) / count
    ),
  }));

  const COLORS = {
    HIGH: "#ef4444",
    MEDIUM: "#eab308",
    LOW: "#22c55e",
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Priority Distribution</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={viewType === "pie" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("pie")}
            >
              <PieChart className="w-4 h-4 mr-2" />
              Pie
            </Button>
            <Button
              variant={viewType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("bar")}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Bar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {viewType === "pie" ? (
            <ResponsiveContainer>
              <RechartsePieChart>
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
                    <Cell key={index} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsePieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[entry.priority]} />
                  ))}
                </Bar>
                <Bar dataKey="progress" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Search and Filter Component
const SearchAndFilter = ({ onSearch, onFilter, filters }) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <Label htmlFor="search">Search Tasks</Label>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="search"
                placeholder="Search by task name or owner..."
                onChange={(e) => onSearch(e.target.value)}
                className="w-full"
              />
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Priority Filter</Label>
            <Select
              onValueChange={(value) => onFilter("priority", value)}
              defaultValue={filters.priority}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status Filter</Label>
            <Select
              onValueChange={(value) => onFilter("status", value)}
              defaultValue={filters.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="onTrack">On Track</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Team Performance Component
const TeamPerformance = ({ currentReport }) => {
  const teamStats = currentReport.taskStatuses.reduce((acc, task) => {
    if (!acc[task.taskOwner]) {
      acc[task.taskOwner] = {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        avgProgress: 0,
      };
    }

    const stats = acc[task.taskOwner];
    stats.totalTasks++;
    stats.completedTasks += task.tasksCurrentProgress === 100 ? 1 : 0;
    stats.overdueTasks += task.isDeadlineCrossed ? 1 : 0;
    stats.avgProgress += task.tasksCurrentProgress;

    return acc;
  }, {});

  // Calculate final averages
  Object.values(teamStats).forEach((stats) => {
    stats.avgProgress = Math.round(stats.avgProgress / stats.totalTasks);
  });

  const teamData = Object.entries(teamStats).map(([name, stats]) => ({
    name,
    ...stats,
    performance: Math.round((stats.completedTasks / stats.totalTasks) * 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>Performance metrics by team member</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {teamData.map((member, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{member.name}</span>
                </div>
                <Badge
                  variant={member.performance >= 70 ? "success" : "warning"}
                >
                  {member.performance}% Completion Rate
                </Badge>
              </div>
              <Progress value={member.avgProgress} className="w-full" />
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                <div>Total: {member.totalTasks}</div>
                <div>Completed: {member.completedTasks}</div>
                <div>Overdue: {member.overdueTasks}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Report Comparison Tool Component
const ReportComparison = ({ currentReport, previousReports }) => {
  const [compareDate, setCompareDate] = useState("");
  const comparisonReport = previousReports.find(
    (r) => format(new Date(r.timeStamp), "yyyy-MM-dd") === compareDate
  );

  const getComparisonData = () => {
    if (!comparisonReport) return null;

    const current = {
      avgProgress: Math.round(
        currentReport.taskStatuses.reduce(
          (acc, t) => acc + t.tasksCurrentProgress,
          0
        ) / currentReport.taskStatuses.length
      ),
      overdueTasks: currentReport.taskStatuses.filter(
        (t) => t.isDeadlineCrossed
      ).length,
      completedTasks: currentReport.taskStatuses.filter(
        (t) => t.tasksCurrentProgress === 100
      ).length,
    };

    const previous = {
      avgProgress: Math.round(
        comparisonReport.taskStatuses.reduce(
          (acc, t) => acc + t.tasksCurrentProgress,
          0
        ) / comparisonReport.taskStatuses.length
      ),
      overdueTasks: comparisonReport.taskStatuses.filter(
        (t) => t.isDeadlineCrossed
      ).length,
      completedTasks: comparisonReport.taskStatuses.filter(
        (t) => t.tasksCurrentProgress === 100
      ).length,
    };

    return { current, previous };
  };

  const comparisonData = getComparisonData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Comparison</CardTitle>
        <div className="mt-2">
          <Select onValueChange={setCompareDate} value={compareDate}>
            <SelectTrigger>
              <SelectValue placeholder="Select date to compare" />
            </SelectTrigger>
            <SelectContent>
              {previousReports.map((report) => (
                <SelectItem
                  key={report.timeStamp}
                  value={format(new Date(report.timeStamp), "yyyy-MM-dd")}
                >
                  {format(new Date(report.timeStamp), "PPP")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {comparisonData && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <ComparisonCard
                title="Average Progress"
                current={comparisonData.current.avgProgress}
                previous={comparisonData.previous.avgProgress}
                unit="%"
              />
              <ComparisonCard
                title="Overdue Tasks"
                current={comparisonData.current.overdueTasks}
                previous={comparisonData.previous.overdueTasks}
              />
              <ComparisonCard
                title="Completed Tasks"
                current={comparisonData.current.completedTasks}
                previous={comparisonData.previous.completedTasks}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Comparison Card Component
const ComparisonCard = ({ title, current, previous, unit = "" }) => {
  const difference = current - previous;
  const percentageChange = Math.round((difference / previous) * 100);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex justify-between items-end">
        <p className="text-2xl font-bold">
          {current}
          {unit}
        </p>
        <div
          className={`flex items-center ${
            difference >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {difference >= 0 ? (
            <ArrowUpCircle className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownCircle className="w-4 h-4 mr-1" />
          )}
          <span className="text-sm font-medium">
            {Math.abs(percentageChange)}%
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Previous: {previous}
        {unit}
      </p>
    </div>
  );
};


// Performance Insights Component
const PerformanceInsights = ({ currentReport, previousReports }) => {
  const getInsights = () => {
    const insights = [];
    const currentAvgProgress = Math.round(
      currentReport.taskStatuses.reduce(
        (acc, t) => acc + t.tasksCurrentProgress,
        0
      ) / currentReport.taskStatuses.length
    );

    // Trend Analysis
    const previousAvgProgress =
      previousReports.length > 0
        ? Math.round(
            previousReports[0].taskStatuses.reduce(
              (acc, t) => acc + t.tasksCurrentProgress,
              0
            ) / previousReports[0].taskStatuses.length
          )
        : null;

    if (previousAvgProgress !== null) {
      const progressDiff = currentAvgProgress - previousAvgProgress;
      insights.push({
        type: progressDiff >= 0 ? "positive" : "negative",
        message: `Overall progress has ${
          progressDiff >= 0 ? "increased" : "decreased"
        } by ${Math.abs(progressDiff)}% compared to last report`,
        icon: progressDiff >= 0 ? CheckCircle : AlertTriangle,
      });
    }

    // Overdue Analysis
    const overdueTasks = currentReport.taskStatuses.filter(
      (t) => t.isDeadlineCrossed
    );
    if (overdueTasks.length > 0) {
      insights.push({
        type: "warning",
        message: `${overdueTasks.length} tasks are currently overdue`,
        icon: Clock,
      });
    }

    // High Priority Analysis
    const highPriorityTasks = currentReport.taskStatuses.filter(
      (t) => t.taskPriority === "HIGH" && t.tasksCurrentProgress < 100
    );
    if (highPriorityTasks.length > 0) {
      insights.push({
        type: "urgent",
        message: `${highPriorityTasks.length} high-priority tasks need attention`,
        icon: AlertTriangle,
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Alert
                key={index}
                variant={
                  insight.type === "positive" ? "default" : "destructive"
                }
              >
                <Icon className="h-4 w-4" />
                <AlertTitle>
                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}{" "}
                  Insight
                </AlertTitle>
                <AlertDescription>{insight.message}</AlertDescription>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Page Component
export default function ProgressReportPage() {
  const [currentReport, setCurrentReport] = useState(null);
  const [previousReports, setPreviousReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [currentResponse, previousResponse] = await Promise.all([
          fetch("/api/progress-report/current"),
          fetch("/api/progress-report/previous"),
        ]);

        if (!currentResponse.ok || !previousResponse.ok) {
          throw new Error("Failed to fetch data");
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

    fetchData();
  }, []);

  const handleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value === "all" ? "" : value,
    }));
  };

  const filteredData = useFilteredData(currentReport, searchTerm, filters);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen mt-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4 mt-12">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!currentReport) {
    return (
      <Alert className="m-4 mt-12">
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No progress report data available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Progress Report Dashboard</h1>
        </div>

        <SearchAndFilter
          onSearch={setSearchTerm}
          onFilter={handleFilter}
          filters={filters}
        />

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current">Current Progress</TabsTrigger>
            <TabsTrigger value="history">Historical Data</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Current Progress Report</CardTitle>
                    <CardDescription>
                      Last updated:{" "}
                      {new Date(currentReport.timeStamp).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      {filteredData.map((task, index) => (
                        <TaskProgressCard key={index} task={task} />
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <TaskStatistics currentReport={currentReport} />
                <PriorityDistribution currentReport={currentReport} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <ReportComparison
                currentReport={currentReport}
                previousReports={previousReports}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Progress Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressOverTimeChart
                    reports={[currentReport, ...previousReports]}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-6">
              <TeamPerformance currentReport={currentReport} />
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <PerformanceInsights
              currentReport={currentReport}
              previousReports={previousReports}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
