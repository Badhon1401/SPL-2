"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Plus, 
  Sun, 
  Moon, 
  AlertCircle,
  ChevronRight,
  UserPlus,
  Shield,
  Globe
} from 'lucide-react';

const TeamCard = ({ team, onClick }) => (
  <Card 
    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary"
    onClick={onClick}
  >
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {team.teamName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{team.teamName}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Created by {team.teamOwner}
            </CardDescription>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {team.teamDescription}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Team</span>
          </div>
          <div className="flex items-center space-x-2">
            {team.teamOwner === JSON.parse(localStorage.getItem('TimeWiseUserData'))?.userName && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Owner</span>
              </Badge>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NoTeamsFound = ({ onCreateClick }) => (
  <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
    <Users className="h-16 w-16 text-muted-foreground" />
    <h3 className="text-xl font-semibold">No Teams Found</h3>
    <p className="text-muted-foreground text-center max-w-md">
      You haven't joined any teams yet. Create your first team or ask for an invitation to join an existing team.
    </p>
    <Button onClick={onCreateClick} className="mt-4">
      <Plus className="h-4 w-4 mr-2" />
      Create Your First Team
    </Button>
  </div>
);

const LoadingState = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function TeamsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('TimeWiseUserData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch teams');
        }

        const data = await response.json();
        setTeams(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error fetching teams",
          description: "Please try again later or contact support if the problem persists."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [router, toast]);

  const handleTeamClick = (teamName) => {
    localStorage.setItem("TimeWiseSelectedTeam", teamName); 
    router.push(`/home/team/details`);
  };

  const handleCreateTeam = () => {W
    router.push('/home/team/create');
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 mt-6">
      <div className="flex flex-col space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Teams</h1>
            <p className="text-muted-foreground mt-2">
              Manage your teams and collaborations
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Teams List Section */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <LoadingState />
          ) : teams.length === 0 ? (
            <NoTeamsFound onCreateClick={handleCreateTeam} />
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {teams.map((team) => (
                  <TeamCard
                    key={team.teamName}
                    team={team}
                    onClick={() => handleTeamClick(team.teamName)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Quick Actions */}
        {teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Plus className="h-6 w-6" />
                <div>
                  <CardTitle>Create Team</CardTitle>
                  <CardDescription>Start a new collaboration</CardDescription>
                </div>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center space-x-4">
                <UserPlus className="h-6 w-6" />
                <div>
                  <CardTitle>Join Team</CardTitle>
                  <CardDescription>Accept team invitations</CardDescription>
                </div>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Globe className="h-6 w-6" />
                <div>
                  <CardTitle>Discover Teams</CardTitle>
                  <CardDescription>Find public teams to join</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
// "use client"
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useTheme } from 'next-themes';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { Switch } from '@/components/ui/switch';
// import { MessageSquare, Users, ClipboardList, Settings, Sun, Moon, Send, Plus, Trash2 } from 'lucide-react';
// import { format } from 'date-fns';

// const TeamsPage = () => {
//   const router = useRouter();
//   const { theme, setTheme } = useTheme();
//   const [teams, setTeams] = useState([]);
//   const [selectedTeam, setSelectedTeam] = useState(null);
//   const [chatMessage, setChatMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     // Load user data from localStorage
//     const storedUserData = localStorage.getItem('TimeWiseUserData');
//     if (storedUserData) {
//       setUserData(JSON.parse(storedUserData));
//     }

//     // Fetch teams for the user
//     const fetchTeams = async () => {
//       try {
//         const response = await fetch(`/api/teams`);
//         const data = await response.json();
//         setTeams(data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching teams:', error);
//         setLoading(false);
//       }
//     };

//     if (userData?.userName) {
//       fetchTeams();
//     }
//   }, [userData?.userName]);

//   const handleTeamSelect = async (team) => {
//     try {
//       const response = await fetch(`/api/teams/${team.teamName}`);
//       const detailedTeam = await response.json();
//       setSelectedTeam(detailedTeam);
//     } catch (error) {
//       console.error('Error fetching team details:', error);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!chatMessage.trim() || !selectedTeam) return;

//     try {
//       await fetch(`/api/teams/${selectedTeam.teamName}/chat`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           sender: userData.userName,
//           message: chatMessage,
//         }),
//       });

//       // Refresh team details to get updated chat
//       handleTeamSelect(selectedTeam);
//       setChatMessage('');
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   };

//   const handleTaskClick = (taskId) => {
//     router.push(`/tasks/${taskId}`);
//   };

//   const isTeamOwner = (team) => {
//     return team?.teamOwner === userData?.userName;
//   };

//   const TeamsList = () => (
//     <ScrollArea className="h-[700px] w-full rounded-md border p-4">
//       <div className="space-y-4">
//         {teams.map((team) => (
//           <Card 
//             key={team.teamId}
//             className="cursor-pointer hover:bg-accent"
//             onClick={() => handleTeamSelect(team)}
//           >
//             <CardHeader>
//               <CardTitle className="flex items-center justify-between">
//                 <span>{team.teamName}</span>
//                 <Badge variant={team.teamVisibilityStatus === 'Public' ? 'secondary' : 'outline'}>
//                   {team.teamVisibilityStatus}
//                 </Badge>
//               </CardTitle>
//               <CardDescription>{team.teamDescription}</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center space-x-4">
//                 <Users className="h-4 w-4" />
//                 <span>{team.teamMembers?.length || 0} members</span>
//                 <ClipboardList className="h-4 w-4 ml-4" />
//                 <span>{team.teamTasks?.length || 0} tasks</span>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </ScrollArea>
//   );

//   const TeamDetails = () => {
//     if (!selectedTeam) return null;

//     return (
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle className="flex items-center justify-between">
//             <span>{selectedTeam.teamName}</span>
//             <div className="flex items-center space-x-2">
//               {isTeamOwner(selectedTeam) && (
//                 <Button variant="outline" size="sm">
//                   <Settings className="h-4 w-4 mr-2" />
//                   Manage Team
//                 </Button>
//               )}
//               <Badge variant={selectedTeam.teamVisibilityStatus === 'Public' ? 'secondary' : 'outline'}>
//                 {selectedTeam.teamVisibilityStatus}
//               </Badge>
//             </div>
//           </CardTitle>
//           <CardDescription>{selectedTeam.teamDescription}</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Tabs defaultValue="chat" className="w-full">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="chat">Chat</TabsTrigger>
//               <TabsTrigger value="tasks">Tasks</TabsTrigger>
//               <TabsTrigger value="members">Members</TabsTrigger>
//             </TabsList>

//             <TabsContent value="chat" className="space-y-4">
//               <ScrollArea className="h-[400px] w-full rounded-md border p-4">
//                 {selectedTeam.teamChat?.map((chat, index) => (
//                   <div
//                     key={index}
//                     className={`flex flex-col mb-4 ${
//                       chat.sender === userData?.userName ? 'items-end' : 'items-start'
//                     }`}
//                   >
//                     <div className="flex items-center space-x-2 mb-1">
//                       <Avatar className="h-6 w-6">
//                         <AvatarFallback>{chat.sender[0]}</AvatarFallback>
//                       </Avatar>
//                       <span className="text-sm font-medium">{chat.sender}</span>
//                       <span className="text-sm text-muted-foreground">
//                         {format(new Date(chat.timestamp), 'MMM d, HH:mm')}
//                       </span>
//                     </div>
//                     <div className="bg-accent rounded-lg p-3 max-w-[80%]">
//                       <p>{chat.message}</p>
//                     </div>
//                   </div>
//                 ))}
//               </ScrollArea>
//               <div className="flex items-center space-x-2">
//                 <Input
//                   placeholder="Type your message..."
//                   value={chatMessage}
//                   onChange={(e) => setChatMessage(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                 />
//                 <Button onClick={handleSendMessage}>
//                   <Send className="h-4 w-4" />
//                 </Button>
//               </div>
//             </TabsContent>

//             <TabsContent value="tasks" className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-semibold">Team Tasks</h3>
//                 {isTeamOwner(selectedTeam) && (
//                   <Button size="sm">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Task
//                   </Button>
//                 )}
//               </div>
//               <ScrollArea className="h-[400px] w-full">
//                 {selectedTeam.teamTasks?.map((task, index) => (
//                   <Card
//                     key={index}
//                     className="mb-4 cursor-pointer hover:bg-accent"
//                     onClick={() => handleTaskClick(task)}
//                   >
//                     <CardHeader>
//                       <CardTitle className="text-base">{task}</CardTitle>
//                     </CardHeader>
//                   </Card>
//                 ))}
//               </ScrollArea>
//             </TabsContent>

//             <TabsContent value="members" className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-semibold">Team Members</h3>
//                 {isTeamOwner(selectedTeam) && (
//                   <Button size="sm">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Invite Member
//                   </Button>
//                 )}
//               </div>
//               <ScrollArea className="h-[400px] w-full">
//                 {selectedTeam.teamMembers?.map((member, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-4 hover:bg-accent rounded-lg"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <Avatar>
//                         <AvatarFallback>{member[0]}</AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <p className="font-medium">{member}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {member === selectedTeam.teamOwner ? 'Owner' : 'Member'}
//                         </p>
//                       </div>
//                     </div>
//                     {isTeamOwner(selectedTeam) && member !== userData?.userName && (
//                       <Button variant="ghost" size="sm">
//                         <Trash2 className="h-4 w-4 text-destructive" />
//                       </Button>
//                     )}
//                   </div>
//                 ))}
//               </ScrollArea>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     );
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="container mx-auto py-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">My Teams</h1>
//         <div className="flex items-center space-x-4">
//           <Switch
//             checked={theme === 'dark'}
//             onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//           />
//           {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <h2 className="text-xl font-semibold mb-4">Teams List</h2>
//           <TeamsList />
//         </div>
//         <div>
//           <h2 className="text-xl font-semibold mb-4">Team Details</h2>
//           <TeamDetails />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeamsPage;