"use client";

import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiBriefcase, FiCalendar, FiEdit2, FiSearch, FiUserPlus, FiUsers } from "react-icons/fi";
import type { BatchDetailsItem } from "@/app/store/batchStore/batchStore";

function getStatusColor(status: string) {
  if (status === "expired") {
    return "red";
  }

  if (status === "completed") {
    return "green";
  }

  if (status === "expiring_soon") {
    return "orange";
  }

  return "blue";
}

function formatDuration(batch?: BatchDetailsItem | null) {
  if (!batch) {
    return "Not set";
  }

  const start = batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "Not set";
  const end = batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "Open ended";
  return `${start} - ${end}`;
}

type BatchDetailsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  batch: BatchDetailsItem | null;
  isLoading?: boolean;
  canManage?: boolean;
  onEditBatch?: () => void;
  onManageUsers?: () => void;
};

export default function BatchDetailsDrawer({
  isOpen,
  onClose,
  batch,
  isLoading = false,
  canManage = false,
  onEditBatch,
  onManageUsers,
}: BatchDetailsDrawerProps) {
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setUserSearch("");
    }
  }, [isOpen, batch?._id]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query || !batch?.users?.length) {
      return batch?.users || [];
    }

    return batch.users.filter((user) =>
      `${user.name} ${user.email || ""} ${user.department || ""}`.toLowerCase().includes(query)
    );
  }, [batch?.users, userSearch]);

  return (
    <Drawer isOpen={isOpen} placement="right" size="xl" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <Stack spacing={3} pr={10}>
            <HStack justify="space-between" align="start">
              <Box>
                <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="0.08em">
                  Batch Details
                </Text>
                <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
                  {batch?.name || "Batch"}
                </Text>
              </Box>
              {batch ? (
                <Badge colorScheme={getStatusColor(batch.status)} borderRadius="full" px={3} py={1}>
                  {batch.status === "expiring_soon" ? "Expiring soon" : batch.status}
                </Badge>
              ) : null}
            </HStack>

            {canManage ? (
              <HStack spacing={3}>
                <Button leftIcon={<Icon as={FiEdit2} />} colorScheme="blue" onClick={onEditBatch}>
                  Edit batch
                </Button>
                <Button leftIcon={<Icon as={FiUserPlus} />} variant="outline" onClick={onManageUsers}>
                  Add or remove users
                </Button>
              </HStack>
            ) : null}
          </Stack>
        </DrawerHeader>

        <DrawerBody py={6}>
          {isLoading ? (
            <HStack justify="center" py={16}>
              <Spinner />
              <Text color="gray.600">Loading batch details...</Text>
            </HStack>
          ) : !batch ? (
            <Box borderWidth="1px" borderRadius="2xl" borderStyle="dashed" p={8} textAlign="center" bg="gray.50">
              <Text fontWeight="medium">Select a batch to inspect it.</Text>
            </Box>
          ) : (
            <Stack spacing={6}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box borderWidth="1px" borderRadius="2xl" p={4} bg="gray.50">
                  <HStack spacing={2} color="gray.700">
                    <Icon as={FiBriefcase} />
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                      Company
                    </Text>
                  </HStack>
                  <Text mt={2} fontWeight="semibold">
                    {batch.company?.company_name || "Not available"}
                  </Text>
                </Box>

                <Box borderWidth="1px" borderRadius="2xl" p={4} bg="gray.50">
                  <HStack spacing={2} color="gray.700">
                    <Icon as={FiUsers} />
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                      Created By
                    </Text>
                  </HStack>
                  <Text mt={2} fontWeight="semibold">
                    {batch.createdBy?.name || batch.createdBy?.email || "Unknown"}
                  </Text>
                </Box>

                <Box borderWidth="1px" borderRadius="2xl" p={4} bg="gray.50">
                  <HStack spacing={2} color="gray.700">
                    <Icon as={FiCalendar} />
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
                      Duration
                    </Text>
                  </HStack>
                  <Text mt={2} fontWeight="semibold">
                    {formatDuration(batch)}
                  </Text>
                </Box>
              </SimpleGrid>

              <Box borderWidth="1px" borderRadius="3xl" p={5}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Courses
                  </Text>
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                    {batch.courses.length} total
                  </Badge>
                </HStack>

                <Stack spacing={3}>
                  {batch.courses.map((course) => (
                    <Box key={course._id} borderWidth="1px" borderRadius="2xl" p={4} bg="gray.50">
                      <HStack justify="space-between" align="start" spacing={4}>
                        <HStack align="start" spacing={3}>
                          <Box borderRadius="xl" bg="blue.100" color="blue.700" p={2.5}>
                            <Icon as={FiBookOpen} boxSize={4} />
                          </Box>
                          <Box>
                            <Text fontWeight="semibold">{course.title}</Text>
                            <Text mt={1} color="gray.600" fontSize="sm" noOfLines={2}>
                              {course.description?.text || "No description available."}
                            </Text>
                            <Text mt={2} fontSize="sm" color="gray.500">
                              {course.sourceLabel || "From batch"}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge colorScheme={course.status === "completed" ? "green" : "blue"} borderRadius="full" px={3} py={1}>
                          {course.status.replace(/_/g, " ")}
                        </Badge>
                      </HStack>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box borderWidth="1px" borderRadius="3xl" p={5}>
                <HStack justify="space-between" mb={4} align="end">
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold">
                      Users
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Search within this batch to quickly inspect assigned learners.
                    </Text>
                  </Box>
                  <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                    {filteredUsers.length} shown
                  </Badge>
                </HStack>

                <InputGroup mb={4}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Search by name, email, or department"
                  />
                </InputGroup>

                <Stack spacing={3}>
                  {filteredUsers.length ? (
                    filteredUsers.map((user) => (
                      <Box key={user._id} borderWidth="1px" borderRadius="2xl" p={4} bg="gray.50">
                        <Grid templateColumns={{ base: "1fr", md: "1.2fr 1fr auto" }} gap={3} alignItems="center">
                          <Box>
                            <Text fontWeight="semibold">{user.name}</Text>
                            <Text color="gray.600" fontSize="sm">
                              {user.email || "No email"}
                            </Text>
                          </Box>
                          <Text color="gray.700" fontSize="sm">
                            {user.department || "No department"}
                          </Text>
                          <Badge colorScheme="gray" borderRadius="full" px={3} py={1}>
                            User
                          </Badge>
                        </Grid>
                      </Box>
                    ))
                  ) : (
                    <Box borderWidth="1px" borderRadius="2xl" borderStyle="dashed" p={6} textAlign="center" bg="gray.50">
                      <Text fontWeight="medium">No users match that search.</Text>
                      <Text mt={1} color="gray.600" fontSize="sm">
                        Clear the search to see everyone in this batch.
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Divider />
            </Stack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
