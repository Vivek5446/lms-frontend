import { toJS } from "mobx";
import React from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Divider,
} from "@chakra-ui/react";

const RecallViewAppointment = ({ data }: any) => {
  const recall = toJS(data);
  if (!recall) return null;

  const statusColor: any = {
    pending: "orange.400",
    scheduled: "blue.400",
    completed: "green.500",
    cancelled: "red.500",
  };

  const Row = ({ label, value }: any) => (
    <Flex
      py={3}
      align="center"
      justify="space-between"
      _notLast={{
        borderBottom: "1px dashed",
        borderColor: "gray.200",
      }}
    >
      <Text
        fontSize="sm"
        color="gray.500"
        letterSpacing="0.3px"
      >
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="600"
        color="gray.800"
        textAlign="right"
      >
        {value || "--"}
      </Text>
    </Flex>
  );

  return (
    <Flex
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      minH="320px"
    >
      {/* ===== LEFT STATUS PANEL ===== */}
      <Flex
        direction="column"
        align="center"
        justify="space-between"
        w="130px"
        bg="gray.900"
        color="white"
        px={3}
        py={4}
      >
        <Badge
          bg={statusColor[recall.status]}
          color="white"
          px={3}
          py={1}
          borderRadius="sm"
          textTransform="uppercase"
          fontSize="0.7rem"
          letterSpacing="0.5px"
        >
          {recall.status}
        </Badge>

        <Box textAlign="center">
          <Text fontSize="xs" opacity={0.6}>
            Recall Date
          </Text>
          <Text fontWeight="bold" fontSize="sm">
            {recall.recallDate
              ? new Date(recall.recallDate).toLocaleDateString()
              : "--"}
          </Text>
        </Box>

        <Box textAlign="center">
          <Text fontSize="xs" opacity={0.6}>
            Created On
          </Text>
          <Text fontSize="xs">
            {new Date(recall.createdAt).toLocaleDateString()}
          </Text>
        </Box>
      </Flex>

      {/* ===== RIGHT DETAILS PANEL ===== */}
      <Box flex="1" px={6} py={5}>

        <Row
          label="Patient"
          value={`${recall.patient?.name} (${recall.patient?.code})`}
        />
        <Row
          label="Patient Mobile"
          value={recall.patient?.mobileNumber}
        />
        <Row
          label="Doctor"
          value={`${recall.doctor?.name} (${recall.doctor?.code})`}
        />
        <Row
          label="Created By"
          value={`${recall.createdDetails?.name} (${recall.createdDetails?.code})`}
        />

        <Divider my={5} />

        {/* Reason */}
        <Box>
          <Text
            fontSize="sm"
            color="gray.500"
            mb={2}
            letterSpacing="0.3px"
          >
            Recall Reason
          </Text>

          <Box
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            p={4}
            borderRadius="md"
          >
            <Text
              fontSize="sm"
              color="gray.800"
              lineHeight="1.7"
            >
              {recall.reason}
            </Text>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default RecallViewAppointment;
