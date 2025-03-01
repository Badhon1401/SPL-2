"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  Tag,
  Star,
  AlertCircle,
  CheckCircle,
  User,
  List,
  Grid3x3,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  RefreshCcw,
  Save,
  ChevronRight,
  Bookmark,
  Eye,
} from "lucide-react";
import {
  format,
  isPast,
  isToday,
  isTomorrow,
  differenceInDays,
} from "date-fns";
import { toast } from "@/components/ui/use-toast";

// Priority badges
const priorityBadges = {
  High: (
    <Badge className="bg-rose-900/80 text-white border border-rose-700/50 shadow-md">
      High
    </Badge>
  ), // Deep muted red
  Medium: (
    <Badge className="bg-amber-900/80 text-white border border-amber-700/50 shadow-md">
      Medium
    </Badge>
  ), // Deep warm gold/brown
  Low: (
    <Badge className="bg-teal-900/80 text-white border border-teal-700/50 shadow-md">
      Low
    </Badge>
  ), // Deep muted teal
};




/**
 * Formats a date for display, showing "Today", "Tomorrow", etc.
 */
const formatDate = (date) => {
  if (!date) return "No deadline";
  const dateObj = new Date(date);

  if (isToday(dateObj)) return "Today";
  if (isTomorrow(dateObj)) return "Tomorrow";

  const daysUntil = differenceInDays(dateObj, new Date());
  if (daysUntil > 0 && daysUntil < 7) return `In ${daysUntil} days`;

  return format(dateObj, "MMM dd, yyyy");
};

/**
 * Get deadline status color
 */
const getDeadlineStatus = (deadline) => {
  if (!deadline) return "text-gray-500";

  const dateObj = new Date(deadline);

  if (isPast(dateObj)) return "text-red-500";
  if (isToday(dateObj)) return "text-orange-500";
  if (differenceInDays(dateObj, new Date()) <= 2) return "text-yellow-500";

  return "text-green-500";
};

/**
 * Main Task Dashboard component
 */
export default function TaskDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    primary: "deadline",
    secondary: "priority",
    tertiary: null,
    primaryDirection: "asc",
    secondaryDirection: "desc",
    tertiaryDirection: "asc",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [multiSort, setMultiSort] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [savedViews, setSavedViews] = useState([
    { name: "Default", config: { ...sortConfig, filters: {} } },
    {
      name: "Urgent Tasks",
      config: {
        primary: "priority",
        primaryDirection: "desc",
        filters: { priorities: ["High"] },
      },
    },
    {
      name: "Upcoming Deadlines",
      config: {
        primary: "deadline",
        primaryDirection: "asc",
        filters: { deadline: "upcoming" },
      },
    },
  ]);

  // Unique categories and priorities from tasks
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(tasks.map((task) => task.taskCategory)),
    ];
    return uniqueCategories.filter(Boolean).sort();
  }, [tasks]);

  const priorities = useMemo(() => {
    const uniquePriorities = [
      ...new Set(tasks.map((task) => task.taskPriority)),
    ];
    return uniquePriorities.filter(Boolean).sort();
  }, [tasks]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/tasks/mytasks");
        const data = await response.json();

        // Assuming data.tasks is the array of task summaries
        setTasks(data.tasks || data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again later.");

        // For demo purposes, load sample data if API fails
        setTasks(sampleTasks);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Navigate to task details
  const handleViewTaskDetails = (task) => {
    // Save task info to local storage
    localStorage.setItem("TimeWiseSelectedTaskName", task.taskName);
    localStorage.setItem("TimeWiseSelectedTaskOwner", task.taskOwner);

    // Navigate to task details page
    router.push("/home/task/details");
  };

  // Filter tasks based on search query, categories, priorities, etc.
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Text search
      const matchesSearch =
        searchQuery === "" ||
        task.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.taskDescription
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        task.taskOwner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.taskGoal?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(task.taskCategory.toLowerCase());

      // Priority filter
      const matchesPriority =
        selectedPriorities.length === 0 ||
        selectedPriorities.includes(task.taskPriority);

      // Deadline filter
      let matchesDeadline = true;
      if (deadlineFilter !== "all" && task.taskDeadline) {
        const deadline = new Date(task.taskDeadline);
        const today = new Date();

        switch (deadlineFilter) {
          case "overdue":
            matchesDeadline = isPast(deadline) && !isToday(deadline);
            break;
          case "today":
            matchesDeadline = isToday(deadline);
            break;
          case "tomorrow":
            matchesDeadline = isTomorrow(deadline);
            break;
          case "upcoming":
            matchesDeadline = !isPast(deadline);
            break;
          case "thisWeek":
            const endOfWeek = new Date();
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
            matchesDeadline = deadline <= endOfWeek && !isPast(deadline);
            break;
          default:
            matchesDeadline = true;
        }
      }

      // Progress filter
      let matchesProgress = true;
      if (progressFilter !== "all" && task.taskCurrentProgress !== undefined) {
        switch (progressFilter) {
          case "notStarted":
            matchesProgress = task.taskCurrentProgress === 0;
            break;
          case "inProgress":
            matchesProgress =
              task.taskCurrentProgress > 0 && task.taskCurrentProgress < 100;
            break;
          case "completed":
            matchesProgress = task.taskCurrentProgress === 100;
            break;
          case "almostDone":
            matchesProgress =
              task.taskCurrentProgress >= 75 && task.taskCurrentProgress < 100;
            break;
          default:
            matchesProgress = true;
        }
      }

      // Tab filter
      let matchesTab = true;
      if (activeTab !== "all") {
        switch (activeTab) {
          case "myTasks":
            const storedUserData = localStorage.getItem("TimeWiseUserData");
            const currentUser = storedUserData
              ? JSON.parse(storedUserData).userName
              : null;
            matchesTab = task.taskOwner === currentUser;
            break;
          case "urgent":
            matchesTab = ["High"].includes(task.taskPriority);
            break;
          case "upcoming":
            if (task.taskDeadline) {
              const deadline = new Date(task.taskDeadline);
              const today = new Date();
              const endOfWeek = new Date();
              endOfWeek.setDate(today.getDate() + 7);
              matchesTab = deadline <= endOfWeek && !isPast(deadline);
            } else {
              matchesTab = false;
            }
            break;
          default:
            matchesTab = true;
        }
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPriority &&
        matchesDeadline &&
        matchesProgress &&
        matchesTab
      );
    });
  }, [
    tasks,
    searchQuery,
    selectedCategories,
    selectedPriorities,
    deadlineFilter,
    progressFilter,
    activeTab,
  ]);

  // Sort tasks based on sort configuration
  const sortedTasks = useMemo(() => {
    const getSortValue = (task, key) => {
      switch (key) {
        case "deadline":
          return task.taskDeadline
            ? new Date(task.taskDeadline).getTime()
            : Infinity;
        case "priority":
          const priorityMap = {
            High: 3,
            Medium: 2,
            Low: 1,
          };
          return priorityMap[task.taskPriority] || 0;
        case "progress":
          return task.taskCurrentProgress || 0;
        case "category":
          return task.taskCategory || "";
        case "name":
          return task.taskName || "";
        case "goal":
          return task.taskGoal || "";
        case "creation":
          return task.taskCreationDate
            ? new Date(task.taskCreationDate).getTime()
            : 0;
        default:
          return task[key] || "";
      }
    };

    const sortFunction = (a, b) => {
      // Primary sort
      const primaryValueA = getSortValue(a, sortConfig.primary);
      const primaryValueB = getSortValue(b, sortConfig.primary);

      const primaryResult =
        sortConfig.primaryDirection === "asc"
          ? primaryValueA > primaryValueB
            ? 1
            : primaryValueA < primaryValueB
            ? -1
            : 0
          : primaryValueA < primaryValueB
          ? 1
          : primaryValueA > primaryValueB
          ? -1
          : 0;

      // If primary sort resulted in equality and multiSort is enabled, try secondary sort
      if (primaryResult === 0 && multiSort && sortConfig.secondary) {
        const secondaryValueA = getSortValue(a, sortConfig.secondary);
        const secondaryValueB = getSortValue(b, sortConfig.secondary);

        const secondaryResult =
          sortConfig.secondaryDirection === "asc"
            ? secondaryValueA > secondaryValueB
              ? 1
              : secondaryValueA < secondaryValueB
              ? -1
              : 0
            : secondaryValueA < secondaryValueB
            ? 1
            : secondaryValueA > secondaryValueB
            ? -1
            : 0;

        // If secondary sort resulted in equality and tertiary sort is defined, use it
        if (secondaryResult === 0 && sortConfig.tertiary) {
          const tertiaryValueA = getSortValue(a, sortConfig.tertiary);
          const tertiaryValueB = getSortValue(b, sortConfig.tertiary);

          return sortConfig.tertiaryDirection === "asc"
            ? tertiaryValueA > tertiaryValueB
              ? 1
              : tertiaryValueA < tertiaryValueB
              ? -1
              : 0
            : tertiaryValueA < tertiaryValueB
            ? 1
            : tertiaryValueA > tertiaryValueB
            ? -1
            : 0;
        }

        return secondaryResult;
      }

      return primaryResult;
    };

    return [...filteredTasks].sort(sortFunction);
  }, [filteredTasks, sortConfig, multiSort]);

  // Handle sort change
  const handleSortChange = (field, level = "primary") => {
    setSortConfig((prevConfig) => {
      // If clicking the same field, toggle direction
      if (prevConfig[level] === field) {
        return {
          ...prevConfig,
          [`${level}Direction`]:
            prevConfig[`${level}Direction`] === "asc" ? "desc" : "asc",
        };
      }

      // Otherwise, change the field and reset direction
      return {
        ...prevConfig,
        [level]: field,
        [`${level}Direction`]: "asc",
      };
    });
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Toggle priority selection
  const togglePriority = (priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedPriorities([]);
    setDeadlineFilter("all");
    setProgressFilter("all");
    setSortConfig({
      primary: "deadline",
      secondary: "priority",
      tertiary: null,
      primaryDirection: "asc",
      secondaryDirection: "desc",
      tertiaryDirection: "asc",
    });
  };

  // Save current view configuration
  const saveCurrentView = () => {
    // Prompt for view name
    const viewName = prompt("Enter a name for this view:", "");
    if (!viewName) return;

    // Save current configuration
    const newView = {
      name: viewName,
      config: {
        ...sortConfig,
        filters: {
          searchQuery,
          categories: selectedCategories,
          priorities: selectedPriorities,
          deadline: deadlineFilter,
          progress: progressFilter,
        },
      },
    };

    setSavedViews((prev) => [...prev, newView]);

    toast({
      title: "View Saved",
      description: `"${viewName}" view has been saved.`,
    });
  };

  // Load a saved view
  const loadSavedView = (view) => {
    setSortConfig({
      primary: view.config.primary || "deadline",
      secondary: view.config.secondary || "priority",
      tertiary: view.config.tertiary || null,
      primaryDirection: view.config.primaryDirection || "asc",
      secondaryDirection: view.config.secondaryDirection || "desc",
      tertiaryDirection: view.config.tertiaryDirection || "asc",
    });

    if (view.config.filters) {
      setSearchQuery(view.config.filters.searchQuery || "");
      setSelectedCategories(view.config.filters.categories || []);
      setSelectedPriorities(view.config.filters.priorities || []);
      setDeadlineFilter(view.config.filters.deadline || "all");
      setProgressFilter(view.config.filters.progress || "all");
    }

    toast({
      title: "View Loaded",
      description: `"${view.name}" view has been applied.`,
    });
  };

  // Render task cards in grid view
  const renderTaskGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.map((task) => (
          <Card
            key={`${task.taskName}-${task.taskOwner}`}
            className="h-full flex flex-col transition-all hover:shadow-lg"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-gray-500 text-white mb-2">
                    {task.taskCategory || "Uncategorized"}
                  </Badge>
                  <CardTitle className="text-lg line-clamp-2">
                    {task.taskName}
                  </CardTitle>
                </div>
                <div>
                  {priorityBadges[task.taskPriority] || (
                    <Badge variant="outline">Normal</Badge>
                  )}
                </div>
              </div>
              <CardDescription className="line-clamp-2 mt-1">
                {task.taskDescription || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              {task.taskGoal && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Goal:</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {task.taskGoal}
                  </div>
                </div>
              )}
              <div className="mb-3">
                <div className="text-sm font-medium mb-1">Progress:</div>
                <Progress
                  value={task.taskCurrentProgress || 0}
                  className="h-2"
                />
                <div className="text-xs text-right mt-1">
                  {task.taskCurrentProgress || 0}%
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                <span className={getDeadlineStatus(task.taskDeadline)}>
                  {formatDate(task.taskDeadline)}
                </span>
              </div>
              <div className="flex gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    {(task.taskOwner || "?").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleViewTaskDetails(task)}
                >
                  <Eye className="h-4 w-4 mr-1" /> Details
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Render task list view
  const renderTaskList = () => {
    return (
      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <Card
            key={`${task.taskName}-${task.taskOwner}`}
            className="transition-all hover:shadow-md"
          >
            <div className="p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      className="bg-gray-500 text-white"
                    >
                      {task.taskCategory || "Uncategorized"}
                    </Badge>
                    <h3 className="font-semibold">{task.taskName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {priorityBadges[task.taskPriority] || (
                      <Badge variant="outline">Normal</Badge>
                    )}
                    <div
                      className={`flex items-center text-sm ${getDeadlineStatus(
                        task.taskDeadline
                      )}`}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(task.taskDeadline)}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {task.taskDescription || "No description provided"}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
                  {task.taskGoal && (
                    <div className="flex items-center gap-1 text-sm">
                      <Tag className="h-4 w-4" />
                      <span>{task.taskGoal}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm">
                    <User className="h-4 w-4" />
                    <span>{task.taskOwner || "Unassigned"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Progress
                    value={task.taskCurrentProgress || 0}
                    className="h-2 flex-grow"
                  />
                  <span className="text-xs whitespace-nowrap">
                    {task.taskCurrentProgress || 0}%
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewTaskDetails(task)}
                >
                  <Eye className="h-4 w-4 mr-1" /> Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-blue-500">
          Task Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage and track your tasks with advanced sorting and filtering
          options.
        </p>
      </div>

      {/* Tabs for quick filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-2">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="myTasks">My Tasks</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        {/* Search and filters section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
          <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="gap-1">
      <Filter className="h-4 w-4" /> Filter
    </Button>
  </DropdownMenuTrigger>
  
  <DropdownMenuPortal>
    <DropdownMenuContent
      align="center"
      className="w-96 p-4 bg-white dark:bg-black shadow-lg rounded-lg 
                 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 
                 max-h-[80vh] overflow-y-auto"
    >
      <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
      <DropdownMenuSeparator />

                <div className="p-2">
                  <h4 className="mb-2 text-sm font-medium">Categories</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>

                  <h4 className="mt-4 mb-2 text-sm font-medium">Priority</h4>
                  <div className="space-y-2">
                    {priorities.map((priority) => (
                      <div
                        key={priority}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={selectedPriorities.includes(priority)}
                          onCheckedChange={() => togglePriority(priority)}
                        />
                        <label
                          htmlFor={`priority-${priority}`}
                          className="text-sm cursor-pointer"
                        >
                          {priority}
                        </label>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    {showAdvancedFilters
                      ? "Hide Advanced Filters"
                      : "Show Advanced Filters"}
                  </Button>

                  {showAdvancedFilters && (
                    <>
                      <h4 className="mt-4 mb-2 text-sm font-medium">
                        Deadline
                      </h4>
                      <Select
                        value={deadlineFilter}
                        onValueChange={setDeadlineFilter}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by deadline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="tomorrow">Tomorrow</SelectItem>
                          <SelectItem value="thisWeek">This Week</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                        </SelectContent>
                      </Select>

                      <h4 className="mt-4 mb-2 text-sm font-medium">
                        Progress
                      </h4>
                      <Select
                        value={progressFilter}
                        onValueChange={setProgressFilter}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by progress" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="notStarted">
                            Not Started
                          </SelectItem>
                          <SelectItem value="inProgress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="almostDone">
                            Almost Done
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-gray-800 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
                </DropdownMenuContent>
  </DropdownMenuPortal>
</DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <SlidersHorizontal className="h-4 w-4" /> Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort Tasks</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="p-2">
                  <h4 className="mb-2 text-sm font-medium">Primary Sort</h4>
                  <Select
                    value={sortConfig.primary}
                    onValueChange={(val) => handleSortChange(val, "primary")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select primary sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="name">Task Name</SelectItem>
                      <SelectItem value="creation">Creation Date</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex justify-center mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleSortChange(sortConfig.primary, "primary")
                      }
                    >
                      {sortConfig.primaryDirection === "asc" ? (
                        <>
                          <SortAsc className="h-4 w-4 mr-1" /> Ascending
                        </>
                      ) : (
                        <>
                          <SortDesc className="h-4 w-4 mr-1" /> Descending
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="mt-4 mb-2 flex items-center">
                    <Checkbox
                      id="multiSort"
                      checked={multiSort}
                      onCheckedChange={setMultiSort}
                      className="mr-2"
                    />
                    <label
                      htmlFor="multiSort"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Enable multi-level sorting
                    </label>
                  </div>

                  {multiSort && (
                    <>
                      <h4 className="mt-4 mb-2 text-sm font-medium">
                        Secondary Sort
                      </h4>
                      <Select
                        value={sortConfig.secondary}
                        onValueChange={(val) =>
                          handleSortChange(val, "secondary")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select secondary sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deadline">Deadline</SelectItem>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="progress">Progress</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="name">Task Name</SelectItem>
                          <SelectItem value="creation">
                            Creation Date
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex justify-center mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleSortChange(sortConfig.secondary, "secondary")
                          }
                        >
                          {sortConfig.secondaryDirection === "asc" ? (
                            <>
                              <SortAsc className="h-4 w-4 mr-1" /> Ascending
                            </>
                          ) : (
                            <>
                              <SortDesc className="h-4 w-4 mr-1" /> Descending
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Bookmark className="h-4 w-4" /> Views
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {savedViews.map((view) => (
                  <DropdownMenuItem
                    key={view.name}
                    onClick={() => loadSavedView(view)}
                  >
                    <span>{view.name}</span>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={saveCurrentView}>
                  <Save className="h-4 w-4 mr-2" />
                  <span>Save Current View</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={() => setView(view === "grid" ? "list" : "grid")}
            >
              {view === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3x3 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Results info and actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            Showing {sortedTasks.length}{" "}
            {sortedTasks.length === 1 ? "task" : "tasks"}
            {searchQuery && (
              <span>
                {" "}
                matching "<strong>{searchQuery}</strong>"
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="gap-1"
          >
            <RefreshCcw className="h-4 w-4" /> Reset
          </Button>
        </div>

        {/* Task Display */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="font-medium text-lg">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Card>
        ) : sortedTasks.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="font-medium text-lg mb-2">No tasks found</p>
            <p className="text-muted-foreground">
              {searchQuery ||
              selectedCategories.length > 0 ||
              selectedPriorities.length > 0
                ? "Try adjusting your filters to see more tasks."
                : "Create a new task to get started."}
            </p>
          </Card>
        ) : (
          <TabsContent value={activeTab} forceMount className="mt-0">
            {view === "grid" ? renderTaskGrid() : renderTaskList()}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
