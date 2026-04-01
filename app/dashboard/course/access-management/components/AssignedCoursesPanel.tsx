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
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return date.toLocaleDateString();
}

const AssignedCoursesPanel = observer(() => {
  useEffect(() => {
    courseStore.fetchAccessibleCourses().catch(() => undefined);
  }, []);

  const courses = courseStore.accessibleCourses || [];

  return (
    <Stack spacing={6}>
      <Box bg="white" borderRadius="2xl" borderWidth="1px" p={{ base: 5, md: 6 }} boxShadow="sm">
        <Heading size="md">My Assigned Courses</Heading>
        <Text mt={2} color="gray.600">
          View the courses that have actually been assigned to you, not just made available.
        </Text>
      </Box>

      {courseStore.isAccessLoading ? (
        <HStack justify="center" py={20}>
          <Spinner />
          <Text color="gray.600">Loading assigned courses...</Text>
        </HStack>
      ) : courses.length === 0 ? (
        <Box bg="white" borderRadius="2xl" borderWidth="1px" p={8}>
          <Text fontWeight="semibold">No assigned courses yet</Text>
          <Text color="gray.600" mt={2}>
            Once an admin enrolls you, your course list will appear here.
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          {courses.map((course) => (
            <Box key={course._id} bg="white" borderRadius="2xl" borderWidth="1px" p={5} boxShadow="sm">
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
                  {course.enrollment?.status?.replace("_", " ") || "assigned"}
                </Badge>
              </HStack>

              <VStack align="stretch" spacing={2} mt={4}>
                <Text fontSize="sm" color="gray.600">
                  Due date: {formatDate(course.enrollment?.dueDate)}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Assigned by:{" "}
                  {course.enrollment?.assignedBy?.name ||
                    course.enrollment?.assignedBy?.email ||
                    "Admin"}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Modules: {course.curriculum?.totalModules || 0}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
});

export default AssignedCoursesPanel;
