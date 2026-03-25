"use client";

import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { motion, AnimatePresence } from "framer-motion";
import CourseList from "./CourseList";
import CourseDetails from "./CourseDetails";
import CoursePlayer from "./scorm/CoursePlayer";
import { courseStore, CourseListItem } from "@/app/store/courseStore/courseStore";
import { BACKEND_URL } from "@/app/config/utils/variables";

function CoursePage() {
  const [view, setView] = useState<"gallery" | "create" | "details" | "player">("gallery");
  const [activeCourse, setActiveCourse] = useState<CourseListItem | null>(null);
  const [playerPath, setPlayerPath] = useState<string | null>(null);

  useEffect(() => {
    courseStore.fetchCourses();
  }, []);

  const handleCreateSuccess = () => {
    courseStore.fetchCourses();
    setView("gallery");
  };

  const handleOpenDetails = (course: CourseListItem) => {
    setActiveCourse(course);
    setView("details");
  };

  const handleLaunchScorm = (path: string, course: CourseListItem) => {
    setPlayerPath(path);
    setActiveCourse(course);
    setView("player");
  };

  const handleBackFromPlayer = () => {
    // If we came from details, go back to details. Else gallery.
    if (activeCourse) {
      setView("details");
    } else {
      setView("gallery");
    }
    setPlayerPath(null);
  };

  // ─── Render Logic ──────────────────────────────────────────

  if (view === "create") {
    return (
      <CourseList
        onSuccess={handleCreateSuccess}
        onCancel={() => setView("gallery")}
      />
    );
  }

  if (view === "details" && activeCourse) {
    return (
      <CourseDetails
        course={activeCourse}
        onBack={() => setView("gallery")}
        onLaunchSection={(path) => handleLaunchScorm(path, activeCourse)}
      />
    );
  }

  if (view === "player" && activeCourse && (playerPath || activeCourse.scormFilePath)) {
    const launchPath = playerPath || activeCourse.scormFilePath;
    return (
      <CoursePlayer
        courseTitle={activeCourse.title}
        courseUrl={`${BACKEND_URL}/courses${launchPath || activeCourse.scormFilePath}`}
        onBack={handleBackFromPlayer}
      />
    );
  }

  // ─── Gallery View ──────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827" }}>
              Course Hub 🚀
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 15, color: "#6B7280" }}>
              Manage your interactive learning adventures
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setView("create")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 14,
              border: "none",
              background: "#4F46E5",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Course
          </motion.button>
        </div>

        {/* Course Grid */}
        {courseStore.isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <div style={{ width: 40, height: 40, border: "4px solid #E5E7EB", borderTopColor: "#4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : courseStore.courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📚</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#374151" }}>No courses yet</p>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>Create your first course to get started!</p>
            <button
              onClick={() => setView("create")}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                background: "#4F46E5",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create First Course
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            <AnimatePresence>
              {courseStore.courses.map((course) => (
                <motion.div
                  key={course._id}
                  layoutId={course._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleOpenDetails(course)}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ height: 160, background: "linear-gradient(135deg, #EEF2FF, #FDF2F8)", position: "relative", overflow: "hidden" }}>
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <span style={{ fontSize: 48 }}>🎓</span>
                      </div>
                    )}
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      background: course.status === "published" ? "#10B981" : "#F59E0B",
                      color: "#fff", padding: "3px 10px", borderRadius: 20,
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    }}>
                      {course.status}
                    </span>
                    {course.scormFilePath && (
                      <span style={{
                        position: "absolute", top: 10, left: 10,
                        background: "#fff", color: "#4F46E5", padding: "3px 10px", borderRadius: 20,
                        fontSize: 11, fontWeight: 700, boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}>
                        SCORM
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: "16px 20px 20px" }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
                      {course.title}
                    </h3>
                    <div style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: 12, color: "#9CA3AF" }}>
                      <span>{course.curriculum?.totalModules || 0} modules</span>
                      <span>•</span>
                      <span>{course.commerce?.pricingModel === "paid"
                        ? `₹${course.commerce.amountInRupees}`
                        : "Free"}</span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(course);
                        }}
                        style={{
                          flex: 1,
                          padding: "8px 0",
                          borderRadius: 10,
                          border: "1px solid #E5E7EB",
                          background: "#fff",
                          color: "#374151",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        Details
                      </button>
                      {course.scormFilePath && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchScorm(course.scormFilePath!, course);
                          }}
                          style={{
                            flex: 1,
                            padding: "8px 0",
                            borderRadius: 10,
                            border: "none",
                            background: "#4F46E5",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          ▶ Launch
                        </button>
                      )}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm("Delete this course?")) {
                            await courseStore.deleteCourse(course._id);
                          }
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 10,
                          border: "1px solid #FCA5A5",
                          background: "#FFF",
                          color: "#EF4444",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                         🗑️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default observer(CoursePage);