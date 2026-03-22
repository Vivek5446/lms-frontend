"use client";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { readFileAsBase64 } from "../../config/utils/utils";
import stores from "../../store/stores";
import Form from "./component/Form";
import UserTable from "./component/users/UserTable";
import { initialValues, titles } from "./component/utils/constant";
import DeleteData from "./component/users/component/DeleteUser";
import { replaceLabelValueObjects } from "../../config/utils/function";

const AdminPage = () => {
  const [loading, setIsLoading] = useState(false);
  const {
    userStore: { createAdmin, getAllUsers, updateUser },
  } = stores;
  const [isDrawerOpen, setIsDrawerOpen] = useState<any>({
    isOpen: false,
    type: "add",
    data: null,
  });
  const [thumbnail, setThumbnail] = useState([]);
  const toast = useToast();

  const handleAddSubmit = async (formData: any) => {
    try {
      setIsLoading(true);
      const values = { ...formData };

      // --- Convert Image ---
      if (values.pic?.file) {
        const buffer = await readFileAsBase64(values.pic.file);

        values.pic = {
          buffer,
          filename: values.pic.file.name,
          type: values.pic.file.type,
          isAdd: values.pic.isAdd || 1,
        };
      }

      // ---- EXCLUDE PIC FROM PROFILE ----
      const keysToRemove = ["pic"];

      const profileDetails = Object.fromEntries(
        Object.entries(values).filter(([key]) => !keysToRemove.includes(key))
      );

      // ---- CLEAN PAYLOAD ----
      const payload = replaceLabelValueObjects({
        ...values,
        title: values.title,
        profileDetails,
      });

      createAdmin(payload)
        .then(() => {
          getAllUsers({ page: 1, limit: 30 });
          setIsDrawerOpen({ isOpen: false, type: "add", data: null });

          toast({
            title: "Admin Added.",
            description: `${formData.name} has been successfully added.`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setIsLoading(false);
        })
        .catch((err: any) => {
          setIsLoading(false);

          toast({
            title: "Failed to create",
            description: `${err?.message}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        });
    } catch (err: any) {
      setIsLoading(false);
      toast({
        title: "Failed to create",
        description: `${err?.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
    }
  };

  const handleEditSubmit = async (values: any) => {
    const formData: any = {
      ...values,
    };

    if (formData?.pic?.file && formData?.pic?.isAdd) {
      const buffer = await readFileAsBase64(formData?.pic?.file);
      const fileData = {
        buffer: buffer,
        filename: formData?.pic?.file?.name,
        type: formData?.pic?.file?.type,
        isDeleted: formData?.pic?.isDeleted || 0,
        isAdd: formData?.pic?.isAdd || 0,
      };
      formData.pic = fileData;
    } else {
      if (formData?.pic?.isDeleted) {
        const fileData = {
          isDeleted: formData?.pic?.isDeleted || 0,
          isAdd: formData?.pic?.isAdd || 0,
        };
        formData.pic = fileData;
      }
    }

    updateUser({
      ...values,
      pic: formData?.pic,
      title: formData?.title?.label || titles[0].label,
      availability: formData?.availability || [],
      profileDetails: { ...formData },
    })
      .then(() => {
        getAllUsers({ page: 1, limit: 30 });
        setIsDrawerOpen({ isOpen: false, type: "add", data: null });
        toast({
          title: "User updated.",
          description: `${formData.name} has been successfully added.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      })
      .catch((err: any) => {
        toast({
          title: "failed to update",
          description: `${err?.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  return (
    <Box>
      <UserTable
        title="Admins"
        onDelete={(ft: any) => {
          setIsDrawerOpen({ open: true, type: "delete", data: ft });
        }}
        onAdd={() => setIsDrawerOpen({ isOpen: true, type: "add", data: null })}
        onEdit={(dt: any) => {
          setIsDrawerOpen({
            isOpen: true,
            type: "edit",
            data: { ...dt, ...dt?.profileDetails?.personalInfo },
          });
        }}
      />
      {(isDrawerOpen.type === "add" || isDrawerOpen.type === "edit") && (
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
              maxW="80%"
              width="80%"
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
                {isDrawerOpen?.type === "edit" ? "Edit Admin" : "Add Admin"}
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
                  isLoading={loading}
                />
              </DrawerBody>
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
      )}
      {isDrawerOpen.type === "delete" && isDrawerOpen.open && (
        <DeleteData
          getData={getAllUsers}
          data={isDrawerOpen.data}
          isOpen={isDrawerOpen.open}
          onClose={() =>
            setIsDrawerOpen({ open: false, type: "add", data: null })
          }
        />
      )}
    </Box>
  );
};

export default AdminPage;