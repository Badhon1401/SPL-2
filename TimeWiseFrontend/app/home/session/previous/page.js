"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const PreviousSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/session/mysessions");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const SessionCard = ({ session }) => (
    <Card 
      className={`mb-4 cursor-pointer transition-all hover:shadow-md ${
        selectedSession?.id === session.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => setSelectedSession(session)}
    >
      <CardHeader>
        <CardTitle className="text-lg">
          {format(new Date(session.sessionTimeStamp), 'PPP')}
        </CardTitle>
        <CardDescription>{session.scenario || 'Meditation Session'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Duration: {session.duration} minutes</span>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Efficiency</p>
            <Progress value={session.sessionEfficiency} />
            <p className="text-xs text-muted-foreground text-right">
              {session.sessionEfficiency}%
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Goal</p>
            <p className="text-sm text-muted-foreground">{session.sessionGoal}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 mt-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/home/session">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft size={16} />
                Back to Sessions
              </Button>
            </Link>
          </div>
          <Button variant="outline" onClick={fetchSessions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Previous Sessions</CardTitle>
              <CardDescription>Your meditation journey</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="animate-spin" />
                  </div>
                ) : sessions.length === 0 ? (
                  <Alert>
                    <AlertTitle>No sessions yet</AlertTitle>
                    <AlertDescription>
                      Start your first meditation session to begin your journey.
                    </AlertDescription>
                  </Alert>
                ) : (
                  sessions.map((session, index) => (
                    <SessionCard key={index} session={session} />
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>
                {selectedSession 
                  ? format(new Date(selectedSession.sessionTimeStamp), 'PPP pp')
                  : 'Select a session to view details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSession ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Session Goal</h3>
                      <p className="text-muted-foreground">
                        {selectedSession.sessionGoal}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Environment</h3>
                      <p className="text-muted-foreground">
                        {selectedSession.scenario || 'Classic Meditation'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Duration</h3>
                      <p className="text-muted-foreground">
                        {selectedSession.duration} minutes
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Efficiency</h3>
                      <Progress value={selectedSession.sessionEfficiency} className="mt-2" />
                      <p className="text-xs text-muted-foreground text-right mt-1">
                        {selectedSession.sessionEfficiency}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Session Outcome</h3>
                    <p className="text-muted-foreground">
                      {selectedSession.sessionOutcome}
                    </p>
                  </div>

                  {selectedSession.tasksOperated?.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Tasks Completed</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedSession.tasksOperated.map((task, index) => (
                          <li key={index} className="text-muted-foreground">
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">
                    Select a session from the list to view its details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PreviousSessionsPage;