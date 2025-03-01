"use client";
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
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
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  MessageCircle,
  Users,
  Target,
  Calendar,
  Star
} from 'lucide-react';

const UserStatisticsDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisualization, setSelectedVisualization] = useState('overview');
  const [feedbackScoreView, setFeedbackScoreView] = useState('histogram');
  const [previousDays, setPreviousDays] = useState(30);
  const [showDaysDialog, setShowDaysDialog] = useState(true);

  // Consistent color palette that works well in both light and dark modes
  const chartColors = [
    '#3b82f6', // Primary blue
    '#60a5fa', // Lighter blue
    '#2563eb', // Darker blue
    '#93c5fd', // Very light blue
    '#1d4ed8', // Deep blue
    '#cbd5e1', // Light gray
    '#64748b', // Medium gray
    '#475569', // Dark gray
  ];

  const fetchStatistics = async (days) => {
    try {
      const response = await fetch(`/api/statistics/account?previousNumberOfDays=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStatistics(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDaysSubmit = (e) => {
    e.preventDefault();
    setShowDaysDialog(false);
    fetchStatistics(previousDays);
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
          <p className="text-muted-foreground">Loading statistics...</p>
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

  const prepareEngagementData = () => {
    return [
      {
        name: 'Messages Sent',
        value: statistics.numberOfMessagesSent,
        icon: MessageCircle
      },
      {
        name: 'Messages Received',
        value: statistics.numberOfMessagesReceived,
        icon: MessageCircle
      },
      {
        name: 'Following',
        value: statistics.numberOfUserFollowing,
        icon: Users
      },
      {
        name: 'Teams',
        value: statistics.teamsParticipated,
        icon: Target
      },
      {
        name: 'Tasks',
        value: statistics.numberOfTasksParticipated,
        icon: Calendar
      },
      {
        name: 'Sessions',
        value: statistics.numberOfSessionsCreated,
        icon: Star
      }
    ];
  };

  const prepareFeedbackHistogram = () => {
    const histogram = Array(11).fill(0);
    statistics.previousFeedbackScores.forEach(score => {
      histogram[score]++;
    });
    return histogram.map((count, score) => ({
      score,
      count
    }));
  };

  const prepareFeedbackTimeline = () => {
    return statistics.previousFeedbackScores.map((score, index) => ({
      session: `Session ${index + 1}`,
      score
    }));
  };

  const FeedbackScoreHistogram = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart 
        data={prepareFeedbackHistogram()} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="score" 
          label={{ value: 'Score', position: 'bottom' }}
        />
        <YAxis 
          label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <Bar dataKey="count">
          {prepareFeedbackHistogram().map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const FeedbackScoreTimeline = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart 
        data={prepareFeedbackTimeline()} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="session" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke={chartColors[0]} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );

  const EngagementMetricsBar = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart 
        data={prepareEngagementData()} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value">
          {prepareEngagementData().map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const EngagementMetricsPie = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={prepareEngagementData()}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          label
        >
          {prepareEngagementData().map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const EngagementMetricsArea = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart 
        data={prepareEngagementData()} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="value" fill={chartColors[0]} stroke={chartColors[1]} />
      </AreaChart>
    </ResponsiveContainer>
  );

  const MetricsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {prepareEngagementData().map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.name}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 mt-12">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            User Statistics Dashboard
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setShowDaysDialog(true)}
          >
            Change Time Range
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedVisualization} onValueChange={setSelectedVisualization}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="bar">
                <BarChart3 className="w-4 h-4 mr-2" />
                Bar Chart
              </TabsTrigger>
              <TabsTrigger value="pie">
                <PieChartIcon className="w-4 h-4 mr-2" />
                Pie Chart
              </TabsTrigger>
              <TabsTrigger value="area">
                <LineChartIcon className="w-4 h-4 mr-2" />
                Area Chart
              </TabsTrigger>
              <TabsTrigger value="feedback">
                <Star className="w-4 h-4 mr-2" />
                Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <MetricsOverview />
            </TabsContent>

            <TabsContent value="bar">
              <EngagementMetricsBar />
            </TabsContent>

            <TabsContent value="pie">
              <EngagementMetricsPie />
            </TabsContent>

            <TabsContent value="area">
              <EngagementMetricsArea />
            </TabsContent>

            <TabsContent value="feedback">
              <div className="space-y-4">
                <Select 
                  value={feedbackScoreView} 
                  onValueChange={setFeedbackScoreView}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visualization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="histogram">Histogram</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                  </SelectContent>
                </Select>
                {feedbackScoreView === 'histogram' ? (
                  <div className="p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      Feedback Score Distribution
                    </h3>
                    <FeedbackScoreHistogram />
                  </div>
                ) : (
                  <div className="p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      Feedback Score Timeline
                    </h3>
                    <FeedbackScoreTimeline />
                  </div>
                )}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    Statistics for the last {previousDays} days
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      Average Score: {
                        (statistics.previousFeedbackScores.reduce((a, b) => a + b, 0) / 
                        statistics.previousFeedbackScores.length).toFixed(1)
                      }
                    </div>
                    <div>
                      Total Feedbacks: {statistics.previousFeedbackScores.length}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Summary Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Total Engagement
              </h4>
              <p className="text-2xl font-bold">
                {statistics.numberOfMessagesSent + statistics.numberOfMessagesReceived}
              </p>
              <p className="text-sm text-muted-foreground">
                Messages exchanged
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Network Size
              </h4>
              <p className="text-2xl font-bold">
                {statistics.numberOfUserFollowing}
              </p>
              <p className="text-sm text-muted-foreground">
                Users following
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Activity Score
              </h4>
              <p className="text-2xl font-bold">
                {((statistics.numberOfTasksParticipated + statistics.numberOfSessionsCreated) / previousDays).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">
                Average daily activities
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Team Collaboration
              </h4>
              <p className="text-2xl font-bold">
                {statistics.teamsParticipated}
              </p>
              <p className="text-sm text-muted-foreground">
                Teams joined
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatisticsDashboard;