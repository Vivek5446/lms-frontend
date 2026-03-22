"use client";

import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Link,
  Icon,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaUser,
  FaMapMarkerAlt,
  FaLink,
  FaStickyNote,
  FaHistory,
  FaVideo,
} from "react-icons/fa";
import stores from "../../../store/stores";
import { observer } from "mobx-react-lite";

const statusColors: Record<string, string> = {
  scheduled: "blue",
  "in-progress": "yellow",
  completed: "green",
  cancelled: "red",
  shift: "purple",
  "no-show": "gray",
};

interface AppointmentDetailsViewProps {
  data: any;
}

const AppointmentDetailsView = observer(
  ({ data }: AppointmentDetailsViewProps) => {
    const [appointment, setAppointment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    console.log("the appointment data are", data)

    const {
      DoctorAppointment: { getAppointmentById },
      auth: { openNotification },
    } = stores;

    const fetchAppointmentView = async () => {
      if (!data?._id) return;

      setIsLoading(true);
      try {
        const response = await getAppointmentById({
          appointmentId: data._id,
        });

        if (response?.status === "success") {
          setAppointment(response?.data?.data);
        }
      } catch (err: any) {
        openNotification({
          type: "error",
          title: "Failed to get Appointment",
          message: err?.message || "Something went wrong",
        });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (data?._id) {
        fetchAppointmentView();
      }
    }, [data?._id]);

    /* ---------------- Skeleton Loader ---------------- */
    if (isLoading) {
      return (
        <Box p={6} bg="white" shadow="lg" borderRadius="xl">
          <HStack justify="space-between" mb={6}>
            <Box flex={1}>
              <Skeleton height="28px" width="60%" mb={2} />
              <SkeletonText noOfLines={2} spacing={2} />
            </Box>
            <Skeleton height="28px" width="100px" borderRadius="full" />
          </HStack>

          {[1, 2, 3].map((_, i) => (
            <Card key={i} mb={6}>
              <CardHeader>
                <Skeleton height="20px" width="200px" />
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <SkeletonCircle size="6" />
                    <Skeleton height="14px" width="220px" />
                  </HStack>
                  <HStack>
                    <SkeletonCircle size="6" />
                    <Skeleton height="14px" width="180px" />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Box>
      );
    }

    /* ---------------- Empty State ---------------- */
    if (!appointment) {
      return <Text>No appointment found.</Text>;
    }

    const {
      title,
      description,
      appointmentDate,
      startTime,
      endTime,
      mode,
      meetingLink,
      location,
      status,
      primaryDoctor,
      additionalDoctors,
      patient,
      notes,
      history,
      createdBy,
    } = appointment;

    const color = statusColors[status] || "gray";

    const formattedDate = appointmentDate
      ? new Date(appointmentDate).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    return (
      <Box p={6} mx="auto" bg="white" shadow="lg" borderRadius="xl">
        {/* Header */}
        <HStack justify="space-between" align="start" mb={6}>
          <Box>
            <Heading size="lg" color="gray.800">
              {description}
            </Heading>
          </Box>

          {status && (
            <Badge
              colorScheme={color}
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              textTransform="capitalize"
            >
              {status.replace(/-/g, " ")}
            </Badge>
          )}
        </HStack>

        {/* Appointment Details */}
        <Card mb={6}>
          <CardHeader pb={2}>
            <Heading size="md">Appointment Details</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack>
                <Icon as={FaCalendarAlt} color="blue.500" />
                <Text>
                  <b>Date:</b> {formattedDate}
                </Text>
              </HStack>

              <HStack>
                <Icon as={FaClock} color="blue.500" />
                <Text>
                  <b>Time:</b> {startTime || "N/A"} – {endTime || "N/A"}
                </Text>
              </HStack>

              <HStack>
                {mode === "online" ? (
                  <>
                    <Icon as={FaVideo} color="blue.500" />
                    <Text>
                      <b>Mode:</b> Online
                    </Text>
                    {meetingLink && (
                      <Link
                        href={meetingLink}
                        color="blue.500"
                        isExternal
                        ml={2}
                      >
                        <Icon as={FaLink} mr={1} />
                        Join Meeting
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Icon as={FaMapMarkerAlt} color="blue.500" />
                    <Text>
                      <b>Location:</b> {location || "Not provided"}
                    </Text>
                  </>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Doctors */}
        <Card mb={6}>
          <CardHeader pb={2}>
            <Heading size="md">Doctors</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack align="start" spacing={3}>
              {primaryDoctor && (
                <HStack>
                  <Icon as={FaUserMd} color="teal.500" />
                  <Text>
                    <b>Primary Doctor:</b> {primaryDoctor.name} (
                    {primaryDoctor.code})
                  </Text>
                </HStack>
              )}

              {additionalDoctors?.length > 0 && (
                <HStack>
                  <Icon as={FaUserMd} color="teal.400" />
                  <Text>
                    <b>Assisted By:</b>{" "}
                    {additionalDoctors
                      .map((d: any) => d?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Patient */}
        <Card mb={6}>
          <CardHeader pb={2}>
            <Heading size="md">Patient Information</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            {patient && (
              <HStack>
                <Icon as={FaUser} color="purple.500" />
                <Text>
                  <b>Name:</b> {patient.name} ({patient.code})
                </Text>
              </HStack>
            )}
          </CardBody>
        </Card>

        {/* Footer */}
        {createdBy && (
          <>
            <Divider />
            <Text fontSize="sm" color="gray.500" mt={3} textAlign="right">
              Created by <b>{createdBy.name}</b> ({createdBy.code})
            </Text>
          </>
        )}
      </Box>
    );
  }
);

export default AppointmentDetailsView;