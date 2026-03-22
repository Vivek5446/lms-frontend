import React, { useState, useEffect } from "react";
import {
  VStack,
  Button,
  Box,
  Flex,
} from "@chakra-ui/react";
import FormModel from "../../../component/common/FormModel/FormModel";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { appointStatus } from "../constant";
import { replaceLabelValueObjects } from "../../../config/utils/function";
import stores from "../../../store/stores";
import moment from "moment";

const AppointChangeStatus = ({
  open,
  close,
  appointmentData,
  applyGetAllRecords,
  setOpenShiftModal
}: any) => {
  const { auth: { openNotification }, DoctorAppointment: { updateAppointmentStatus } } = stores;

  const [formData, setFormData] = useState<any>({
    status: "",
    remarks: "",
  });

  const [shiftDate, setShiftDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointmentData) {
      setFormData({
        status:
          appointStatus.find(
            (it: any) => it.value === appointmentData?.status
          ) || appointStatus[0],
        remarks: appointmentData.remarks || "",
      });
      setShiftDate("");
    }
  }, [appointmentData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleShiftDateSelect = (date: string) => {
    setShiftDate(date);

    setTimeout(() => {
      setOpenShiftModal({
        ...appointmentData,
        appointmentDate: date,
      });
    }, 200);
  };

  const onSubmit = () => {
    setLoading(true);

    updateAppointmentStatus(
      replaceLabelValueObjects({
        ...formData,
        id: appointmentData?._id,
      })
    )
      .then(() => {
        applyGetAllRecords({});
        openNotification({
          type: "success",
          title: "Status Updated",
          message: "Appointment status updated successfully",
        });
        close();
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
        <Flex gap={3} align="center">
          <Box flex={1}>
            <CustomInput
              label="Status"
              type="select"
              value={formData.status}
              options={appointStatus.filter((it : any) => it.value !== "shift")}
              name="status"
              isPortal
              onChange={(e: any) =>
                setFormData({ ...formData, status: e })
              }
            />
          </Box>
        </Flex>
        <Box display="none">
        {/* ---- Shift Date Picker (only when status = shift) ---- */}
        {formData.status?.value === "shift" && (
          <CustomInput
            label="Shift To Date"
            type="date"
            name="date"
            value={shiftDate}
            onChange={(e: any) => handleShiftDateSelect(e.target.value)}
          />
        )}
        </Box>

        <CustomInput
          name="remarks"
          onChange={handleChange}
          label="Remarks"
          type="textarea"
          placeholder="Add any remarks..."
        />

        <Box textAlign="right">
          <Button
            colorScheme="blue"
            onClick={onSubmit}
            isLoading={loading}
          >
            Update Status
          </Button>
        </Box>
      </VStack>
    </FormModel>
  );
};

export default AppointChangeStatus;
