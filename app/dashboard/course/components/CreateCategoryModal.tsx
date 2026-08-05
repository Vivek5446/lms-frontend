"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
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
  const [nameError, setNameError] = useState("");

  const modalBackground = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");
  const fieldBackground = useColorModeValue("gray.50", "whiteAlpha.50");
  const fieldFocusBg = useColorModeValue("white", "gray.800");
  const footerBackground = useColorModeValue("gray.50", "whiteAlpha.50");
  const iconBackground = useColorModeValue("blue.50", "rgba(59, 130, 246, 0.15)");
  const iconColor = useColorModeValue("blue.600", "blue.300");

  const resetForm = () => {
    setFolderName(initialName);
    setDescription(initialDescription);
    setNameError("");
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [initialDescription, initialName, isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const validateName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return "Folder name is required";
    }
    if (/\s/.test(trimmed)) {
      return "Spaces are not allowed (use underscores)";
    }
    if (trimmed.length < 6) {
      return "Folder name must be at least 6 characters";
    }
    if (trimmed.length > 40) {
      return "Folder name must be at most 40 characters";
    }
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const noSpaces = e.target.value.replace(/\s/g, "_");
    setFolderName(noSpaces);
    if (nameError) {
      setNameError(validateName(noSpaces));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateName(folderName);
    
    if (error) {
      setNameError(error);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(folderName.trim(), description.trim());
      toast({
        title: title === "Edit Folder" ? "Folder updated" : "Folder created",
        description: `"${folderName.trim()}" was saved successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      onCreated?.(folderName.trim());
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
        borderRadius={{ base: "16px", sm: "24px" }}
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow={useColorModeValue(
          "0 20px 40px rgba(15, 23, 42, 0.15)",
          "0 20px 40px rgba(0, 0, 0, 0.4)"
        )}
      >
        <Box
          w="100%"
          px={{ base: 5, sm: 6 }}
          py={{ base: 4, sm: 5 }}
          bg={modalBackground}
          borderBottom="1px solid"
          borderColor={borderColor}
          position="sticky"
          top={0}
          zIndex={20}
        >
          <HStack spacing={4} align="center">
            <Box flex={1}>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                <Box as="span" color={useColorModeValue("gray.900", "white")}>
                  {title === "Edit Folder" ? "EDIT " : "ADD "}
                </Box>
                <Box as="span" bgGradient={useColorModeValue("linear(to-r, blue.500, blue.700)", "linear(to-r, blue.300, blue.500)")} bgClip="text">
                  FOLDER
                </Box>
              </Text>
              <Text fontSize="10px" color={useColorModeValue("gray.600", "gray.400")} fontWeight="700" letterSpacing="0.2em" mt={0.5} textTransform="uppercase">
                Set the folder name and description
              </Text>
            </Box>
            <Button
              aria-label="Close"
              onClick={handleClose}
              isDisabled={isSubmitting}
              variant="solid"
              borderRadius="full"
              w={{ base: "36px", md: "42px" }} h={{ base: "36px", md: "42px" }}
              minW={{ base: "36px", md: "42px" }}
              p={0}
              bg={useColorModeValue("red.50", "rgba(239, 68, 68, 0.15)")}
              color={useColorModeValue("red.500", "red.400")}
              border="1px solid"
              borderColor={useColorModeValue("red.200", "red.900")}
              boxShadow="sm"
              _hover={{ bg: useColorModeValue("red.100", "red.800"), color: useColorModeValue("red.700", "red.200"), transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.95)" }}
              transition="all 0.2s"
              flexShrink={0}
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </Button>
          </HStack>
        </Box>

        <form onSubmit={handleSubmit}>
          <ModalBody px={{ base: 5, sm: 6 }} py={{ base: 5, sm: 6 }}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired isInvalid={!!nameError}>
                <HStack mb={2} justify="space-between" align="center">
                  <FormLabel m={0} color={headingColor} fontSize="sm" fontWeight="700">
                    Folder name
                  </FormLabel>
                  <Text color={mutedTextColor} fontSize="xs" fontWeight="600">
                    {folderName.length}/40
                  </Text>
                </HStack>
                <Input
                  value={folderName}
                  onChange={handleNameChange}
                  placeholder="e.g., Onboarding"
                  maxLength={40}
                  isDisabled={isSubmitting}
                  bg={fieldBackground}
                  borderColor={borderColor}
                  borderRadius="xl"
                  fontSize="sm"
                  px={4}
                  h="44px"
                  _focus={{
                    bg: fieldFocusBg,
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                  _hover={{
                    borderColor: useColorModeValue("gray.300", "gray.600")
                  }}
                  transition="all 0.2s"
                />
                <FormErrorMessage fontSize="xs" fontWeight="500">{nameError}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <HStack mb={2} justify="space-between" align="center">
                  <FormLabel m={0} color={headingColor} fontSize="sm" fontWeight="700">
                    Description
                    <Text as="span" ml={1.5} color={mutedTextColor} fontSize="xs" fontWeight="500" opacity={0.8}>
                      (Optional)
                    </Text>
                  </FormLabel>
                  <Text color={mutedTextColor} fontSize="xs" fontWeight="600">
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
                  borderRadius="xl"
                  fontSize="sm"
                  minH="100px"
                  maxH="140px"
                  px={4}
                  py={3}
                  resize="vertical"
                  _focus={{
                    bg: fieldFocusBg,
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                  _hover={{
                    borderColor: useColorModeValue("gray.300", "gray.600")
                  }}
                  transition="all 0.2s"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter px={{ base: 5, sm: 6 }} py={5} bg={footerBackground} borderTopWidth="1px" borderColor={borderColor}>
            <Flex w="full" direction={{ base: "column-reverse", sm: "row" }} justify="flex-end" gap={3}>
              <Button type="button" variant="ghost" size="sm" w={{ base: "full", sm: "auto" }} h="44px" px={6} borderRadius="xl" fontWeight="600" onClick={handleClose} isDisabled={isSubmitting} _hover={{ bg: useColorModeValue('gray.200', 'whiteAlpha.200') }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                w={{ base: "full", sm: "auto" }} 
                h="44px" 
                px={8} 
                borderRadius="xl" 
                fontWeight="700"
                letterSpacing="0.02em"
                bgGradient="linear(to-r, blue.500, blue.600)"
                color="white"
                isLoading={isSubmitting} 
                loadingText="Saving" 
                isDisabled={!folderName.trim() || !!nameError || folderName.trim().length < 6 || folderName.trim().length > 40}
                _hover={{
                  bgGradient: "linear(to-r, blue.600, blue.700)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.2s"
              >
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
