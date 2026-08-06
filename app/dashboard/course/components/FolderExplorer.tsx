"use client";

import {
  CourseFolderAssignmentItem,
  CourseLibraryFolderItem,
  CourseListItem,
  courseStore,
} from "@/app/store/courseStore/courseStore";
import {
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
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiBookOpen,
  FiEdit3,
  FiEye,
  FiFolder,
  FiFolderPlus,
  FiPackage,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiSearch,
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
  onDeleteCourse?: (courseId: string) => void;
  onViewCourseUsers?: (course: CourseListItem) => void;
}

const ALL_COURSES_KEY = "__all_courses__";
const UNASSIGNED_KEY = "__unassigned__";

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
}: FolderExplorerProps) {
  const toast = useToast();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<CourseLibraryFolderItem | null>(null);
  const [folderSearch, setFolderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "paid">("all");

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
  const courseFooterBg = useColorModeValue("#FAFAFA", "#172033");
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const MotionBox = motion(Box);
  const MotionFlex = motion(Flex);

  const assignmentByCourseId = useMemo(() => {
    return assignments.reduce<Record<string, string>>((acc, assignment) => {
      acc[String(assignment.course)] = String(assignment.folder);
      return acc;
    }, {});
  }, [assignments]);

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    assignments.forEach((assignment) => {
      const folderId = String(assignment.folder);
      counts.set(folderId, (counts.get(folderId) || 0) + 1);
    });
    return counts;
  }, [assignments]);

  const folderCards = useMemo(() => {
    const unassignedCount = courses.filter((course) => !assignmentByCourseId[course._id]).length;
    return [
      {
        _id: ALL_COURSES_KEY,
        selectionKey: ALL_COURSES_KEY,
        name: "All Courses",
        description: "Browse every course available in your library.",
        courseCount: courses.length,
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
  }, [assignmentByCourseId, courses, folderCounts, folders]);

  const filteredCoursesInFolder = useMemo(() => {
    if (!selectedFolder) return [];

    return courses.filter((course) => {
      const assignedFolderId = assignmentByCourseId[course._id] || "";
      if (selectedFolder !== ALL_COURSES_KEY && selectedFolder !== UNASSIGNED_KEY && assignedFolderId !== selectedFolder) {
        return false;
      }
      if (selectedFolder === UNASSIGNED_KEY && assignedFolderId) {
        return false;
      }

      const q = folderSearch.trim().toLowerCase();
      if (q) {
        const searchable = [
          course.title,
          course.courseCode,
          course.taxonomy?.level,
          ...(course.taxonomy?.categories || []),
          ...(course.taxonomy?.languages || []),
        ].filter(Boolean).join(" ").toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      if (statusFilter !== "all" && course.status !== statusFilter) return false;
      const pricingModel = course.commerce?.pricingModel || "free";
      if (pricingFilter !== "all" && pricingModel !== pricingFilter) return false;
      return true;
    });
  }, [assignmentByCourseId, courses, folderSearch, pricingFilter, selectedFolder, statusFilter]);

  const selectedFolderName = useMemo(() => {
    return folderCards.find((folder) => folder.selectionKey === selectedFolder)?.name || "";
  }, [folderCards, selectedFolder]);
  const selectedFolderRecord = useMemo(() => {
    return folders.find((folder) => folder._id === selectedFolder) || null;
  }, [folders, selectedFolder]);

  const handleCreateFolder = async (name: string, description: string) => {
    await courseStore.createCourseLibraryFolder({ name, description });
    await courseStore.fetchCourseLibraryFolders();
  };

  const handleUpdateFolder = async (name: string, description: string) => {
    if (!editingFolder) return;
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
                <Box key={`folder-skeleton-${index}`} borderRadius="16px" bg={cardBg} border="1px solid" borderColor={borderColor} p={6} boxShadow="sm" minH="224px">
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
                  <MotionBox key={folder._id} onClick={() => setSelectedFolder(folder.selectionKey)} cursor="pointer" position="relative" overflow="hidden" borderRadius="16px" bg={cardBg} border="1px solid" borderColor={borderColor} p={6} boxShadow="sm" whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
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

                    <Flex mt={6} pt={4} borderTop="1px solid" borderColor={borderColor} justify="end" align="center" color="blue.500" fontWeight="600">
                      {/* <Text fontSize="sm">Open Folder</Text> */}
                      <Flex align="center" gap={2}>
                        {!folder.isVirtual && canManageFolders && (
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
                        )}
                        {/* <FiChevronRight size={18} /> */}
                      </Flex>
                    </Flex>
                  </MotionBox>
                );
              })}

          {canManageFolders && (
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
          )}
        </div>

        <CreateCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreate={handleCreateFolder}
          onCreated={(folderName) => {
            const folder = courseStore.courseLibraryFolders.find((item) => item.name.toLowerCase() === folderName.toLowerCase());
            if (folder) setSelectedFolder(folder._id);
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
            {filteredCoursesInFolder.length} {filteredCoursesInFolder.length === 1 ? "Course" : "Courses"}
          </Badge>
        </Flex>
        {canCreateCourses && selectedFolder !== ALL_COURSES_KEY && selectedFolder !== UNASSIGNED_KEY && (
          <Flex gap={2} wrap="wrap">
            {canManageFolders && selectedFolderRecord && (
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
            )}
            <Button leftIcon={<FiPlus />} colorScheme="blue" size="md" borderRadius={12} onClick={() => onCreateCourse(selectedFolder)}>
              Create Course
            </Button>
          </Flex>
        )}
      </Flex>

      <Flex bg={cardBg} p="14px 18px" borderRadius="14px" border="1px solid" borderColor={borderColor} mb={5} gap={3} wrap="wrap">
        <Box flex="1 1 240px" position="relative">
          <FiSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: mutedColor }} />
          <input
            type="text"
            placeholder={`Search courses in ${selectedFolderName}...`}
            value={folderSearch}
            onChange={(event) => setFolderSearch(event.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8, border: `1px solid ${borderColor}`, fontSize: 14, outline: "none", background: fieldBg, color: titleColor }}
          />
        </Box>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as any)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, fontSize: 13, background: fieldBg, color: titleColor }}>
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={pricingFilter} onChange={(event) => setPricingFilter(event.target.value as any)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${borderColor}`, fontSize: 13, background: fieldBg, color: titleColor }}>
          <option value="all">All Pricing</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </Flex>

      {courseStore.isLoading ? (
        <Text color={textColor}>Loading course library...</Text>
      ) : filteredCoursesInFolder.length === 0 ? (
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 }}>

          {filteredCoursesInFolder.map((course) => {
  const amount = course.commerce?.amountInRupees;
  const isFree = !amount || amount <= 0;
  const priceText = isFree ? "Free" : `Rs ${amount}`;

  const totalModules = course.curriculum?.totalModules || 0;
  const totalSections = course.curriculum?.totalSections || 0;
  const isDraft = course.status === "draft";

  const stopCardClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <motion.div
      key={course._id}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onOpenDetails(course)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails(course);
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        background: cardBg,
        borderRadius: 20,
        border: `1px solid ${borderColor}`,
        overflow: "hidden",
        boxShadow: "0 8px 28px rgba(15, 23, 42, 0.06)",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        outline: "none",
      }}
    >
      {/* Course thumbnail */}
      <Box
        position="relative"
        height={{ base: "170px", md: "180px" }}
        bg="#1E293B"
        overflow="hidden"
      >
        {course.thumbnailUrl ? (
          <Box
            as="img"
            src={course.thumbnailUrl}
            alt={course.title}
            width="100%"
            height="100%"
            objectFit="cover"
            transition="transform 0.35s ease"
            _groupHover={{ transform: "scale(1.04)" }}
          />
        ) : (
          <Flex
            width="100%"
            height="100%"
            align="center"
            justify="center"
            direction="column"
            gap={2}
            bg="linear-gradient(135deg, #1E293B 0%, #334155 100%)"
          >
            <Flex
              width="60px"
              height="60px"
              align="center"
              justify="center"
              borderRadius="2xl"
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <FiBookOpen size={28} color="#94A3B8" />
            </Flex>

            <Text
              fontSize="xs"
              color="whiteAlpha.600"
              fontWeight="600"
            >
              No thumbnail
            </Text>
          </Flex>
        )}

        {/* Image readability overlay */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          bg="linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.18) 0%,
            rgba(15, 23, 42, 0) 45%,
            rgba(15, 23, 42, 0.72) 100%
          )"
        />

        {/* Course status */}
        <Badge
          position="absolute"
          top={3}
          left={3}
          px={2.5}
          py={1}
          borderRadius="full"
          colorScheme={isDraft ? "orange" : "green"}
          textTransform="capitalize"
          fontSize="10px"
          fontWeight="700"
          boxShadow="sm"
        >
          {course.status}
        </Badge>

        {/* Price */}
        <Badge
          position="absolute"
          right={3}
          bottom={3}
          px={3}
          py={1.5}
          borderRadius="full"
          bg={isFree ? "green.500" : "rgba(15, 23, 42, 0.88)"}
          color="white"
          fontSize="xs"
          fontWeight="800"
          boxShadow="0 4px 12px rgba(15, 23, 42, 0.25)"
        >
          {priceText}
        </Badge>
      </Box>

      {/* Course details */}
      <Box
        p={{ base: 4, md: 5 }}
        flex={1}
        display="flex"
        flexDirection="column"
      >
        <Flex align="center" justify="space-between" gap={3} mb={2}>
          <Text
            fontSize="10px"
            fontWeight="800"
            color="#2563EB"
            textTransform="uppercase"
            letterSpacing="0.1em"
            noOfLines={1}
          >
            {course.courseCode || "COURSE"}
          </Text>

          <Text
            fontSize="10px"
            fontWeight="700"
            color={mutedColor}
            whiteSpace="nowrap"
          >
            View details →
          </Text>
        </Flex>

        <Text
          fontSize={{ base: "15px", md: "16px" }}
          fontWeight="750"
          color={titleColor}
          lineHeight="1.4"
          noOfLines={2}
          minHeight="45px"
        >
          {course.title}
        </Text>

        {/* Course statistics */}
        <Flex
          mt={4}
          gap={2}
          align="center"
          flexWrap="wrap"
        >
          <Flex
            align="center"
            gap={2}
            px={3}
            py={2}
            borderRadius="xl"
            bg={courseFooterBg}
            border={`1px solid ${borderColor}`}
          >
            <Flex
              width="26px"
              height="26px"
              align="center"
              justify="center"
              borderRadius="lg"
              bg="blue.50"
              color="#2563EB"
            >
              <FiPackage size={13} />
            </Flex>

            <Box>
              <Text
                fontSize="11px"
                fontWeight="800"
                color={titleColor}
                lineHeight="1"
              >
                {totalModules}
              </Text>
              <Text
                fontSize="9px"
                color={mutedColor}
                mt={1}
                lineHeight="1"
              >
                Modules
              </Text>
            </Box>
          </Flex>

          <Flex
            align="center"
            gap={2}
            px={3}
            py={2}
            borderRadius="xl"
            bg={courseFooterBg}
            border={`1px solid ${borderColor}`}
          >
            <Flex
              width="26px"
              height="26px"
              align="center"
              justify="center"
              borderRadius="lg"
              bg="blue.50"
              color="#2563EB"
            >
              <FiBookOpen size={13} />
            </Flex>

            <Box>
              <Text
                fontSize="11px"
                fontWeight="800"
                color={titleColor}
                lineHeight="1"
              >
                {totalSections}
              </Text>
              <Text
                fontSize="9px"
                color={mutedColor}
                mt={1}
                lineHeight="1"
              >
                Lessons
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Course actions */}
      {(canEditCourses || canDeleteCourses) && (
        <Flex
          p={{ base: "12px 14px", md: "14px 18px" }}
          borderTop={`1px solid ${borderColor}`}
          bg={courseFooterBg}
          align="center"
          gap={2}
          onClick={stopCardClick}
        >
          {canEditCourses && onOpenModulesDrawer && (
            <Button
              flex={1}
              size="sm"
              minW={0}
              leftIcon={<FiPackage />}
              colorScheme="blue"
              borderRadius="xl"
              fontSize="xs"
              boxShadow="0 4px 10px rgba(37, 99, 235, 0.16)"
              onClick={(event) => {
                event.stopPropagation();
                onOpenModulesDrawer(course);
              }}
            >
              Add Modules
            </Button>
          )}

          {canEditCourses && (
            <Button
              size="sm"
              px={3}
              leftIcon={<FiEdit3 />}
              variant="ghost"
              colorScheme="blue"
              borderRadius="xl"
              fontSize="xs"
              onClick={(event) => {
                event.stopPropagation();
                onOpenEdit(course);
              }}
            >
              Edit
            </Button>
          )}

          {canDeleteCourses && onDeleteCourse && (
            <Button
              size="sm"
              px={3}
              leftIcon={<FiTrash2 />}
              variant="ghost"
              colorScheme="red"
              borderRadius="xl"
              fontSize="xs"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteCourse(course._id);
              }}
            >
              Delete
            </Button>
          )}
        </Flex>
      )}
    </motion.div>
  );
})}
          {/* {filteredCoursesInFolder.map((course) => {
            const amount = course.commerce?.amountInRupees;
            const priceText = !amount || amount <= 0 ? "Free" : `Rs ${amount}`;
            return (
              <motion.div key={course._id} whileHover={{ y: -3 }}  onClick={() => onOpenDetails(course)} style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ position: "relative", height: 160, background: "#1E293B" }}>
                  {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Flex w="100%" h="100%" align="center" justify="center"><FiBookOpen size={44} color="#475569" /></Flex>}
                  <Badge position="absolute" top={3} right={3} colorScheme={course.status === "draft" ? "orange" : "green"} textTransform="uppercase">{course.status}</Badge>
                  <Badge position="absolute" bottom={3} left={3} bg="rgba(15, 23, 42, 0.85)" color="#FFFFFF">{priceText}</Badge>
                </div>
                <Box p={4} flex={1}>
                  <Text fontSize="11px" fontWeight="700" color="#2563EB" textTransform="uppercase" mb={1}>{course.courseCode || "COURSE"}</Text>
                  <Text fontSize="16px" fontWeight="700" color={titleColor} noOfLines={2}>{course.title}</Text>
                  <Text fontSize="12px" color={mutedColor} mt={2}>{course.curriculum?.totalModules || 0} Modules | {course.curriculum?.totalSections || 0} Lessons</Text>
                </Box>
                <Flex p="12px 18px" borderTop={`1px solid ${borderColor}`} bg={courseFooterBg} align="center" justify="space-between" gap={2} flexWrap="wrap">
                  {canEditCourses && onOpenModulesDrawer && <Button size="xs" leftIcon={<FiPackage />} colorScheme="blue" variant="solid" onClick={() => onOpenModulesDrawer(course)}>Add Modules</Button>}
                  {canEditCourses && <Button size="xs" leftIcon={<FiEdit3 />} variant="ghost" colorScheme="blue" onClick={() => onOpenEdit(course)}>Edit</Button>}
                  {canDeleteCourses && onDeleteCourse && <Button size="xs" leftIcon={<FiTrash2 />} variant="ghost" colorScheme="red" onClick={() => onDeleteCourse(course._id)}>Delete</Button>}
                </Flex>
              </motion.div>
            );
          })} */}
        </div>
      )}
      {/* {canViewUsers && onViewCourseUsers && <Button size="xs" variant="ghost" onClick={() => onViewCourseUsers(course)}>Users</Button>} */}
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
});

export default FolderExplorer;
