"use client";

import React, { useState, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { motion, AnimatePresence } from "framer-motion";
import {
  useColorModeValue,
  useBreakpointValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Button,
  FormControl,
  FormLabel,
  Box,
  Flex,
  Text,
  Badge,
  Icon,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import {
  FiFolder,
  FiPlus,
  FiArrowLeft,
  FiBookOpen,
  FiSearch,
  FiChevronRight,
  FiFilter,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiUsers,
  FiLock,
  FiGlobe,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import { courseStore, CourseListItem, CourseCategoryItem } from "@/app/store/courseStore/courseStore";
import { getCategoryIconMeta } from "../utils/folderIconUtils";

interface FolderExplorerProps {
  categories: CourseCategoryItem[];
  courses: CourseListItem[];
  canCreateCourses: boolean;
  canEditCourses: boolean;
  canDeleteCourses: boolean;
  canAssignCourses: boolean;
  canViewUsers: boolean;
  onOpenDetails: (course: CourseListItem) => void;
  onOpenEdit: (course: CourseListItem) => void;
  onCreateCourseInCategory: (categoryName: string) => void;
  onDeleteCourse?: (courseId: string) => void;
  onAssignCourse?: (course: CourseListItem) => void;
  onViewCourseUsers?: (course: CourseListItem) => void;
}

export const FolderExplorer = observer(function FolderExplorer({
  categories,
  courses,
  canCreateCourses,
  canEditCourses,
  canDeleteCourses,
  canAssignCourses,
  canViewUsers,
  onOpenDetails,
  onOpenEdit,
  onCreateCourseInCategory,
  onDeleteCourse,
  onAssignCourse,
  onViewCourseUsers,
}: FolderExplorerProps) {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scoped search & filter inside selected folder
  const [folderSearch, setFolderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "paid">("all");

  const cardBg = useColorModeValue("#FFFFFF", "#1E293B");
  const borderColor = useColorModeValue("#E2E8F0", "#334155");
  const titleColor = useColorModeValue("#0F172A", "#F8FAFC");
  const textColor = useColorModeValue("#475569", "#CBD5E1");
  const mutedColor = useColorModeValue("#64748B", "#94A3B8");
  const hoverBg = useColorModeValue("#F8FAFC", "#1E293B");

  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const ALL_COURSES_KEY = "__all_courses__";

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast({
        title: "Category name required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await courseStore.createCategory(trimmed, newCategoryDesc.trim());
      await courseStore.fetchCategories();
      toast({
        title: "Category Created",
        description: `"${trimmed}" folder is ready!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewCategoryName("");
      setNewCategoryDesc("");
      setIsAddModalOpen(false);
      setSelectedCategory(trimmed);
    } catch (err: any) {
      toast({
        title: "Error creating category",
        description: err.message || "Failed to create category",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter courses by selected category
  const filteredCoursesInCategory = useMemo(() => {
    if (!selectedCategory) return [];

    if (selectedCategory === ALL_COURSES_KEY) {
      return courses.filter((course) => {
        const q = folderSearch.trim().toLowerCase();
        if (q) {
          const titleMatch = course.title.toLowerCase().includes(q);
          const codeMatch = (course.courseCode || "").toLowerCase().includes(q);
          const categoryMatch = (course.taxonomy?.categories || []).some((category) =>
            category.toLowerCase().includes(q)
          );
          if (!titleMatch && !codeMatch && !categoryMatch) return false;
        }

        if (statusFilter !== "all" && course.status !== statusFilter) return false;
        const pricingModel = course.commerce?.pricingModel || "free";
        if (pricingFilter !== "all" && pricingModel !== pricingFilter) return false;

        return true;
      });
    }

    return courses.filter((course) => {
      const cats = course.taxonomy?.categories || [];
      const matchesCategory = cats.some(
        (c) => c.toLowerCase() === selectedCategory.toLowerCase()
      );
      if (!matchesCategory) return false;

      const q = folderSearch.trim().toLowerCase();
      if (q) {
        const titleMatch = course.title.toLowerCase().includes(q);
        const codeMatch = (course.courseCode || "").toLowerCase().includes(q);
        if (!titleMatch && !codeMatch) return false;
      }

      if (statusFilter !== "all" && course.status !== statusFilter) return false;
      const pricingModel = course.commerce?.pricingModel || "free";
      if (pricingFilter !== "all" && pricingModel !== pricingFilter) return false;

      return true;
    });
  }, [courses, selectedCategory, folderSearch, statusFilter, pricingFilter]);

  // Compute live course counts for folders
  const categoriesWithCounts = useMemo(() => {
    const countsMap = new Map<string, number>();
    courses.forEach((c) => {
      (c.taxonomy?.categories || []).forEach((cat) => {
        if (cat) {
          const key = cat.toLowerCase();
          countsMap.set(key, (countsMap.get(key) || 0) + 1);
        }
      });
    });

    return categories.map((cat) => {
      const liveCount = countsMap.get(cat.name.toLowerCase()) || 0;
      return {
        ...cat,
        courseCount: Math.max(cat.courseCount || 0, liveCount),
      };
    });
  }, [categories, courses]);

  const folderCards = useMemo(() => {
    const uncategorizedCount = courses.filter(
      (course) => !Array.isArray(course.taxonomy?.categories) || course.taxonomy?.categories.length === 0
    ).length;

    return [
      {
        _id: ALL_COURSES_KEY,
        selectionKey: ALL_COURSES_KEY,
        name: "All Courses",
        description:
          uncategorizedCount > 0
            ? `Browse every course in one place, including ${uncategorizedCount} uncategorized ${uncategorizedCount === 1 ? "course" : "courses"}.`
            : "Browse every course in one place, including anything not mapped to a category yet.",
        courseCount: courses.length,
        isVirtual: true,
      },
      ...categoriesWithCounts.map((category) => ({
        ...category,
        selectionKey: category.name,
      })),
    ];
  }, [categoriesWithCounts, courses]);

  // Category Icon / Gradient Colors generator
  const getCategoryGradient = (index: number) => {
    const gradients = [
      "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
      "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
      "linear-gradient(135deg, #10B981 0%, #047857 100%)",
      "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
      "linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)",
      "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
    ];
    return gradients[index % gradients.length];
  };

  const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

  // ----------------------------------------------------
  // VIEW 1: CATEGORY FOLDER GRID VIEW
  // ----------------------------------------------------
  if (!selectedCategory) {
    return (
      <div style={{ marginTop: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: titleColor,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FiFolder style={{ color: "#3B82F6" }} /> Course Categories
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: textColor }}>
              Select a category folder to browse courses or add a new category container.
            </p>
          </div>
        </div>

        {/* Responsive Grid of Category Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {(courseStore.isCategoriesLoading || courseStore.isLoading) && folderCards.length === 0
            ? Array.from({ length: isMobile ? 4 : 6 }, (_, index) => (
                <Box
                  key={`folder-skeleton-${index}`}
                  borderRadius="2xl"
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
                  <Skeleton h="18px" w="96px" mt={10} borderRadius="md" />
                </Box>
              ))
            : folderCards.map((cat, index) => {
            const iconMeta = getCategoryIconMeta(cat.name);
            const IconComponent = iconMeta.icon;
            return (

              <MotionBox
  key={cat._id || cat.name}
  onClick={() => setSelectedCategory(cat.selectionKey)}
  cursor="pointer"
  position="relative"
  overflow="hidden"
  borderRadius="2xl"
  bg={cardBg}
  border="1px solid"
  borderColor={borderColor}
  p={6}
  boxShadow="sm"
  whileHover={{
    y: -8,
    scale: 1.01,
  }}
  whileTap={{ scale: 0.98 }}
  transition={{
    type: "spring",
    stiffness: 260,
    damping: 20,
  }}
  _hover={{
    boxShadow: "md",
    borderColor: "purple.200",
  }}
>

  {/* Animated Background Glow */}
  <MotionBox
    position="absolute"
    top="-40%"
    right="-20%"
    w="180px"
    h="180px"
    borderRadius="full"
    bgGradient={iconMeta.gradient}
    opacity={0.08}
    filter="blur(50px)"
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 15, 0],
    }}
    transition={{
      repeat: Infinity,
      duration: 6,
      ease: "easeInOut",
    }}
  />

  {/* Animated Top Border */}
  <MotionBox
    position="absolute"
    top="0"
    left="0"
    h="4px"
    w="100%"
    bgGradient={iconMeta.gradient}
    initial={{ scaleX: 0 }}
    whileHover={{ scaleX: 1 }}
    style={{ originX: 0 }}
    transition={{ duration: .35 }}
  />

  {/* Header */}
  <Flex
    justify="space-between"
    align="center"
    mb={5}
    position="relative"
    zIndex={2}
  >

    {/* Icon */}
    <MotionFlex
      w="56px"
      h="56px"
      rounded="xl"
      bgGradient={iconMeta.gradient}
      justify="center"
      align="center"
      boxShadow="lg"
      whileHover={{
        rotate: -8,
        scale: 1.15,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
      }}
    >
      <Icon
        as={IconComponent}
        boxSize={6}
        color={iconMeta.color}
      />
    </MotionFlex>

    <Badge
      px={3}
      py={1.5}
      rounded="full"
      bg={iconMeta.badgeBg}
      color={iconMeta.color}
      fontWeight="700"
      fontSize="11px"
      textTransform="capitalize"
    >
      {cat.courseCount}{" "}
      {cat.courseCount === 1 ? "Course" : "Courses"}
    </Badge>
  </Flex>

  {/* Content */}
  <Box position="relative" zIndex={2}>
    <Text
      fontWeight="bold"
      fontSize="lg"
      color={titleColor}
      noOfLines={1}
      mb={2}
    >
      {cat.name}
    </Text>

    <Text
      fontSize="sm"
      color={mutedColor}
      noOfLines={2}
      minH="42px"
    >
      {cat.description ||
        `Browse courses under ${cat.name}.`}
    </Text>
  </Box>

  {/* Footer */}
  <MotionFlex
    mt={6}
    pt={4}
    borderTop="1px solid"
    borderColor={borderColor}
    justify="space-between"
    align="center"
    color="blue.500"
    fontWeight="600"
    position="relative"
    zIndex={2}
    whileHover="hover"
  >
    <Text fontSize="sm">
      Open Folder
    </Text>

    <MotionBox
      variants={{
        hover: {
          x: 6,
        },
      }}
      transition={{
        type: "spring",
        stiffness: 300,
      }}
    >
      <FiChevronRight size={18} />
    </MotionBox>
  </MotionFlex>

</MotionBox>
              // <motion.div
              //   key={cat._id || cat.name}
              //   whileHover={{ y: -4, scale: 1.01 }}
              //   whileTap={{ scale: 0.98 }}
              //   onClick={() => setSelectedCategory(cat.name)}
              //   style={{
              //     background: cardBg,
              //     borderRadius: 16,
              //     border: `1.5px solid ${borderColor}`,
              //     padding: "20px 22px",
              //     cursor: "pointer",
              //     boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              //     transition: "all 0.2s ease",
              //     display: "flex",
              //     flexDirection: "column",
              //     justifyContent: "space-between",
              //     position: "relative",
              //     overflow: "hidden",
              //   }}
              // >
              //   {/* Folder Header Accent */}
              //   <div
              //     style={{
              //       display: "flex",
              //       alignItems: "center",
              //       justifyContent: "space-between",
              //       marginBottom: 16,
              //     }}
              //   >
              //     <div
              //       style={{
              //         width: 48,
              //         height: 48,
              //         borderRadius: 12,
              //         background: iconMeta.gradient,
              //         display: "flex",
              //         alignItems: "center",
              //         justifyContent: "center",
              //         boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              //       }}
              //     >
              //       <IconComponent size={24} color={iconMeta.color} />
              //     </div>
              //     <span
              //       style={{
              //         fontSize: 12,
              //         fontWeight: 700,
              //         padding: "4px 10px",
              //         borderRadius: 20,
              //         background: iconMeta.badgeBg,
              //         color: iconMeta.color,
              //       }}
              //     >
              //       {cat.courseCount} {cat.courseCount === 1 ? "Course" : "Courses"}
              //     </span>
              //   </div>

              //   {/* Folder Info */}
              //   <div>
              //     <h3
              //       style={{
              //         fontSize: 17,
              //         fontWeight: 700,
              //         color: titleColor,
              //         margin: "0 0 6px",
              //         overflow: "hidden",
              //         textOverflow: "ellipsis",
              //         whiteSpace: "nowrap",
              //       }}
              //     >
              //       {cat.name}
              //     </h3>
              //     <p
              //       style={{
              //         fontSize: 13,
              //         color: mutedColor,
              //         margin: 0,
              //         lineHeight: 1.4,
              //         display: "-webkit-box",
              //         WebkitLineClamp: 2,
              //         WebkitBoxOrient: "vertical",
              //         overflow: "hidden",
              //         minHeight: 36,
              //       }}
              //     >
              //       {cat.description || `Browse courses under ${cat.name}.`}
              //     </p>
              //   </div>

              //   {/* Bottom Explorer Action */}
              //   <div
              //     style={{
              //       marginTop: 18,
              //       paddingTop: 12,
              //       borderTop: `1px solid ${borderColor}`,
              //       display: "flex",
              //       alignItems: "center",
              //       justifyContent: "space-between",
              //       fontSize: 13,
              //       fontWeight: 600,
              //       color: "#2563EB",
              //     }}
              //   >
              //     <span>Open Folder</span>
              //     <FiChevronRight size={16} />
              //   </div>
              // </motion.div>
            );
          })}

          {/* ALWAYS AT THE END: "Add Category" Card with Centered Plus (+) Icon */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddModalOpen(true)}
            style={{
              borderRadius: 16,
              border: "2px dashed #93C5FD",
              background: useColorModeValue(
                "linear-gradient(180deg, rgba(239,246,255,0.7) 0%, rgba(219,234,254,0.4) 100%)",
                "rgba(30, 41, 59, 0.4)"
              ),
              padding: "20px 22px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 190,
              textAlign: "center",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#2563EB",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                boxShadow: "0 8px 18px rgba(37, 99, 235, 0.3)",
              }}
            >
              <FiPlus size={26} />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1E40AF",
              }}
            >
              Add Category
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#3B82F6",
                marginTop: 4,
              }}
            >
              Create new folder bucket
            </span>
          </motion.div>
        </div>

        {/* Modal for Adding New Category */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} isCentered size="md">
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius={16}>
            <ModalHeader fontSize={18} fontWeight={700} borderBottom={`1px solid ${borderColor}`}>
              Create New Category Folder
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleCreateCategory}>
              <ModalBody py={6}>
                <FormControl isRequired mb={4}>
                  <FormLabel fontSize={14} fontWeight={600}>
                    Category Name
                  </FormLabel>
                  <Input
                    placeholder="e.g. Sales, Business Analysis, Full Stack, AI"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    borderRadius={10}
                    autoFocus
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel fontSize={14} fontWeight={600}>
                    Description (Optional)
                  </FormLabel>
                  <Input
                    placeholder="Brief description of courses stored in this folder"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    borderRadius={10}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter borderTop={`1px solid ${borderColor}`} gap={3}>
                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} borderRadius={10}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={isSubmitting}
                  borderRadius={10}
                  px={6}
                >
                  Create Folder
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: INSIDE CATEGORY FOLDER VIEW
  // ----------------------------------------------------
  return (
    <div style={{ marginTop: 8 }}>
      {/* Breadcrumb & Navigation Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="outline"
            size="sm"
            borderRadius={10}
            onClick={() => {
              setSelectedCategory(null);
              setFolderSearch("");
            }}
          >
            All Folders
          </Button>

          {(() => {
            const selectedMeta = getCategoryIconMeta(
              selectedCategory === ALL_COURSES_KEY ? "All Courses" : selectedCategory
            );
            const SelectedIcon = selectedMeta.icon;
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: mutedColor, fontSize: 14 }}>/</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <SelectedIcon style={{ color: selectedMeta.color }} size={20} />
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: titleColor, margin: 0 }}>
                    {selectedCategory === ALL_COURSES_KEY ? "All Courses" : selectedCategory}
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: 16,
                    background: selectedMeta.badgeBg,
                    color: selectedMeta.color,
                    marginLeft: 4,
                  }}
                >
                  {filteredCoursesInCategory.length} {filteredCoursesInCategory.length === 1 ? "Course" : "Courses"}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Clear "Create Course" action within Category view */}
        {canCreateCourses && (
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            size="md"
            borderRadius={12}
            boxShadow="0 4px 14px rgba(37, 99, 235, 0.25)"
            onClick={() =>
              onCreateCourseInCategory(
                selectedCategory === ALL_COURSES_KEY ? "" : selectedCategory
              )
            }
            isDisabled={selectedCategory === ALL_COURSES_KEY}
          >
            {selectedCategory === ALL_COURSES_KEY
              ? "Select a category to create a course"
              : `Create Course in ${selectedCategory}`}
          </Button>
        )}
      </div>

      {/* Scoped Search & Filter Bar */}
      <div
        style={{
          background: cardBg,
          padding: "14px 18px",
          borderRadius: 14,
          border: `1px solid ${borderColor}`,
          marginBottom: 22,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        {/* Search input */}
        <div style={{ flex: "1 1 240px", position: "relative" }}>
          <FiSearch
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: mutedColor,
            }}
          />
          <input
            type="text"
            placeholder={`Search courses in ${
              selectedCategory === ALL_COURSES_KEY ? "all folders" : selectedCategory
            }...`}
            value={folderSearch}
            onChange={(e) => setFolderSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              fontSize: 14,
              outline: "none",
              background: useColorModeValue("#FAFAFA", "#0F172A"),
              color: titleColor,
            }}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
            fontSize: 13,
            outline: "none",
            background: useColorModeValue("#FAFAFA", "#0F172A"),
            color: titleColor,
          }}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {/* Pricing filter */}
        <select
          value={pricingFilter}
          onChange={(e) => setPricingFilter(e.target.value as any)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
            fontSize: 13,
            outline: "none",
            background: useColorModeValue("#FAFAFA", "#0F172A"),
            color: titleColor,
          }}
        >
          <option value="all">All Pricing</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Courses Grid in Category */}
      {courseStore.isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: 20,
          }}
        >
          {Array.from({ length: isMobile ? 2 : 6 }, (_, index) => (
            <Box
              key={`course-skeleton-${index}`}
              background={cardBg}
              borderRadius="16px"
              border={`1px solid ${borderColor}`}
              overflow="hidden"
              boxShadow="0 4px 18px rgba(0,0,0,0.04)"
            >
              <Skeleton h="160px" w="100%" />
              <Box p={5}>
                <Skeleton h="12px" w="72px" mb={3} />
                <Skeleton h="18px" w="80%" mb={2} />
                <Skeleton h="18px" w="55%" mb={4} />
                <SkeletonText noOfLines={2} spacing={3} skeletonHeight={3} />
              </Box>
              <Flex
                padding="12px 18px"
                borderTop={`1px solid ${borderColor}`}
                background={useColorModeValue("#FAFAFA", "#172033")}
                gap={3}
              >
                <Skeleton h="28px" flex="1" borderRadius="8px" />
                <Skeleton h="28px" flex="1" borderRadius="8px" />
                <Skeleton h="28px" flex="1" borderRadius="8px" />
              </Flex>
            </Box>
          ))}
        </div>
      ) : filteredCoursesInCategory.length === 0 ? (
        <div
          style={{
            background: cardBg,
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.1)",
              color: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <FiBookOpen size={30} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: titleColor, margin: "0 0 6px" }}>
            No courses in {selectedCategory === ALL_COURSES_KEY ? "All Courses" : selectedCategory}
          </h3>
          <p style={{ fontSize: 14, color: mutedColor, margin: "0 0 20px" }}>
            {selectedCategory === ALL_COURSES_KEY
              ? "There are currently no courses matching your filter criteria across the full course library."
              : "There are currently no courses matching your filter criteria in this category."}
          </p>
          {canCreateCourses && selectedCategory !== ALL_COURSES_KEY && (
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => onCreateCourseInCategory(selectedCategory)}
            >
              Add First Course to {selectedCategory}
            </Button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: 20,
          }}
        >
          {filteredCoursesInCategory.map((course) => {
            const isDraft = course.status === "draft";
            const amount = course.commerce?.amountInRupees;
            const priceText = !amount || amount <= 0 ? "Free" : `₹${amount}`;

            return (
              <motion.div
                key={course._id}
                whileHover={{ y: -3 }}
                style={{
                  background: cardBg,
                  borderRadius: 16,
                  border: `1px solid ${borderColor}`,
                  overflow: "hidden",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* Course Header / Thumbnail */}
                <div style={{ position: "relative", height: 160, background: "#1E293B" }}>
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FiBookOpen size={44} color="#475569" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: isDraft ? "rgba(245, 158, 11, 0.9)" : "rgba(16, 185, 129, 0.9)",
                      color: "#FFFFFF",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {course.status}
                  </span>

                  {/* Price Tag */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "rgba(15, 23, 42, 0.85)",
                      color: "#FFFFFF",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {priceText}
                  </span>
                </div>

                {/* Course Body */}
                <div style={{ padding: 18, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#2563EB",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 4,
                    }}
                  >
                    {course.courseCode || "COURSE"}
                  </div>
                  <h4
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: titleColor,
                      margin: "0 0 8px",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {course.title}
                  </h4>
                  <div
                    style={{
                      fontSize: 12,
                      color: mutedColor,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 10,
                    }}
                  >
                    <span>{course.curriculum?.totalModules || 0} Modules</span>
                    <span>•</span>
                    <span>{course.curriculum?.totalSections || 0} Lessons</span>
                  </div>
                </div>

                {/* Course Actions Footer */}
                <div
                  style={{
                    padding: "12px 18px",
                    borderTop: `1px solid ${borderColor}`,
                    background: useColorModeValue("#FAFAFA", "#172033"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  <Button
                    size="xs"
                    leftIcon={<FiEye />}
                    variant="ghost"
                    onClick={() => onOpenDetails(course)}
                  >
                    View
                  </Button>

                  {canEditCourses && (
                    <Button
                      size="xs"
                      leftIcon={<FiEdit3 />}
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => onOpenEdit(course)}
                    >
                      Edit
                    </Button>
                  )}

                  {canAssignCourses && onAssignCourse && (
                    <Button
                      size="xs"
                      leftIcon={<FiUsers />}
                      variant="ghost"
                      colorScheme="purple"
                      onClick={() => onAssignCourse(course)}
                    >
                      Assign
                    </Button>
                  )}

                  {canDeleteCourses && onDeleteCourse && (
                    <Button
                      size="xs"
                      leftIcon={<FiTrash2 />}
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => onDeleteCourse(course._id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default FolderExplorer;
