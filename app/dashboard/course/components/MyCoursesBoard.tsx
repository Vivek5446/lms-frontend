"use client";

import {
  Badge,
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { courseStore } from "@/app/store/courseStore/courseStore";

function formatDate(value?: string | null) {
  if (!value) {
    return "No expiry";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No expiry";
  }

  return date.toLocaleDateString();
}

function getStatusColor(status: string) {
  if (status === "expired") {
    return "red";
  }

  if (status === "expiring_soon") {
    return "orange";
  }

  return "green";
}

const MyCoursesBoard = observer(() => {
  useEffect(() => {
    courseStore.fetchMyCourses().catch(() => undefined);
  }, []);

  const courses = courseStore.myCourses || [];

  return (
    <Stack spacing={6}>
      <Box bg="white" borderRadius="2xl" borderWidth="1px" p={{ base: 5, md: 6 }} boxShadow="sm">
        <Heading size="md">My Courses</Heading>
        <Text mt={2} color="gray.600">
          Review the courses assigned directly to you and the ones delivered through batches.
        </Text>
      </Box>

      {courseStore.isMyCoursesLoading ? (
        <HStack justify="center" py={20}>
          <Spinner />
          <Text color="gray.600">Loading your courses...</Text>
        </HStack>
      ) : courses.length === 0 ? (
        <Box bg="white" borderRadius="2xl" borderWidth="1px" p={8}>
          <Text fontWeight="semibold">No courses assigned yet</Text>
          <Text color="gray.600" mt={2}>
            Once you are enrolled directly or through a batch, your courses will appear here.
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
          {courses.map((course) => (
            <Box key={course.courseId} bg="white" borderRadius="2xl" borderWidth="1px" p={5} boxShadow="sm">
              <HStack justify="space-between" align="start">
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">
                    {course.title}
                  </Text>
                  <Text mt={1} color="gray.600" fontSize="sm">
                    {course.description?.text || "No description available."}
                  </Text>
                </Box>
                <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                  {course.status.replace("_", " ")}
                </Badge>
              </HStack>

              <HStack mt={4} spacing={2} flexWrap="wrap">
                {course.sources.map((source, index) => (
                  <Badge
                    key={`${source.type}-${source.batchId || index}`}
                    colorScheme={source.type === "batch" ? "purple" : "green"}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {source.label}
                  </Badge>
                ))}
                <Badge colorScheme={getStatusColor(course.visibilityStatus)} borderRadius="full" px={3} py={1}>
                  {course.visibilityStatus === "expiring_soon" ? "Expiring soon" : course.isExpired ? "Expired" : "Active"}
                </Badge>
              </HStack>

              <VStack align="stretch" spacing={2} mt={4}>
                <Text fontSize="sm" color="gray.600">
                  Progress: {course.progress}%
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Modules: {course.curriculum?.totalModules || 0}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Valid till: {formatDate(course.validTill)}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
});

export default MyCoursesBoard;
