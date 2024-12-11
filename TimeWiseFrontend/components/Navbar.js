"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaTasks,
  FaBullseye,
  FaChartLine,
  FaHistory,
  FaUsers,
  FaLaptopCode,
  FaBell,
  FaChartPie,
  FaBars,
  FaTimes,
  FaTachometerAlt, FaEnvelope, FaSearch, FaUserCircle, FaComments, FaUserFriends,
} from "react-icons/fa";

const Navbar = React.memo(() => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const options = [
    { id: "goals", label: "My Goals", icon: <FaBullseye className="mr-3 text-blue-500" /> },
    { id: "tasks", label: "My Tasks", icon: <FaTasks className="mr-3 text-green-500" /> },
    { id: "progress", label: "My Progress", icon: <FaChartLine className="mr-3 text-purple-500" /> },
    { id: "performance", label: "My Performance History", icon: <FaHistory className="mr-3 text-orange-500" /> },
    { id: "create-session", label: "Create a Session", icon: <FaLaptopCode className="mr-3 text-teal-500" /> },
    { id: "teams", label: "My Teams", icon: <FaUsers className="mr-3 text-indigo-500" /> },
    { id: "notifications", label: "Reminders & Notifications", icon: <FaBell className="mr-3 text-red-500" /> },
    { id: "statistics", label: "Statistics & Insights", icon: <FaChartPie className="mr-3 text-pink-500" /> },
    { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt className="mr-3" /> },
    { id: "messages", label: "Messages", icon: <FaEnvelope className="mr-3" /> },
    { id: "feedbacks", label: "Feedbacks", icon: <FaComments className="mr-3" /> },
    { id: "search-users", label: "Search Users", icon: <FaSearch className="mr-3" /> },
    { id: "settings", label: "Account Settings", icon: <FaUserCircle className="mr-3" /> },
    { id: "friendlist", label: "My Friendlist", icon: <FaUserFriends className="mr-3" /> },
  ];

  return (
    <header className="bg-gray-900 mb-2 text-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-1 px-4">
       
        {/* Logo */}
        <div className="flex items-center justify-start">
          <Image
            src="/images/timewise_logo.png"
            alt="TimeWise Logo"
            width={50}
            height={50}
            className="mr-2"
          />
          <span className="font-semibold text-lg">TimeWise</span>
        </div>
         {/* Mobile menu button */}
         <div className="md:hidden flex items-center justify-end">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Desktop menu */}
        <nav className="hidden md:flex space-x-8 items-center">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link href="/about" className="hover:text-gray-300">
            About
          </Link>
          <Link href="/contact" className="hover:text-gray-300">
            Contact
          </Link>
        </nav>

        {/* Desktop search and profile */}
        <div className="hidden md:flex items-center">
          <input
            type="text"
            placeholder="Search"
            className="px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-900 text-white focus:outline-none focus:border-gray-400"
          />
          <img
            src="/profile-pic.png"
            alt="Profile Picture"
            className="h-10 w-10 rounded-full ml-3 border-2 border-gray-600"
          />
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 py-2 px-4 flex flex-col space-y-3 max-h-screen overflow-y-auto">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link href="/register" className="hover:text-gray-300">
            Register
          </Link>
          <Link href="/about" className="hover:text-gray-300">
            About
          </Link>
          <Link href="/contact" className="hover:text-gray-300">
            Contact
          </Link>
          {options.map((option) => (
            <Link
              key={option.id}
              href={`/${option.id}`}
              className="hover:text-gray-300 flex items-center"
            >
              {option.icon}
              <span>{option.label}</span>
            </Link>
          ))}

          {/* Mobile search and profile */}
          <input
            type="text"
            placeholder="Search"
            className="px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-900 text-white focus:outline-none focus:border-gray-400 mt-2"
          />
          <img
            src="/profile-pic.png"
            alt="Profile Picture"
            className="h-10 w-10 rounded-full mt-3 border-2 border-gray-600"
          />
        </div>
      )}
    </header>
  );
});

// Manually setting the display name
Navbar.displayName = "Navbar";

export default Navbar;
