"use client";

import {
  CourseFolderAssignmentItem,
  CourseLibraryFolderItem,
  CourseListItem,
  courseStore,
} from "@/app/store/courseStore/courseStore";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  Icon,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiEye,
  FiFolder,
  FiGlobe,
  FiLock,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { getCategoryIconMeta } from "../utils/folderIconUtils";
import CreateCategoryModal from "./CreateCategoryModal";

interface FolderExplorerProps {
  folders: CourseLibraryFolderItem[];
  assignments: CourseFolderAssignmentItem[];
  courses: CourseListItem[];
  canCreateCourses: boolean;
  canEditCourses: boolean;
  canDeleteCourses: boolean;
  canManageFolders: boolean;
  canViewUsers: boolean;
  onOpenDetails: (course: CourseListItem) => void;
  onOpenEdit: (course: CourseListItem) => void;
  onOpenModulesDrawer?: (course: CourseListItem) => void;
  onCreateCourse: (folderId?: string) => void;
  onDeleteCourse?: (courseId: string) => void | Promise<void>;
  onViewCourseUsers?: (course: CourseListItem) => void;
  onRegisterReload?: (reload: () => void) => void;
}

const ALL_COURSES_KEY = "__all_courses__";
const UNASSIGNED_KEY = "__unassigned__";
const PAGE_SIZE = 8;

export const FolderExplorer = observer(function FolderExplorer({
  folders,
  assignments,
  courses,
  canCreateCourses,
  canEditCourses,
  canDeleteCourses,
  canManageFolders,
  canViewUsers,
  onOpenDetails,
  onOpenEdit,
  onOpenModulesDrawer,
  onCreateCourse,
  onDeleteCourse,
  onViewCourseUsers,
  onRegisterReload,
}: FolderExplorerProps) {
  const toast = useToast();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<CourseLibraryFolderItem | null>(null);
  const [folderSearch, setFolderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "paid">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [publishTarget, setPublishTarget] = useState<CourseListItem | null>(null);
  const cancelPublishRef = useRef<HTMLButtonElement | null>(null);

  const cardBg = useColorModeValue("#FFFFFF", "#1E293B");
  const borderColor = useColorModeValue("#E2E8F0", "#334155");
  const titleColor = useColorModeValue("#0F172A", "#F8FAFC");
  const textColor = useColorModeValue("#475569", "#CBD5E1");
  const mutedColor = useColorModeValue("#64748B", "#94A3B8");
  const addFolderBg = useColorModeValue(
    "linear-gradient(180deg, rgba(239,246,255,0.7) 0%, rgba(219,234,254,0.4) 100%)",
    "rgba(30, 41, 59, 0.4)"
  );
  const fieldBg = useColorModeValue("#FAFAFA", "#0F172A");
  const tableHeaderBg = useColorModeValue("#F8FAFC", "#172033");
  const tableRowHoverBg = useColorModeValue("#F8FAFC", "#172033");
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const MotionBox = motion(Box);
  const MotionFlex = motion(Flex);

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    assignments.forEach((assignment) => {
      const folderId = String(assignment.folder);
      counts.set(folderId, (counts.get(folderId) || 0) + 1);
    });
    return counts;
  }, [assignments]);

  const totalCourseCount = courseStore.courseSummary.total || courseStore.coursePagination.total || courses.length;
  const unassignedCount = Math.max(totalCourseCount - assignments.length, 0);

  const folderCards = useMemo(() => {
    return [
      {
        _id: ALL_COURSES_KEY,
        selectionKey: ALL_COURSES_KEY,
        name: "All Courses",
        description: "Browse every course available in your library.",
        courseCount: totalCourseCount,
        isVirtual: true,
      },
      {
        _id: UNASSIGNED_KEY,
        selectionKey: UNASSIGNED_KEY,
        name: "Unassigned",
        description: "Courses you have not placed in a personal folder yet.",
        courseCount: unassignedCount,
        isVirtual: true,
      },
      ...folders.map((folder) => ({
        ...folder,
        selectionKey: folder._id,
        courseCount: folderCounts.get(folder._id) || 0,
        isVirtual: false,
      })),
    ];
  }, [folderCounts, folders, totalCourseCount, unassignedCount]);

  const selectedFolderName = useMemo(() => {
    return folderCards.find((folder) => folder.selectionKey === selectedFolder)?.name || "";
  }, [folderCards, selectedFolder]);

  const selectedFolderRecord = useMemo(() => {
    return folders.find((folder) => folder._id === selectedFolder) || null;
  }, [folders, selectedFolder]);

  const selectedFolderKey = selectedFolder || ALL_COURSES_KEY;
  const selectedFolderCourseTotal = courseStore.coursePagination.total || courses.length;

  const buildCourseParams = (page: number) => {
    const params: Record<string, unknown> = {
      paginate: true,
      page,
      limit: PAGE_SIZE,
      folderId: selectedFolderKey,
    };

    if (selectedFolder) {
      if (folderSearch.trim()) {
        params.search = folderSearch.trim();
      }
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (pricingFilter !== "all") {
        params.pricingModel = pricingFilter;
      }
    }

    return params;
  };

  const reloadCurrentCourses = async (page = currentPage) => {
    await courseStore.fetchCourses(buildCourseParams(page));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFolder, folderSearch, pricingFilter, statusFilter]);

  useEffect(() => {
    reloadCurrentCourses(currentPage).catch(() => undefined);
  }, [currentPage, selectedFolder, folderSearch, statusFilter, pricingFilter]);

  useEffect(() => {
    if (!onRegisterReload) {
      return;
    }

    onRegisterReload(() => {
      void reloadCurrentCourses(currentPage);
    });
  }, [currentPage, folderSearch, onRegisterReload, pricingFilter, selectedFolder, statusFilter]);

  const handleCreateFolder = async (name: string, description: string) => {
    await courseStore.createCourseLibraryFolder({ name, description });
    await courseStore.fetchCourseLibraryFolders();
  };

  const handleUpdateFolder = async (name: string, description: string) => {
    if (!editingFolder) {
      return;
    }

    await courseStore.updateCourseLibraryFolder(editingFolder._id, { name, description });
    await courseStore.fetchCourseLibraryFolders();
    setEditingFolder(null);
  };

  const handleDeleteFolder = async (folder: CourseLibraryFolderItem) => {
    try {
      await courseStore.deleteCourseLibraryFolder(folder._id);
      if (selectedFolder === folder._id) {
        setSelectedFolder(null);
      }
      toast({
        title: "Folder deleted",
        description: `"${folder.name}" was removed from your library.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error: unknown) {
      toast({
        title: "Unable to delete folder",
        description: error instanceof Error ? error.message : "Failed to delete folder",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleDeleteCourseRecord = async (courseId: string) => {
    if (!onDeleteCourse) {
      return;
    }

    await onDeleteCourse(courseId);
    await courseStore.fetchCourseLibraryFolders();
    if (courses.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
      return;
    }
    await reloadCurrentCourses();
  };

  const handleConfirmPublish = async () => {
    if (!publishTarget) {
      return;
    }

    try {
      await courseStore.publishCourse(publishTarget._id);
      toast({
        title: "Course published",
        description: `"${publishTarget.title}" is now live.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      setPublishTarget(null);
      if (courses.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
        return;
      }
      await reloadCurrentCourses();
    } catch (error: unknown) {
      toast({
        title: "Unable to publish course",
        description: error instanceof Error ? error.message : "Publishing failed",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  if (!selectedFolder) {
    return (
      <div style={{ marginTop: 8 }}>
        <Flex align="center" justify="space-between" mb={5} gap={3} wrap="wrap">
          <Box>
            <Text as="h2" fontSize="20px" fontWeight="700" color={titleColor} display="flex" alignItems="center" gap={2} m={0}>
              <FiFolder style={{ color: "#2563EB" }} /> Course Library Folders
            </Text>
            <Text mt={1} fontSize="13px" color={textColor}>
              Organize courses in your own folders without changing course categories.
            </Text>
          </Box>
        </Flex>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {(courseStore.isCourseFoldersLoading || courseStore.isLoading) && folderCards.length === 0
            ? Array.from({ length: isMobile ? 4 : 6 }, (_, index) => (
                <Box
                  key={`folder-skeleton-${index}`}
                  borderRadius="16px"
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  p={6}
                  boxShadow="sm"
                  minH="224px"
                >
                  <Flex justify="space-between" align="center" mb={5}>
                    <SkeletonCircle size="14" />
                    <Skeleton h="26px" w="84px" borderRadius="full" />
                  </Flex>
                  <Skeleton h="24px" w="65%" mb={3} borderRadius="md" />
                  <SkeletonText noOfLines={2} spacing={3} skeletonHeight={3} />
                </Box>
              ))
            : folderCards.map((folder) => {
                const iconMeta = getCategoryIconMeta(folder.name);
                const IconComponent = iconMeta.icon;
                return (
                  <MotionBox
                    key={folder._id}
                    onClick={() => setSelectedFolder(folder.selectionKey)}
                    cursor="pointer"
                    position="relative"
                    overflow="hidden"
                    borderRadius="16px"
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    p={6}
                    boxShadow="sm"
                    whileHover={{ y: -5, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Flex justify="space-between" align="center" mb={5} position="relative" zIndex={2}>
                      <MotionFlex w="56px" h="56px" rounded="xl" bgGradient={iconMeta.gradient} justify="center" align="center" boxShadow="lg">
                        <Icon as={IconComponent} boxSize={6} color={iconMeta.color} />
                      </MotionFlex>
                      <Badge px={3} py={1.5} rounded="full" bg={iconMeta.badgeBg} color={iconMeta.color} fontWeight="700" fontSize="11px" textTransform="capitalize">
                        {folder.courseCount} {folder.courseCount === 1 ? "Course" : "Courses"}
                      </Badge>
                    </Flex>

                    <Text fontWeight="bold" fontSize="lg" color={titleColor} noOfLines={1} mb={2}>
                      {folder.name}
                    </Text>
                    <Text fontSize="sm" color={mutedColor} noOfLines={2} minH="42px">
                      {folder.description || `Browse courses in ${folder.name}.`}
                    </Text>

                    <Flex mt={6} pt={4} borderTop="1px solid" borderColor={borderColor} justify="end" align="center">
                      <Flex align="center" gap={2}>
                        {!folder.isVirtual && canManageFolders ? (
                          <>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              leftIcon={<FiEdit3 />}
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditingFolder(folder as CourseLibraryFolderItem);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              leftIcon={<FiTrash2 />}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteFolder(folder as CourseLibraryFolderItem);
                              }}
                            >
                              Delete
                            </Button>
                          </>
                        ) : null}
                      </Flex>
                    </Flex>
                  </MotionBox>
                );
              })}

          {canManageFolders ? (
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddModalOpen(true)}
              style={{
                borderRadius: 16,
                border: "2px dashed #93C5FD",
                background: addFolderBg,
                padding: "20px 22px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 190,
                textAlign: "center",
              }}
            >
              <Flex w="52px" h="52px" borderRadius="50%" bg="#2563EB" color="#FFFFFF" align="center" justify="center" mb={3} boxShadow="0 8px 18px rgba(37, 99, 235, 0.3)">
                <FiPlus size={26} />
              </Flex>
              <Text fontSize="16px" fontWeight="700" color="#1E40AF">Add Folder</Text>
              <Text fontSize="12px" color="#3B82F6" mt={1}>Create personal folder</Text>
            </motion.div>
          ) : null}
        </div>

        <CreateCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreate={handleCreateFolder}
          onCreated={(folderName) => {
            const folder = courseStore.courseLibraryFolders.find((item) => item.name.toLowerCase() === folderName.toLowerCase());
            if (folder) {
              setSelectedFolder(folder._id);
            }
          }}
        />
        <CreateCategoryModal
          isOpen={Boolean(editingFolder)}
          onClose={() => setEditingFolder(null)}
          onCreate={handleUpdateFolder}
          initialName={editingFolder?.name || ""}
          initialDescription={editingFolder?.description || ""}
          title="Edit Folder"
          submitLabel="Update Folder"
        />
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <Flex align="center" justify="space-between" mb={5} gap={3} wrap="wrap">
        <Flex align="center" gap={3} wrap="wrap">
          <Button leftIcon={<FiArrowLeft />} variant="outline" size="sm" borderRadius={10} onClick={() => setSelectedFolder(null)}>
            All Folders
          </Button>
          <Text as="h2" fontSize="20px" fontWeight="800" color={titleColor} m={0}>
            {selectedFolderName}
          </Text>
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {selectedFolderCourseTotal} {selectedFolderCourseTotal === 1 ? "Course" : "Courses"}
          </Badge>
        </Flex>

        {canCreateCourses && selectedFolder !== ALL_COURSES_KEY && selectedFolder !== UNASSIGNED_KEY ? (
          <Flex gap={2} wrap="wrap">
            {canManageFolders && selectedFolderRecord ? (
              <Button
                leftIcon={<FiEdit3 />}
                variant="outline"
                colorScheme="blue"
                size="md"
                borderRadius={12}
                onClick={() => setEditingFolder(selectedFolderRecord)}
              >
                Edit Folder
              </Button>
            ) : null}
            <Button leftIcon={<FiPlus />} colorScheme="blue" size="md" borderRadius={12} onClick={() => onCreateCourse(selectedFolder)}>
              Create Course
            </Button>
          </Flex>
        ) : null}
      </Flex>

      <Flex bg={cardBg} p="14px 18px" borderRadius="14px" border="1px solid" borderColor={borderColor} mb={5} gap={3} wrap="wrap">
        <Box flex="1 1 240px" position="relative">
          <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: mutedColor }} />
          <input
            type="text"
            placeholder={`Search courses in ${selectedFolderName}...`}
            value={folderSearch}
            onChange={(event) => setFolderSearch(event.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              fontSize: 14,
              outline: "none",
              background: fieldBg,
              color: titleColor,
            }}
          />
        </Box>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "all" | "draft" | "published")}
          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, fontSize: 13, background: fieldBg, color: titleColor }}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={pricingFilter}
          onChange={(event) => setPricingFilter(event.target.value as "all" | "free" | "paid")}
          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, fontSize: 13, background: fieldBg, color: titleColor }}
        >
          <option value="all">All Pricing</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </Flex>

      {courseStore.isLoading ? (
        <Text color={textColor}>Loading course library...</Text>
      ) : courses.length === 0 ? (
        <Box bg={cardBg} borderRadius="16px" border="1px solid" borderColor={borderColor} p="50px 20px" textAlign="center">
          <FiBookOpen size={30} style={{ color: "#2563EB", margin: "0 auto 16px" }} />
          <Text fontSize="18px" fontWeight="700" color={titleColor} mb={2}>No courses here</Text>
          <Text fontSize="14px" color={mutedColor}>
            {selectedFolder === ALL_COURSES_KEY || selectedFolder === UNASSIGNED_KEY
              ? "Create courses from inside a personal folder to keep them organized here."
              : "Create a course from this folder to add it here automatically."}
          </Text>
        </Box>
      ) : (
        <Box bg={cardBg} borderRadius="18px" border="1px solid" borderColor={borderColor} overflow="hidden">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 1080, borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: tableHeaderBg }}>
                  {["Course", "Code", "Visibility", "Modules", "Lessons", "Status", "Price", "Actions"].map((label) => (
                    <th
                      key={label}
                      style={{
                        textAlign: label === "Actions" ? "center" : "left",
                        padding: "14px 16px",
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: mutedColor,
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const totalModules = Number(course.curriculum?.totalModules || 0);
                  const totalSections = Number(course.curriculum?.totalSections || 0);
                  const amount = Number(course.commerce?.amountInRupees || 0);
                  const visibilityType = course.visibility?.type || "private";
                  const canPublish = course.status === "draft" && totalModules > 0;

                  return (
                    <tr
                      key={course._id}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = tableRowHoverBg;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td style={{ padding: "16px", borderBottom: `1px solid ${borderColor}` }}>
                        <Flex align="center" gap={3}>
                          <Flex
                            width="48px"
                            height="48px"
                            borderRadius="14px"
                            overflow="hidden"
                            align="center"
                            justify="center"
                            bg="linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)"
                            flexShrink={0}
                          >
                            {course.thumbnailUrl ? (
                              <img src={course.thumbnailUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <FiBookOpen size={20} color="#2563EB" />
                            )}
                          </Flex>
                          <Box minW={0}>
                            <Text fontSize="14px" fontWeight="700" color={titleColor} noOfLines={1}>
                              {course.title}
                            </Text>
                            <Text fontSize="12px" color={mutedColor} noOfLines={1}>
                              {course.taxonomy?.level || "Beginner"}
                              {(course.taxonomy?.categories || []).length
                                ? ` · ${(course.taxonomy?.categories || []).slice(0, 2).join(", ")}`
                                : ""}
                            </Text>
                          </Box>
                        </Flex>
                      </td>
                      <td style={{ padding: "16px", borderBottom: `1px solid ${borderColor}` }}>
                        <Text fontSize="13px" fontWeight="600" color={titleColor}>
                          {course.courseCode || "COURSE"}
                        </Text>
                      </td>
                      <td style={{ padding: "16px", borderBottom: `1px solid ${borderColor}` }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "7px 12px",
                            borderRadius: 999,
                            background: visibilityType === "public" ? "#ECFDF5" : "#EFF6FF",
                            color: visibilityType === "public" ? "#047857" : "#1D4ED8",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {visibilityType === "public" ? <FiGlobe size={12} /> : <FiLock size={12} />}
                          {visibilityType === "public" ? "Public" : "Private"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", borderBottom: `1px solid ${borderColor}` }}>
                        <Text fontSize="13px" fontWeight="700" color={titleColor}>{totalModules}</Text>
                      </td>
                      <td style={{ padding: "16px", borderBottom: `1px solid ${borderColor}` }}>
                        <Text fontSize="13px" fontWeight="700" color={titleColor}>{totalSections}</Text>
                      </td>
                      <td style={{ padding: "16px", borderBottom: `1px solid ${borderColor}` }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "7px 12px",
                            borderRadius: 999,
                            background: course.status === "published" ? "#DCFCE7" : "#FEF3C7",
                            color: course.status === "published" ? "#166534" : "#92400E",
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: "capitalize",
                          }}
                        >
                          <FiCheckCircle size={12} />
                          {course.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px", borderBottom: `1px solid ${borderColor}` }}>
                        <Text fontSize="13px" fontWeight="700" color={titleColor}>
                          {amount > 0 ? `Rs ${amount}` : "Free"}
                        </Text>
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid ${borderColor}` }}>
                        <Flex justify="center" gap={2} wrap="wrap">
                          <Button size="xs" variant="outline" leftIcon={<FiEye />} onClick={() => onOpenDetails(course)}>
                            View
                          </Button>
                          {canEditCourses && onOpenModulesDrawer ? (
                            <Button size="xs" colorScheme="blue" leftIcon={<FiPackage />} onClick={() => onOpenModulesDrawer(course)}>
                              Add Modules
                            </Button>
                          ) : null}
                          {canEditCourses ? (
                            <Button size="xs" variant="outline" colorScheme="blue" leftIcon={<FiEdit3 />} onClick={() => onOpenEdit(course)}>
                              Edit
                            </Button>
                          ) : null}
                          {canEditCourses && course.status === "draft" ? (
                            <Button
                              size="xs"
                              colorScheme="green"
                              variant={canPublish ? "solid" : "outline"}
                              leftIcon={<FiCheckCircle />}
                              isDisabled={!canPublish || courseStore.publishingCourseId === course._id}
                              isLoading={courseStore.publishingCourseId === course._id}
                              title={canPublish ? "Publish course" : "Add at least one module before publishing"}
                              onClick={() => setPublishTarget(course)}
                            >
                              Publish
                            </Button>
                          ) : null}
                          {canDeleteCourses && onDeleteCourse ? (
                            <Button size="xs" variant="outline" colorScheme="red" leftIcon={<FiTrash2 />} onClick={() => handleDeleteCourseRecord(course._id)}>
                              Delete
                            </Button>
                          ) : null}
                          {canViewUsers && onViewCourseUsers ? (
                            <Button size="xs" variant="outline" colorScheme="purple" leftIcon={<FiUsers />} onClick={() => onViewCourseUsers(course)}>
                              Users
                            </Button>
                          ) : null}
                        </Flex>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Box>
      )}

      {selectedFolderCourseTotal > 0 ? (
        <Flex mt={5} align="center" justify="space-between" gap={3} wrap="wrap">
          <Text fontSize="13px" color={textColor}>
            Showing <strong>{selectedFolderCourseTotal === 0 ? 0 : (courseStore.coursePagination.page - 1) * PAGE_SIZE + 1}</strong> to{" "}
            <strong>{Math.min(courseStore.coursePagination.page * PAGE_SIZE, selectedFolderCourseTotal)}</strong> of{" "}
            <strong>{selectedFolderCourseTotal}</strong> courses
          </Text>
          <Flex align="center" gap={2}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiChevronLeft />}
              isDisabled={courseStore.coursePagination.page <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Prev
            </Button>
            <Text fontSize="13px" fontWeight="700" color={titleColor}>
              Page {courseStore.coursePagination.page} of {courseStore.coursePagination.totalPages}
            </Text>
            <Button
              size="sm"
              variant="outline"
              rightIcon={<FiChevronRight />}
              isDisabled={courseStore.coursePagination.page >= courseStore.coursePagination.totalPages}
              onClick={() => setCurrentPage((page) => Math.min(courseStore.coursePagination.totalPages, page + 1))}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      ) : null}

      <CreateCategoryModal
        isOpen={Boolean(editingFolder)}
        onClose={() => setEditingFolder(null)}
        onCreate={handleUpdateFolder}
        initialName={editingFolder?.name || ""}
        initialDescription={editingFolder?.description || ""}
        title="Edit Folder"
        submitLabel="Update Folder"
      />

    <AlertDialog
  isOpen={Boolean(publishTarget)}
  leastDestructiveRef={cancelPublishRef}
  onClose={() => setPublishTarget(null)}
  isCentered
>
  <AlertDialogOverlay
    backdropFilter="blur(2px)"
  />

  <AlertDialogContent
    mx={4}
    maxW="420px"
    borderRadius="24px"
    overflow="hidden"
    boxShadow="0 24px 70px rgba(0, 0, 0, 0.2)"
    border="1px solid"
    borderColor="gray.100"
  >
    {/* Playful header */}
    <Box
      position="relative"
      bg="green.50"
      px={6}
      pt={5}
      pb={4}
      overflow="hidden"
    >
      {/* Decorative bubbles */}
      <Box
        position="absolute"
        w="90px"
        h="90px"
        borderRadius="full"
        bg="green.100"
        top="-45px"
        right="-20px"
        opacity={0.7}
      />

      <Box
        position="absolute"
        w="42px"
        h="42px"
        borderRadius="full"
        border="8px solid"
        borderColor="green.100"
        bottom="-20px"
        right="80px"
      />

      <Flex
        position="relative"
        align="center"
        gap={4}
      >
        {/* Icon */}
        <Flex
          w="54px"
          h="54px"
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="18px"
          bg="green.500"
          color="white"
          boxShadow="0 8px 20px rgba(72, 187, 120, 0.28)"
          transform="rotate(-4deg)"
        >
          <Icon
            viewBox="0 0 24 24"
            boxSize={6}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
          </Icon>
        </Flex>

        <Box>
          <Text
            fontSize="xs"
            fontWeight="700"
            color="green.600"
            textTransform="uppercase"
            letterSpacing="0.08em"
            mb={1}
          >
            Almost there
          </Text>

          <AlertDialogHeader
            p={0}
            fontSize="xl"
            fontWeight="800"
            lineHeight="1.2"
            letterSpacing="-0.025em"
            color="gray.800"
          >
            Ready to publish?
          </AlertDialogHeader>
        </Box>
      </Flex>
    </Box>

    {/* Content */}
    <AlertDialogBody px={6} pt={5} pb={4}>
      {/* Course card */}
      <Flex
        align="center"
        gap={3}
        p={3}
        borderRadius="14px"
        bg="gray.50"
        border="1px solid"
        borderColor="gray.100"
      >
        <Flex
          w="36px"
          h="36px"
          flexShrink={0}
          borderRadius="10px"
          align="center"
          justify="center"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
        >
          <Icon
            viewBox="0 0 24 24"
            boxSize={4}
            color="green.500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          </Icon>
        </Flex>

        <Box minW={0}>
          <Text
            fontSize="xs"
            color="gray.500"
            fontWeight="600"
            mb={0.5}
          >
            Course
          </Text>

          <Text
            fontSize="sm"
            fontWeight="700"
            color="gray.800"
            noOfLines={1}
          >
            {publishTarget?.title || "This course"}
          </Text>
        </Box>

        <Box
          ml="auto"
          px={2.5}
          py={1}
          bg="green.100"
          color="green.700"
          borderRadius="full"
          fontSize="10px"
          fontWeight="700"
          flexShrink={0}
        >
          READY
        </Box>
      </Flex>

      <Text
        mt={4}
        fontSize="sm"
        color="gray.600"
        lineHeight="1.6"
      >
        Once published, this course will become available according to
        its visibility settings.
      </Text>
    </AlertDialogBody>

    {/* Footer */}
    <AlertDialogFooter
      px={6}
      pt={2}
      pb={6}
      gap={3}
    >
      <Button
        ref={cancelPublishRef}
        onClick={() => setPublishTarget(null)}
        variant="ghost"
        flex={1}
        h="44px"
        borderRadius="12px"
        fontWeight="600"
        color="gray.600"
        _hover={{
          bg: "gray.100",
        }}
      >
        Cancel
      </Button>

      <Button
        colorScheme="green"
        onClick={handleConfirmPublish}
        isLoading={
          courseStore.publishingCourseId === publishTarget?._id
        }
        flex={1.4}
        h="44px"
        borderRadius="12px"
        fontWeight="700"
        boxShadow="0 6px 14px rgba(72, 187, 120, 0.22)"
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: "0 8px 18px rgba(72, 187, 120, 0.28)",
        }}
        _active={{
          transform: "translateY(0)",
        }}
        transition="all 0.18s ease"
      >
        Publish course
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

    </div>
  );
});

export default FolderExplorer;
