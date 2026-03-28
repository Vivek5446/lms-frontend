"use client";

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";

type AddPatientDrawerProps = {
  isDrawerOpen?: { isOpen?: boolean } | boolean;
  setIsDrawerOpen?: (value: any) => void;
  handleAddSubmit?: (value: any) => void | Promise<void>;
  thumbnail?: any[];
  setThumbnail?: (value: any) => void;
  formLoading?: boolean;
};

const AddPatientDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  formLoading = false,
}: AddPatientDrawerProps) => {
  const isOpen =
    typeof isDrawerOpen === "boolean" ? isDrawerOpen : !!isDrawerOpen?.isOpen;

  const onClose = () => {
    setIsDrawerOpen?.({ isOpen: false, type: "add", data: null });
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Add Patient</DrawerHeader>

        <DrawerBody>
          <Stack spacing={4}>
            <Text color="gray.700">
              The original patient creation drawer is not present in this codebase.
            </Text>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              bg="gray.50"
              color="gray.600"
            >
              Patient creation from this appointment form is temporarily unavailable.
              Please create the patient from the patient management flow, then return
              here to complete the appointment.
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button onClick={onClose} isLoading={formLoading}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddPatientDrawer;
