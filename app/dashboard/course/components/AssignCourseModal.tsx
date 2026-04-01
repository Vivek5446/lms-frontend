"use client";

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
  Step,
  StepDescription,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Switch,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import stores from "@/app/store/stores";
import { courseStore } from "@/app/store/courseStore/courseStore";

const STEPS = [
  { title: "Target", description: "Choose course and audience" },
  { title: "Duration", description: "Configure validity" },
  { title: "Rules", description: "Control downstream assignment" },
  { title: "Review", description: "Confirm before saving" },
];

type AssignmentTarget = "company" | "department" | "users";

type AssignCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseId?: string;
  fixedCompanyId?: string;
  onAssigned?: () => void | Promise<void>;
};

const AssignCourseModal = observer(
  ({ isOpen, onClose, defaultCourseId = "", fixedCompanyId = "", onAssigned }: AssignCourseModalProps) => {
    const toast = useToast();
    const { auth, companyStore } = stores;
    const role = String(auth.userType || auth.user?.role || "").toLowerCase();
    const isSuperadmin = role === "superadmin";
    const [step, setStep] = useState(0);
    const [courseId, setCourseId] = useState(defaultCourseId);
    const [assignmentTarget, setAssignmentTarget] = useState<AssignmentTarget>("company");
    const [companyId, setCompanyId] = useState(fixedCompanyId || companyStore.getActiveCompanyId());
    const [departmentName, setDepartmentName] = useState("");
    const [allowFurtherAssignment, setAllowFurtherAssignment] = useState(true);
    const [noExpiry, setNoExpiry] = useState(true);
    const [validTill, setValidTill] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const companies = companyStore.companies.data || [];
    const selectedCompany = companies.find((company: any) => company._id === companyId);
    const departments = selectedCompany?.departments || auth.user?.companyDetails?.departments || [];
    const selectedCourse = courseStore.courses.find((course) => course._id === courseId);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      courseStore.fetchCourses().catch(() => undefined);
      if (isSuperadmin && !companyStore.companies.data?.length) {
        companyStore.getManagedCompanies().catch(() => undefined);
      }
    }, [companyStore, isOpen, isSuperadmin]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      setCourseId(defaultCourseId || "");
      setCompanyId(fixedCompanyId || companyStore.getActiveCompanyId());
      setAssignmentTarget("company");
      setDepartmentName("");
      setAllowFurtherAssignment(true);
      setNoExpiry(true);
      setValidTill("");
      setUserSearch("");
      setUserResults([]);
      setSelectedUsers([]);
      setStep(0);
    }, [companyStore, defaultCourseId, fixedCompanyId, isOpen]);

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

    const canContinue = useMemo(() => {
      if (step === 0) {
        if (!courseId || !companyId) {
          return false;
        }

        if (assignmentTarget === "department") {
          return Boolean(departmentName);
        }

        if (assignmentTarget === "users") {
          return selectedUsers.length > 0;
        }

        return true;
      }

      if (step === 1) {
        return noExpiry || Boolean(validTill);
      }

      return true;
    }, [assignmentTarget, companyId, courseId, departmentName, noExpiry, selectedUsers.length, step, validTill]);

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
      if (!courseId || !companyId) {
        return;
      }

      try {
        const response = await courseStore.assignCourseAccess({
          courseId,
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
          title: "Unable to assign course",
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
          <DrawerHeader>Assign Course</DrawerHeader>

          <DrawerBody>
            {!isSuperadmin ? (
              <Alert status="warning" borderRadius="xl">
                <AlertIcon />
                <Box>
                  <AlertTitle>Superadmin only</AlertTitle>
                  <AlertDescription>
                    This assignment flow is reserved for cross-company course assignment.
                  </AlertDescription>
                </Box>
              </Alert>
            ) : (
              <Stack spacing={6}>
                <Stepper index={step} orientation="horizontal" size="sm">
                  {STEPS.map((item) => (
                    <Step key={item.title}>
                      <StepIndicator>
                        <StepStatus complete={<StepNumber />} incomplete={<StepNumber />} active={<StepNumber />} />
                      </StepIndicator>
                      <Box flexShrink="0">
                        <StepTitle>{item.title}</StepTitle>
                        <StepDescription>{item.description}</StepDescription>
                      </Box>
                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>

                {step === 0 ? (
                  <Stack spacing={5}>
                    <FormControl isRequired isDisabled={Boolean(defaultCourseId)}>
                      <FormLabel>Course</FormLabel>
                      <Select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                        <option value="">Select course</option>
                        {courseStore.courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

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

                    <FormControl isRequired>
                      <FormLabel>Assign to</FormLabel>
                      <RadioGroup value={assignmentTarget} onChange={(value) => setAssignmentTarget(value as AssignmentTarget)}>
                        <HStack spacing={4} flexWrap="wrap">
                          <Radio value="company">Company-wide</Radio>
                          <Radio value="department">Department</Radio>
                          <Radio value="users">Users</Radio>
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

                        <Box borderWidth="1px" borderRadius="xl" p={3} minH="220px">
                          {userResults.length === 0 ? (
                            <Text color="gray.500" fontSize="sm">
                              Start typing to find users in the selected company.
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
                ) : null}

                {step === 1 ? (
                  <Stack spacing={4}>
                    <Box borderWidth="1px" borderRadius="xl" p={4}>
                      <HStack justify="space-between">
                        <Box>
                          <Text fontWeight="semibold">No expiry</Text>
                          <Text color="gray.600" fontSize="sm">
                            Keep this assignment active until you change or remove it.
                          </Text>
                        </Box>
                        <Switch isChecked={noExpiry} onChange={(event) => setNoExpiry(event.target.checked)} />
                      </HStack>
                    </Box>

                    {!noExpiry ? (
                      <FormControl isRequired>
                        <FormLabel>Valid till</FormLabel>
                        <Input type="date" value={validTill} onChange={(event) => setValidTill(event.target.value)} />
                      </FormControl>
                    ) : null}
                  </Stack>
                ) : null}

                {step === 2 ? (
                  <Box borderWidth="1px" borderRadius="xl" p={4}>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="semibold">Allow further assignment</Text>
                        <Text color="gray.600" fontSize="sm">
                          Let downstream admins assign this course within their allowed scope.
                        </Text>
                      </Box>
                      <Switch
                        isChecked={allowFurtherAssignment}
                        onChange={(event) => setAllowFurtherAssignment(event.target.checked)}
                      />
                    </HStack>
                  </Box>
                ) : null}

                {step === 3 ? (
                  <Stack spacing={4}>
                    <Box borderWidth="1px" borderRadius="2xl" p={5}>
                      <Text fontWeight="semibold" fontSize="lg">
                        Assignment summary
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.500">
                            Course
                          </Text>
                          <Text fontWeight="medium">{selectedCourse?.title || "Not selected"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">
                            Company
                          </Text>
                          <Text fontWeight="medium">{selectedCompany?.company_name || "Not selected"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">
                            Target
                          </Text>
                          <Text fontWeight="medium">
                            {assignmentTarget === "company"
                              ? "Company-wide"
                              : assignmentTarget === "department"
                                ? departmentName || "Not selected"
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
                    </Box>

                    <HStack spacing={3} flexWrap="wrap">
                      <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                        {assignmentTarget === "company"
                          ? "Company-wide"
                          : assignmentTarget === "department"
                            ? "Department"
                            : "User-specific"}
                      </Badge>
                      <Badge colorScheme={allowFurtherAssignment ? "blue" : "gray"} borderRadius="full" px={3} py={1}>
                        {allowFurtherAssignment ? "Further assignment enabled" : "Further assignment disabled"}
                      </Badge>
                    </HStack>
                  </Stack>
                ) : null}
              </Stack>
            )}
          </DrawerBody>

          <DrawerFooter>
            <HStack justify="space-between" w="full">
              <Button variant="outline" onClick={() => (step === 0 ? onClose() : setStep((current) => current - 1))}>
                {step === 0 ? "Cancel" : "Back"}
              </Button>

              {step < STEPS.length - 1 ? (
                <Button colorScheme="blue" onClick={() => setStep((current) => current + 1)} isDisabled={!canContinue || !isSuperadmin}>
                  Continue
                </Button>
              ) : (
                <Button colorScheme="blue" onClick={handleSubmit} isLoading={courseStore.isAssignmentSubmitting} isDisabled={!isSuperadmin}>
                  Confirm assignment
                </Button>
              )}
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

export default AssignCourseModal;
