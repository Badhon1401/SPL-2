"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaCalendar as Calendar,
  FaCheck as Check,
  FaClock as Clock,
  FaFileAlt as FileText,
  FaFolder as Folder,
  FaCommentAlt as MessageCircle,
  FaEllipsisV as MoreVertical,
  FaPlusCircle as PlusCircle,
  FaTag as Tag,
  FaTrashAlt as Trash2,
} from "react-icons/fa";

const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    High: "bg-red-500 text-white",
    Medium: "bg-yellow-500 text-black",
    Low: "bg-green-500 text-white",
  };

  return (
    <span
      className={`${
        priorityStyles[priority] || "bg-gray-500"
      } rounded-full px-2 py-1 text-xs font-semibold`}
    >
      {priority} Priority
    </span>
  );
};

const TaskProgressBar = ({ progress }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm text-gray-500">
      <span>Progress</span>
      <span>{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

const TaskCard = ({ task, onTaskDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const formattedDeadline = useMemo(() => {
    return new Date(task.taskDeadline).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [task.taskDeadline]);

  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-all">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">{task.taskName}</h2>
        <PriorityBadge priority={task.taskPriority} />
        <button onClick={() => setIsExpanded(!isExpanded)}>
          <MoreVertical />
        </button>
      </div>

      <TaskProgressBar progress={task.taskCurrentProgress} />

      <div className="flex space-x-3 mt-2 text-sm text-gray-500">
        <div className="flex items-center">
          <Calendar className="mr-1" />
          {formattedDeadline}
        </div>
        <div className="flex items-center">
          <Folder className="mr-1" />
          {task.taskCategory}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <p className="text-sm">{task.taskDescription}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              className="border rounded p-2 flex items-center justify-center"
              onClick={() => setModalOpen(true)}
            >
              <FileText className="mr-2" /> Details
            </button>
            <button
              className="border rounded p-2 text-red-500 flex items-center justify-center"
              onClick={onTaskDelete} // Pass both taskId and taskName
            >
              <Trash2 className="mr-2" /> Delete
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{task.taskName}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Task Overview</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Tag className="mr-2" />
                    <span>Category: {task.taskCategory}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2" />
                    <span>Priority: {task.taskPriority}</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2" />
                    <span>Progress: {task.taskCurrentProgress}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div>
                  <p>Created: {new Date(task.taskCreationDate).toLocaleDateString()}</p>
                  <p>Deadline: {formattedDeadline}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between">
                <button
                  className="flex items-center"
                  onClick={() => setModalOpen(false)}
                >
                  <MessageCircle className="mr-2" /> Comments
                </button>
                <button
                  className="flex items-center"
                  onClick={() => setModalOpen(false)}
                >
                  <PlusCircle className="mr-2" /> Todos
                </button>
              </div>
            </div>
            <button
              className="mt-4 w-full bg-gray-200 p-2 rounded"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks/mytasks");
        const data = await response.json();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      return [];
    }
    switch (filter) {
      case "In Progress":
        return tasks.filter(
          (task) =>
            task.taskCurrentProgress > 0 && task.taskCurrentProgress < 100
        );
      case "Completed":
        return tasks.filter((task) => task.taskCurrentProgress === 100);
      case "Not Started":
        return tasks.filter((task) => task.taskCurrentProgress === 0);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const handleTaskDelete = async (taskId, taskName) => {
    try {
      const response = await fetch(
        `/api/tasks/delete?taskName=${encodeURIComponent(taskName)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      const result = await response.text();
      console.log(result); // Log the result if needed

      // Filter out the deleted task
      const updatedTasks = tasks.filter((task) => task.taskId !== taskId);

      // Update the tasks state with the filtered list
      setTasks(updatedTasks);
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {error}</div>;

  return (
    <div className="container mx-auto p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <div className="flex space-x-2">
          {["All", "Not Started", "In Progress", "Completed"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded ${
                filter === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No tasks found. Create your first task!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task, index) => (
            <TaskCard
              key={`${task.taskId.toString()}-${index}`}
              task={task}
              onTaskDelete={() => handleTaskDelete(task.taskId, task.taskName)} // Pass as a callback
            />
          ))}
        </div>
      )}
    </div>
  );
}