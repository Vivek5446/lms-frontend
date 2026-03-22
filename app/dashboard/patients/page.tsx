"use client";
import { Box, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { readFileAsBase64 } from "../../config/utils/utils";
import stores from "../../store/stores";
import { titles } from "./component/utils/constant";
import DeleteData from "./component/patient/component/DeleteUser";
import PatientTable from "./component/patient/PatientTable";
import { replaceLabelValueObjects } from "../../config/utils/function";
import { tablePageLimit } from "../../component/config/utils/variable";
import AddPatientDrawer from "./component/patient/component/AddPatientDrawer";

const PatientPage = () => {
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
  const [formLoading, setFormLoading] = useState(false);

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
        mobileNumber:
          formData.phones.find((it: any) => it.primary === true).number ||
          undefined,
        username:
          formData.emails.find((it: any) => it.primary === true).email ||
          undefined,
        gender: formData?.gender?.value || 1,
        type: "patient",
      })
        .then(() => {
          getAllUsers({ page: 1, limit: tablePageLimit, type: "patient" });
          setFormLoading(false);
          setIsDrawerOpen({ isOpen: false, type: "add", data: null });
          toast({
            title: "Patient Added.",
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
      mobileNumber:
        formData.phones.find((it: any) => it.primary === true).number ||
        undefined,
      username:
        formData.emails.find((it: any) => it.primary === true).email ||
        undefined,
      pic: formData?.pic,
      title: formData?.title?.label || titles[0].label,
      gender: formData?.gender?.value || 1,
    })
      .then(() => {
        getAllUsers({ page: 1, limit: tablePageLimit, type: "patient" });
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
      <PatientTable
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
              refrenceBy: rest?.refrenceBy,
            },
          });
        }}
      />
      {(isDrawerOpen.type === "add" || isDrawerOpen.type === "edit") && (
        <AddPatientDrawer
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          handleAddSubmit={handleAddSubmit}
          handleEditSubmit={handleEditSubmit}
          thumbnail={thumbnail}
          setThumbnail={setThumbnail}
          formLoading={formLoading}
          getAllUsers={getAllUsers}
        />
      )}
      {isDrawerOpen.type === "delete" && isDrawerOpen.open && (
        <DeleteData
          getData={() =>
            getAllUsers({ page: 1, limit: tablePageLimit, type: "patient" })
          }
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

export default PatientPage;