/* eslint-disable */
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AddCourseModal from "@/components/AddCourseModal";
import { useRouter } from "next/router";

export default function Home() {
  const [user, setUser] = useState({ username: "", email: "" });
  const router = useRouter();
  interface Course {
    id: string;
    name: string;
    color: string;
  }
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const fetchCoursesData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
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
    fetchCoursesData();
  }, []);

  const handleAddCourseClick = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    fetchCoursesData();
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/notes/${courseId}`);
  };

  return (
    <div className="relative w-full">
      <Sidebar />
      <AddCourseModal
        onClose={handleCloseModal}
        isVisible={isModalVisible}
      ></AddCourseModal>
      <div className="bg-white rounded-2xl p-4 relative col-span-2 ms-80 me-6">
        <p className="text-3xl font-bold text-navy-blue border-b-2 border-light-blue-100 pb-2">
          Courses
        </p>
        <button
          className="absolute top-4 right-4 text-gray-500 text-xl"
          onClick={handleAddCourseClick}
        >
          <img src="/assets/add.png" alt="+" />
        </button>
        <div className="w-full">
          <div className="flex flex-wrap justify-left">
            {courses.map((course) => (
              <div key={course.id} className="relative flex-shrink-0 mr-24 my-4">
                <img
                  src={`/assets/${course.color.replace("#", "")}.png`}
                  alt="folder"
                />

                <div className="absolute inset-0 flex items-end justify-center text-navy-blue font-bold text-xl cursor-pointer"
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
    </div>
  );
}
