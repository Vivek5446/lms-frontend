"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { FormEvent, useState } from "react";
import { FiFolderPlus } from "react-icons/fi";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
  onCreated?: (folderName: string) => void;
  initialName?: string;
  initialDescription?: string;
  title?: string;
  submitLabel?: string;
}

const MAX_DESCRIPTION_LENGTH = 180;

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  onCreated,
  initialName = "",
  initialDescription = "",
  title = "Add Folder",
  submitLabel = "Save Folder",
}) => {
  const toast = useToast();
  const [folderName, setFolderName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalBackground = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");
  const fieldBackground = useColorModeValue("gray.50", "whiteAlpha.50");
  const footerBackground = useColorModeValue("gray.50", "whiteAlpha.50");
  const iconBackground = useColorModeValue("blue.50", "rgba(59, 130, 246, 0.15)");
  const iconColor = useColorModeValue("blue.600", "blue.300");

  const resetForm = () => {
    setFolderName(initialName);
    setDescription(initialDescription);
  };

  React.useEffect(() => {
    if (isOpen) {
      setFolderName(initialName);
      setDescription(initialDescription);
    }
  }, [initialDescription, initialName, isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = folderName.trim();
    if (!name) {
      toast({
        title: "Folder name required",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(name, description.trim());
      toast({
        title: title === "Edit Folder" ? "Folder updated" : "Folder created",
        description: `"${name}" was saved successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      onCreated?.(name);
      resetForm();
      onClose();
    } catch (error: unknown) {
      toast({
        title: "Unable to create folder",
        description: error instanceof Error ? error.message : "Failed to create folder",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size="md"
      motionPreset="slideInBottom"
      closeOnEsc={!isSubmitting}
      closeOnOverlayClick={!isSubmitting}
    >
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(5px)" />
      <ModalContent
        mx={4}
        maxW="460px"
        bg={modalBackground}
        borderRadius={{ base: "16px", sm: "20px" }}
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow={useColorModeValue(
          "0 12px 35px rgba(15, 23, 42, 0.12)",
          "0 12px 35px rgba(0, 0, 0, 0.25)"
        )}
      >
        <ModalHeader px={{ base: 5, sm: 6 }} pt={5} pb={4} borderBottomWidth="1px" borderColor={borderColor}>
          <HStack spacing={3} pr={8} align="flex-start">
            <Flex align="center" justify="center" w="40px" h="40px" flexShrink={0} borderRadius="xl" bg={iconBackground} color={iconColor}>
              <Icon as={FiFolderPlus} boxSize={4.5} />
            </Flex>
            <Box minW={0}>
              <Text color={headingColor} fontSize="md" fontWeight="700" lineHeight="short">
                {title}
              </Text>
              <Text mt={1} color={mutedTextColor} fontSize="xs" fontWeight="400" lineHeight="tall">
                Set the folder name and description.
              </Text>
            </Box>
          </HStack>
        </ModalHeader>

        <ModalCloseButton top={4} right={4} size="sm" borderRadius="full" isDisabled={isSubmitting} />

        <form onSubmit={handleSubmit}>
          <ModalBody px={{ base: 5, sm: 6 }} py={{ base: 5, sm: 6 }}>
            <VStack spacing={5} align="stretch">
              <FormControl isRequired>
                <FormLabel mb={1.5} color={headingColor} fontSize="sm" fontWeight="600">
                  Folder name
                </FormLabel>
                <Input
                  value={folderName}
                  onChange={(event) => setFolderName(event.target.value)}
                  placeholder="e.g., Onboarding"
                  isDisabled={isSubmitting}
                  bg={fieldBackground}
                  borderColor={borderColor}
                  borderRadius="10px"
                  fontSize="sm"
                />
              </FormControl>

              <FormControl>
                <HStack mb={1.5} justify="space-between" align="center">
                  <FormLabel m={0} color={headingColor} fontSize="sm" fontWeight="600">
                    Description
                    <Text as="span" ml={1} color={mutedTextColor} fontSize="xs" fontWeight="400">
                      Optional
                    </Text>
                  </FormLabel>
                  <Text color={mutedTextColor} fontSize="10px" fontWeight="500">
                    {description.length}/{MAX_DESCRIPTION_LENGTH}
                  </Text>
                </HStack>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add a short description for this folder"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  isDisabled={isSubmitting}
                  bg={fieldBackground}
                  borderColor={borderColor}
                  borderRadius="10px"
                  fontSize="sm"
                  minH="90px"
                  maxH="130px"
                  py={3}
                  resize="vertical"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter px={{ base: 5, sm: 6 }} py={4} bg={footerBackground} borderTopWidth="1px" borderColor={borderColor}>
            <Flex w="full" direction={{ base: "column-reverse", sm: "row" }} justify="flex-end" gap={2.5}>
              <Button type="button" variant="ghost" size="sm" w={{ base: "full", sm: "auto" }} h="40px" px={5} borderRadius="10px" onClick={handleClose} isDisabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" size="sm" w={{ base: "full", sm: "auto" }} h="40px" px={6} colorScheme="blue" borderRadius="10px" fontWeight="700" isLoading={isSubmitting} loadingText="Saving" isDisabled={!folderName.trim()}>
                {submitLabel}
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

CreateCategoryModal.displayName = "CreateCategoryModal";

export default CreateCategoryModal;
