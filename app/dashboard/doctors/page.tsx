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
import { initialValues, titles } from "./component/utils/constant";
import DeleteData from "./component/Doctors/component/DeleteUser";
import DoctorsTable from "./component/Doctors/DoctorTable";
import { replaceLabelValueObjects } from "../../config/utils/function";
import { tablePageLimit } from "../../component/config/utils/variable";

const DoctorsPage = () => {
  const [formLoading, setFormLoading] = useState(false);
  const {
    userStore: { createUser, getAllUsers, updateUser },
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
      setFormLoading(true);
      const values = { ...formData };
      if (values.pic?.file && values.pic?.file?.length !== 0) {
        const buffer = await readFileAsBase64(values.pic?.file);
        const fileData = {
          buffer: buffer,
          filename: values.pic?.file?.name,
          type: values.pic?.file?.type,
          isAdd: values.pic?.isAdd || 1,
        };
        formData.pic = fileData;
      }

      createUser({
        ...values,
      ...(replaceLabelValueObjects(values) || {}),
        pic: formData?.pic || {},
        title: formData?.data,
        mobileNumber : formData.phones.find((it : any) => it.primary === true).number || undefined,
        username : formData.emails.find((it : any) => it.primary === true).email || undefined,
        gender: formData?.gender?.value || 1,
        type: "doctor",
      })
        .then(() => {
          getAllUsers({ page: 1, limit: tablePageLimit, type: "doctor" });
          setFormLoading(false);
          setIsDrawerOpen({ isOpen: false, type: "add", data: null });
          toast({
            title: "Doctors Added.",
            description: `${formData.name} has been successfully added.`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        })
        .catch((err: any) => {
          setFormLoading(false);
          toast({
            title: "failed to create",
            description: `${err?.message}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        });
    } catch (err: any) {
      setFormLoading(false);
      toast({
        title: "failed to create",
        description: `${err?.message}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditSubmit = async (values: any) => {
    const formData: any = {
      ...values,
    };
    setFormLoading(true);
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
      ...(replaceLabelValueObjects(values) || {}),
      mobileNumber : formData.phones.find((it : any) => it.primary === true).number || undefined,
      username : formData.emails.find((it : any) => it.primary === true).email || undefined,
      pic: formData?.pic,
      title: formData?.title?.label || titles[0].label,
      gender: formData?.gender?.value || 1
    })
      .then(() => {
        getAllUsers({ page: 1, limit: tablePageLimit, type: "doctor" });
        setFormLoading(false);
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
        setFormLoading(false);
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
      <DoctorsTable
        onDelete={(ft: any) => {
          setIsDrawerOpen({ open: true, type: "delete", data: ft });
        }}
        onAdd={() => setIsDrawerOpen({ isOpen: true, type: "add", data: null })}
        onEdit={(dt: any) => {
          const { profileDetails, ...rest } = dt;
          setIsDrawerOpen({
            isOpen: true,
            type: "edit",
            data: {
              ...rest,
              ...profileDetails?.personalInfo,
            },
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
                {isDrawerOpen?.type === "edit" ? "Edit Doctors" : "Add Doctors"}
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
                />
              </DrawerBody>
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
      )}
      {isDrawerOpen.type === "delete" && isDrawerOpen.open && (
        <DeleteData
          getData={() => getAllUsers({ page: 1, limit: tablePageLimit, type: "doctor" })}
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

export default DoctorsPage;
