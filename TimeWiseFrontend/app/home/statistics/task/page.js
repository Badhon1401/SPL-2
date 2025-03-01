"use client";
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  PieChart as PieChartIcon,
  BarChart2,
  Activity
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TaskStatisticsDashboard = () => {
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [previousDays, setPreviousDays] = useState(30);
  const [showDaysDialog, setShowDaysDialog] = useState(true);
  

  const chartColors = [
    '#22c55e', // green for completed before deadline
    '#3b82f6', // blue for completed after deadline
    '#eab308', // yellow for uncrossed unfinished
    '#ef4444', // red for crossed unfinished
  ];

  const fetchTaskStatistics = async (days) => {
    try {
      const response = await fetch(`/api/statistics/task?previousNumberOfDays=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task statistics');
      }
      const data = await response.json();
      setTaskStats(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showDaysDialog) {
      fetchTaskStatistics(previousDays);
    }
  }, [previousDays, showDaysDialog]);

  const handleDaysSubmit = (e) => {
    e.preventDefault();
    setShowDaysDialog(false);
  };

  if (showDaysDialog) {
      return (
        <Dialog open={showDaysDialog} onOpenChange={setShowDaysDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Time Range</DialogTitle>
              <DialogDescription>
                Enter the number of previous days to analyze
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDaysSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="days">Number of Days</Label>
                <Input
                  id="days"
                  type="number"
                  value={previousDays}
                  onChange={(e) => setPreviousDays(e.target.value)}
                  min="1"
                  max="365"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Load Statistics
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      );
    }
  

  if (loading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground">Loading task statistics...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const TaskOverview = () => {
    const totalTasks = taskStats.tasksCompletedBeforeDeadline.length +
      taskStats.tasksCompletedAfterDeadline.length +
      taskStats.deadlineUncrossedAndUnfinishedTasks.length +
      taskStats.deadlineCrossedAndUnfinishedTasks.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((taskStats.tasksCompletedBeforeDeadline.length / totalTasks) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Completion</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((taskStats.tasksCompletedAfterDeadline.length / totalTasks) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((taskStats.deadlineUncrossedAndUnfinishedTasks.length / totalTasks) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((taskStats.deadlineCrossedAndUnfinishedTasks.length / totalTasks) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const TaskDistribution = () => {
    const data = [
      {
        name: 'Completed On Time',
        value: taskStats.tasksCompletedBeforeDeadline.length
      },
      {
        name: 'Completed Late',
        value: taskStats.tasksCompletedAfterDeadline.length
      },
      {
        name: 'Pending',
        value: taskStats.deadlineUncrossedAndUnfinishedTasks.length
      },
      {
        name: 'Overdue',
        value: taskStats.deadlineCrossedAndUnfinishedTasks.length
      }
    ];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const TaskCompletion = () => {
    const data = [
      {
        name: 'On Time',
        completed: taskStats.tasksCompletedBeforeDeadline.length,
        pending: taskStats.deadlineUncrossedAndUnfinishedTasks.length
      },
      {
        name: 'Late/Overdue',
        completed: taskStats.tasksCompletedAfterDeadline.length,
        pending: taskStats.deadlineCrossedAndUnfinishedTasks.length
      }
    ];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" fill={chartColors[0]} name="Completed" />
          <Bar dataKey="pending" fill={chartColors[2]} name="Pending" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-8 mt-12">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Task Statistics Dashboard
          </CardTitle>
          <Button
                                variant="outline"
                                onClick={() => setShowDaysDialog(true)}
                              >
                                Change Time Range
                              </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedView} onValueChange={setSelectedView}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="distribution">
                <PieChartIcon className="w-4 h-4 mr-2" />
                Distribution
              </TabsTrigger>
              <TabsTrigger value="completion">
                <BarChart2 className="w-4 h-4 mr-2" />
                Completion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <TaskOverview />
            </TabsContent>

            <TabsContent value="distribution">
              <TaskDistribution />
            </TabsContent>

            <TabsContent value="completion">
              <TaskCompletion />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Task Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Completion Rate
              </h4>
              <p className="text-2xl font-bold">
                {(((taskStats.tasksCompletedBeforeDeadline.length + 
                   taskStats.tasksCompletedAfterDeadline.length) / 
                  (taskStats.tasksCompletedBeforeDeadline.length + 
                   taskStats.tasksCompletedAfterDeadline.length + 
                   taskStats.deadlineUncrossedAndUnfinishedTasks.length + 
                   taskStats.deadlineCrossedAndUnfinishedTasks.length)) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Overall task completion
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                On-Time Rate
              </h4>
              <p className="text-2xl font-bold">
                {((taskStats.tasksCompletedBeforeDeadline.length / 
                  (taskStats.tasksCompletedBeforeDeadline.length + 
                   taskStats.tasksCompletedAfterDeadline.length)) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Tasks completed before deadline
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                At Risk
              </h4>
              <p className="text-2xl font-bold">
                {taskStats.deadlineCrossedAndUnfinishedTasks.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Tasks past deadline
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskStatisticsDashboard;