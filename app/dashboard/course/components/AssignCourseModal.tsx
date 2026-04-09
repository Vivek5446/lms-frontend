"use client";

import { courseStore } from "@/app/store/courseStore/courseStore";
import stores from "@/app/store/stores";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useToast,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import CourseMultiSelectInput from "./CourseMultiSelectInput";

type AssignmentTarget = "company" | "department" | "users";

type AssignCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseId?: string;
  fixedCompanyId?: string;
  onAssigned?: () => void | Promise<void>;
};

function getDefaultTarget(role: string): AssignmentTarget {
  return role === "departmenthead" ? "users" : "company";
}

const AssignCourseModal = observer(
  ({ isOpen, onClose, defaultCourseId = "", fixedCompanyId = "", onAssigned }: AssignCourseModalProps) => {
    const toast = useToast();
    const { auth, companyStore } = stores;
    const role = String(auth.userType || auth.user?.role || "").toLowerCase();
    const isSuperadmin = role === "superadmin";
    const isDepartmentHead = role === "departmenthead";

    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(defaultCourseId ? [defaultCourseId] : []);
    const [courseSearch, setCourseSearch] = useState("");
    const [assignmentTarget, setAssignmentTarget] = useState<AssignmentTarget>(getDefaultTarget(role));
    const [companyId, setCompanyId] = useState(fixedCompanyId || companyStore.getActiveCompanyId());
    const [departmentName, setDepartmentName] = useState("");
    const [allowFurtherAssignment, setAllowFurtherAssignment] = useState(true);
    const [noExpiry, setNoExpiry] = useState(true);
    const [validTill, setValidTill] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const companies = companyStore.companies.data || [];
    const selectedCompany =
      companies.find((company: any) => company._id === companyId) || auth.user?.companyDetails || null;
    const departments = selectedCompany?.departments || auth.user?.companyDetails?.departments || [];

    const availableCourses = useMemo(() => {
      if (isSuperadmin) {
        return courseStore.courses || [];
      }

      return (courseStore.accessibleCourses || []).filter((course) => course.access?.canAssign);
    }, [courseStore.accessibleCourses, courseStore.courses, isSuperadmin]);

    const selectedCourses = useMemo(() => {
      const courseMap = new Map(availableCourses.map((course) => [course._id, course]));
      return selectedCourseIds.map((courseId) => courseMap.get(courseId)).filter(Boolean);
    }, [availableCourses, selectedCourseIds]);

    const assignmentOptions = useMemo(() => {
      if (isDepartmentHead) {
        return [
          { value: "users", label: "Users" },
          { value: "department", label: "Department" },
        ];
      }

      return [
        { value: "company", label: "Company-wide" },
        { value: "department", label: "Department" },
        { value: "users", label: "Users" },
      ];
    }, [isDepartmentHead]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      courseStore.fetchCourses().catch(() => undefined);
      courseStore.fetchAccessibleCourses().catch(() => undefined);

      if (isSuperadmin && !companyStore.companies.data?.length) {
        companyStore.getManagedCompanies().catch(() => undefined);
      }
    }, [companyStore, isOpen, isSuperadmin]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      setSelectedCourseIds(defaultCourseId ? [defaultCourseId] : []);
      setCourseSearch("");
      setCompanyId(fixedCompanyId || companyStore.getActiveCompanyId());
      setAssignmentTarget(getDefaultTarget(role));
      setDepartmentName("");
      setAllowFurtherAssignment(true);
      setNoExpiry(true);
      setValidTill("");
      setUserSearch("");
      setUserResults([]);
      setSelectedUsers([]);
    }, [companyStore, defaultCourseId, fixedCompanyId, isOpen, role]);

    useEffect(() => {
      if (!isOpen || assignmentTarget !== "users" || !companyId) {
        setUserResults([]);
        return;
      }

      const timeoutId = setTimeout(async () => {
        if (!userSearch.trim()) {
          setUserResults([]);
          return;
        }

        try {
          const response = await auth.getCompanyUsers({
            searchValue: userSearch.trim(),
            companyId,
          });
          setUserResults(response || []);
        } catch (error) {
          setUserResults([]);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }, [assignmentTarget, auth, companyId, isOpen, userSearch]);

    const canSubmit = useMemo(() => {
      if (!selectedCourseIds.length) {
        return false;
      }

      if (!companyId) {
        return false;
      }

      if (assignmentTarget === "users") {
        return selectedUsers.length > 0 && (noExpiry || Boolean(validTill));
      }

      if (assignmentTarget === "department") {
        return Boolean(departmentName) && (noExpiry || Boolean(validTill));
      }

      return noExpiry || Boolean(validTill);
    }, [assignmentTarget, companyId, departmentName, noExpiry, selectedCourseIds.length, selectedUsers.length, validTill]);

    const toggleSelectedUser = (user: any) => {
      setSelectedUsers((current) => {
        const exists = current.some((item) => item._id === user._id);
        if (exists) {
          return current.filter((item) => item._id !== user._id);
        }

        return [...current, user];
      });
    };

    const handleSubmit = async () => {
      if (!canSubmit) {
        return;
      }

      try {
        const response = await courseStore.assignMultipleCourses({
          courseIds: selectedCourseIds,
          assignmentType: assignmentTarget,
          companyId,
          departmentName: assignmentTarget === "department" ? departmentName : undefined,
          userIds: assignmentTarget === "users" ? selectedUsers.map((user) => user._id) : undefined,
          validFrom: new Date().toISOString(),
          validTill: noExpiry ? null : new Date(validTill).toISOString(),
          allowFurtherAssignment,
        });

        toast({
          title: "Course assignment saved",
          description: response?.message || "The assignment has been created successfully.",
          status: "success",
          duration: 4000,
        });

        if (onAssigned) {
          await onAssigned();
        }

        onClose();
      } catch (err: any) {
        toast({
          title: "Unable to assign courses",
          description: err?.message || err?.error || "Please try again.",
          status: "error",
          duration: 4500,
        });
      }
    };

    return (
      <Drawer isOpen={isOpen} placement="right" size="xl" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Assign Courses</DrawerHeader>

          <DrawerBody>
            <Stack spacing={6}>
              {!companyId && isSuperadmin ? (
                <Alert status="info" borderRadius="xl">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Select a company first</AlertTitle>
                    <AlertDescription>
                      Choose a company before assigning courses so the target audience and departments can be loaded correctly.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : null}

              <CourseMultiSelectInput
                courses={availableCourses}
                selectedCourseIds={selectedCourseIds}
                onSelectionChange={setSelectedCourseIds}
                searchValue={courseSearch}
                onSearchChange={setCourseSearch}
                label="Courses"
                helperText="Pick one or more published courses, then complete the audience and validity settings below."
                emptyStateText="No courses match your search."
              />

              <Box borderWidth="1px" borderRadius="3xl" p={5}>
                <Stack spacing={4}>
                  <Text fontWeight="semibold" fontSize="lg">
                    Assignment details
                  </Text>

                  {isSuperadmin ? (
                    <FormControl isRequired isDisabled={Boolean(fixedCompanyId)}>
                      <FormLabel>Company</FormLabel>
                      <Select value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
                        <option value="">Select company</option>
                        {companies.map((company: any) => (
                          <option key={company._id} value={company._id}>
                            {company.company_name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Box borderWidth="1px" borderRadius="2xl" p={4} bg="gray.50">
                      <Text fontSize="sm" color="gray.500">
                        Company
                      </Text>
                      <Text mt={1} fontWeight="semibold">
                        {selectedCompany?.company_name || "Current company"}
                      </Text>
                    </Box>
                  )}

                  <FormControl isRequired>
                    <FormLabel>Assign to</FormLabel>
                    <RadioGroup value={assignmentTarget} onChange={(value) => setAssignmentTarget(value as AssignmentTarget)}>
                      <HStack spacing={4} flexWrap="wrap">
                        {assignmentOptions.map((option) => (
                          <Radio key={option.value} value={option.value}>
                            {option.label}
                          </Radio>
                        ))}
                      </HStack>
                    </RadioGroup>
                  </FormControl>

                  {assignmentTarget === "department" ? (
                    <FormControl isRequired>
                      <FormLabel>Department</FormLabel>
                      <Select value={departmentName} onChange={(event) => setDepartmentName(event.target.value)}>
                        <option value="">Select department</option>
                        {departments.map((department: string) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  ) : null}

                  {assignmentTarget === "users" ? (
                    <Stack spacing={3}>
                      <FormControl>
                        <FormLabel>Search users</FormLabel>
                        <Input
                          value={userSearch}
                          onChange={(event) => setUserSearch(event.target.value)}
                          placeholder="Search by name, email, code, or department"
                        />
                      </FormControl>

                      <Wrap spacing={2}>
                        {selectedUsers.length ? (
                          selectedUsers.map((user) => (
                            <WrapItem key={user._id}>
                              <Tag size="lg" borderRadius="full" colorScheme="blue">
                                <TagLabel>{user.name || user.email}</TagLabel>
                                <TagCloseButton onClick={() => toggleSelectedUser(user)} />
                              </Tag>
                            </WrapItem>
                          ))
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            Selected users will appear here once you choose them.
                          </Text>
                        )}
                      </Wrap>

                      <Box borderWidth="1px" borderRadius="2xl" p={3} minH="220px">
                        {userResults.length === 0 ? (
                          <Text color="gray.500" fontSize="sm">
                            Start typing to search users inside the selected company.
                          </Text>
                        ) : (
                          <VStack align="stretch" spacing={3}>
                            {userResults.map((row: any) => {
                              const user = row.user || row;
                              const isSelected = selectedUsers.some((item) => item._id === user._id);

                              return (
                                <Box
                                  key={user._id}
                                  borderWidth="1px"
                                  borderColor={isSelected ? "blue.300" : "gray.200"}
                                  bg={isSelected ? "blue.50" : "white"}
                                  borderRadius="lg"
                                  p={3}
                                  cursor="pointer"
                                  onClick={() => toggleSelectedUser(user)}
                                >
                                  <HStack justify="space-between">
                                    <Box>
                                      <Text fontWeight="semibold">{user.name || user.email}</Text>
                                      <Text fontSize="sm" color="gray.600">
                                        {user.email || user.username}
                                      </Text>
                                    </Box>
                                    <Badge colorScheme={isSelected ? "blue" : "gray"}>
                                      {user.department || "No department"}
                                    </Badge>
                                  </HStack>
                                </Box>
                              );
                            })}
                          </VStack>
                        )}
                      </Box>
                    </Stack>
                  ) : null}
                </Stack>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box borderWidth="1px" borderRadius="3xl" p={5}>
                  <Stack spacing={4}>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="semibold">No expiry</Text>
                        <Text color="gray.600" fontSize="sm">
                          Keep this assignment active until it is changed or revoked.
                        </Text>
                      </Box>
                      <Switch isChecked={noExpiry} onChange={(event) => setNoExpiry(event.target.checked)} />
                    </HStack>

                    {!noExpiry ? (
                      <FormControl isRequired>
                        <FormLabel>Valid till</FormLabel>
                        <Input type="date" value={validTill} onChange={(event) => setValidTill(event.target.value)} />
                      </FormControl>
                    ) : null}
                  </Stack>
                </Box>

                {isSuperadmin ? (
                  <Box borderWidth="1px" borderRadius="3xl" p={5}>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="semibold">Allow further assignment</Text>
                        <Text color="gray.600" fontSize="sm">
                          Let downstream admins continue assigning this course within their allowed scope.
                        </Text>
                      </Box>
                      <Switch
                        isChecked={allowFurtherAssignment}
                        onChange={(event) => setAllowFurtherAssignment(event.target.checked)}
                      />
                    </HStack>
                  </Box>
                ) : null}
              </SimpleGrid>

              <Box borderWidth="1px" borderRadius="3xl" p={5} bg="gray.50">
                <Stack spacing={4}>
                  <Text fontWeight="semibold" fontSize="lg">
                    Review
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        Courses
                      </Text>
                      <Text fontWeight="medium">
                        {selectedCourses.length ? `${selectedCourses.length} selected` : "Not selected"}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        Company
                      </Text>
                      <Text fontWeight="medium">{selectedCompany?.company_name || "Not selected"}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        Audience
                      </Text>
                      <Text fontWeight="medium">
                        {assignmentTarget === "company"
                          ? "Company-wide"
                          : assignmentTarget === "department"
                            ? departmentName || "Department not selected"
                            : `${selectedUsers.length} selected user${selectedUsers.length === 1 ? "" : "s"}`}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        Valid till
                      </Text>
                      <Text fontWeight="medium">{noExpiry ? "No expiry" : validTill || "Not selected"}</Text>
                    </Box>
                  </SimpleGrid>

                  {selectedCourses.length ? (
                    <Wrap spacing={2}>
                      {selectedCourses.map((course: any) => (
                        <WrapItem key={course._id}>
                          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                            {course.title}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  ) : null}
                </Stack>
              </Box>
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <HStack justify="space-between" w="full">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSubmit} isLoading={courseStore.isAssignmentSubmitting} isDisabled={!canSubmit}>
                Review and assign
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

export default AssignCourseModal;
