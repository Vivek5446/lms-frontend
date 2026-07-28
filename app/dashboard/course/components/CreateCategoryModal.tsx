import stores from "@/app/store/stores";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    description: string,
    options?: {
      parentCategory?: string;
    }
  ) => Promise<void>;
  onCreated?: (categoryName: string) => void;
}

const MAX_NAME_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 180;

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = observer(
  ({ isOpen, onClose, onCreate, onCreated }) => {
    const toast = useToast();
    const initialFocusRef = useRef<HTMLSelectElement>(null);

    const borderColor = useColorModeValue(
      "gray.200",
      "whiteAlpha.200"
    );
    const mutedTextColor = useColorModeValue(
      "gray.500",
      "gray.400"
    );
    const fieldBackground = useColorModeValue(
      "gray.50",
      "whiteAlpha.50"
    );
    const footerBackground = useColorModeValue(
      "gray.50",
      "whiteAlpha.50"
    );

    const [selectedMasterId, setSelectedMasterId] = useState("");
    const [customName, setCustomName] = useState("");
    const [categoryDescription, setCategoryDescription] =
      useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] =
      useState(false);

    const masterCategories =
      stores.courseStore.masterCategories || [];

    useEffect(() => {
      if (!isOpen) return;

      let isMounted = true;

      const loadMasterCategories = async () => {
        setIsLoadingCategories(true);

        try {
          await stores.courseStore.fetchMasterCategories();
        } catch {
          toast({
            title: "Unable to load categories",
            description:
              "The master category list could not be loaded.",
            status: "error",
            duration: 4000,
            isClosable: true,
            position: "top-right",
          });
        } finally {
          if (isMounted) {
            setIsLoadingCategories(false);
          }
        }
      };

      loadMasterCategories();

      return () => {
        isMounted = false;
      };
    }, [isOpen, toast]);

    const resetForm = () => {
      setSelectedMasterId("");
      setCustomName("");
      setCategoryDescription("");
    };

    const handleClose = () => {
      if (isSubmitting) return;

      resetForm();
      onClose();
    };

    const handleMasterSelectChange = (
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const selectedId = event.target.value;

      setSelectedMasterId(selectedId);

      const selectedMaster = masterCategories.find(
        (category) =>
          category._id === selectedId ||
          category.name === selectedId
      );

      setCustomName(selectedMaster?.name || "");
    };

    const handleSubmit = async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      const selectedMaster = masterCategories.find(
        (category) =>
          category._id === selectedMasterId ||
          category.name === selectedMasterId
      );

      const finalName = (
        customName ||
        selectedMaster?.name ||
        ""
      ).trim();

      const trimmedDescription =
        categoryDescription.trim();

      if (!selectedMasterId) {
        toast({
          title: "Select a category",
          description:
            "Please select a category from the master list.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        return;
      }

      if (!finalName) {
        toast({
          title: "Folder name required",
          description:
            "Please enter a display name for the folder.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        await onCreate(finalName, trimmedDescription, {
          parentCategory: selectedMaster?._id || undefined,
        });

        toast({
          title: "Category folder created",
          description: `"${finalName}" is ready for storing courses.`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });

        onCreated?.(finalName);
        resetForm();
        onClose();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create category folder";

        toast({
          title: "Unable to create folder",
          description: message,
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
        initialFocusRef={initialFocusRef}
        isCentered
        size="md"
        motionPreset="slideInBottom"
        closeOnEsc={!isSubmitting}
        closeOnOverlayClick={!isSubmitting}
      >
        <ModalOverlay
          bg="blackAlpha.400"
          backdropFilter="blur(5px)"
        />

        <ModalContent
          mx={4}
          maxW="460px"
          borderRadius="18px"
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
          boxShadow="xl"
        >
          <ModalHeader
            px={{ base: 5, sm: 6 }}
            pt={5}
            pb={4}
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            <Box pr={8}>
              <Text
                fontSize="md"
                fontWeight="700"
                lineHeight="short"
              >
                Create Category Folder
              </Text>

              <Text
                mt={1}
                fontSize="xs"
                fontWeight="400"
                color={mutedTextColor}
                lineHeight="tall"
              >
                Select a master category and create a folder
                for organizing courses.
              </Text>
            </Box>
          </ModalHeader>

          <ModalCloseButton
            top={4}
            right={4}
            size="sm"
            borderRadius="md"
            isDisabled={isSubmitting}
          />

          <form onSubmit={handleSubmit}>
            <ModalBody
              px={{ base: 5, sm: 6 }}
              py={5}
            >
              <VStack
                spacing={4}
                align="stretch"
              >
                <FormControl isRequired>
                  <FormLabel
                    mb={1.5}
                    fontSize="sm"
                    fontWeight="600"
                  >
                    Master Category
                  </FormLabel>

                  <Select
                    ref={initialFocusRef}
                    value={selectedMasterId}
                    onChange={handleMasterSelectChange}
                    placeholder={
                      isLoadingCategories
                        ? "Loading categories..."
                        : "Select a category"
                    }
                    isDisabled={
                      isSubmitting || isLoadingCategories
                    }
                    bg={fieldBackground}
                    borderRadius="10px"
                    fontSize="sm"
                    h="42px"
                    _focusVisible={{
                      boxShadow: "outline",
                    }}
                  >
                    {masterCategories.map((category) => (
                      <option
                        key={category._id || category.name}
                        value={category._id || category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                  </Select>

                  <FormHelperText
                    mt={1.5}
                    fontSize="xs"
                    color={mutedTextColor}
                    lineHeight="normal"
                  >
                    Categories are managed through the
                    Superadmin Master List.
                  </FormHelperText>
                </FormControl>

                <FormControl isRequired>
                  <HStack
                    mb={1.5}
                    justify="space-between"
                    align="center"
                  >
                    <FormLabel
                      m={0}
                      fontSize="sm"
                      fontWeight="600"
                    >
                      Folder Display Name
                    </FormLabel>

                    <Text
                      fontSize="10px"
                      color={mutedTextColor}
                      fontWeight="500"
                    >
                      {customName.length}/{MAX_NAME_LENGTH}
                    </Text>
                  </HStack>

                  <Input
                    value={customName}
                    onChange={(event) =>
                      setCustomName(event.target.value)
                    }
                    placeholder="Folder name"
                    maxLength={MAX_NAME_LENGTH}
                    isDisabled={isSubmitting}
                    bg={fieldBackground}
                    borderRadius="10px"
                    fontSize="sm"
                    h="42px"
                    _focusVisible={{
                      boxShadow: "outline",
                    }}
                  />
                </FormControl>

                <FormControl>
                  <HStack
                    mb={1.5}
                    justify="space-between"
                    align="center"
                  >
                    <FormLabel
                      m={0}
                      fontSize="sm"
                      fontWeight="600"
                    >
                      Description
                      <Text
                        as="span"
                        ml={1}
                        fontSize="xs"
                        fontWeight="400"
                        color={mutedTextColor}
                      >
                        Optional
                      </Text>
                    </FormLabel>

                    <Text
                      fontSize="10px"
                      color={mutedTextColor}
                      fontWeight="500"
                    >
                      {categoryDescription.length}/
                      {MAX_DESCRIPTION_LENGTH}
                    </Text>
                  </HStack>

                  <Textarea
                    value={categoryDescription}
                    onChange={(event) =>
                      setCategoryDescription(
                        event.target.value
                      )
                    }
                    placeholder="Briefly describe the courses in this folder"
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    isDisabled={isSubmitting}
                    bg={fieldBackground}
                    borderRadius="10px"
                    fontSize="sm"
                    minH="76px"
                    maxH="100px"
                    py={2.5}
                    resize="none"
                    _focusVisible={{
                      boxShadow: "outline",
                    }}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter
              px={{ base: 5, sm: 6 }}
              py={3.5}
              bg={footerBackground}
              borderTopWidth="1px"
              borderColor={borderColor}
            >
              <HStack
                w="full"
                justify="flex-end"
                spacing={2.5}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  isDisabled={isSubmitting}
                  borderRadius="9px"
                  px={4}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="sm"
                  isLoading={isSubmitting}
                  loadingText="Creating"
                  borderRadius="9px"
                  px={5}
                >
                  Create Folder
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  }
);

CreateCategoryModal.displayName = "CreateCategoryModal";

export default CreateCategoryModal;