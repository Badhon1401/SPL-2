"use client";
import React from "react";
import { FaTachometerAlt, FaEnvelope, FaSearch, FaUserCircle, FaComments, FaUserFriends } from "react-icons/fa";

const SidebarRight = () => {
  const handleClick = (message) => {
    alert(message);
  };

  const options = [
    { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt className="mr-2" /> },
    { id: "messages", label: "Messages", icon: <FaEnvelope className="mr-2" /> },
    { id: "feedbacks", label: "Feedbacks", icon: <FaComments className="mr-2" /> },
    { id: "search-users", label: "Search Users", icon: <FaSearch className="mr-2" /> },
    { id: "settings", label: "Account Settings", icon: <FaUserCircle className="mr-2" /> },
    { id: "friendlist", label: "My Friendlist", icon: <FaUserFriends className="mr-2" /> },
  ];

  return (
    <aside className="w-48 bg-gray-200 shadow-md fixed top-12 right-0 bottom-0 z-10 lg:block md:hidden hidden">
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-start mb-2">
          <FaUserCircle className="text-3xl text-gray-800 mr-3" />
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold text-gray-800 break-words">{/* Allows the name to break onto a new line */}
              John ghjhjdfadffadfadfe
            </h2>
            <p className="text-gray-600 text-sm break-words">{/* Allows the email to break onto a new line */}
              johndoaefdadfadfaadfde@gmail.com
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 mb-2 transition-colors duration-200">
          Edit Profile
        </button>
        <button className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors duration-200">
          Sign Out
        </button>

        {/* Navigation Options */}
        <ul className="space-y-3 mt-3">
          {options.map((option) => (
            <li key={option.id}>
              <button
                onClick={() => handleClick(`Navigating to ${option.label}`)}
                className="flex items-center w-full px-2 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-opacity-50 transition-transform transform hover:scale-105"
              >
                {option.icon}
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default SidebarRight;
