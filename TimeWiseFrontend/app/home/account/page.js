'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Edit2, Eye, EyeOff, User, Users, ListTodo, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountDashboard() {
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [localUserData, setLocalUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({  
    userEmail: '',
    previousPassword: '',
    newPassword: '',
    shortBioData: '',
    role: '',
    userStatus: '',
    accountVisibility: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
       
        const localUserName = localStorage.getItem("UserAccountName") || "";
        const storedData = localStorage.getItem("TimeWiseUserData");
        let localData = null;
        
        if (storedData) {
          localData = JSON.parse(storedData);
          setLocalUserData(localData);
        }
        
       
        const response = await fetch(`/api/users/account/details?userName=${localUserName}`);
        const apiData = await response.json();
        console.log(apiData);
        
        if (apiData) {
          setUserData(apiData);
          if (localData && localData.userName === apiData.userName) {
            setIsEditing(false);
          }
         
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load account data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  useEffect(() => {
    if (userData) {
      setEditForm({
       
        userEmail: userData.userEmail || '',
        previousPassword: '',
        newPassword: '',
        shortBioData: userData.shortBioData || '',
        role: userData.role || '',
        userStatus: userData.userStatus || '',
        accountVisibility: userData.accountVisibility || ''
      });
    }
  }, [userData]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/users/account/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        // Update the userData state with the new values
        setUserData(prev => ({
          ...prev,
       
          userEmail: editForm.userEmail,
          shortBioData: editForm.shortBioData,
          role: editForm.role,
          userStatus: editForm.userStatus,
          accountVisibility: editForm.accountVisibility
        }));
        
        // Update localStorage
        localStorage.setItem("TimeWiseUserData", JSON.stringify({
          ...userData,
        
          userEmail: editForm.userEmail,
          shortBioData: editForm.shortBioData,
          role: editForm.role,
          userStatus: editForm.userStatus,
          accountVisibility: editForm.accountVisibility
        }));
        
        toast({
          title: "Success",
          description: "Your account has been updated successfully.",
          variant: "success"
        });
        
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update account");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      toast({
        title: "Update Failed",
        description: error.message || "There was a problem updating your account.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


if (isLoading && !userData) {
  return (
    <div className="container mx-auto py-2 px-4">
      <div className="grid grid-cols-1 gap-6">
       
        <div>
          <Skeleton className="w-full md:w-80 h-64 mx-auto rounded-lg" />
        </div>
        
       
        <div>
          <Skeleton className="h-12 w-full mb-6 rounded-lg" /> 
          <Skeleton className="h-96 w-full rounded-lg" /> 
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="container mx-auto py-2 px-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Account Dashboard</h1>
        {userData && localUserData && userData.userName === localUserData.userName && (
          <Button 
            variant={isEditing ? "default" : "outline"} 
            onClick={handleEditToggle}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <CheckCircle className="h-4 w-4" /> Exit Edit Mode
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" /> Edit Profile
              </>
            )}
          </Button>
        )}
      </div>

      {userData && (
        <div className="grid grid-cols-1 gap-6"> 
        <div>
  <Card className="w-full md:w-80 mx-auto"> {/* Adjusted width */}
    <CardHeader className="text-center p-4"> {/* Reduced padding */}
      <Avatar className="h-20 w-20 mx-auto mb-1"> {/* Adjusted size */}
        <AvatarImage
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${userData.userName}`}
          alt={userData.userName}
        />
        <AvatarFallback>
          <User className="h-10 w-10" />
        </AvatarFallback>
      </Avatar>
      <CardTitle className="text-lg">{userData.userName}</CardTitle>
      <CardDescription className="text-sm">{userData.userEmail}</CardDescription>
      <div className="flex justify-center mt-2 space-x-1"> {/* Badge container */}
        <Badge
          variant={
            userData.userStatus === "Active"
              ? "success"
              : userData.userStatus === "Inactive"
              ? "secondary"
              : "outline"
          }
          className="text-xs"
        >
          {userData.userStatus}
        </Badge>
        <Badge
          variant={
            userData.accountVisibility === "Public" ? "default" : "outline"
          }
          className="text-xs flex items-center gap-1"
        >
          {userData.accountVisibility === "Public" ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
          {userData.accountVisibility}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="text-center p-4"> 
      <p className="text-sm text-muted-foreground mb-2">
        {userData.shortBioData || "No bio provided"}
      </p>
      <div className="flex justify-center space-x-4"> 
        <div>
          <p className="text-lg font-semibold">
            {userData.usersFollowing?.size || 0}
          </p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
        <div>
          <p className="text-lg font-semibold">
            {userData.userTasks?.length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Tasks</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

          {/* Main Content Area */}
          <div>
            <Tabs defaultValue="account">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="account" className="flex-1">
                  <User className="h-4 w-4 mr-2" /> Account
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex-1">
                  <ListTodo className="h-4 w-4 mr-2" /> Tasks
                </TabsTrigger>
                <TabsTrigger value="teams" className="flex-1">
                  <Users className="h-4 w-4 mr-2" /> Teams
                </TabsTrigger>
              </TabsList>

              {/* Account Tab */}
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      {isEditing 
                        ? "Update account details below. Fields marked with * are required." 
                        : "View account details below."}
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        

                        {/* Username */}
                        <div className="space-y-2">
                          <Label htmlFor="userName">Username*</Label>
                          <Input 
                            id="userName" 
                            name="userName"
                            value={editForm.userName}
                          
                            disabled={!isEditing} 
                            required
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="userEmail">Email*</Label>
                          <Input 
                            id="userEmail" 
                            name="userEmail"
                            type="email"
                            value={editForm.userEmail}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>

                      {/* Role */}
<div className="space-y-2">
  <Label htmlFor="role">Role</Label>
  {isEditing ? (
    <Select 
      value={editForm.role || ""} 
      onValueChange={(value) => handleSelectChange("role", value)}
    >
      <SelectTrigger id="role">
        <SelectValue>{editForm.role || "Select role"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
  <SelectItem value="Admin">Admin</SelectItem>
  <SelectItem value="User">User</SelectItem>
  <SelectItem value="Manager">Manager</SelectItem>
  <SelectItem value="Developer">Developer</SelectItem>
  <SelectItem value="Guest">Guest</SelectItem>
  <SelectItem value="Moderator">Moderator</SelectItem>
  <SelectItem value="Support">Support</SelectItem>
  <SelectItem value="Analyst">Analyst</SelectItem>
  <SelectItem value="Designer">Designer</SelectItem>
  <SelectItem value="Tester">Tester</SelectItem>
  <SelectItem value="Sales">Sales</SelectItem>
  <SelectItem value="Marketing">Marketing</SelectItem>
  <SelectItem value="Finance">Finance</SelectItem>
  <SelectItem value="Hr">Hr</SelectItem>
  <SelectItem value="Operations">Operations</SelectItem>
  <SelectItem value="Teacher">Teacher</SelectItem>
  <SelectItem value="Doctor">Doctor</SelectItem>
  <SelectItem value="Engineer">Engineer</SelectItem>
  <SelectItem value="Scientist">Scientist</SelectItem>
  <SelectItem value="Artist">Artist</SelectItem>
  <SelectItem value="Writer">Writer</SelectItem>
  <SelectItem value="Consultant">Consultant</SelectItem>
  <SelectItem value="Researcher">Researcher</SelectItem>
  <SelectItem value="Advisor">Advisor</SelectItem>
  <SelectItem value="Other">Other</SelectItem>
</SelectContent>
    </Select>
  ) : (
    <div className="p-2 border rounded-md">{userData.role || "Not specified"}</div>
  )}
</div>

{/* Account Status */}
<div className="space-y-2">
  <Label htmlFor="userStatus">Account Status</Label>
  {isEditing ? (
    <Select
      value={editForm.userStatus || ""}
      onValueChange={(value) => handleSelectChange("userStatus", value)}
    >
      <SelectTrigger id="userStatus">
        <SelectValue>{editForm.userStatus || "Select status"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Active">Active</SelectItem>
        <SelectItem value="Inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  ) : (
    <div className="p-2 border rounded-md">{userData.userStatus || "Not specified"}</div>
  )}
</div>

{/* Account Visibility */}
<div className="space-y-2">
  <Label htmlFor="accountVisibility">Account Visibility</Label>
  {isEditing ? (
    <Select 
      value={editForm.accountVisibility || ""}
      onValueChange={(value) => handleSelectChange("accountVisibility", value)}
    >
      <SelectTrigger id="accountVisibility">
        <SelectValue>{editForm.accountVisibility || "Select visibility"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Public">Public</SelectItem>
        <SelectItem value="Private">Private</SelectItem>
      </SelectContent>
    </Select>
  ) : (
    <div className="p-2 border rounded-md">{userData.accountVisibility || "Not specified"}</div>
  )}
</div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <Label htmlFor="shortBioData">Bio</Label>
                        <Textarea 
                          id="shortBioData" 
                          name="shortBioData"
                          value={editForm.shortBioData}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Tell us about yourself"
                          className="min-h-24"
                        />
                      </div>

                      {isEditing && (
                        <>
                          <Separator className="my-4" />
                          <h3 className="text-lg font-medium mb-2">Change Password</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Leave these fields empty if you don't want to change your password.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="previousPassword">Current Password</Label>
                              <Input 
                                id="previousPassword" 
                                name="previousPassword"
                                type="password"
                                value={editForm.previousPassword}
                                onChange={handleInputChange}
                                placeholder="Enter current password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input 
                                id="newPassword" 
                                name="newPassword"
                                type="password"
                                value={editForm.newPassword}
                                onChange={handleInputChange}
                                placeholder="Enter new password"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>

                    {isEditing && (
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="gap-2">
                          {isLoading ? (
                            <>
                              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    )}
                  </form>
                </Card>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Tasks</CardTitle>
                    <CardDescription>Manage your assigned and created tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userData.userTasks && userData.userTasks.length > 0 ? (
                      <div className="space-y-4">
                        {userData.userTasks.map((task, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{task.taskName}</CardTitle>
                                <Badge>{task.taskCategory}</Badge>
                              </div>
                              <CardDescription>Owner: {task.taskOwner}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm mb-2">{task.taskDescription}</p>
                              {task.subTasks && task.subTasks.length > 0 && (
                                <div className="mt-2">
                                  <h4 className="text-sm font-medium mb-1">Subtasks:</h4>
                                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {task.subTasks.map((subtask, idx) => (
                                      <li key={idx}>{subtask}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ListTodo className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
                        <p className="text-sm text-muted-foreground">You don't have any tasks assigned yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Teams Tab */}
              <TabsContent value="teams">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Teams</CardTitle>
                    <CardDescription>Teams you are a member of</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userData.userTeams && userData.userTeams.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userData.userTeams.map((team, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{team.teamName}</CardTitle>
                              <CardDescription>Owner: {team.teamOwner}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{team.teamDescription}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No teams found</h3>
                        <p className="text-sm text-muted-foreground">You are not a member of any teams yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}