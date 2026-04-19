import CustomInput from "@/app/component/config/component/customInput/CustomInput";
import { departmentStore } from "@/app/store/departmentStore/departmentStore";
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
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiBriefcase, FiLayers } from "react-icons/fi";
// import CustomInput from "@/components/Common/CustomInput"; // Adjust path as needed

type AddDepartmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  companyId?: string;
  companyName?: string;
  onSaved?: (_mode: "create" | "update") => Promise<void> | void;
};

const AddDepartmentModal = ({
  isOpen,
  onClose,
  initialData,
  companyId,
  companyName,
  onSaved,
}: AddDepartmentModalProps) => {
  const [formData, setFormData] = useState({ name: "", code: "" });
  
  // Color tokens for a "Linear" feel
  const bgColor = useColorModeValue("white", "gray.900");
  const companyBadgeBg = useColorModeValue("gray.50", "whiteAlpha.100");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.departmentName || "",
        code: initialData.code || "",
      });
    } else {
      setFormData({ name: "", code: "" });
    }
  }, [initialData, isOpen]);

  const handleSave = async () => {
    const departmentName = formData.name.trim();
    const code = formData.code.trim();
    const mode = initialData?._id ? "update" : "create";

    try {
      if (mode === "update") {
        await departmentStore.updateDepartment(initialData._id, {
          departmentName,
          code,
        });
      } else {
        await departmentStore.createDepartment({
          departmentName,
          code,
          companyId,
        });
      }

      await onSaved?.(mode);
      onClose();
    } catch (error) {
      console.error("Failed to save department:", error);
    }
  };

  const isDisabled =
    !formData.name.trim() ||
    !formData.code.trim() ||
    (!initialData?._id && !companyId);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isCentered 
      motionPreset="slideInBottom"
      // size="sm"
    >
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent 
        borderRadius="3xl" 
        boxShadow="2xl"
        bg={bgColor}
      >
        <ModalHeader borderBottomWidth="1px" fontSize="lg" fontWeight="semibold">
          <HStack spacing={2}>
            <Icon as={initialData ? FiLayers : FiLayers} color="blue.500" />
            <Text fontWeight={600}>{initialData ? "Update Department" : "New Department"}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top="12px" />

        <ModalBody>
          <Stack spacing={5}>
            {/* Context Header: Shows which company this belongs to */}
            <Box 
              p={3} 
              bg={companyBadgeBg} 
              borderRadius="lg" 
              borderWidth="1px"
              borderStyle="dashed"
            >
              {/* <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                Parent Entity
              </Text> */}
              <HStack>
                <Icon as={FiBriefcase} size={14} color="gray.400" />
                <Text fontSize="sm" fontWeight="medium">
                  {companyName || "No company selected"}
                </Text>
              </HStack>
            </Box>

            <CustomInput
              label="Department Name"
              placeholder="e.g. Engineering"
              name="name"
              value={formData.name}
              onChange={(e: any) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
            />

            <CustomInput
              label="Department Code"
              placeholder="e.g. ENG-01"
              name="code"
              value={formData.code}
              onChange={(e: any) =>
                setFormData((p) => ({ ...p, code: e.target.value }))
              }
            />
          </Stack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button 
            variant="ghost" 
            onClick={onClose}
            fontWeight="medium"
          >
            Cancel
          </Button>

          <Button
            colorScheme="blue"
            px={6}
            fontWeight="bold"
            onClick={handleSave}
            isDisabled={isDisabled}
            isLoading={departmentStore.isSubmitting}
            loadingText={initialData ? "Saving..." : "Creating..."}
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.2s"
          >
            {initialData ? "Update Changes" : "Create Department"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddDepartmentModal;