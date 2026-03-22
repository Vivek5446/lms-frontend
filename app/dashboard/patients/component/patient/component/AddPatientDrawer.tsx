import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/react";
import { initialValues } from "../../utils/constant";
import Form from "../../Form";

const AddPatientDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  handleAddSubmit,
  handleEditSubmit,
  thumbnail,
  setThumbnail,
  formLoading,
  getAllUsers,
}: any) => {
  return (
    <Drawer
      size="md"
      isOpen={isDrawerOpen.isOpen}
      placement="right"
      onClose={() =>
        setIsDrawerOpen({ isOpen: false, type: "add", data: null })
      }
      autoFocus={false}
    >
      <DrawerOverlay>
        <DrawerContent
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          maxW={{ base: "100%", md: "92%" }}
          width={{ base: "100%", md: "92%" }}
        >
          <DrawerCloseButton />
          <DrawerHeader
            bg="teal.500"
            color="white"
            fontSize="lg"
            fontWeight="bold"
            textAlign="center"
            bgGradient="linear(to-r, blue.400, purple.400)"
          >
            {isDrawerOpen?.type === "edit" ? "Edit Patient" : "Add Patient"}
          </DrawerHeader>
          <DrawerBody p={6} bg="gray.50">
            <Form
              initialData={
                isDrawerOpen?.type === "edit"
                  ? { ...initialValues, ...isDrawerOpen?.data }
                  : initialValues
              }
              onSubmit={
                isDrawerOpen?.type === "edit"
                  ? handleEditSubmit
                  : handleAddSubmit
              }
              isOpen={isDrawerOpen}
              onClose={() =>
                setIsDrawerOpen({ isOpen: false, type: "add", data: null })
              }
              thumbnail={thumbnail}
              isEdit={isDrawerOpen.type === "edit" ? true : false}
              setThumbnail={setThumbnail}
              loading={formLoading}
              getAllUsers={getAllUsers}
            />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default AddPatientDrawer;