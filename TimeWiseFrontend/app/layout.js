"use client";
import '@/styles/globals.css';
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";
import WelcomeMessage from "@/components/WelcomeMessage";
import SignIn from "@/components/SignIn";
import SignUp from "@/components/SignUp";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initial null indicates "loading"
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status
    const userIsAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(userIsAuthenticated);

    // Redirect based on auth status
    if (userIsAuthenticated) {
      // Redirect authenticated users away from auth pages
      if (["/signin", "/signup", "/welcome"].includes(pathname)) {
        router.push("/"); // Use `replace` to avoid adding to history
      }
    } else {
      // Redirect unauthenticated users to the welcome page
      if (!["/signin", "/signup", "/welcome"].includes(pathname)) {
        router.push("/welcome");
      }
    }
  }, [pathname]);

  // Show loading screen while determining authentication state
  if (isAuthenticated === null) {
    return (
      <html lang="en">
        <body>
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p>Loading...</p> {/* Loading indicator */}
          </div>
        </body>
      </html>
    );
  }

  // If the user is not authenticated, show appropriate pages based on pathname
  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body>
          {pathname === "/welcome" && <WelcomeMessage />}
          {pathname === "/signin" && <SignIn />}
          {pathname === "/signup" && <SignUp />}
        </body>
      </html>
    );
  }

  // If authenticated, render the main layout
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="main-layout">
          <SidebarLeft />
          <div className="main-content">
            {children} {/* Content passed to the layout */}
          </div>
          <SidebarRight />
        </div>
      </body>
    </html>
  );
}
