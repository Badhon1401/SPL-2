"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  TrendingUp,
  History,
  Play,
  Users,
  Bell,
  PieChart,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const menuItems = [
  {
    id: "tasks",
    label: "My Tasks",
    icon: ClipboardList,
    route: "/home/task/mytasks",
    color: "text-green-500",
  },
  {
    id: "progress",
    label: "My Progress",
    icon: TrendingUp,
    route: "/progress",
    color: "text-purple-500",
  },
  {
    id: "performance",
    label: "Performance History",
    icon: History,
    route: "/performance",
    color: "text-orange-500",
  },
  {
    id: "create-session",
    label: "Create Session",
    icon: Play,
    route: "/create-session",
    color: "text-teal-500",
  },
  {
    id: "teams",
    label: "My Teams",
    icon: Users,
    route: "/teams",
    color: "text-indigo-500",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    route: "/notifications",
    color: "text-red-500",
  },
  {
    id: "statistics",
    label: "Statistics",
    icon: PieChart,
    route: "/statistics",
    color: "text-pink-500",
  },
];

export default function SidebarLeft() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  const showLabels = !isCollapsed || isHovered;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 200 }}
      className={cn(
        "fixed top-16 left-0 bottom-0 z-30",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-r",
        "transition-all duration-300 ease-in-out",
        "hidden lg:block","dark:bg-gray-800",      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-6 w-6"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 p-2 ">
          <TooltipProvider>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.route;
                return (
                  <Tooltip key={item.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isCollapsed && "justify-center"
                        )}
                        onClick={() => router.push(item.route)}
                      >
                        <item.icon
                          className={cn("h-5 w-5 shrink-0", item.color)}
                        />
                        <AnimatePresence>
                          {showLabels && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="ml-3 overflow-hidden whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && !isHovered && (
                      <TooltipContent side="right">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>
        </ScrollArea>
      </div>
    </motion.aside>
  );
}