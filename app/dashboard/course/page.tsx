"use client";

import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useColorModeValue } from "@chakra-ui/react";
import { 
  FiGrid, 
  FiPlus, 
  FiTrash2, 
  FiEye, 
  FiBookOpen, 
  FiAward, 
  FiDollarSign, 
  FiLoader,
  FiChevronRight,
  FiUsers,
  FiSettings,
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronsRight
} from "react-icons/fi";
import CourseList from "./CourseList";
import CourseDetails from "./CourseDetails";
import AssignCourseModal from "./components/AssignCourseModal";
import CoursePlayer from "./scorm/CoursePlayer";
import CourseAssetModal from "./scorm/CourseAssetModal";
import { buildCourseAssetUrl, CourseLaunchSection, isScormLaunchSection } from "./scorm/sectionTracking";
import { courseStore, CourseListItem } from "@/app/store/courseStore/courseStore";
import stores from "@/app/store/stores";
import { isLearnerRole } from "@/app/config/utils/roleAccess";
import PermissionGate from "@/app/component/common/PermissionGate";
import { PERMISSION_KEYS, hasPermission } from "@/app/config/utils/permissions";

function CoursePage() {
  const [view, setView] = useState<"gallery" | "create" | "details">("gallery");
  const [activeCourse, setActiveCourse] = useState<CourseListItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageBg = useColorModeValue("#F9FAFB", "#0F172A");
  const cardBg = useColorModeValue("#FFFFFF", "#1f2937");
  const surfaceBg = useColorModeValue("#FFFFFF", "#111827");
  const borderColor = useColorModeValue("#E5E7EB", "#334155");
  const titleColor = useColorModeValue("#111827", "#F8FAFC");
  const textColor = useColorModeValue("#6B7280", "#CBD5E1");
  const mutedTextColor = useColorModeValue("#9CA3AF", "#94A3B8");
  const tableHeaderBg = useColorModeValue("#F9FAFB", "#1E293B");
  const [playerSection, setPlayerSection] = useState<CourseLaunchSection | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const router = useRouter();
  const role = String(stores.auth.userType || stores.auth.user?.role || "").toLowerCase();
  const isLearner = isLearnerRole(role);
  const canViewCourses = hasPermission(stores.auth.user, PERMISSION_KEYS.VIEW_COURSES);
  const canManageCourses = hasPermission(stores.auth.user, PERMISSION_KEYS.MANAGE_COURSES);
  const canAssignCourses = hasPermission(stores.auth.user, PERMISSION_KEYS.ASSIGN_COURSES);

  useEffect(() => {
    if (isLearner) {
      router.replace("/course");
      return;
    }

    if (canViewCourses) {
      courseStore.fetchCourses();
    }
  }, [canViewCourses, isLearner, router]);

  const handleCreateSuccess = () => {
    courseStore.fetchCourses();
    setView("gallery");
  };

  const handleOpenDetails = (course: CourseListItem) => {
    setActiveCourse(course);
    setView("details");
  };

  const handleLaunchScorm = (launchSection: CourseLaunchSection) => {
    setPlayerSection(launchSection);
  };

  const handleBackFromPlayer = () => {
    setPlayerSection(null);
  };

  // Pagination calculations
  const totalCourses = courseStore.courses.length;
  const totalPages = Math.ceil(totalCourses / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = courseStore.courses.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (isLearner) {
    return null;
  }

  // ─── Create View ───────────────────────────────────────────
  if (view === "create") {
    return (
      <CourseList
        onSuccess={handleCreateSuccess}
        onCancel={() => setView("gallery")}
      />
    );
  }

  // ─── Details View (with player overlay) ───────────────────
  if (view === "details" && activeCourse) {
    return (
      <>
        <CourseDetails
          course={activeCourse}
          onBack={() => setView("gallery")}
          onLaunchSection={(launchSection) => handleLaunchScorm(launchSection)}
          onAssignCourse={canAssignCourses ? () => setIsAssignModalOpen(true) : undefined}
        />

        <AnimatePresence>
          {playerSection && isScormLaunchSection(playerSection) ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1400,
              }}
            >
              <CoursePlayer
                courseId={activeCourse._id}
                userId={stores.auth.user?._id}
                learnerName={stores.auth.user?.name || stores.auth.user?.username || "Learner"}
                courseTitle={activeCourse.title}
                courseUrl={buildCourseAssetUrl(playerSection.assetPath)}
                moduleId={playerSection.moduleId}
                sectionId={playerSection.sectionId}
                onBack={handleBackFromPlayer}
              />
            </motion.div>
          ) : playerSection ? (
            <CourseAssetModal
              assetKind={playerSection.contentKind}
              assetUrl={buildCourseAssetUrl(playerSection.assetPath)}
              title={playerSection.sectionTitle || activeCourse.title}
              onBack={handleBackFromPlayer}
            />
          ) : null}
        </AnimatePresence>

        <AssignCourseModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          defaultCourseId={activeCourse._id}
          onAssigned={async () => {
            await courseStore.fetchAssignedCourseAccesses({
              companyId: stores.companyStore.getActiveCompanyId() || undefined,
            });
          }}
        />
      </>
    );
  }

  // ─── Gallery View (Table Layout with Pagination) ──────────────────────────
  return (
    <PermissionGate
      allowed={canViewCourses}
      title="Courses module is disabled"
      description="This account does not currently have access to the course workspace."
      fallbackHref="/dashboard/profile"
    >
    <div style={{ minHeight: "100vh", background: pageBg, padding: "32px 32px" }}>
      <div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: titleColor, letterSpacing: "-0.01em" }}>
              Course Hub
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 15, color: textColor }}>
              Manage your interactive learning adventures
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                router.push(
                  isLearner
                    ? "/course"
                    : role === "superadmin"
                      ? "/dashboard/course/assigned"
                      : "/dashboard/course/access-management"
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: titleColor,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <FiUsers size={16} />
              {role === "superadmin"
                ? "Assigned Courses"
                : isLearner
                  ? "My Courses"
                  : "Assign Courses"}
            </motion.button>

            {!isLearner && canManageCourses ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("create")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: "#4F46E5",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
                }}
              >
                <FiPlus size={16} strokeWidth={2.5} />
                Add New Course
              </motion.button>
            ) : null}
          </div>
        </div>

        {/* Items Per Page Selector */}
        {courseStore.courses.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: textColor }}>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: surfaceBg,
                color: titleColor,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: 13, color: textColor }}>
              Total: <strong style={{ color: titleColor }}>{totalCourses}</strong> courses
            </span>
          </div>
        )}

        {/* Course Table */}
        {courseStore.isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 16 }}>
            <FiLoader size={40} style={{ color: "#4F46E5", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: textColor, fontSize: 14 }}>Loading courses...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : courseStore.courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: surfaceBg, borderRadius: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <FiBookOpen size={48} style={{ color: mutedTextColor, marginBottom: 16 }} />
            <p style={{ fontSize: 18, fontWeight: 600, color: titleColor }}>No courses yet</p>
            <p style={{ fontSize: 14, color: mutedTextColor, marginBottom: 24 }}>Create your first course to get started!</p>
            {canManageCourses ? (
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
            ) : null}
          </div>
        ) : (
          <>
            <div style={{ 
              background: surfaceBg, 
              borderRadius: 20, 
              border: `1px solid ${borderColor}`,
              overflow: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${borderColor}`, background: tableHeaderBg }}>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontWeight: 600, color: titleColor, fontSize: 13, letterSpacing: "0.03em" }}>COURSE</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontWeight: 600, color: titleColor, fontSize: 13, letterSpacing: "0.03em" }}>TYPE</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontWeight: 600, color: titleColor, fontSize: 13, letterSpacing: "0.03em" }}>STATUS</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontWeight: 600, color: titleColor, fontSize: 13, letterSpacing: "0.03em" }}>MODULES</th>
                    <th style={{ textAlign: "left", padding: "16px 20px", fontWeight: 600, color: titleColor, fontSize: 13, letterSpacing: "0.03em" }}>PRICE</th>
                    <th style={{ textAlign: "center", padding: "16px 20px", fontWeight: 600, color: titleColor, fontSize: 13, letterSpacing: "0.03em" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {currentCourses.map((course, index) => (
                      <motion.tr
                        key={course._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03 }}
                        style={{ borderBottom: `1px solid ${borderColor}`, transition: "background 0.2s" }}
                        onMouseEnter={(e) => {
                          const bg = useColorModeValue("#F9FAFB", "#1E293B");
                          e.currentTarget.style.background = bg;
                        }}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {/* Course Info */}
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              background: "linear-gradient(135deg, #EEF2FF, #FDF2F8)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0
                            }}>
                              {course.thumbnailUrl ? (
                                <img src={course.thumbnailUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <FiBookOpen size={24} style={{ color: "#4F46E5" }} />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: titleColor, fontSize: 15, marginBottom: 4 }}>{course.title}</div>
                              <div style={{ fontSize: 12, color: mutedTextColor }}>ID: {course._id.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Type */}
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {course.scormFilePath ? (
                              <>
                                <FiSettings size={14} style={{ color: "#4F46E5" }} />
                                <span style={{ fontSize: 13, fontWeight: 500, color: "#4F46E5" }}>SCORM</span>
                              </>
                            ) : (
                              <>
                                <FiAward size={14} style={{ color: "#10B981" }} />
                                <span style={{ fontSize: 13, fontWeight: 500, color: "#10B981" }}>Standard</span>
                              </>
                            )}
                          </div>
                        </td>
                        
                        {/* Status */}
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            background: course.status === "published" ? "#D1FAE5" : "#FEF3C7",
                            color: course.status === "published" ? "#065F46" : "#B45309",
                          }}>
                            {course.status === "published" ? "Published" : "Draft"}
                          </span>
                        </td>
                        
                        {/* Modules */}
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FiGrid size={14} style={{ color: mutedTextColor }} />
                            <span style={{ fontSize: 14, color: titleColor }}>{course.curriculum?.totalModules || 0}</span>
                          </div>
                        </td>
                        
                        {/* Price */}
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FiDollarSign size={14} style={{ color: mutedTextColor }} />
                            <span style={{ fontSize: 14, fontWeight: 500, color: course.commerce?.pricingModel === "paid" ? titleColor : "#10B981" }}>
                              {course.commerce?.pricingModel === "paid"
                                ? `₹${course.commerce.amountInRupees}`
                                : "Free"}
                            </span>
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td style={{ padding: "12px 20px", textAlign: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetails(course);
                              }}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: `1px solid ${borderColor}`,
                                background: surfaceBg,
                                color: titleColor,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <FiEye size={12} />
                              View
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Delete this course?")) {
                                  await courseStore.deleteCourse(course._id);
                                }
                              }}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: `1px solid ${borderColor}`,
                                background: surfaceBg,
                                color: "#EF4444",
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <FiTrash2 size={12} />
                              Delete
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetails(course);
                              }}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: `1px solid ${borderColor}`,
                                background: "#4F46E5",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <FiChevronRight size={12} />
                              Manage
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginTop: 24,
                flexWrap: "wrap",
                gap: 16
              }}>
                <div style={{ fontSize: 13, color: textColor }}>
                  Showing <strong style={{ color: titleColor }}>{startIndex + 1}</strong> to <strong style={{ color: titleColor }}>{Math.min(endIndex, totalCourses)}</strong> of <strong style={{ color: titleColor }}>{totalCourses}</strong> courses
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* First Page Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${borderColor}`,
                      background: surfaceBg,
                      color: currentPage === 1 ? mutedTextColor : titleColor,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FiChevronsLeft size={14} />
                  </motion.button>
                  
                  {/* Previous Page Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${borderColor}`,
                      background: surfaceBg,
                      color: currentPage === 1 ? mutedTextColor : titleColor,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FiChevronLeft size={14} />
                    Prev
                  </motion.button>
                  
                  {/* Page Numbers */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {getPageNumbers().map(page => (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goToPage(page)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: currentPage === page ? "none" : `1px solid ${borderColor}`,
                          background: currentPage === page ? "#4F46E5" : surfaceBg,
                          color: currentPage === page ? "#fff" : titleColor,
                          fontWeight: currentPage === page ? 600 : 500,
                          cursor: "pointer",
                          minWidth: 40,
                        }}
                      >
                        {page}
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Next Page Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${borderColor}`,
                      background: surfaceBg,
                      color: currentPage === totalPages ? mutedTextColor : titleColor,
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Next
                    <FiChevronRight size={14} />
                  </motion.button>
                  
                  {/* Last Page Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${borderColor}`,
                      background: surfaceBg,
                      color: currentPage === totalPages ? mutedTextColor : titleColor,
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FiChevronsRight size={14} />
                  </motion.button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </PermissionGate>
  );
}

export default observer(CoursePage);