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
  Icon,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaUserMd, FaUser, FaTooth, FaCalendarAlt } from "react-icons/fa";
import stores from "../../../store/stores";
import { observer } from "mobx-react-lite";
import { formatDate } from "../../../component/config/utils/dateUtils";

const statusColors: Record<string, string> = {
  scheduled: "blue",
  "in-progress": "yellow",
  completed: "green",
  cancelled: "red",
  shift: "purple",
  "no-show": "gray",
};

interface TreatviewProps {
  data: any;
}

const ToothTreatmentView = observer(({ data }: TreatviewProps) => {
  const [treatment, setTreatment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    toothTreatmentStore: { getToothTreatmentById },
    auth: { openNotification },
  } = stores;

  const fetchTreatment = async () => {
    if (!data?._id) return;

    setIsLoading(true);
    try {
      const response = await getToothTreatmentById({
        appointmentId: data._id,
      });

      if (response?.status === "success") {
        setTreatment(response?.data);
      }
    } catch (err: any) {
      openNotification({
        type: "error",
        title: "Failed to get treatment",
        message: err?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatment();
  }, [data?._id]);

  /* ---------------- Loading ---------------- */
  if (isLoading) {
    return (
      <Box p={6}>
        <Skeleton height="28px" width="40%" mb={4} />
        <SkeletonText noOfLines={4} spacing={3} />
      </Box>
    );
  }

  if (!treatment) {
    return <Text>No treatment found.</Text>;
  }

  const {
    patient,
    doctor,
    tooth,
    treatmentDate,
    status,
    notes,
    createdBy,
  } = treatment;

  const color = statusColors[status] || "gray";

  return (
    <Box p={6} bg="white" shadow="lg" borderRadius="xl">
      {/* Header */}
      <HStack justify="space-between" align="start" mb={6}>
        <Box>
          <Heading size="lg">
            {patient?.name || "Patient"}
          </Heading>
          <HStack mt={1}>
            <Icon as={FaTooth} color="gray.500" />
            <Text fontSize="sm" color="gray.600">
              FDI {tooth?.fdi || "--"} | U {tooth?.universal || "--"} | P{" "}
              {tooth?.palmer || "--"}
            </Text>
          </HStack>
        </Box>

        <Badge
          colorScheme={color}
          px={4}
          py={2}
          borderRadius="full"
          textTransform="capitalize"
        >
          {status}
        </Badge>
      </HStack>

      {/* Treatment Details */}
      <Card mb={6}>
        <CardHeader pb={2}>
          <Heading size="md">Treatment Details</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <VStack align="start" spacing={3}>
            <HStack>
              <Icon as={FaCalendarAlt} color="blue.500" />
              <Text>
                <b>Date:</b> {formatDate(treatmentDate)}
              </Text>
            </HStack>

            <Text>
              <b>Notes:</b> {notes || "No notes provided"}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Doctor */}
      <Card mb={6}>
        <CardHeader pb={2}>
          <Heading size="md">Doctor</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <HStack>
            <Icon as={FaUserMd} color="teal.500" />
            <Text>
              {doctor?.name} ({doctor?.code})
            </Text>
          </HStack>
        </CardBody>
      </Card>

      {/* Patient */}
      <Card mb={6}>
        <CardHeader pb={2}>
          <Heading size="md">Patient</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <HStack>
            <Icon as={FaUser} color="purple.500" />
            <Text>
              {patient?.name} ({patient?.code})
            </Text>
          </HStack>
        </CardBody>
      </Card>

      {/* Footer */}
      {createdBy && (
        <>
          <Divider />
          <Text fontSize="sm" color="gray.500" mt={3} textAlign="right">
            Created by <b>{createdBy?.name}</b> ({createdBy?.code})
          </Text>
        </>
      )}
    </Box>
  );
});

export default ToothTreatmentView;
