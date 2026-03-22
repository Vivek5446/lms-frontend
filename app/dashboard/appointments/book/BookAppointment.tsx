"use client";
import React, { useState, useCallback } from "react";
import { Box, Heading, Flex, Button, Text, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import DentistScheduler from "../../daily-report/component/DentistScheduler/DentistScheduler";
import stores from "../../../store/stores";
import moment from "moment";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { tablePageLimit } from "../../../component/config/utils/variable";
import AddAppointmentForm from "../component/AddForm";
import EditAppointmentForm from "../component/EditForm";
import { SLOT_DURATION } from "../../daily-report/utils/constant";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";

const BookAppointmentPage = observer(() => {
    const {
        DoctorAppointment: { getDoctorAppointment },
        auth: { openNotification, userType, user },
    } = stores;

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [createdAppointmentByCalender, setCreatedAppointmentByCalender] = useState(false);
    const [selectedDateAndTime, setSelectedDateTime] = useState<any>({
        open: false,
        chair: undefined,
        chairId: "",
        selectedDate: new Date(),
        time: "",
        start: null,
        end: null,
        type: "add",
    });

    const isPatient = userType === "patient";
    const patientDetails = isPatient ? user : null;

    const applyGetAllRecords = useCallback(
        ({ page = 1, limit = tablePageLimit, reset = false } = {}) => {
            const query: any = { page, limit };
            getDoctorAppointment(query)
                .then(() => { })
                .catch((err) => {
                    openNotification({
                        type: "error",
                        title: "Failed to get Appointments",
                        message: err?.message,
                    });
                });
        },
        [getDoctorAppointment, openNotification]
    );

    const handleOpenAddForm = (data: any) => {
        const selectedDateStr = moment(data.selectedDate).format("YYYY-MM-DD");
        const start = moment(`${selectedDateStr} ${data.time}`, "YYYY-MM-DD HH:mm");
        const end = start.clone().add(SLOT_DURATION, "minutes");

        setSelectedDateTime({
            selectedDate: data?.selectedDate || new Date(),
            start: start.toDate(),
            end: end.toDate(),
            time: data.time,
            chairId: data.chair?.id,
            chair: {
                label: data?.chair?.name,
                value: data?.chair?.id,
            },
            data: data?.appointment,
            open: true,
            type: data?.mode === "edit" ? "edit" : "add",
        });
    };

    const goToPreviousDate = () => {
        setSelectedDate((prev: any) => moment(prev).subtract(1, "day").toDate());
    };

    const goToNextDate = () => {
        setSelectedDate((prev: any) => moment(prev).add(1, "day").toDate());
    };

    const bgColor = useColorModeValue("gray.50", "gray.900");

    return (
        <Box p={4} bg={bgColor} minH="100vh">
            <Flex align="center" justify="space-between" mb={6} bg={useColorModeValue("white", "gray.800")} p={4} borderRadius="xl" boxShadow="sm">
                <Heading size="lg">Book Appointment</Heading>
                <Flex align="center" gap={3}>
                    <Button size="md" colorScheme="blue" onClick={goToPreviousDate} p={1}>
                        <ChevronLeftIcon fontSize={28} />
                    </Button>
                    <Text fontWeight="700" fontSize="lg" minW="220px" textAlign="center">
                        {moment(selectedDate).format("dddd, DD MMM YYYY")}
                    </Text>
                    <Button size="md" colorScheme="blue" onClick={goToNextDate} p={1}>
                        <ChevronRightIcon fontSize={28} />
                    </Button>
                </Flex>
            </Flex>

            <Box bg={useColorModeValue("white", "gray.800")} borderRadius="xl" boxShadow="md" p={2}>
                <DentistScheduler
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    handleTimeSlots={handleOpenAddForm}
                    createdAppointmentByCalender={createdAppointmentByCalender}
                />
            </Box>

            <CustomDrawer
                width="90vw"
                open={selectedDateAndTime.open}
                close={() =>
                    setSelectedDateTime({
                        ...selectedDateAndTime,
                        open: false,
                    })
                }
                title={
                    selectedDateAndTime.type === "add"
                        ? `New Appointment - ${moment(selectedDateAndTime.start).format("HH:mm")}`
                        : `Edit Appointment - ${moment(selectedDateAndTime.start).format("HH:mm")}`
                }
            >
                <Box p={2}>
                    {selectedDateAndTime.type === "add" ? (
                        <AddAppointmentForm
                            isPatient={isPatient}
                            patientDetails={patientDetails}
                            applyGetAllRecords={applyGetAllRecords}
                            close={() => {
                                setCreatedAppointmentByCalender(!createdAppointmentByCalender);
                                setSelectedDateTime({ ...selectedDateAndTime, open: false });
                            }}
                            selectedDateAndTime={selectedDateAndTime}
                        />
                    ) : (
                        <EditAppointmentForm
                            isPatient={isPatient}
                            patientDetails={patientDetails}
                            applyGetAllRecords={applyGetAllRecords}
                            close={() => {
                                setSelectedDateTime({ ...selectedDateAndTime, open: false });
                                setCreatedAppointmentByCalender(!createdAppointmentByCalender);
                            }}
                            selectedDateAndTime={selectedDateAndTime}
                        />
                    )}
                </Box>
            </CustomDrawer>
        </Box>
    );
});

export default BookAppointmentPage;
