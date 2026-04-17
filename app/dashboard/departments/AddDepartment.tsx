import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import { departmentStore } from "@/app/store/departmentStore/departmentStore";

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

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.departmentName,
        code: initialData.code,
      });
      return;
    }

    setFormData({ name: "", code: "" });
  }, [initialData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    } catch {}
  };

  const isDisabled =
    !formData.name.trim() ||
    !formData.code.trim() ||
    (!initialData?._id && !companyId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialData ? "Edit Department" : "Create Department"}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Selected Company</FormLabel>
              <Input
                value={companyName || "No company selected"}
                isReadOnly
                variant="filled"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Department Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Department Code</FormLabel>
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
              />
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>

          <Button
            colorScheme="blue"
            onClick={handleSave}
            isDisabled={isDisabled}
            isLoading={departmentStore.isSubmitting}
            loadingText={initialData ? "Updating" : "Creating"}
          >
            {initialData ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddDepartmentModal;
