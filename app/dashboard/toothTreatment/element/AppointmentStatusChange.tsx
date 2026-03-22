import React, { useState, useEffect } from "react";
import {
  VStack,
  Button,
  Box,
} from "@chakra-ui/react";
import FormModel from "../../../component/common/FormModel/FormModel";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { appointStatus } from "../constant";
import { replaceLabelValueObjects } from "../../../config/utils/function";
import stores from "../../../store/stores";

const AppointChangeStatus = ({
  open,
  close,
  appointmentData,
  applyGetAllRecords
}: any) => {
  const {auth :  {openNotification}, DoctorAppointment : {updateAppointmentStatus}} = stores
  const [formData, setFormData] = useState({
    status: "",
    remarks: "",
  });
  const [loading,setLoading] = useState(false)

  useEffect(() => {
    if (appointmentData) {
      setFormData({
        status: appointmentData.status || "Pending",
        remarks: appointmentData.remarks || "",
      });
    }
  }, [appointmentData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = () => {
      setLoading(true)
      updateAppointmentStatus(replaceLabelValueObjects({...formData, id : appointmentData?._id}))
        .then(() => {
          applyGetAllRecords({})
          openNotification({
            type: "success",
            title: "Status Updated",
            message: "Appointment has been Created Successfully",
          });
          close()
        })
        .catch((err) => {
          openNotification({
            type: "error",
            title: "Failed to Update Status",
            message: err?.message,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    };

  return (
    <FormModel
      open={open}
      close={close}
      isCentered
      size="xl"
      title="Update Appointment Status"
      footer={false}
    >
      <VStack spacing={4} p={3} align="stretch">
        <CustomInput
          label="Status"
          type="select"
          value={formData.status}
          options={appointStatus}
          name="status"
          isPortal
          onChange={(e: any) => setFormData({ ...formData, status: e })}
        />
        <CustomInput
          name="remarks"
          onChange={handleChange}
          label="Remarks"
          type="textarea"
          placeholder="Add any remarks..."
        />
        <Box textAlign="right">
          <Button colorScheme="blue" onClick={onSubmit} isLoading={loading}>
            Update Status
          </Button>
        </Box>
      </VStack>
    </FormModel>
  );
};

export default AppointChangeStatus;