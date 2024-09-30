/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";

interface Note {
  title: string;
  content: string;
  courseTitle: string;
}

export default function Notes() {
  const router = useRouter();
  const { courseId, noteId } = router.query;
  const [note, setNote] = useState<Note | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState("");
  const [updatedTitle, setUpdatedTitle] = useState("");

  const fetchNoteData = () => {
    if (noteId && courseId) {
      setLoading(true);
      fetch(`/api/notes/${noteId}`)
        .then((response) => response.json())
        .then((data) => {
          setNote(data.data);
          setCourseTitle(data.data.course); 
          setUpdatedContent(data.data.content); // Set initial content
          setUpdatedTitle(data.data.title); // Set initial title
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching note:", error);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchNoteData();
  }, [noteId, courseId]);

  const handleUpdate = () => {
    if (noteId) {
      const token = localStorage.getItem("token");
      if(!token) {
        console.error("No token found");
        router.push("/login");
        return;
      }
      fetch(`/api/notes/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updatedTitle,
          content: updatedContent,
          course: courseTitle,
        }),
      })
        .then((response) => {
          if (response.ok) {
            fetchNoteData();
          } else {
            console.error("Error updating the note");
          }
        })
        .catch((error) => {
          console.error("Error updating note:", error);
        });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!note) {
    return <p>No note found.</p>;
  }

  return (
    <div className="relative w-full">
      <Sidebar />
      <div className="bg-white rounded-2xl p-4 relative col-span-2 ms-80 me-6">
        <p className="text-3xl font-bold text-navy-blue border-b-2 border-[#D3D3D3] pb-2 mb-4">
          {isEditing ? (
            <input
              type="text"
              className="w-full text-3xl font-bold"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
            />
          ) : (
            courseTitle || "Course Title"
          )}
        </p>

        <p className="text-3xl font-bold text-navy-blue border-b-2 border-[#D3D3D3] pb-2 mb-4">
          {isEditing ? (
            <input
              type="text"
              className="w-full text-3xl font-bold"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
          ) : (
            updatedTitle || "Note Title"
          )}
        </p>

        {isEditing ? (
          <textarea
            className="w-full h-96 text-navy-blue font-montserrat font-medium text-justify border rounded-lg p-2"
            value={updatedContent}
            onChange={(e) => setUpdatedContent(e.target.value)}
          />
        ) : (
          <p className="text-navy-blue font-montserrat font-medium text-justify">
            {note.content || "Note content goes here..."}
          </p>
        )}

        <button
          type="button"
          className="w-[100px] h-[50px] bg-navy-blue fixed right-10 bottom-10 rounded-full text-white"
          onClick={() => {
            if (isEditing) {
              handleUpdate();
            }
            setIsEditing(!isEditing); 
          }}
        >
          {isEditing ? "Save" : "Update"}
        </button>
      </div>
    </div>
  );
}
