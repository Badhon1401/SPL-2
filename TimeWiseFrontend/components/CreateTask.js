"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

function TaskCreationPage() {
  const [taskDetails, setTaskDetails] = useState({
    taskName: "",
    taskDescription: "",
    taskPriority: "",
    taskDeadline: "",
    taskCategory: "",
  });

  const [error, setError] = useState("");

  const validateForm = () => {
    if (!taskDetails.taskName.trim()) return "Task name is required.";
    if (!taskDetails.taskDeadline.trim()) return "Task deadline is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError("");
    try {
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskDetails),
      });
  
      if (!response.ok) {
        setError("Task Creation failed. Please try again.");
        return;
      }
  
      taskDetails = await response.json(); 
    
      router.push("/"); // Redirect to home
    } catch (error) {
      console.error("Login error:", error.message);
      setError("An error occurred. Please try again later.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskDetails({ ...taskDetails, [name]: value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-gray-400">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl p-8 bg-gray-800 bg-opacity-90 rounded-lg shadow-lg"
      >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Image
            src="/images/timewise_logo.png"
            alt="TimeWise Logo"
            width={60}
            height={60}
          />
          <h1 className="text-4xl font-bold text-blue-400">TimeWise</h1>
        </div>
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create a Task
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="taskName"
            placeholder="Task Name"
            value={taskDetails.taskName}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <textarea
            name="taskDescription"
            placeholder="Task Description"
            value={taskDetails.taskDescription}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          ></textarea>
          <select
            name="taskPriority"
            value={taskDetails.taskPriority}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          >
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            type="date"
            name="taskDeadline"
            value={taskDetails.taskDeadline}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="taskCategory"
            placeholder="Task Category"
            value={taskDetails.taskCategory}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-300"
            type="submit"
          >
            Create Task
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default TaskCreationPage;
