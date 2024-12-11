"use client";
import { useState } from "react";
import {
  FaTasks,
  FaBullseye,
  FaChartLine,
  FaHistory,
  FaUsers,
  FaLaptopCode,
  FaBell,
  FaChartPie,
} from "react-icons/fa";

const SidebarLeft = () => {
  const [activeItem, setActiveItem] = useState("");

  // Define services for TimeWise
  const options = [
    { id: "goals", label: "My Goals", icon: <FaBullseye className="mr-3 text-blue-500" /> },
    { id: "tasks", label: "My Tasks", icon: <FaTasks className="mr-3 text-green-500" /> },
    { id: "progress", label: "My Progress", icon: <FaChartLine className="mr-3 text-purple-500" /> },
    { id: "performance", label: "My Performance History", icon: <FaHistory className="mr-3 text-orange-500" /> },
    { id: "create-session", label: "Create a Session", icon: <FaLaptopCode className="mr-3 text-teal-500" /> },
    { id: "teams", label: "My Teams", icon: <FaUsers className="mr-3 text-indigo-500" /> },
    { id: "notifications", label: "Reminders & Notifications", icon: <FaBell className="mr-3 text-red-500" /> },
    { id: "statistics", label: "Statistics & Insights", icon: <FaChartPie className="mr-3 text-pink-500" /> },
  ];

  return (
    <aside className="w-48 bg-gray-800 shadow-md fixed top-12 left-0 bottom-0 z-10 lg:block md:hidden hidden">
      <div className="p-4">
        <ul className="space-y-1 mt-4">
          {options.map(({ id, label, icon }) => (
            <li key={id}>
              <button
                className={`flex items-center w-full text-left px-2 py-3 rounded-md transition-transform transform ${
                  activeItem === id
                    ? "bg-blue-100 text-blue-800 scale-105"
                    : "text-gray-200 hover:bg-gray-700"
                }`}
                onClick={() => setActiveItem(id)}
              >
                {icon}
                <span className="font-medium">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default SidebarLeft;
