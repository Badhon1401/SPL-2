"use client";
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Activity,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Gauge,
  Calendar,
  CheckCircle,
  Timer,
  Settings
} from 'lucide-react';

const SessionStatisticsDashboard = () => {
  const [sessionStats, setSessionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [previousDays, setPreviousDays] = useState(30);
  const [showDaysDialog, setShowDaysDialog] = useState(true);

  const chartColors = [
    '#3b82f6',
    '#60a5fa',
    '#2563eb',
    '#93c5fd',
    '#1d4ed8',
    '#cbd5e1',
    '#64748b',
    '#475569',
  ];

  const fetchSessionStatistics = async (days) => {
    try {
      const response = await fetch(
        `/api/statistics/session?previousNumberOfDays=${days}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch session statistics');
      }
      const data = await response.json();
      setSessionStats(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showDaysDialog) {
      fetchSessionStatistics(previousDays);
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
      <Card className="w-full h-96 flex items-center justify-center mt-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-muted-foreground">Loading session statistics...</p>
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

  const SessionOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sessionStats.numberOfSession}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(sessionStats.totalSessionTime)} hrs
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
          <Gauge className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(sessionStats.averageSessionEfficiency)}%
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sessionStats.totalTasksOperated}</div>
        </CardContent>
      </Card>
    </div>
  );

  const SessionEfficiencyChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={sessionStats.previousSessionsEfficiencyScores.map((score, index) => ({
          session: `Session ${index + 1}`,
          efficiency: score
        }))}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="session" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="efficiency"
          stroke={chartColors[0]}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const SessionTimeDistribution = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart
        data={sessionStats.sessionNames.map((name, index) => ({
          name,
          time: sessionStats.totalSessionTime / sessionStats.numberOfSession,
          efficiency: sessionStats.previousSessionsEfficiencyScores[index]
        }))}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis />
        <Radar
          name="Time (hours)"
          dataKey="time"
          stroke={chartColors[0]}
          fill={chartColors[0]}
          fillOpacity={0.6}
        />
        <Radar
          name="Efficiency (%)"
          dataKey="efficiency"
          stroke={chartColors[1]}
          fill={chartColors[1]}
          fillOpacity={0.6}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );

  const SessionTasksScatter = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          name="Session Time"
          unit="hrs"
        />
        <YAxis
          dataKey="tasks"
          name="Tasks Completed"
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter
          name="Sessions"
          data={sessionStats.sessionNames.map((name, index) => ({
            time: sessionStats.totalSessionTime / sessionStats.numberOfSession,
            tasks: Math.round(sessionStats.totalTasksOperated / sessionStats.numberOfSession),
            efficiency: sessionStats.previousSessionsEfficiencyScores[index]
          }))}
          fill={chartColors[0]}
        >
          {sessionStats.sessionNames.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-8 mt-12">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Session Statistics Dashboard
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="efficiency">
                <Gauge className="w-4 h-4 mr-2" />
                Efficiency
              </TabsTrigger>
              <TabsTrigger value="distribution">
                <Target className="w-4 h-4 mr-2" />
                Distribution
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckCircle className="w-4 h-4 mr-2" />
                Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <SessionOverview />
            </TabsContent>

            <TabsContent value="efficiency">
              <SessionEfficiencyChart />
            </TabsContent>

            <TabsContent value="distribution">
              <SessionTimeDistribution />
            </TabsContent>

            <TabsContent value="tasks">
              <SessionTasksScatter />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Detailed Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Average Session Length
              </h4>
              <p className="text-2xl font-bold">
                {(sessionStats.totalSessionTime / sessionStats.numberOfSession).toFixed(1)} hrs
              </p>
              <p className="text-sm text-muted-foreground">
                Per session
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Tasks Per Session
              </h4>
              <p className="text-2xl font-bold">
                {(sessionStats.totalTasksOperated / sessionStats.numberOfSession).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">
                Average tasks
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Efficiency Trend
              </h4>
              <p className="text-2xl font-bold">
                {sessionStats.previousSessionsEfficiencyScores.length > 1
                  ? (sessionStats.previousSessionsEfficiencyScores[sessionStats.previousSessionsEfficiencyScores.length - 1] -
                     sessionStats.previousSessionsEfficiencyScores[sessionStats.previousSessionsEfficiencyScores.length - 2]).toFixed(1)
                  : "0"}%
              </p>
              <p className="text-sm text-muted-foreground">
                Change from last session
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionStatisticsDashboard;