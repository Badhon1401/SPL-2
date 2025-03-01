"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Send, 
  Plus,
  Trash2,
  Edit,
  LogOut,
  Shield,
  UserPlus,
  AlertCircle,
  Clock,
  ChevronLeft,
  Sun,
  Moon,
  ClipboardList,
  Mail,
  Lock,
  Globe,
  History,
  MoreVertical,
  Check,
  X
} from 'lucide-react';

  // First, define the missing ChatSection component
const ChatSection = ({ chats, onSendMessage, currentUser }) => {
    const [message, setMessage] = useState('');
  
    const handleSend = () => {
      if (message.trim()) {
        onSendMessage(message);
        setMessage('');
      }
    };
  
    return (
      <div className="space-y-4">
        <ScrollArea className="h-[500px] p-4 border rounded-lg">
          {chats?.map((chat, index) => (
            <div
              key={index}
              className={`flex flex-col mb-4 ${
                chat.sender === currentUser ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{chat.sender[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{chat.sender}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(chat.timestamp).toLocaleString()}
                </span>
              </div>
              <div className={`rounded-lg p-3 max-w-[80%] ${
                chat.sender === currentUser 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p>{chat.message}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

const MembersSection = ({ members, teamOwner, currentUser, onRemoveMember }) => (
  <ScrollArea className="h-[500px]">
    <div className="space-y-4">
      {members?.map((member, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{member[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member}</p>
                <p className="text-sm text-muted-foreground">
                  {member === teamOwner ? 'Team Owner' : 'Member'}
                </p>
              </div>
            </div>
            {teamOwner === currentUser && member !== currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMember(member)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  </ScrollArea>
);



const TasksSection = ({ tasks, teamOwner, currentUser, onTaskClick, onAddTask, onRemoveTask }) => (
  <ScrollArea className="h-[500px]">
    <div className="space-y-4">
      {teamOwner === currentUser && (
        <Button onClick={onAddTask} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      )}
      {tasks?.map((task, index) => (
        <Card 
          key={index}
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onTaskClick(task)}
        >
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{task}</p>
                <p className="text-sm text-muted-foreground">Click to view details</p>
              </div>
            </div>
            {teamOwner === currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTask(task);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  </ScrollArea>
);

const HistorySection = ({ history }) => (
  <ScrollArea className="h-[500px]">
    <div className="space-y-4">
      {history?.map((entry, index) => (
        <Card key={index}>
          <CardHeader className="p-4">
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {new Date(entry.split(' - ')[0]).toLocaleString()}
              </span>
            </div>
            <p className="mt-2">{entry.split(' - ')[1]}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  </ScrollArea>
);

const TeamSettings = ({ team, onUpdateTeam, onClose }) => {
  const [teamName, setTeamName] = useState(team.teamName);
  const [teamDescription, setTeamDescription] = useState(team.teamDescription);
  const [teamVisibilityStatus, setTeamVisibilityStatus] = useState(team.teamVisibilityStatus);
  const previousTeamName=team.teamName;
  const handleSubmit = () => {
    onUpdateTeam({ teamName, teamDescription, teamVisibilityStatus ,previousTeamName});
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Team Name</label>
        <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Visibility</label>
        <div className="flex items-center space-x-2">
          <Switch
            checked={teamVisibilityStatus === 'Public'}
            onCheckedChange={(checked) => setTeamVisibilityStatus(checked ? 'Public' : 'Private')}
          />
          <span>{visibility === 'Public' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
};

export default function TeamDetailsPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
   
    // const [editedTeam, setEditedTeam] = useState({
    //   teamName: "",
    //   teamDescription: "",
    //   teamVisibilityStatus: "",
    //   previousTeamName: "",
    // });

  useEffect(() => {
    const storedUserData = localStorage.getItem('TimeWiseUserData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    const fetchTeamDetails = async () => {
      try {
        const response = await fetch(`/api/teams/details?teamName=${localStorage.getItem('TimeWiseSelectedTeam')}`);
    
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch team details');
        }
    
        const data = await response.json();
        setTeam(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error fetching team details",
          description: "Please try again later or contact support if the problem persists."
        });
      } finally {
          setLoading(false);
        }
      };
    fetchTeamDetails();
  }, [params, router, toast]);

  const handleSendMessage = async (message) => {
    try {
      const response = await fetch(`/api/teams/add/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName: team.teamName, chat: message }), // Correctly pass the payload
      });
  
      if (!response.ok) throw new Error('Failed to send message');
  
      // Refresh team details to get updated chat
      const updatedTeam = await response.json();
      setTeam(updatedTeam);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: "Please try again."
      });
    }
  };
  

  const handleRemoveMember = async (memberToRemove) => {
    try {
      const response = await fetch('/api/teams/remove/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.teamName,
          userName: memberToRemove
        }),
      });

      if (!response.ok) throw new Error('Failed to remove member');

      const updatedTeam = await response.json();
      setTeam(updatedTeam);
      toast({
        title: "Member removed",
        description: `${memberToRemove} has been removed from the team.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error removing member",
        description: "Please try again."
      });
    }
  };

  const handleLeaveTeam = async () => {
    try {
      await fetch('/api/teams/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.teamName
        }),
      });

      router.push('/teams');
      toast({
        title: "Left team",
        description: "You have successfully left the team."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error leaving team",
        description: "Please try again."
      });
    }
  };

  const handleUpdateTeam = async (updates) => {
    try {
      const response = await fetch(`/api/teams/${team.teamName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update team');

      const updatedTeam = await response.json();
      setTeam(updatedTeam);
      toast({
        title: "Team updated",
        description: "Team details have been updated successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating team",
        description: "Please try again."
      });
    }
  };

  const handleInviteMember = async () => {
    try {
      const response = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.teamName,
          email: inviteEmail
        }),
      });

      if (!response.ok) throw new Error('Failed to send invitation');

      setShowInviteDialog(false);
      setInviteEmail('');
      toast({
        title: "Invitation sent",
        description: `Invitation has been sent to ${inviteEmail}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error sending invitation",
        description: "Please try again."
      });
    }
  };

  const handleRemoveTask = async (taskId) => {
    try {
      const response = await fetch('/api/teams/remove/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.teamName,
          taskId
        }),
      });

      if (!response.ok) throw new Error('Failed to remove task');

      const updatedTeam = await response.json();
      setTeam(updatedTeam);
      toast({
        title: "Task removed",
        description: "Task has been removed successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error removing task",
        description: "Please try again."
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const isOwner = team?.teamOwner === userData?.userName;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 mt-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/home/team')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{team.teamName}</h1>
              <p className="text-muted-foreground">{team.teamDescription}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ClipboardList className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatSection
              chats={team.teamChat}
              onSendMessage={handleSendMessage}
              currentUser={userData?.userName}
            />
          </TabsContent>

          <TabsContent value="members">
            <MembersSection
              members={team.teamMembers}
              teamOwner={team.teamOwner}
              currentUser={userData?.userName}
              onRemoveMember={handleRemoveMember}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksSection
              tasks={team.teamTasks}
              teamOwner={team.teamOwner}
              currentUser={userData?.userName}
              onTaskClick={(task) => router.push(`/tasks/${task}`)}
              onAddTask={() => router.push(`/tasks/create?team=${team.teamName}`)}
              onRemoveTask={handleRemoveTask}
            />
          </TabsContent>

          <TabsContent value="history">
            <HistorySection history={team.teamModificationHistories} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Team Settings</DialogTitle>
              <DialogDescription>
                Update your team's information and preferences
              </DialogDescription>
            </DialogHeader>
            <TeamSettings
              team={team}
              onUpdateTeam={handleUpdateTeam}
              onClose={() => setShowSettings(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join the team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteMember}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Leave Team Confirmation Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="mt-4">
              <LogOut className="h-4 w-4 mr-2" />
              Leave Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave Team</DialogTitle>
              <DialogDescription>
                Are you sure you want to leave this team? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLeaveTeam}>
                Leave Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}