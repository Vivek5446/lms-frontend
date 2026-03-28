import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import FormModel from "../../../../component/common/FormModel/FormModel";
import stores from "../../../../store/stores";

export default function DeleteChairModal({ isOpen, onClose, data, refresh }: any) {
  const { chairsStore, auth: { openNotification } } = stores;

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await chairsStore.deleteChair(data._id);
      openNotification({
        title: "Deleted Successfully",
        message: "Chair deleted successfully",
      });
      refresh();  // refresh table
      onClose();
    } catch (err: any) {
      openNotification({
        title: "Delete Failed",
        message: err?.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModel isCentered open={isOpen} close={onClose} title="Confirm Delete" size="md">
      <Box p={5} textAlign="center">
        <Text mb={3} fontSize="md" fontWeight="medium">
          Are you sure you want to <Text as="span" color="red.400">delete this chair?</Text>
        </Text>
        <Text fontSize="xs" color="gray.500">This action cannot be undone.</Text>
      </Box>
      <Flex justify="space-between" align="center" p={4} borderTopWidth="1px">
        <HStack spacing={3}>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={handleDelete}
            borderRadius="full"
            size="sm"
            isLoading={loading}
          >
            Delete
          </Button>
        </HStack>
        <Button variant="ghost" onClick={onClose} size="sm">
          Cancel
        </Button>
      </Flex>
    </FormModel>
  );
}
