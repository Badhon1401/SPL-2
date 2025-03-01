"use client";
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  BarChart3,
  Activity,
  Target,
  Calendar,
  Star,
  Laptop,
  Brain,
  Timer,
  CheckCircle2
} from 'lucide-react';

const DeepWorkDashboard = () => {
  const [deepWorkData, setDeepWorkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisualization, setSelectedVisualization] = useState('overview');
  const [previousDays, setPreviousDays] = useState(30);
  const [showDaysDialog, setShowDaysDialog] = useState(true);
  const [timeGrouping, setTimeGrouping] = useState('hourly');

  // Color palette for dark mode compatibility
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#2563eb',
    muted: '#94a3b8',
    success: '#22c55e',
    warning: '#f59e0b',
    background: '#0f172a',
    text: '#e2e8f0'
  };

  const fetchDeepWorkData = async (days) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/deep-work-analytics?previousNumberOfDays=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch deep work data');
      }
      const data = await response.json();
      setDeepWorkData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDaysSubmit = (e) => {
    e.preventDefault();
    setShowDaysDialog(false);
    fetchDeepWorkData(previousDays);
  };

  useEffect(() => {
    if (!showDaysDialog) {
      fetchDeepWorkData(previousDays);
    }
  }, [showDaysDialog, previousDays]);

  if (showDaysDialog) {
    return (
      <Dialog open={showDaysDialog} onOpenChange={setShowDaysDialog}>
        <DialogContent className="sm:max-w-md dark:bg-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">
              Select Analysis Period
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Choose the number of previous days to analyze your deep work patterns
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDaysSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="days" className="dark:text-white">Analysis Period (Days)</Label>
              <Input
                id="days"
                type="number"
                value={previousDays}
                onChange={(e) => setPreviousDays(Number(e.target.value))}
                min="1"
                max="365"
                required
                className="dark:bg-black dark:text-white dark:border-gray-900"
              />
            </div>
            <Button type="submit" className="w-full">
              Load Deep Work Analytics
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  if (loading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center mt-8 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground dark:text-gray-300">Loading deep work analytics...</p>
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

  // Data processing functions
  const processTimeData = () => {
    if (!deepWorkData) return [];
    
    if (timeGrouping === 'hourly') {
      return deepWorkData.map(item => ({
        timeSlot: item.timeSlot,
        hoursWorked: Number(item.totalHoursWorked.toFixed(2)),
        tasks: item.totalTasksOperated,
        efficiency: Number(item.averageEfficiencyScore.toFixed(2)),
        sessions: item.sessionCount
      }));
    } else {
      // Group by morning/afternoon/evening/night
      const timeGroups = {
        'Morning (6AM-12PM)': [],
        'Afternoon (12PM-6PM)': [],
        'Evening (6PM-12AM)': [],
        'Night (12AM-6AM)': []
      };

      deepWorkData.forEach(item => {
        const hour = parseInt(item.timeSlot.split(':')[0]);
        let group;
        if (hour >= 6 && hour < 12) group = 'Morning (6AM-12PM)';
        else if (hour >= 12 && hour < 18) group = 'Afternoon (12PM-6PM)';
        else if (hour >= 18) group = 'Evening (6PM-12AM)';
        else group = 'Night (12AM-6AM)';

        timeGroups[group].push(item);
      });

      return Object.entries(timeGroups).map(([group, items]) => {
        const totalHours = items.reduce((sum, item) => sum + item.totalHoursWorked, 0);
        const totalTasks = items.reduce((sum, item) => sum + item.totalTasksOperated, 0);
        const avgEfficiency = items.length ? 
          items.reduce((sum, item) => sum + item.averageEfficiencyScore, 0) / items.length : 0;
        const totalSessions = items.reduce((sum, item) => sum + item.sessionCount, 0);

        return {
          timeSlot: group,
          hoursWorked: Number(totalHours.toFixed(2)),
          tasks: totalTasks,
          efficiency: Number(avgEfficiency.toFixed(2)),
          sessions: totalSessions
        };
      });
    }
  };

  const calculateSummaryMetrics = () => {
    if (!deepWorkData) return null;

    const totalHours = deepWorkData.reduce((sum, item) => sum + item.totalHoursWorked, 0);
    const totalTasks = deepWorkData.reduce((sum, item) => sum + item.totalTasksOperated, 0);
    const totalSessions = deepWorkData.reduce((sum, item) => sum + item.sessionCount, 0);
    const avgEfficiency = deepWorkData.reduce((sum, item) => sum + item.averageEfficiencyScore, 0) / deepWorkData.length;

    return {
      totalHours: Number(totalHours.toFixed(2)),
      totalTasks,
      totalSessions,
      avgEfficiency: Number(avgEfficiency.toFixed(2)),
      avgTasksPerHour: Number((totalTasks / totalHours).toFixed(2)),
      avgSessionLength: Number((totalHours / totalSessions).toFixed(2))
    };
  };

  // Component sections
  const MetricsOverview = () => {
    const metrics = calculateSummaryMetrics();
    if (!metrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="dark:bg-black hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Total Deep Work Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{metrics.totalHours}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              hrs over {previousDays} days
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-black hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Average Efficiency
            </CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{metrics.avgEfficiency}%</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              across all sessions
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-black hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Total Tasks Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{metrics.totalTasks}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {metrics.avgTasksPerHour} tasks/hour
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-black hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Total Sessions
            </CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{metrics.totalSessions}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              avg {metrics.avgSessionLength} hrs/session
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const TimeDistributionChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={processTimeData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timeSlot" angle={-45} textAnchor="end" height={80} />
        <YAxis yAxisId="left" orientation="left" stroke={chartColors.primary} />
        <YAxis yAxisId="right" orientation="right" stroke={chartColors.secondary} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="hoursWorked" name="Hours Worked" fill={chartColors.primary} />
        <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency %" stroke={chartColors.secondary} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const ProductivityMatrix = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={processTimeData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timeSlot" angle={-45} textAnchor="end" height={80} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="tasks" name="Tasks" stackId="1" fill={chartColors.primary} stroke={chartColors.primary} />
        <Area type="monotone" dataKey="sessions" name="Sessions" stackId="1" fill={chartColors.secondary} stroke={chartColors.secondary} />
      </AreaChart>
    </ResponsiveContainer>
  );

  const EfficiencyRadar = () => {
    const data = processTimeData().map(item => ({
      name: item.timeSlot,
      value: item.efficiency
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="10%" 
          outerRadius="80%" 
          data={data}
          startAngle={0}
          endAngle={360}
        >
          <RadialBar
            minAngle={15}
            label={{ position: 'insideStart', fill: '#fff' }}
            background
            clockWise
            dataKey="value"
          />
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-8 mt-12">
      <Card className="dark:bg-black">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold dark:text-white">
            Deep Work Analytics Dashboard
          </CardTitle>
          <div className="flex space-x-4">
            <Select value={timeGrouping} onValueChange={setTimeGrouping}>
              <SelectTrigger className="w-[180px] dark:bg-gray-900 dark:text-white">
                <SelectValue placeholder="Select time grouping" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly Breakdown</SelectItem>
                <SelectItem value="period">Time Period Groups</SelectItem>
              </SelectContent>
            </Select>
            <Button
             variant="outline"
              onClick={() => setShowDaysDialog(true)}
              className="dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              Change Period
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedVisualization} onValueChange={setSelectedVisualization}>
            <TabsList className="grid w-full grid-cols-5 dark:bg-gray-900">
              <TabsTrigger value="overview" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-800">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="time" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-800">
                <Clock className="w-4 h-4 mr-2" />
                Time Analysis
              </TabsTrigger>
              <TabsTrigger value="productivity" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-800">
                <Target className="w-4 h-4 mr-2" />
                Productivity
              </TabsTrigger>
              <TabsTrigger value="efficiency" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-800">
                <Star className="w-4 h-4 mr-2" />
                Efficiency
              </TabsTrigger>
              <TabsTrigger value="insights" className="dark:text-gray-200 dark:data-[state=active]:bg-gray-800">
                <Brain className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <MetricsOverview />
              <Card className="dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold dark:text-white">
                    Quick Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-gray-900">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          Peak Performance Time
        </h4>
        {(() => {
          const timeData = processTimeData();
          if (timeData.length === 0) {
            return <p>No data available</p>;
          }
          const peakEfficiency = timeData.reduce((max, item) => 
            item.efficiency > max.efficiency ? item : max, timeData[0]
          );
          return (
            <div className="space-y-2">
              <p className="text-lg font-bold text-blue-800 dark:text-blue-100">
                {peakEfficiency.timeSlot}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Efficiency: {peakEfficiency.efficiency}%
              </p>
            </div>
          );
        })()}
      </div>

      <div className="p-4 rounded-lg bg-green-50 dark:bg-gray-900">
        <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">
          Most Productive Period
        </h4>
        {(() => {
          const timeData = processTimeData();
          if (timeData.length === 0) {
            return <p>No data available</p>;
          }
          const peakProductivity = timeData.reduce((max, item) => 
            (item.tasks / item.hoursWorked) > (max.tasks / max.hoursWorked) ? item : max, timeData[0]
          );
          return (
            <div className="space-y-2">
              <p className="text-lg font-bold text-green-800 dark:text-green-100">
                {peakProductivity.timeSlot}
              </p>
              <p className="text-sm text-green-600 dark:text-green-300">
                {(peakProductivity.tasks / peakProductivity.hoursWorked).toFixed(1)} tasks/hour
              </p>
            </div>
          );
        })()}
      </div>
    </div>

    <div className="p-4 rounded-lg bg-purple-50 dark:bg-gray-900">
      <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-2">
        Recommendations
      </h4>
      <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-100">
        {(() => {
          const metrics = calculateSummaryMetrics();
          const recommendations = [];

          if (metrics.avgEfficiency < 70) {
            recommendations.push(
              "Consider implementing the Pomodoro Technique to improve focus and efficiency"
            );
          }

          if (metrics.avgTasksPerHour < 2) {
            recommendations.push(
              "Try breaking down tasks into smaller, more manageable chunks"
            );
          }

          if (metrics.avgSessionLength > 2) {
            recommendations.push(
              "Consider taking more frequent breaks to maintain high efficiency"
            );
          }

          return recommendations.map((rec, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="mt-1">•</span>
              <span>{rec}</span>
            </li>
          ));
        })()}
      </ul>
    </div>
  </div>
</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time" className="space-y-4">
              <Card className="dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold dark:text-white">
                    Time Distribution Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimeDistributionChart />
                </CardContent>
              </Card>

              <Card className="dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold dark:text-white">
                    Time Utilization Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {processTimeData().map((timeSlot, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium dark:text-white">{timeSlot.timeSlot}</span>
                          <span className="text-sm text-muted-foreground dark:text-gray-400">
                            {timeSlot.hoursWorked} hours
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${(timeSlot.hoursWorked / calculateSummaryMetrics().totalHours) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="productivity" className="space-y-4">
              <Card className="dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold dark:text-white">
                    Tasks and Sessions Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductivityMatrix />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="dark:bg-black">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold dark:text-white">
                      Task Completion Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {processTimeData().map((timeSlot, index) => {
                        const completionRate = (timeSlot.tasks / timeSlot.sessions).toFixed(1);
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium dark:text-white">
                                {timeSlot.timeSlot}
                              </span>
                              <span className="text-sm text-muted-foreground dark:text-gray-400">
                                {completionRate} tasks/session
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-900 rounded-full">
                              <div
                                className="h-2 bg-green-500 rounded-full"
                                style={{
                                  width: `${Math.min((completionRate / 5) * 100, 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-black">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold dark:text-white">
                      Session Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {processTimeData().map((timeSlot, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium dark:text-white">
                              {timeSlot.timeSlot}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Timer className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground dark:text-gray-400">
                                {(timeSlot.hoursWorked / timeSlot.sessions).toFixed(1)} hrs/session
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-900 rounded-full">
                              <div
                                className="h-2 bg-purple-500 rounded-full"
                                style={{
                                  width: `${(timeSlot.sessions / calculateSummaryMetrics().totalSessions) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground dark:text-gray-400">
                              {timeSlot.sessions} sessions
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="efficiency" className="space-y-4">
              <Card className="dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold dark:text-white">
                    Efficiency Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EfficiencyRadar />
                </CardContent>
              </Card>

              <Card className="dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold dark:text-white">
                    Efficiency Trends and Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {processTimeData()
                      .sort((a, b) => b.efficiency - a.efficiency)
                      .map((timeSlot, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium dark:text-white">
                              {timeSlot.timeSlot}
                            </span>
                            <span className="text-sm text-muted-foreground dark:text-gray-400">
                              {timeSlot.efficiency}% efficient
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2.5">
                            <div
                              className="bg-green-500 h-2.5 rounded-full"
                              style={{ width: `${timeSlot.efficiency}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-gray-400">
                            {timeSlot.tasks} tasks completed in {timeSlot.hoursWorked} hours
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card className="dark:bg-black">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold dark:text-white">
                    Key Insights and Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {(() => {
                      const metrics = calculateSummaryMetrics();
                      const timeData = processTimeData();
                      const insights = [];

                      // Peak Performance Times
                      const peakEfficiency = timeData.reduce((max, item) => 
                        item.efficiency > max.efficiency ? item : max
                      );
                      insights.push({
                        title: "Peak Performance",
                        description: `Your highest efficiency of ${peakEfficiency.efficiency}% occurs during ${peakEfficiency.timeSlot}`,
                        icon: Star,
                        color: "text-yellow-500"
                      });

                      // Workload Distribution
                      const busyPeriod = timeData.reduce((max, item) => 
                        item.tasks > max.tasks ? item : max
                      );
                      insights.push({
                        title: "Workload Patterns",
                        description: `Most tasks (${busyPeriod.tasks}) are completed during ${busyPeriod.timeSlot}`,
                        icon: CheckCircle2,
                        color: "text-green-500"
                      });

                      // Session Duration Analysis
                      const avgSessionTrend = timeData.map(item => 
                        item.hoursWorked / item.sessions
                      ).reduce((a, b) => a + b) / timeData.length;
                      insights.push({
                        title: "Session Duration Trends",
                        description: `Average session duration is ${avgSessionTrend.toFixed(2)} hours`,
                        icon: Timer,
                        color: "text-purple-500"
                      });

                      // Efficiency Consistency
                      const efficiencyVariance = timeData.reduce((variance, item) => {
                        return variance + Math.pow(item.efficiency - metrics.avgEfficiency, 2);
                      }, 0) / timeData.length;
                      insights.push({
                        title: "Efficiency Consistency",
                        description: `Your efficiency variance is ${efficiencyVariance.toFixed(2)}%, indicating ${efficiencyVariance > 10 ? 'inconsistent' : 'consistent'} performance`,
                        icon: Activity,
                        color: "text-blue-500"
                      });

                      // Task Completion Efficiency
                      const taskEfficiency = metrics.totalTasks / metrics.totalHours;
                      insights.push({
                        title: "Task Completion Rate",
                        description: `You complete an average of ${taskEfficiency.toFixed(1)} tasks per hour`,
                        icon: Target,
                        color: "text-red-500"
                      });

                      return insights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                          <div className={`mt-1 ${insight.color}`}>
                            <insight.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium dark:text-white mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-sm text-muted-foreground dark:text-gray-300">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="dark:bg-black">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold dark:text-white">
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const metrics = calculateSummaryMetrics();
                        const recommendations = [];

                        // Time Management
                        if (metrics.avgSessionLength > 2.5) {
                          recommendations.push({
                            title: "Optimize Session Duration",
                            description: "Consider breaking longer sessions into shorter, more focused periods",
                            icon: Clock
                          });
                        }

                        // Efficiency Improvement
                        if (metrics.avgEfficiency < 75) {
                          recommendations.push({
                            title: "Boost Efficiency",
                            description: "Try implementing the Pomodoro Technique to maintain higher focus levels",
                            icon: Target
                          });
                        }

                        // Task Management
                        if (metrics.avgTasksPerHour < 1.5) {
                          recommendations.push({
                            title: "Task Breakdown",
                            description: "Break down complex tasks into smaller, manageable subtasks",
                            icon: CheckCircle2
                          });
                        }

                        // Peak Performance
                        const timeData = processTimeData();
                        const peakHours = timeData
                          .filter(item => item.efficiency > metrics.avgEfficiency)
                          .map(item => item.timeSlot);
                        if (peakHours.length > 0) {
                          recommendations.push({
                            title: "Leverage Peak Hours",
                            description: `Schedule important tasks during your peak performance times: ${peakHours.join(", ")}`,
                            icon: Star
                          });
                        }

                        return recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-gray-900">
                            <rec.icon className="w-5 h-5 mt-1 text-blue-500" />
                            <div>
                              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                {rec.title}
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                {rec.description}
                              </p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-black">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold dark:text-white">
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {(() => {
                        const metrics = calculateSummaryMetrics();
                        const timeData = processTimeData();
                        
                        // Calculate overall performance score
                        const performanceScore = (
                          (metrics.avgEfficiency * 0.4) +
                          (Math.min(metrics.avgTasksPerHour * 20, 100) * 0.3) +
                          (Math.min(metrics.totalHours / previousDays * 25, 100) * 0.3)
                        ).toFixed(1);

                        return (
                          <>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {performanceScore}%
                              </div>
                              <div className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                                Overall Performance Score
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="dark:text-white">Daily Deep Work Goal</span>
                                  <span className="text-muted-foreground dark:text-gray-400">
                                    {(metrics.totalHours / previousDays).toFixed(1)} hrs/day
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min((metrics.totalHours / previousDays / 8) * 100, 100)}%`
                                    }}
                                  ></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="dark:text-white">Task Completion Rate</span>
                                  <span className="text-muted-foreground dark:text-gray-400">
                                    {metrics.avgTasksPerHour.toFixed(1)} tasks/hr
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(metrics.avgTasksPerHour * 20, 100)}%`
                                    }}
                                  ></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="dark:text-white">Average Efficiency</span>
                                  <span className="text-muted-foreground dark:text-gray-400">
                                    {metrics.avgEfficiency.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2">
                                  <div
                                    className="bg-purple-500 h-2 rounded-full"
                                    style={{ width: `${metrics.avgEfficiency}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeepWorkDashboard;