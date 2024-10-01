/* eslint-disable */
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AddTaskModal from "@/components/AddTaskModal";
import { useRouter } from "next/router";

export default function TaskTracker() {
  const [user, setUser] = useState({ username: "", email: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  interface Task {
    id: string;
    name: string;
    status: "not-started" | "in-progress" | "completed" | "blocked";
    startTime: string;
    endTime: string;
  }

  const fetchTasksData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("/api/tasks/getAll", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setTasks(result.data.tasks);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch("/api/user/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (result.success) {
          setUser(result.data);
        } else {
          console.error(result.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
    fetchTasksData();
  }, []);

  const handleAddTaskClick = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    fetchTasksData();
  };

  const formatDateTimeRange = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleString();
    const endDate = new Date(end).toLocaleString();
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="relative w-full">
      <Sidebar />
      <AddTaskModal onClose={handleCloseModal} isVisible={isModalVisible} />
      <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 relative col-span-2 ms-80 me-6">
        <p className="text-3xl font-bold text-navy-blue border-b-2 border-light-blue-100 pb-2">
          Tasks Tracker
        </p>
        <button className="absolute top-4 right-4 text-gray-500 text-xl">
          <img src="/assets/add.png" alt="+" onClick={handleAddTaskClick} />
        </button>
        <div className="w-full mt-4 flex justify-between">
          {/* Not Started Column */}
          <div className="w-[23%] rounded-2xl border-2 border-light-blue-100 min-h-[85vh]">
            <p className="text-2xl mt-2 font-bold mx-2 text-navy-blue border-b-2 border-light-blue-100 pb-2 text-center">
              Not started
            </p>
            {tasks
              .filter((task) => task.status === "not-started")
              .map((task) => (
                <div
                  key={task.id}
                  className="mx-2 my-1 border-2 border-light-blue-100 px-1 rounded-lg"
                >
                  <p className="text-pink font-bold border-b border-pink">
                    {task.name}
                  </p>
                  <p className="text-xs text-black font-montserrat text-left font-medium">
                    {formatDateTimeRange(task.startTime, task.endTime)}
                  </p>
                </div>
              ))}
          </div>

          {/* In Progress Column */}
          <div className="w-[23%] rounded-2xl border-2 border-light-blue-100 min-h-96">
            <p className="text-2xl mt-2 font-bold mx-2 text-navy-blue border-b-2 border-yellow pb-2 text-center">
              In progress
            </p>
            {tasks
              .filter((task) => task.status === "in-progress")
              .map((task) => (
                <div
                  key={task.id}
                  className="mx-2 my-1 border-2 border-light-blue-100 px-1 rounded-lg"
                >
                  <p className="text-pink font-bold border-b border-yellow">
                    {task.name}
                  </p>
                  <p className="text-xs text-black font-montserrat text-left font-medium">
                    {formatDateTimeRange(task.startTime, task.endTime)}
                  </p>
                </div>
              ))}
          </div>

          {/* Completed Column */}
          <div className="w-[23%] rounded-2xl border-2 border-light-blue-100 min-h-96">
            <p className="text-2xl mt-2 font-bold mx-2 text-navy-blue border-b-2 border-green pb-2 text-center">
              Completed
            </p>
            {tasks
              .filter((task) => task.status === "completed")
              .map((task) => (
                <div
                  key={task.id}
                  className="mx-2 my-1 border-2 border-light-blue-100 px-1 rounded-lg"
                >
                  <p className="text-pink font-bold border-b border-yellow">
                    {task.name}
                  </p>
                  <p className="text-xs text-black font-montserrat text-left font-medium">
                    {formatDateTimeRange(task.startTime, task.endTime)}
                  </p>
                </div>
              ))}
          </div>

          {/* Blocked Column */}
          <div className="w-[23%] rounded-2xl border-2 border-light-blue-100 min-h-96">
            <p className="text-2xl mt-2 font-bold mx-2 text-navy-blue border-b-2 border-pink pb-2 text-center">
              Blocked
            </p>
            {tasks
              .filter((task) => task.status === "blocked")
              .map((task) => (
                <div
                  key={task.id}
                  className="mx-2 my-1 border-2 border-light-blue-100 px-1 rounded-lg"
                >
                  <p className="text-pink font-bold border-b border-yellow">
                    {task.name}
                  </p>
                  <p className="text-xs text-black font-montserrat text-left font-medium">
                    {formatDateTimeRange(task.startTime, task.endTime)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
