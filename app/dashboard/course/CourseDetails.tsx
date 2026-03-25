"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  BookOpen, 
  Layers, 
  Users, 
  Play, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Award
} from "lucide-react";

interface CourseDetailsProps {
  course: any;
  onBack: () => void;
  onLaunchSection: (scormPath: string) => void;
}

export default function CourseDetails({ course, onBack, onLaunchSection }: CourseDetailsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "batches">("overview");
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([1]));
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);

  const toggleModule = (order: number) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "curriculum", label: "Curriculum", icon: Layers },
    { id: "batches", label: "Batches & Learners", icon: Users },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* Sticky Header */}
      <div style={{ 
        position: "sticky", top: 0, zIndex: 50, 
        background: "rgba(255, 255, 255, 0.9)", 
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E5E7EB",
        padding: "16px 24px"
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            style={{ 
              width: 40, height: 40, borderRadius: 12, border: "1px solid #E5E7EB", 
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#374151", boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
            }}
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>{course.title}</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
              {course.taxonomy?.level || "Beginner"} • {course.taxonomy?.categories?.join(", ") || "General"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "32px auto", padding: "0 24px", paddingBottom: 80 }}>
        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
          
          <div>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, background: "#F3F4F6", padding: 6, borderRadius: 20, marginBottom: 32 }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 0", borderRadius: 16, border: "none", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.2s",
                    background: activeTab === tab.id ? "#fff" : "transparent",
                    color: activeTab === tab.id ? "#4F46E5" : "#6B7280",
                    boxShadow: activeTab === tab.id ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{ background: "#fff", padding: 32, borderRadius: 28, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}
                >
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: "#111827" }}>About this Course</h2>
                  <div 
                    dangerouslySetInnerHTML={{ __html: course.description?.html || course.description?.text || "No description provided." }} 
                    style={{ color: "#4B5563", lineHeight: 1.7, fontSize: 15 }}
                  />
                  
                  <div style={{ marginTop: 40, borderTop: "1px solid #F3F4F6", paddingTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5" }}>
                        <Clock size={24} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>Duration</p>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{course.progression?.completionWindowDays || "Self-paced"} Days</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
                        <Award size={24} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>Certification</p>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{course.progression?.certificateEnabled ? "Certificate Included" : "No Certificate"}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "curriculum" && (
                <motion.div
                  key="curriculum"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Learning Path</h2>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#4F46E5", background: "#EEF2FF", padding: "6px 16px", borderRadius: 20 }}>
                      {course.curriculum?.totalModules} Modules • {course.curriculum?.totalSections} Lessons
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {course.curriculum?.modules?.map((mod: any) => (
                      <div key={mod.order} style={{ background: "#fff", borderRadius: 24, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                        <button 
                          onClick={() => toggleModule(mod.order)}
                          style={{ 
                            width: "100%", padding: "24px", display: "flex", alignItems: "center", gap: 20, 
                            border: "none", background: "none", cursor: "pointer", textAlign: "left"
                          }}
                        >
                          <div style={{ 
                            width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #4F46E5, #818CF8)", 
                            display: "flex", alignItems: "center", justifyContent: "center", 
                            fontSize: 16, fontWeight: 800, color: "#fff" 
                          }}>
                            {mod.order}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>{mod.title}</h3>
                            <p style={{ margin: 0, fontSize: 13, color: "#9CA3AF" }}>{mod.sections?.length} Lessons • {mod.summary ? "Overview inclusive" : "Dive in"}</p>
                          </div>
                          {openModules.has(mod.order) ? <ChevronUp size={24} color="#9CA3AF" /> : <ChevronDown size={24} color="#9CA3AF" />}
                        </button>

                        <AnimatePresence>
                          {openModules.has(mod.order) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: "hidden", borderTop: "1px solid #F3F4F6", background: "#FAFBFF" }}
                            >
                              <div style={{ padding: "12px 24px 24px" }}>
                                {mod.sections?.map((sec: any, idx: number) => {
                                  const secId = mod.order * 100 + idx;
                                  const isPlayable = Boolean(sec.content?.previewUrl);
                                  return (
                                    <div 
                                      key={sec.order}
                                      onMouseEnter={() => setHoveredSection(secId)}
                                      onMouseLeave={() => setHoveredSection(null)}
                                      onClick={() => isPlayable && onLaunchSection(sec.content.previewUrl)}
                                      style={{ 
                                        display: "flex", alignItems: "center", gap: 16, padding: "16px",
                                        borderRadius: 18, cursor: isPlayable ? "pointer" : "default",
                                        transition: "all 0.2s ease",
                                        background: hoveredSection === secId ? "#EEF2FF" : "transparent",
                                        transform: hoveredSection === secId ? "translateX(4px)" : "none",
                                      }}
                                    >
                                      <div style={{ 
                                        width: 32, height: 32, borderRadius: 10, 
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        background: isPlayable ? (hoveredSection === secId ? "#4F46E5" : "#EEF2FF") : "#F3F4F6",
                                        color: isPlayable ? (hoveredSection === secId ? "#fff" : "#4F46E5") : "#D1D5DB"
                                      }}>
                                        {isPlayable ? <Play size={16} fill="currentColor" /> : <BookOpen size={16} />}
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#374151" }}>{sec.title}</p>
                                        {sec.description && <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{sec.description}</p>}
                                      </div>
                                      {isPlayable && (
                                        <motion.span 
                                          initial={{ opacity: 0.6 }}
                                          animate={{ opacity: hoveredSection === secId ? 1 : 0.6 }}
                                          style={{ fontSize: 12, fontWeight: 800, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.05em" }}
                                        >
                                          Start
                                        </motion.span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "batches" && (
                <motion.div
                  key="batches"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{ background: "#fff", padding: 32, borderRadius: 28, border: "1px solid #E5E7EB" }}
                >
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: "#111827" }}>Upcoming Batches</h2>
                  {course.enrollment?.batches?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {course.enrollment.batches.map((batch: any, i: number) => (
                        <div key={i} style={{ border: "1px solid #F3F4F6", borderRadius: 20, padding: 24, background: "#FCFDFF" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>{batch.name}</h3>
                            <span style={{ fontSize: 12, color: "#4F46E5", fontWeight: 800, background: "#EEF2FF", padding: "4px 12px", borderRadius: 20 }}>
                              {batch.seatLimit || "Open"} Seats
                            </span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#6B7280" }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Calendar size={16} />
                              </div>
                              {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#6B7280" }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <MapPin size={16} />
                              </div>
                              {batch.trainer || "Instructor Led"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <p style={{ fontSize: 40 }}>🗓️</p>
                      <p style={{ fontSize: 16, color: "#9CA3AF" }}>No batches scheduled yet.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Info Card */}
          <div>
            <div style={{ position: "sticky", top: 120 }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ background: "#fff", borderRadius: 32, padding: 24, border: "1px solid #E5E7EB", boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
              >
                <div style={{ height: 180, borderRadius: 24, overflow: "hidden", marginBottom: 24, background: "#F3F4F6", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
                  <img src={course.thumbnailUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Price</p>
                  <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#111827" }}>
                    {course.commerce?.pricingModel === "paid" ? `₹${course.commerce.amountInRupees}` : "Free"}
                  </p>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => course.scormFilePath && onLaunchSection(course.scormFilePath)}
                  disabled={!course.scormFilePath}
                  style={{ 
                    width: "100%", padding: "18px 0", borderRadius: 20, border: "none", 
                    background: "linear-gradient(135deg, #4F46E5, #6366F1)", color: "#fff", fontSize: 16, fontWeight: 800, 
                    cursor: course.scormFilePath ? "pointer" : "not-allowed", opacity: course.scormFilePath ? 1 : 0.6,
                    boxShadow: "0 10px 25px rgba(79,70,229,0.3)"
                  }}
                >
                  Start Learning Now
                </motion.button>
                
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6B7280" }}>
                    <CheckCircle size={14} color="#10B981" /> Full lifetime access
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6B7280" }}>
                    <CheckCircle size={14} color="#10B981" /> Interactive modules
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6B7280" }}>
                    <CheckCircle size={14} color="#10B981" /> Certificate of completion
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
