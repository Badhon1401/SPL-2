"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/ModeToggle";
import {
  Moon,
  Sun,
  Menu,
  X,
  User,
  Mail,
  Info,
  Phone,
  Clock,
  CheckCircle,
  BarChart,
  Users,
  Bell,
  Target,
  Activity,
} from "lucide-react";

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      title: "Advanced User Management",
      description: "Create and customize your profile with detailed insights and preferences.",
      icon: User,
      details: [
        "Customizable user profiles",
        "Role-based access control",
        "Profile analytics",
        "Activity history",
      ],
    },
    {
      title: "Intelligent Task Management",
      description: "AI-powered task organization and prioritization system.",
      icon: CheckCircle,
      details: [
        "Smart task categorization",
        "Priority automation",
        "Deadline predictions",
        "Task dependencies",
      ],
    },
    {
      title: "Real-time Progress Tracking",
      description: "Monitor your progress with advanced analytics and insights.",
      icon: Activity,
      details: [
        "Visual progress indicators",
        "Milestone tracking",
        "Progress predictions",
        "Achievement system",
      ],
    },
    {
      title: "Performance Analytics",
      description: "Comprehensive performance metrics and insights.",
      icon: BarChart,
      details: [
        "Detailed performance metrics",
        "Productivity analysis",
        "Custom reports",
        "Trend forecasting",
      ],
    },
    {
      title: "Smart Notifications",
      description: "Context-aware reminders and intelligent alerts.",
      icon: Bell,
      details: [
        "AI-powered notifications",
        "Custom alert rules",
        "Priority-based alerts",
        "Multi-channel delivery",
      ],
    },
    {
      title: "Team Collaboration",
      description: "Advanced tools for team coordination and feedback.",
      icon: Users,
      details: [
        "Real-time collaboration",
        "Team analytics",
        "Shared workspaces",
        "Feedback system",
      ],
    },
  ];

  const mainContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/timewise_logo.png"
                alt="TimeWise Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                TimeWise
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              

              <Button variant="ghost" size="sm" asChild>
                <Link href="/about-us">About</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/contact">Contact</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
               {/* Theme Toggle */}
                        <ModeToggle />
              
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigate through TimeWise
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] py-4">
                  <div className="flex flex-col space-y-2">
                    {features.map((feature) => (
                      <Button
                        key={feature.title}
                        variant="ghost"
                        className="justify-start"
                      >
                        <feature.icon className="mr-2 h-4 w-4" />
                        {feature.title}
                      </Button>
                    ))}
                    <Separator className="my-2" />
                    <Button variant="ghost" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/register">Register</Link>
                    </Button>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          variants={mainContentVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Hero Section */}
          <section className="text-center space-y-6 py-6">
            <motion.h1
              className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Welcome to TimeWise
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Transform your productivity with AI-powered time management and task organization
            </motion.p>
            <motion.div
              className="flex justify-center space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </motion.div>
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={featureCardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  layout
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <feature.icon className="h-6 w-6 text-primary" />
                        <CardTitle>{feature.title}</CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        </motion.div>
      </main>
    </div>
  );
}