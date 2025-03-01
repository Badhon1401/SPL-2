"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { 
  MessageSquare, Users, Settings, Send, Plus, Trash2, Edit, LogOut, Shield,
  UserPlus, AlertCircle, Clock, ChevronLeft, ClipboardList, Mail, Lock, Globe,
  History, MoreVertical, Check, X, Info, Download, Upload, Share, Star, StarOff,
  Filter, Search, Pencil, Calendar, Bell, ArrowUpRight, CornerDownRight, Loader2
} from 'lucide-react';



// ChatMessage Component to handle individual messages
const ChatMessage = ({ chat, isCurrentUser, onDelete }) => {
  const formattedTime = new Date(chat.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
  });

  return (
      <div className={`group flex items-start mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} `}>
          <div
              className={`relative max-w-xs sm:max-w-md rounded-lg px-3 py-2 bg-teal-200 dark:bg-black  ${
                  isCurrentUser ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
              }`}
          >
              <div className="flex items-center text-xs mb-1 text-gray-800 dark:text-gray-100">
                  <span className="font-semibold mr-2">{chat.sender}</span>
                  <span className="text-xs opacity-70 mr-2">{formattedTime}</span>
                  {onDelete && (
                      <button
                          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onDelete(chat)}
                      >
                          <Trash2 className="h-3 w-3" />
                      </button>
                  )}
              </div>
              <p className="text-sm break-words text-gray-800 dark:text-gray-100">{chat.message}</p>
          </div>
      </div>
  );
};

const ChatSection = ({ chats = [], onSendMessage, onDeleteMessage, currentUser, isOwner }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chats]);
  
  const handleSend = async () => {
    if (message.trim()) {
      setIsLoading(true);
      await onSendMessage(message);
      setMessage('');
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <ScrollArea className="flex-grow p-4 border rounded-lg  mb-4" ref={scrollAreaRef}>
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No messages yet</h3>
            <p className="text-muted-foreground mt-2">
              Start the conversation by sending a message to your team.
            </p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-1">
              {chats.map((chat, index) => (
                <ChatMessage
                  key={index}
                  chat={chat}
                  isCurrentUser={chat.sender === currentUser}
                  onDelete={() => onDeleteMessage(chat)}
                />
              ))}
            </div>
          </TooltipProvider>
        )}
      </ScrollArea>
      <div className="flex space-x-2">
        <Input
          ref={inputRef}
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={isLoading}
          className="flex-grow"
        />
        <Button onClick={handleSend} disabled={isLoading || !message.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      
     
    </div>
  );
};

const MembersSection = ({
  members = [],
  invitedMembers = [],
  requestedToJoinMembers = [],
  teamOwner,
  currentUser,
  onRemoveMember,
  onAcceptRequest,
  onRejectRequest,
}) => {
  const [filter, setFilter] = useState("");

  const filteredMembers = members.filter(member =>
      member.toLowerCase().includes(filter.toLowerCase())
  );

  return (
      <div className="space-y-6">
          <div className="flex items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Search members..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="max-w-xs pl-9" // Add padding to accommodate the icon
                  />
              </div>
              <Badge variant="outline" className="ml-auto">
                  {members.length} member{members.length !== 1 ? 's' : ''}
              </Badge>
          </div>

          <div className="space-y-4">
              <h3 className="text-lg font-medium">Team Members</h3>
              <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                      {filteredMembers.length > 0 ? (
                          filteredMembers.map((member, index) => (
                              <Card key={index} className="border-l-4 border-l-primary">
                                  <CardHeader className="flex flex-row items-center justify-between p-4">
                                      <div className="flex items-center space-x-4">
                                          <Avatar>
                                              <AvatarFallback>{member[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            {/* Changed from p to div to prevent nesting issues */}
                                            <div className="font-medium flex items-center">
                                                {member}
                                                {member === teamOwner && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            Owner
                                                        </span>
                                                    </Badge>
                                                )}
                                                {member === currentUser && (
                                                    <Badge variant="outline" className="ml-2">You</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {member === teamOwner ? 'Has full control over the team' : 'Team member'}
                                            </p>
                                          </div>
                                      </div>

                                      {/* Actions based on permissions */}
                                      {(teamOwner === currentUser && member !== currentUser) && (
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="icon">
                                                      <MoreVertical className="h-4 w-4" />
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                  <DropdownMenuItem onClick={() => onRemoveMember(member)} className="text-destructive">
                                                      <Trash2 className="h-4 w-4 mr-2" />
                                                      Remove
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => onPromoteToOwner(member)}>
                                                      <Shield className="h-4 w-4 mr-2" />
                                                      Transfer Ownership
                                                  </DropdownMenuItem>
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      )}

                                      {(teamOwner !== currentUser && member !== currentUser && member === teamOwner) && (
                                          <Badge variant="outline">
                                              <Shield className="h-3 w-3 mr-1" />
                                              Owner
                                          </Badge>
                                      )}
                                  </CardHeader>
                              </Card>
                          ))
                      ) : (
                          <div className="text-center p-4 text-muted-foreground">
                              No members found matching "{filter}"
                          </div>
                      )}
                  </div>
              </ScrollArea>
          </div>

          {requestedToJoinMembers && requestedToJoinMembers.length > 0 && teamOwner === currentUser && (
              <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-medium flex items-center">
                      Membership Requests
                      <Badge variant="destructive" className="ml-2">{requestedToJoinMembers.length}</Badge>
                  </h3>
                  <ScrollArea className="h-[200px] border rounded-lg p-2">
                      <div className="space-y-3">
                          {requestedToJoinMembers.map((member, index) => (
                              <Card key={index}>
                                  <CardHeader className="flex flex-row items-center justify-between p-4">
                                      <div className="flex items-center space-x-4">
                                          <Avatar>
                                              <AvatarFallback>{member[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                              <p className="font-medium">{member}</p>
                                              <p className="text-xs text-muted-foreground">Requested to join</p>
                                          </div>
                                      </div>
                                      <div className="flex space-x-2">
                                          <Button size="sm" variant="outline" onClick={() => onRejectRequest(member)}>
                                              <X className="h-4 w-4 mr-1" />
                                              Reject
                                          </Button>
                                          <Button size="sm" onClick={() => onAcceptRequest(member)}>
                                              <Check className="h-4 w-4 mr-1" />
                                              Accept
                                          </Button>
                                      </div>
                                  </CardHeader>
                              </Card>
                          ))}
                      </div>
                  </ScrollArea>
              </div>
          )}

          {invitedMembers && invitedMembers.length > 0 && (
              <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-medium">Pending Invitations</h3>
                  <ScrollArea className="h-[200px] border rounded-lg p-2">
                      <div className="space-y-3">
                          {invitedMembers.map((member, index) => (
                              <Card key={index}>
                                  <CardHeader className="flex flex-row items-center justify-between p-4">
                                      <div className="flex items-center space-x-4">
                                          <Mail className="h-5 w-5 text-muted-foreground" />
                                          <div>
                                              <p className="font-medium">{member}</p>
                                              <p className="text-xs text-muted-foreground">Invitation sent</p>
                                          </div>
                                      </div>
                                      {teamOwner === currentUser && (
                                          <Button size="sm" variant="ghost" className="text-destructive">
                                              <X className="h-4 w-4 mr-1" />
                                              Cancel Invite
                                          </Button>
                                      )}
                                  </CardHeader>
                              </Card>
                          ))}
                      </div>
                  </ScrollArea>
              </div>
          )}
      </div>
  );
};

//  TasksSection Component
const TasksSection = ({
  tasks = [],
  teamOwner,
  currentUser,
  onTaskClick,
  onAddTask,
  onRemoveTask,
  teamName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const filteredTasks = tasks.filter(task =>
    task.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort tasks based on selected sort option
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'name') return a.localeCompare(b);
    if (sortBy === 'nameDesc') return b.localeCompare(a);
    // For dateCreated, we would need timestamps, but we don't have them in this example
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
       
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
              <SelectItem value="dateCreated">Date Created</SelectItem>
            </SelectContent>
          </Select>
         
          {teamOwner === currentUser && (
            <Button onClick={onAddTask} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>
     
      <ScrollArea className="h-[450px]">
        {sortedTasks.length > 0 ? (
          <div className="space-y-3">
            {sortedTasks.map((task, index) => (
              <Card
                key={index}
                className="hover:border-primary transition-colors cursor-pointer group"
                onClick={() => onTaskClick(task)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {task}
                          <ArrowUpRight className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Task ID: {task.substring(0, 8)}
                        </CardDescription>
                      </div>
                    </div>
                    {teamOwner === currentUser && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTask(task);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-md">
              {searchTerm
                ? `No tasks matching "${searchTerm}"`
                : "The team owner doesn't have assigned any tasks yet."}
            </p>
            
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// History Section Component
const HistorySection = ({ history = [] }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollAreaRef = useRef(null); 
  
  const parseHistoryEntry = (entry) => {
    try {
      const [datePart, description] = entry.split(' - ');
      return {
        date: new Date(datePart),
        description,
        type: description.toLowerCase().includes('added') ? 'add' :
              description.toLowerCase().includes('removed') ? 'remove' :
              description.toLowerCase().includes('updated') ? 'update' : 'other'
      };
    } catch (e) {
      return {
        date: new Date(),
        description: entry,
        type: 'other'
      };
    }
  };
  
  const parsedHistory = history.map(parseHistoryEntry);
  
  const filteredHistory = parsedHistory
    .filter(entry => 
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter === 'all' || entry.type === filter)
    );
  
  const historyTypeIcon = (type) => {
    switch(type) {
      case 'add': return <Plus className="h-4 w-4 text-green-500" />;
      case 'remove': return <Trash2 className="h-4 w-4 text-destructive" />;
      case 'update': return <Edit className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  useEffect(() => {
    
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [parsedHistory]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <Input
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        
        <div className="flex space-x-2">
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid grid-cols-4 w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="add">Additions</TabsTrigger>
              <TabsTrigger value="remove">Removals</TabsTrigger>
              <TabsTrigger value="update">Updates</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <ScrollArea className="h-[500px]" ref={scrollAreaRef}>
        {filteredHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredHistory.map((entry, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  entry.type === 'add' ? 'bg-green-500' :
                  entry.type === 'remove' ? 'bg-destructive' :
                  entry.type === 'update' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <CardHeader className="p-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                    {historyTypeIcon(entry.type)}
                    <span>{format(entry.date, 'PPP')}</span>
                    <span>•</span>
                    <span>{format(entry.date, 'h:mm a')}</span>
                  </div>
                  <p className="mt-1">{entry.description}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No history found</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {searchTerm 
                ? `No history entries matching "${searchTerm}"`
                : "There's no team activity recorded yet."}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// Team Settings Component
const TeamSettings = ({ team, onUpdateTeam, onClose }) => {
  const [teamName, setTeamName] = useState(team.teamName || '');
  const [teamDescription, setTeamDescription] = useState(team.teamDescription || '');
  const [teamVisibilityStatus, setTeamVisibilityStatus] = useState(team.teamVisibilityStatus || 'Private');
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
          await onUpdateTeam({
              teamName,
              teamDescription,
              teamVisibilityStatus,
             
          });
          onClose();
      } catch (error) {
          console.error('Error updating team:', error);
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
      <div className="space-y-6">
          {/* ... (rest of the component remains the same) */}
          <div className="space-y-4">
              <div className="space-y-2">
                  <label className="text-sm font-medium">Team Name</label>
                  <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name"
                  />
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      placeholder="Describe the purpose of this team"
                      rows={3}
                  />
              </div>

              <div className="space-y-3">
                  <label className="text-sm font-medium">Visibility</label>
                  <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                          <div className="flex items-center space-x-3">
                              <Globe className="h-5 w-5 text-primary" />
                              <div>
                                  <p className="font-medium">Public</p>
                                  <p className="text-sm text-muted-foreground">
                                      Anyone can find and join this team
                                  </p>
                              </div>
                          </div>
                          <Switch
                              checked={teamVisibilityStatus === 'Public'}
                              onCheckedChange={(checked) => setTeamVisibilityStatus(checked ? 'Public' : 'Private')}
                          />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                          <div className="flex items-center space-x-3">
                              <Lock className="h-5 w-5 text-primary" />
                              <div>
                                  <p className="font-medium">Private</p>
                                  <p className="text-sm text-muted-foreground">
                                      Only invited members can join
                                  </p>
                              </div>
                          </div>
                          <Switch
                              checked={teamVisibilityStatus === 'Private'}
                              onCheckedChange={(checked) => setTeamVisibilityStatus(checked ? 'Private' : 'Public')}
                          />
                      </div>
                  </div>
              </div>
          </div>

          <Separator />

          <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !teamName.trim()}>
                  {isSubmitting ? (
                      <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                      </>
                  ) : (
                      'Save Changes'
                  )}
              </Button>
          </DialogFooter>
      </div>
  );
};


// Invite Member Dialog Component
const InviteMemberDialog = ({ open, onOpenChange, onInvite }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInvite = async () => {
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onInvite(email);
      setEmail('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">User Name</label>
            <Input
              type="email"
              placeholder="Enter the invitee's TimeWise user name"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <Alert variant="info" className="text-sm">
            <Info className="h-4 w-4" />
            <AlertTitle>Member will receive an email invitation</AlertTitle>
            <AlertDescription>
              They'll need to accept the invitation to join your team.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isSubmitting || !email.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Leave Team Dialog Component
const LeaveTeamDialog = ({ open, onOpenChange, onLeave, isLoading }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Leave Team</DialogTitle>
        <DialogDescription>
          Are you sure you want to leave this team? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          You will lose access to all team resources, chats, and tasks.
        </AlertDescription>
      </Alert>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onLeave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Leaving...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Leave Team
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Main Team Details Page Component
export default function TeamDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Dialog states
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch team details and user data
  useEffect(() => {
    const storedUserData = localStorage.getItem('TimeWiseUserData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      // Redirect to login if no user data
      router.push('/login');
      return;
    }

   // Continuing from where your code left off...
const fetchTeamDetails = async () => {
    try {
      const selectedTeam = localStorage.getItem('TimeWiseSelectedTeam');
      if (!selectedTeam) {
        router.push('/home/team');
        return;
      }
      
      const response = await fetch(`/api/teams/details?teamName=${selectedTeam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch team details');
      }
      
      const teamData = await response.json();
      setTeam(teamData);
    } catch (err) {
      console.error('Error fetching team details:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load team details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  fetchTeamDetails();
  }, [router, toast]);
  
  // State for the invite form
  const [inviteUserName, setInviteUserName] = useState('');
  
  // Handle sending a message
  const handleSendMessage = async (message) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/teams/chat/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.teamName,
          chat:message,  
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      const updatedTeam = await response.json();
  
      
      setTeam(updatedTeam);
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the team.",
      });
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle removing a team member
  const handleRemoveMember = async (memberName) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/teams/members', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.teamName,
          memberName,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove member');
      }
  
      // Update local state
      const updatedTeam = { ...team };
      updatedTeam.teamMembers = updatedTeam.teamMembers.filter(member => member !== memberName);
      updatedTeam.teamModificationHistories = [
        ...updatedTeam.teamModificationHistories,
        `${new Date().toISOString()} - ${userData.userName} removed ${memberName} from the team`
      ];
      setTeam(updatedTeam);
      
      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the team.`,
      });
    } catch (err) {
      console.error('Error removing member:', err);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  
  
  // Handle accepting join request
  const handleAcceptRequest = async (memberName) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/teams/requests/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.teamName,
          memberName,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to accept request');
      }
  
      // Update local state
      const updatedTeam = { ...team };
      updatedTeam.requestedToJoinMembers = updatedTeam.requestedToJoinMembers.filter(
        member => member !== memberName
      );
      updatedTeam.teamMembers = [...updatedTeam.teamMembers, memberName];
      updatedTeam.teamModificationHistories = [
        ...updatedTeam.teamModificationHistories,
        `${new Date().toISOString()} - ${userData.userName} accepted ${memberName}'s request to join`
      ];
      setTeam(updatedTeam);
      
      toast({
        title: "Request accepted",
        description: `${memberName} has been added to the team.`,
      });
    } catch (err) {
      console.error('Error accepting request:', err);
      toast({
        title: "Error",
        description: "Failed to accept join request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle rejecting join request
  const handleRejectRequest = async (memberName) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/teams/requests/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.teamName,
          memberName,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to reject request');
      }
  
      // Update local state
      const updatedTeam = { ...team };
      updatedTeam.requestedToJoinMembers = updatedTeam.requestedToJoinMembers.filter(
        member => member !== memberName
      );
      updatedTeam.teamModificationHistories = [
        ...updatedTeam.teamModificationHistories,
        `${new Date().toISOString()} - ${userData.userName} rejected ${memberName}'s request to join`
      ];
      setTeam(updatedTeam);
      
      toast({
        title: "Request rejected",
        description: `${memberName}'s request has been rejected.`,
      });
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast({
        title: "Error",
        description: "Failed to reject join request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle removing a task
  const handleRemoveTask = async (taskName) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/teams/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: team.teamName,
          taskName,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove task');
      }
  
      // Update local state
      const updatedTeam = { ...team };
      updatedTeam.teamTasks = updatedTeam.teamTasks.filter(task => task !== taskName);
      updatedTeam.teamModificationHistories = [
        ...updatedTeam.teamModificationHistories,
        `${new Date().toISOString()} - ${userData.userName} removed task "${taskName}"`
      ];
      setTeam(updatedTeam);
      
      toast({
        title: "Task removed",
        description: `"${taskName}" has been removed.`,
      });
    } catch (err) {
      console.error('Error removing task:', err);
      toast({
        title: "Error",
        description: "Failed to remove task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle updating team
  const handleUpdateTeam = async (updatedData) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/teams/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousTeamName: team.teamName,
          ...updatedData
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update team');
      }
  
      const updatedTeam = await response.json();
      localStorage.setItem('TimeWiseSelectedTeam', updatedTeam.teamName);
      setTeam(updatedTeam);
      
      toast({
        title: "Team updated",
        description: "Team settings have been updated successfully.",
      });
    } catch (err) {
      console.error('Error updating team:', err);
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle inviting a member
  const handleInviteMember = async () => {
    if (!inviteUserName.trim()) return;
    
    setActionLoading(true);
    try {
        const response = await fetch(`/api/teams/invite?teamName=${encodeURIComponent(team.teamName)}&recipient=${encodeURIComponent(inviteUserName)}`, {
          method: 'POST',
        });
  
      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }
  
      // Update local state
      const updatedTeam = { ...team };
      if (!updatedTeam.invitedMembers) {
        updatedTeam.invitedMembers = [];
      }
      updatedTeam.invitedMembers = [...updatedTeam.invitedMembers, inviteEmail];
      updatedTeam.teamModificationHistories = [
        ...updatedTeam.teamModificationHistories,
        `${new Date().toISOString()} - ${userData.userName} invited ${inviteEmail} to the team`
      ];
      setTeam(updatedTeam);
      setInviteUserName('');
      setShowInviteDialog(false);
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteUserName}.`,
      });
    } catch (err) {
      console.error('Error sending invitation:', err);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle leaving the team
  const handleLeaveTeam = async () => {
    setActionLoading(true);
    try {
        const response = await fetch(`/api/teams/leave?teamName=${encodeURIComponent(team.teamName)}`, {
          method: 'POST',
        });
  
      if (!response.ok) {
        throw new Error('Failed to leave team');
      }
  
      localStorage.removeItem('TimeWiseSelectedTeam');
      toast({
        title: "Left team",
        description: `You have successfully left the team.`,
      });
      
      router.push('/home/team');
    } catch (err) {
      console.error('Error leaving team:', err);
      toast({
        title: "Error",
        description: "Failed to leave team. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle deleting the team
  const handleDeleteTeam = async () => {
    setActionLoading(true);
    try {
        const response = await fetch(`/api/teams/delete?teamName=${encodeURIComponent(team.teamName)}`, {
          method: 'DELETE',
        });
  
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
  
      localStorage.removeItem('TimeWiseSelectedTeam');
      toast({
        title: "Team deleted",
        description: `The team has been deleted successfully.`,
      });
      
      router.push('/home/team');
    } catch (err) {
      console.error('Error deleting team:', err);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h3 className="mt-4 text-lg font-medium">Loading team details...</h3>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-24">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/home/team')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </div>
      </div>
    );
  }
  
  // Show not found state
  if (!team) {
    return (
      <div className="container mx-auto py-24">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The team you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push('/home/team')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </div>
      </div>
    );
  }
  
  // Add actions menu next to title for team owner
  const ActionMenu = () => (
    <div className="flex items-center space-x-2">
      {userData?.userName === team.teamOwner ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Team Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowLeaveDialog(true)}>
          <LogOut className="h-4 w-4 mr-2" />
          Leave Team
        </Button>
      )}
    </div>
  );
  
  // Delete Team Dialog
  const DeleteTeamDialog = ({ open, onOpenChange, onDelete, isLoading }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this team? This action cannot be undone and will remove all team data.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            All team chats, tasks, and data will be permanently deleted.
          </AlertDescription>
        </Alert>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Team
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 mt-2 bg-gray-400 dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          
            <div>
              <h1 className="text-3xl font-bold">{team.teamName}</h1>
              <p className="text-muted-foreground">{team.teamDescription}</p>
            </div>
          
          <Button variant="ghost" onClick={() => router.push('/home/team')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
          <ActionMenu />
        </div>
  
        {/* Team status badge */}
        <div className="flex items-center space-x-2">
          <Badge variant={team.teamVisibilityStatus === "Public" ? "secondary" : "outline"}>
            {team.teamVisibilityStatus === "Public" ? (
              <Globe className="h-3 w-3 mr-1" />
            ) : (
              <Lock className="h-3 w-3 mr-1" />
            )}
            {team.teamVisibilityStatus}
          </Badge>
          <Badge variant="outline">
            {team.teamMembers?.length || 0} member{team.teamMembers?.length !== 1 ? 's' : ''}
          </Badge>
        </div>
  
        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">
              <MessageSquare className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="chat">
              <ClipboardList className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tasks">
            <TasksSection
              tasks={team.teamTasks || []}
              teamOwner={team.teamOwner}
              currentUser={userData?.userName}
              onTaskClick={(task) => router.push(`/tasks/${encodeURIComponent(task)}`)}
              onAddTask={() => router.push(`/tasks/create?team=${encodeURIComponent(team.teamName)}`)}
              onRemoveTask={handleRemoveTask}
              teamName={team.teamName}
            />
          </TabsContent>
  
          
  
          <TabsContent value="members">
            <MembersSection
              members={team.teamMembers || []}
              invitedMembers={team.invitedMembers || []}
              requestedToJoinMembers={team.requestedToJoinMembers || []}
              teamOwner={team.teamOwner}
              currentUser={userData?.userName}
              onRemoveMember={handleRemoveMember}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
            />
          </TabsContent>
          <TabsContent value="chat">
            <ChatSection
              chats={team.teamChat || []}
              onSendMessage={handleSendMessage}
              onDeleteMessage={(chat) => {
                // Implement message deletion logic here
                // This is a placeholder and would require a proper API implementation
                toast({
                  title: "Feature in progress",
                  description: "Message deletion will be available soon.",
                });
              }}
              currentUser={userData?.userName}
              isOwner={userData?.userName === team.teamOwner}
            />
          </TabsContent>
          
  
          <TabsContent value="history">
            <HistorySection history={team.teamModificationHistories || []} />
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
  
        {/* Invite Member Dialog */}
        <InviteMemberDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          onInvite={handleInviteMember}
        />
  
        {/* Leave Team Dialog */}
        <LeaveTeamDialog
          open={showLeaveDialog}
          onOpenChange={setShowLeaveDialog}
          onLeave={handleLeaveTeam}
          isLoading={actionLoading}
        />
  
        {/* Delete Team Dialog */}
        <DeleteTeamDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onDelete={handleDeleteTeam}
          isLoading={actionLoading}
        />
      </div>
    </div>
  );
}