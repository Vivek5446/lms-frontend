"use client";

import type { CourseListItem } from "@/app/store/courseStore/courseStore";
import {
  Box,
  Button,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { getApiErrorMessage } from "../../../config/utils/apiError";

type DeleteCourseModalProps = {
  isOpen: boolean;
  course: CourseListItem | null;
  onClose: () => void;
  onConfirm: (course: CourseListItem) => Promise<void>;
};

const DeleteCourseModal = ({ isOpen, course, onClose, onConfirm }: DeleteCourseModalProps) => {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const modalBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.900", "white");
  const dangerTextColor = useColorModeValue("red.800", "red.100");
  const courseTitleColor = useColorModeValue("gray.900", "white");
  const warningBg = useColorModeValue("red.50", "rgba(248, 113, 113, 0.12)");
  const warningBorder = useColorModeValue("red.100", "red.800");
  const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const handleClose = () => {
    if (isDeleting) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (!course) return;

    setIsDeleting(true);
    try {
      await onConfirm(course);
      toast({
        title: "Course deleted",
        description: `"${course.title || "Course"}" was removed successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      onClose();
    } catch (error: unknown) {
      toast({
        title: "Unable to delete course",
        description: getApiErrorMessage(error),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size="md"
      motionPreset="slideInBottom"
      closeOnEsc={!isDeleting}
      closeOnOverlayClick={!isDeleting}
    >
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(5px)" />
      <ModalContent
        mx={4}
        bg={modalBg}
        borderRadius={{ base: "16px", sm: "20px" }}
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <ModalHeader px={{ base: 5, sm: 6 }} py={5} borderBottomWidth="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Box borderRadius="full" bg={warningBg} color="red.500" p={2}>
              <Icon as={FiTrash2} boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="800" color={headingColor}>
                Delete Course
              </Text>
              <Text fontSize="sm" color={mutedColor} fontWeight="500" mt={1}>
                This action cannot be undone.
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={isDeleting} top={4} right={4} />

        <ModalBody px={{ base: 5, sm: 6 }} py={5}>
          <VStack align="stretch" spacing={4}>
            <Box borderWidth="1px" borderColor={warningBorder} bg={warningBg} borderRadius="12px" p={4}>
              <HStack align="start" spacing={3}>
                <Icon as={FiAlertTriangle} color="red.500" boxSize={5} mt={0.5} />
                <Box>
                  <Text fontWeight="700" color={dangerTextColor}>
                    You are about to delete:
                  </Text>
                  <Text mt={1} fontWeight="800" color={courseTitleColor} noOfLines={2}>
                    {course?.title || "Selected course"}
                  </Text>
                  {/* {course?.slug ? (
                    <Text mt={1} fontSize="sm" color={mutedColor}>
                      {course.slug}
                    </Text>
                  ) : null} */}
                </Box>
              </HStack>
            </Box>

            <Text fontSize="sm" lineHeight="1.7" color={mutedColor}>
              Deleting this course removes it from the course library and any folder views where it appears.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter px={{ base: 5, sm: 6 }} py={4} bg={footerBg} borderTopWidth="1px" borderColor={borderColor}>
          <HStack spacing={3} w="100%" justify="flex-end">
            <Button variant="ghost" borderRadius="10px" onClick={handleClose} isDisabled={isDeleting}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              borderRadius="10px"
              leftIcon={<Icon as={FiTrash2} />}
              onClick={handleConfirm}
              isLoading={isDeleting}
              loadingText="Deleting"
              isDisabled={!course}
            >
              Delete Course
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteCourseModal;
