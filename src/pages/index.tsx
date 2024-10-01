import Sidebar from "@/components/Sidebar";
import AddCourseModal from "@/components/AddCourseModal";
import AddTaskModal from "@/components/AddTaskModal";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState({ username: "", email: "" });

  interface Course {
    id: string;
    name: string;
    color: string;
  }

  interface Task {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    details: string;
    status: string;
    category: string;
  }

  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

  const fetchCoursesData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/courses/getAll", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setCourses(result.data.courses);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchTasksData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        router.push("/login");
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
          router.push("/login");
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
    fetchCoursesData();
    fetchTasksData();
  }, []);

  const handleAddCourseClick = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    fetchCoursesData();
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalVisible(false);
    fetchTasksData();
  };

  const handleAddTaskClick = () => {
    setIsTaskModalVisible(true);
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/notes/${courseId}`);
  };

  function formatDateTimeRange(startTime: string, endTime: string) {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    const date = new Date(startTime).toLocaleDateString("en-GB", dateOptions);
    const startTimeFormatted = new Date(startTime)
      .toLocaleTimeString([], timeOptions)
      .replace(":", ".");
    const endTimeFormatted = new Date(endTime)
      .toLocaleTimeString([], timeOptions)
      .replace(":", ".");

    return `${date} - ${startTimeFormatted}-${endTimeFormatted}`;
  }

  function formatDateTimeRangeBreak(startTime: string, endTime: string) {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
  
    const date = new Date(startTime).toLocaleDateString("en-GB", dateOptions);
    const startTimeFormatted = new Date(startTime)
      .toLocaleTimeString([], timeOptions)
      .replace(":", ".");
    const endTimeFormatted = new Date(endTime)
      .toLocaleTimeString([], timeOptions)
      .replace(":", ".");
  
    return (
      <>
        {date} <br />
        {startTimeFormatted} - {endTimeFormatted}
      </>
    );
  }
  

  return (
    <div className="relative w-full">
      <Sidebar></Sidebar>
      <AddCourseModal
        onClose={handleCloseModal}
        isVisible={isModalVisible}
      ></AddCourseModal>
      <AddTaskModal
        onClose={handleCloseTaskModal}
        isVisible={isTaskModalVisible}
      ></AddTaskModal>
      <div className="ms-80 mt-6 me-6">
        <p className="text-4xl text-navy-blue font-medium">
          Have A nice day,{" "}
          <span className="font-bold">{user.username || "User"}!</span>
        </p>
        <div className="grid grid-cols-2 gap-2 p-4 bg-light-blue-100 rounded-2rem mt-6">
          {/* Upcoming Tasks Card */}
          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 col-span-2">
            <p className="text-xl font-bold text-navy-blue border-b-2 border-light-blue-100">
              Upcoming tasks
            </p>
            <div>
              {tasks
                .filter((task) => task.status === "not-started" || task.status === "in-progress")
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between border-t border-light-blue-100"
                  >
                    <p className="text-pink font-bold">{task.name}</p>
                    <p className="text-sm text-black font-montserrat text-right font-medium">
                      {formatDateTimeRangeBreak(task.startTime, task.endTime)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
          {/* Upcoming Courses Card */}
          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 relative col-span-2">
            <p className="text-xl font-bold text-navy-blue border-b-2 border-light-blue-100 pb-2">
              Courses
            </p>
            <button
              className="absolute top-4 right-4 text-gray-500 text-xl"
              onClick={handleAddCourseClick}
            >
              <img src="/assets/add.png" alt="+" />
            </button>
            <div className="w-full overflow-x-auto hide-scrollbar">
              <div className="flex space-x-8 mt-4">
                {courses.map((course) => (
                  <div key={course.id} className="relative flex-shrink-0">
                    <img
                      src={`/assets/${course.color.replace("#", "")}.png`}
                      alt="folder"
                    />
                    <div
                      className="absolute inset-0 flex items-end justify-center text-navy-blue font-bold text-xl cursor-pointer"
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <p className="bg-beige mb-4 min-w-[248px] text-center py-2 rounded-lg">
                        {course.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Tasks Progress Cards */}
          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 relative col-span-2">
            <p className="text-xl font-bold text-navy-blue border-b-2 border-light-blue-100 pb-2">
              Tasks progress
            </p>
            <button className="absolute top-4 right-4 text-gray-500 text-xl">
              <img src="/assets/add.png" alt="+" onClick={handleAddTaskClick} />
            </button>
            <div className="w-full mt-4 flex justify-between">
              <div className="w-[23%] rounded-2xl border-2 border-light-blue-100 min-h-96">
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
      </div>
    </div>
  );
}
