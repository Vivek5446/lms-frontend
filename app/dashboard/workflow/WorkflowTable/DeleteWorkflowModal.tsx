import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import stores from "../../../store/stores";
// import stores from "../../../../store/stores";

const DeleteWorkflowModal = ({ isOpen, onClose, data, refresh }: any) => {
  const { workflowStore } = stores;
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await workflowStore.deleteWorkflow(data._id);
      toast({
        title: "Workflow Deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
      refresh();
    } catch (err: any) {
      toast({
        title: "Failed to delete",
        description: err?.message || "Something went wrong",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Workflow</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Are you sure you want to delete{" "}
            <strong>{data?.workflowData?.workflowName}</strong>? This will also
            delete the logo from storage and cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" isLoading={loading} onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteWorkflowModal;