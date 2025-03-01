"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  MessageSquare,
  Star,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  ThumbsUp,
  History,
  Filter,
} from "lucide-react";

const FeedbackStatisticsDashboard = () => {
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState("overview");
  const [previousDays, setPreviousDays] = useState(30);
  const [showDaysDialog, setShowDaysDialog] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState("all");

  const chartColors = [
    "#3b82f6",
    "#60a5fa",
    "#2563eb",
    "#93c5fd",
    "#1d4ed8",
    "#cbd5e1",
    "#64748b",
    "#475569",
  ];

  const fetchFeedbackStatistics = async (days) => {
    try {
      const response = await fetch(
        `/api/statistics/feedback?previousNumberOfDays=${days}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch feedback statistics");
      }
      const data = await response.json();
      setFeedbackStats(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showDaysDialog) {
      fetchFeedbackStatistics(previousDays);
    }
  }, [previousDays, showDaysDialog]);

  const getSentimentColor = (score) => {
    if (score >= 8) return "#22c55e"; // green
    if (score >= 6) return "#3b82f6"; // blue
    if (score >= 4) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  const calculateSentimentDistribution = () => {
    const distribution = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    feedbackStats.previousFeedbackScores.forEach((score) => {
      if (score >= 8) distribution.positive++;
      else if (score >= 5) distribution.neutral++;
      else distribution.negative++;
    });

    return [
      { name: "Positive", value: distribution.positive },
      { name: "Neutral", value: distribution.neutral },
      { name: "Negative", value: distribution.negative },
    ];
  };

  const handleDaysSubmit = (e) => {
    e.preventDefault();
    setShowDaysDialog(false);
    fetchFeedbackStatistics(previousDays);
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
          <p className="text-muted-foreground">
            Loading feedback statistics...
          </p>
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

  const FeedbackOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
          <MessageSquare className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {feedbackStats.feedbackCount}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Star className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {feedbackStats.averageFeedbackScore &&
            feedbackStats.averageFeedbackScore.length > 0
              ? feedbackStats.averageFeedbackScore[
                  feedbackStats.averageFeedbackScore.length - 1
                ]
              : "N/A"}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {feedbackStats.previousFeedbackScores &&
            feedbackStats.previousFeedbackScores.length > 0
              ? feedbackStats.previousFeedbackScores[
                  feedbackStats.previousFeedbackScores.length - 1
                ]
              : "N/A"}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score Trend</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(
              ((feedbackStats.previousFeedbackScores[
                feedbackStats.previousFeedbackScores.length - 1
              ] -
                feedbackStats.previousFeedbackScores[0]) /
                feedbackStats.previousFeedbackScores[0]) *
              100
            ).toFixed(1)}
            %
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FeedbackTrend = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={feedbackStats.previousFeedbackScores.map((score, index) => ({
          index: index + 1,
          score,
          average: feedbackStats.averageFeedbackScore,
        }))}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="index"
          label={{ value: "Feedback Number", position: "bottom" }}
        />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="score"
          stroke={chartColors[0]}
          strokeWidth={2}
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="average"
          stroke={chartColors[1]}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const SentimentDistribution = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={calculateSentimentDistribution()}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {calculateSentimentDistribution().map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const FeedbackMessages = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="positive">Positive Only</SelectItem>
            <SelectItem value="neutral">Neutral Only</SelectItem>
            <SelectItem value="negative">Negative Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {Array.isArray(feedbackStats.feedbackMessages) &&
  feedbackStats.feedbackMessages
    .filter((message) => {
      if (sentimentFilter === "all") return true;
      const score =
        feedbackStats.previousFeedbackScores[
          feedbackStats.feedbackMessages.indexOf(message)
        ];
      switch (sentimentFilter) {
        case "positive":
          return score >= 8;
        case "neutral":
          return score >= 5 && score < 8;
        case "negative":
          return score < 5;
        default:
          return true;
      }
    })
          .map((message, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start">
                <p className="text-sm">{message}</p>
                <span
                  className="ml-2 px-2 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: getSentimentColor(
                      feedbackStats.previousFeedbackScores[index]
                    ),
                    color: "white",
                  }}
                >
                  {feedbackStats.previousFeedbackScores[index]}/10
                </span>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 mt-12">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Feedback Statistics Dashboard
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
              <TabsTrigger value="trend">
                <LineChartIcon className="w-4 h-4 mr-2" />
                Trend
              </TabsTrigger>
              <TabsTrigger value="sentiment">
                <PieChartIcon className="w-4 h-4 mr-2" />
                Sentiment
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <FeedbackOverview />
            </TabsContent>

            <TabsContent value="trend">
              <FeedbackTrend />
            </TabsContent>

            <TabsContent value="sentiment">
              <SentimentDistribution />
            </TabsContent>

            <TabsContent value="messages">
              <FeedbackMessages />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Feedback Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Sentiment Ratio</h4>
              <p className="text-2xl font-bold">
                {(
                  (calculateSentimentDistribution()[0].value /
                    feedbackStats.feedbackCount) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-sm text-muted-foreground">Positive feedback</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Score Variance</h4>
              <p className="text-2xl font-bold">
                {Math.sqrt(
                  feedbackStats.previousFeedbackScores.reduce(
                    (acc, score) =>
                      acc +
                      Math.pow(score - feedbackStats.averageFeedbackScore, 2),
                    0
                  ) / feedbackStats.feedbackCount
                ).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Standard deviation in scores
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Response Rate</h4>
              <p className="text-2xl font-bold">
                {(
                  (feedbackStats.feedbackCount / feedbackStats.totalUsers) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-sm text-muted-foreground">
                Users who provided feedback
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackStatisticsDashboard;
