"use client";
import React, { useState, useCallback } from "react";
import { Box, Heading, Flex, Button, Text, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import WaitingRoomScheduler from "./component/WaitingRoomScheduler";
import moment from "moment";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { tablePageLimit } from "../../../component/config/utils/variable";
import { SLOT_DURATION } from "../../daily-report/utils/constant";
import CustomDrawer from "../../../component/common/Drawer/CustomDrawer";
import stores from "../../../store/stores";

const WaitingRoomPage = observer(() => {
    const {
        auth: { openNotification, userType, user },
    } = stores;

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [createdAppointmentByCalender, setCreatedAppointmentByCalender] = useState(false);

    // We keep state but don't use it for booking since it's disabled
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
                <Heading size="lg">Waiting Room</Heading>
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
                <WaitingRoomScheduler
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    handleTimeSlots={() => { }} // Disabled function for safety
                    createdAppointmentByCalender={createdAppointmentByCalender}
                    filterStatus="arrived" // Only show arrived
                    disableBooking={true} // Disable adding new appointments
                    shouldNotEditIcon={true} // Hide edit icon if applicable
                />
            </Box>
        </Box>
    );
});

export default WaitingRoomPage;
