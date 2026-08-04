"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Icon,
  HStack,
  VStack,
  useColorModeValue,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Button,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
  Tooltip,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import {
  Folder,
  Plus,
  Search,
  Layers,
  Building2,
  Edit2,
  Trash2,
  BookOpen,
  Tag as TagIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import stores from "../../../../../store/stores";
import { CourseCategoryItem } from "@/app/store/courseStore/courseStore";

const MotionBox = motion(Box);

const CourseCategoryMaster = observer(() => {
  const toast = useToast();
  const sectionBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<CourseCategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CourseCategoryItem | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formParentCategory, setFormParentCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      await stores.courseStore.fetchMasterCategories();
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = stores.courseStore.masterCategories || [];

  const filteredCategories = categories.filter((cat) => {
    return (
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalMasterCount = categories.length;
  const totalCoursesMapped = categories.reduce((sum, c) => sum + (c.courseCount || 0), 0);

  const handleOpenCreate = () => {
    setFormName("");
    setFormDescription("");
    setFormParentCategory("");
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (category: CourseCategoryItem) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || "");
    const parentId =
      typeof category.parentCategory === "object" && category.parentCategory
        ? category.parentCategory._id
        : (category.parentCategory as string) || "";
    setFormParentCategory(parentId);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (category: CourseCategoryItem) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast({ title: "Name is required", status: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      await stores.courseStore.createCategory(formName.trim(), formDescription.trim(), {
        isMaster: true,
        parentCategory: formParentCategory || undefined,
      });

      toast({
        title: "Category Added to Master",
        description: `"${formName.trim()}" has been added to the Master Category list.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsCreateOpen(false);
      await loadCategories();
    } catch (err: any) {
      toast({
        title: "Error Adding Category",
        description: err?.message || "Failed to create master category.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?._id) return;
    if (!formName.trim()) {
      toast({ title: "Name is required", status: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      await stores.courseStore.updateCategory(editingCategory._id, {
        name: formName.trim(),
        description: formDescription.trim(),
        parentCategory: formParentCategory || undefined,
      });

      toast({
        title: "Category Updated",
        description: "Master category details updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsEditOpen(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (err: any) {
      toast({
        title: "Error Updating Category",
        description: err?.message || "Failed to update category.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingCategory?._id) return;

    setIsSubmitting(true);
    try {
      await stores.courseStore.deleteCategory(deletingCategory._id);

      toast({
        title: "Category Deleted",
        description: `"${deletingCategory.name}" category deleted successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsDeleteOpen(false);
      setDeletingCategory(null);
      await loadCategories();
    } catch (err: any) {
      toast({
        title: "Cannot Delete Category",
        description: err?.message || "Failed to delete category.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header & Title */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
            Course Category Master List
          </Text>
          <Text fontSize="sm" color={textSecondary}>
            Maintain the global Master Category list. All entries are global and populated in dropdowns everywhere.
          </Text>
        </Box>

        <Button
          leftIcon={<Icon as={Plus} />}
          colorScheme="purple"
          borderRadius="lg"
          px={6}
          shadow="md"
          _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
          onClick={handleOpenCreate}
        >
          Add Master Category
        </Button>
      </Flex>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
        <MotionBox
          bg={cardBg}
          p={5}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium" color={textSecondary}>
              Total Master Categories
            </Text>
            <Flex p={2} bg="purple.50" color="purple.600" borderRadius="lg">
              <Icon as={Layers} size={20} />
            </Flex>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
            {totalMasterCount}
          </Text>
          <Text fontSize="xs" color="purple.600" mt={1}>
            Global master dropdown options
          </Text>
        </MotionBox>

        <MotionBox
          bg={cardBg}
          p={5}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium" color={textSecondary}>
              Mapped Courses
            </Text>
            <Flex p={2} bg="green.50" color="green.600" borderRadius="lg">
              <Icon as={BookOpen} size={20} />
            </Flex>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
            {totalCoursesMapped}
          </Text>
          <Text fontSize="xs" color="green.600" mt={1}>
            Total courses assigned to categories
          </Text>
        </MotionBox>

        <MotionBox
          bg={cardBg}
          p={5}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
        >
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium" color={textSecondary}>
              Dropdown Scope
            </Text>
            <Flex p={2} bg="blue.50" color="blue.600" borderRadius="lg">
              <Icon as={Building2} size={20} />
            </Flex>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
            Global
          </Text>
          <Text fontSize="xs" color="blue.600" mt={1}>
            Visible to all companies and admins
          </Text>
        </MotionBox>
      </SimpleGrid>

      {/* Filter and Search Bar */}
      <Box bg={sectionBg} p={4} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
        <HStack spacing={3}>
          <Icon as={Search} color={textSecondary} />
          <Input
            placeholder="Search master category name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="unstyled"
            fontSize="sm"
          />
        </HStack>
      </Box>

      {/* Categories Table */}
      <Box bg={sectionBg} borderRadius="xl" borderWidth="1px" borderColor={borderColor} overflow="hidden" shadow="sm">
        {isLoading ? (
          <Flex justify="center" align="center" py={12}>
            <Spinner size="lg" color="purple.500" thickness="3px" />
          </Flex>
        ) : filteredCategories.length === 0 ? (
          <VStack py={12} spacing={3}>
            <Icon as={Folder} size={40} color={textSecondary} />
            <Text color={textSecondary} fontWeight="medium">
              No categories found
            </Text>
            <Button size="sm" colorScheme="purple" variant="outline" onClick={handleOpenCreate}>
              Add First Master Category
            </Button>
          </VStack>
        ) : (
          <TableContainer>
            <Table variant="simple" size="md">
              <Thead bg={headerBg}>
                <Tr>
                  <Th>Category Name</Th>
                  <Th>Description</Th>
                  <Th>Parent Category</Th>
                  <Th>Created By</Th>
                  <Th isNumeric>Courses</Th>
                  <Th isNumeric>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredCategories.map((category) => {
                  const companyName =
                    typeof category.company === "object" && category.company
                      ? category.company.name
                      : null;
                  const parentName =
                    typeof category.parentCategory === "object" && category.parentCategory
                      ? category.parentCategory.name
                      : null;

                  return (
                    <Tr key={category._id || category.name} _hover={{ bg: useColorModeValue("gray.50", "gray.750") }}>
                      <Td fontWeight="semibold">
                        <HStack spacing={2}>
                          <Icon as={TagIcon} color="purple.500" size={16} />
                          <Text color={useColorModeValue("gray.800", "white")}>{category.name}</Text>
                        </HStack>
                      </Td>

                      <Td maxW="280px">
                        <Text fontSize="xs" color={textSecondary} isTruncated>
                          {category.description || "—"}
                        </Text>
                      </Td>

                      <Td>
                        {parentName ? (
                          <Tag size="sm" colorScheme="purple" variant="subtle" borderRadius="full">
                            <TagLabel>{parentName}</TagLabel>
                          </Tag>
                        ) : (
                          <Text fontSize="xs" color={textSecondary}>
                            None
                          </Text>
                        )}
                      </Td>

                      <Td>
                        {companyName ? (
                          <HStack spacing={1}>
                            <Icon as={Building2} size={14} color="blue.500" />
                            <Text fontSize="xs" color={textSecondary} fontWeight="medium">
                              {companyName}
                            </Text>
                          </HStack>
                        ) : (
                          <Badge colorScheme="purple" borderRadius="full" px={2} fontSize="xs">
                            Superadmin (Global)
                          </Badge>
                        )}
                      </Td>

                      <Td isNumeric fontWeight="bold">
                        <Badge colorScheme={category.courseCount > 0 ? "green" : "gray"} borderRadius="md" px={2}>
                          {category.courseCount}
                        </Badge>
                      </Td>

                      <Td isNumeric>
                        <HStack spacing={2} justify="flex-end">
                          <Tooltip label="Edit Category">
                            <IconButton
                              aria-label="Edit Category"
                              icon={<Icon as={Edit2} size={15} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="purple"
                              onClick={() => handleOpenEdit(category)}
                            />
                          </Tooltip>

                          <Tooltip label="Delete Category">
                            <IconButton
                              aria-label="Delete Category"
                              icon={<Icon as={Trash2} size={15} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleOpenDelete(category)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Create Master Category Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <form onSubmit={handleCreateSubmit}>
            <ModalHeader fontSize="lg" fontWeight="bold">
              Add Master Category
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Category Name
                  </FormLabel>
                  <Input
                    placeholder="e.g. Technology, Leadership, Compliance, Web Dev"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    borderRadius="lg"
                    autoFocus
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Parent Category (Optional)
                  </FormLabel>
                  <Select
                    placeholder="None (Root Category)"
                    value={formParentCategory}
                    onChange={(e) => setFormParentCategory(e.target.value)}
                    borderRadius="lg"
                  >
                    {categories.map((mc) => (
                      <option key={mc._id || mc.name} value={mc._id}>
                        {mc.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Description
                  </FormLabel>
                  <Input
                    placeholder="Brief description of this category..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    borderRadius="lg"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)} borderRadius="lg">
                Cancel
              </Button>
              <Button colorScheme="purple" type="submit" isLoading={isSubmitting} borderRadius="lg" px={6}>
                Add Master Category
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <form onSubmit={handleEditSubmit}>
            <ModalHeader fontSize="lg" fontWeight="bold">
              Edit Category
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Category Name
                  </FormLabel>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    borderRadius="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Parent Category (Optional)
                  </FormLabel>
                  <Select
                    placeholder="None (Root Category)"
                    value={formParentCategory}
                    onChange={(e) => setFormParentCategory(e.target.value)}
                    borderRadius="lg"
                  >
                    {categories
                      .filter((mc) => mc._id !== editingCategory?._id)
                      .map((mc) => (
                        <option key={mc._id || mc.name} value={mc._id}>
                          {mc.name}
                        </option>
                      ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Description
                  </FormLabel>
                  <Input
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    borderRadius="lg"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" onClick={() => setIsEditOpen(false)} borderRadius="lg">
                Cancel
              </Button>
              <Button colorScheme="purple" type="submit" isLoading={isSubmitting} borderRadius="lg" px={6}>
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="lg" fontWeight="bold" color="red.500">
            Delete Category
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={3}>
            <Text fontSize="sm">
              Are you sure you want to delete category <strong>"{deletingCategory?.name}"</strong>?
            </Text>
            {deletingCategory && deletingCategory.courseCount > 0 && (
              <Text fontSize="xs" color="red.500" mt={2} fontWeight="semibold">
                Warning: This category currently has {deletingCategory.courseCount} mapped course(s). You must unassign or reassign courses before deleting.
              </Text>
            )}
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} borderRadius="lg">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteSubmit}
              isLoading={isSubmitting}
              isDisabled={Boolean(deletingCategory && deletingCategory.courseCount > 0)}
              borderRadius="lg"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
});

export default CourseCategoryMaster;
