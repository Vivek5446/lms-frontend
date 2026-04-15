"use client";

import CustomInput from "@/app/component/config/component/customInput/CustomInput";
import { courseStore } from "@/app/store/courseStore/courseStore";
import stores from "@/app/store/stores";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  SlideFade,
  Stack,
  Step,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useToast,
  VStack,
  Wrap,
  WrapItem
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { FiBook, FiCheckCircle, FiClock, FiLayers, FiSearch } from "react-icons/fi";

type AssignmentTarget = "company" | "department" | "users";

type AssignCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseId?: string;
  fixedCompanyId?: string;
  onAssigned?: () => void | Promise<void>;
};

const STEPS = [
  { title: "Courses", description: "Select curriculum" },
  { title: "Scope", description: "Define audience" },
  { title: "Rules", description: "Set parameters" },
  { title: "Review", description: "Confirm & assign" },
];

function getDefaultTarget(role: string): AssignmentTarget {
  return role === "departmenthead" ? "users" : "company";
}

function formatDate(value?: string | null) {
  if (!value) return "No expiry";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No expiry" : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// -----------------------------------------------------------------------------
// UI Enhancements: Custom Cards for Courses & Users
// -----------------------------------------------------------------------------

const InteractiveCourseCard = ({ course, isSelected, onClick }: any) => {
  const category = course.taxonomy?.categories?.[0] || "General";
  const level = course.taxonomy?.level || "All Levels";
  const modules = course.curriculum?.totalModules || 0;
  const imageSrc = course.thumbnailUrl && course.thumbnailUrl.startsWith('blob:') ? course.thumbnailUrl : (course.thumbnailUrl || 'https://via.placeholder.com/150');

  return (
    <Box
      borderWidth="2px"
      borderColor={isSelected ? "blue.500" : "gray.200"}
      bg={isSelected ? "blue.50" : "white"}
      borderRadius="2xl"
      overflow="hidden"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{ borderColor: isSelected ? "blue.500" : "gray.300", shadow: "md", transform: "translateY(-2px)" }}
      position="relative"
    >
      <Flex direction="row" h="120px">
        <Box w="120px" h="full" flexShrink={0} position="relative" bg="gray.100">
          <Image src={imageSrc} alt={course.title} objectFit="cover" w="full" h="full" />
        </Box>
        <Stack p={4} spacing={2} flex={1} justify="center">
          <HStack justify="space-between" align="start">
            <Box>
              <Text fontWeight="bold" color="gray.900" noOfLines={1} pr={4}>
                {course.title || "Untitled Course"}
              </Text>
              <HStack spacing={2} mt={1}>
                <Badge colorScheme="purple" variant="subtle" fontSize="2xs" rounded="md px={1.5}">
                  {category}
                </Badge>
                <Badge colorScheme={level === 'Beginner' ? 'green' : level === 'Advanced' ? 'red' : 'blue'} variant="outline" fontSize="2xs" rounded="md px={1.5}">
                  {level}
                </Badge>
              </HStack>
            </Box>
            {isSelected && <Icon as={FiCheckCircle} color="blue.500" boxSize={6} position="absolute" top={4} right={4} />}
          </HStack>
          <HStack spacing={4} color="gray.500" fontSize="xs">
            <HStack spacing={1}><Icon as={FiLayers} /><Text>{modules} Module{modules !== 1 && 's'}</Text></HStack>
            <HStack spacing={1}><Icon as={FiClock} /><Text>{course.progression?.certificateEnabled ? 'Certificate' : 'No Cert'}</Text></HStack>
          </HStack>
        </Stack>
      </Flex>
    </Box>
  );
};

const TargetCard = ({ isSelected, onClick, title, description }: any) => (
  <Box
    p={5}
    borderWidth="2px"
    borderColor={isSelected ? "blue.500" : "gray.200"}
    bg={isSelected ? "blue.50" : "white"}
    borderRadius="2xl"
    cursor="pointer"
    onClick={onClick}
    transition="all 0.2s"
    _hover={{ borderColor: isSelected ? "blue.500" : "gray.300", shadow: "sm" }}
  >
    <HStack justify="space-between" align="center">
      <Box>
        <Text fontWeight="semibold" color={isSelected ? "blue.800" : "gray.900"} fontSize="md">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500" mt={1}>
          {description}
        </Text>
      </Box>
      <Box 
        w={5} h={5} borderRadius="full" borderWidth="2px" 
        borderColor={isSelected ? "blue.500" : "gray.300"} 
        bg={isSelected ? "blue.500" : "transparent"}
        display="flex" alignItems="center" justifyItems="center"
      >
        {isSelected && <Icon as={FiCheckCircle} color="white" boxSize={3} m="auto" />}
      </Box>
    </HStack>
  </Box>
);

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

const AssignCourseModal = observer(
  ({ isOpen, onClose, defaultCourseId = "", fixedCompanyId = "", onAssigned }: AssignCourseModalProps) => {
    const toast = useToast();
    const { auth, companyStore } = stores;
    const role = String(auth.userType || auth.user?.role || "").toLowerCase();
    const isSuperadmin = role === "superadmin";
    const isDepartmentHead = role === "departmenthead";

    const [step, setStep] = useState(0);
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
    const selectedCompany = companies.find((company: any) => company._id === companyId) || auth.user?.companyDetails || null;
    const departments = selectedCompany?.departments || auth.user?.companyDetails?.departments || [];

    const availableCourses = useMemo(() => {
      let courses = isSuperadmin ? (courseStore.courses || []) : ((courseStore.accessibleCourses || []).filter((c) => c.access?.canAssign));
      if (courseSearch.trim()) {
        const query = courseSearch.toLowerCase();
        courses = courses.filter((c:any) => c.title?.toLowerCase().includes(query) || c.taxonomy?.categories?.some((cat: string) => cat.toLowerCase().includes(query)));
      }
      return courses;
    }, [isSuperadmin, courseSearch, courseStore.courses, courseStore.accessibleCourses]);
 
    const selectedCourses = useMemo(() => {
      const courseMap = new Map(availableCourses.map((course) => [course._id, course]));
      return selectedCourseIds.map((courseId) => courseMap.get(courseId)).filter(Boolean);
    }, [availableCourses, selectedCourseIds]);

    const companyOptions = useMemo(() => companies.map((c: any) => ({ value: c._id, label: c.company_name })), [companies]);
    const departmentOptions = useMemo(() => departments.map((d: string) => ({ value: d, label: d })), [departments]);

    const selectedCompanyOption = companyOptions.find((o) => o.value === companyId) || null;
    const selectedDepartmentOption = departmentOptions.find((o) => o.value === departmentName) || null;

    useEffect(() => {
      if (!isOpen) return;
      courseStore.fetchCourses().catch(() => undefined);
      courseStore.fetchAccessibleCourses().catch(() => undefined);
      if (isSuperadmin && !companyStore.companies.data?.length) {
        companyStore.getManagedCompanies().catch(() => undefined);
      }
    }, [companyStore, isOpen, isSuperadmin]);

    useEffect(() => {
      if (!isOpen) return;
      setStep(0);
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
          const response = await auth.getCompanyUsers({ searchValue: userSearch.trim(), companyId });
          setUserResults(response || []);
        } catch (error) {
          setUserResults([]);
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }, [assignmentTarget, auth, companyId, isOpen, userSearch]);

    useEffect(() => {
      setDepartmentName("");
      setUserSearch("");
      setUserResults([]);
      setSelectedUsers([]);
    }, [assignmentTarget, companyId]);

    const canContinue = useMemo(() => {
      if (step === 0) return selectedCourseIds.length > 0;
      if (step === 1) {
        if (!companyId) return false;
        if (assignmentTarget === "department") return Boolean(departmentName);
        return true;
      }
      if (step === 2) return noExpiry || Boolean(validTill);
      if (assignmentTarget === "users") return selectedUsers.length > 0;
      return true;
    }, [assignmentTarget, companyId, departmentName, noExpiry, selectedCourseIds.length, selectedUsers.length, step, validTill]);

    const toggleSelectedCourse = (courseId: string) => {
      setSelectedCourseIds((current) => 
        current.includes(courseId) ? current.filter(id => id !== courseId) : [...current, courseId]
      );
    };

    const toggleSelectedUser = (user: any) => {
      setSelectedUsers((current) => {
        const exists = current.some((item) => item._id === user._id);
        if (exists) return current.filter((item) => item._id !== user._id);
        return [...current, user];
      });
    };

    const handleClose = () => {
      setStep(0);
      onClose();
    };

    const handleSubmit = async () => {
      if (!canContinue) return;
      try {
        const response = await courseStore.assignMultipleCourses({
          courseIds: selectedCourseIds,
          assignmentType: assignmentTarget,
          companyId,
          departmentName: assignmentTarget === "department" ? departmentName : undefined,
          userIds: assignmentTarget === "users" ? selectedUsers.map((u) => u._id) : undefined,
          validFrom: new Date().toISOString(),
          validTill: noExpiry ? null : new Date(validTill).toISOString(),
          allowFurtherAssignment,
        });

        toast({
          title: "Assignment successful",
          description: response?.message || "Courses have been distributed to the selected audience.",
          status: "success",
          duration: 4000,
          position: "top-right",
          isClosable: true,
        });

        if (onAssigned) await onAssigned();
        handleClose();
      } catch (err: any) {
        toast({
          title: "Assignment failed",
          description: err?.message || err?.error || "An error occurred while creating the assignment.",
          status: "error",
          duration: 4500,
          position: "top-right",
          isClosable: true,
        });
      }
    };

    return (
      <Drawer isOpen={isOpen} placement="right" size="xl" onClose={handleClose}>
        <DrawerOverlay backdropFilter="blur(3px)" bg="blackAlpha.400" />
        <DrawerContent maxW={{ base: "full", lg: "850px", xl: "1050px" }} boxShadow="2xl" borderLeftRadius={{ md: "2xl" }}>
          <DrawerCloseButton top={5} right={5} size="lg" />
          
          <DrawerHeader borderBottomWidth="1px" pb={6} pt={8} px={{ base: 6, md: 10 }}>
            <Stack spacing={6}>
              <Box>
                <Text fontSize="3xl" fontWeight="bold" color="gray.900" letterSpacing="tight">
                  Assign Courses
                </Text>
                <Text fontSize="md" color="gray.500" mt={1}>
                  Configure and distribute learning paths across your organization.
                </Text>
              </Box>

              <Stepper index={step} size="sm" colorScheme="blue" w="full">
                {STEPS.map((item, index) => (
                  <Step key={index}>
                    <StepIndicator bg={step >= index ? "blue.500" : "gray.100"}>
                      <StepStatus complete={<StepNumber />} incomplete={<StepNumber />} active={<StepNumber />} />
                    </StepIndicator>
                    <Box flexShrink="0" display={{ base: "none", md: "block" }}>
                      <StepTitle fontWeight={step === index ? "bold" : "medium"}>{item.title}</StepTitle>
                    </Box>
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </Stack>
          </DrawerHeader>

          {/* Use standard padding and let the DrawerBody handle all overflowing scroll to prevent double bars */}
          <DrawerBody py={8} px={{ base: 6, md: 10 }} bg="gray.50" overflowY="auto">
            <SlideFade in key={step} offsetY="20px">
              <Stack spacing={8}>
                
                {/* Warnings Context */}
                {!companyId && isSuperadmin && step > 0 && (
                  <Alert status="warning" borderRadius="xl" bg="orange.50" color="orange.800" borderWidth="1px" borderColor="orange.200">
                    <AlertIcon color="orange.500" />
                    <Box>
                      <AlertTitle fontSize="sm">Company Selection Required</AlertTitle>
                      <AlertDescription fontSize="sm" mt={1}>
                        You must select a company before defining the audience or rules.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {/* STEP 0: COURSES */}
                {step === 0 && (
                  <Box>
                    <HStack justify="space-between" align="center" mb={6}>
                       <Box>
                         <Text fontWeight="bold" fontSize="xl" color="gray.900">Select Curriculum</Text>
                         <Text color="gray.500" fontSize="sm">Pick the courses you want to assign.</Text>
                       </Box>
                       <InputGroup maxW="300px">
                         <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
                         <Input 
                           placeholder="Search courses..." 
                           value={courseSearch} 
                           onChange={(e) => setCourseSearch(e.target.value)} 
                           bg="white" 
                           borderRadius="xl"
                         />
                       </InputGroup>
                    </HStack>
                    
                    {availableCourses.length === 0 ? (
                      <Box p={10} textAlign="center" bg="white" borderRadius="2xl" borderWidth="1px" borderStyle="dashed">
                        <Icon as={FiBook} boxSize={10} color="gray.300" mb={3} />
                        <Text color="gray.500">No courses found matching your criteria.</Text>
                      </Box>
                    ) : (
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
                        {availableCourses.map((course) => (
                          <GridItem key={course._id}>
                            <InteractiveCourseCard 
                              course={course} 
                              isSelected={selectedCourseIds.includes(course._id)} 
                              onClick={() => toggleSelectedCourse(course._id)} 
                            />
                          </GridItem>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}

                {/* STEP 1: SCOPE */}
                {step === 1 && (
                  <Stack spacing={8}>
                    <Box bg="white" p={6} borderRadius="2xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
                      <Text fontWeight="bold" fontSize="xl" mb={1} color="gray.900">Target Organization</Text>
                      <Text color="gray.500" fontSize="sm" mb={6}>Verify or select the company you are assigning this to.</Text>
                      
                      {isSuperadmin ? (
                        <Box maxW="500px">
                          <CustomInput
                            type="select"
                            name="assignment-company"
                            placeholder="Select a company"
                            value={selectedCompanyOption}
                            options={companyOptions}
                            onChange={(option: any) => setCompanyId(option?.value || "")}
                            isSearchable
                            isPortal
                            disabled={Boolean(fixedCompanyId)}
                          />
                        </Box>
                      ) : (
                        <Box p={4} bg="gray.50" borderRadius="xl" borderWidth="1px" borderColor="gray.200" maxW="max-content">
                          <HStack spacing={4}>
                            <Avatar size="md" name={selectedCompany?.company_name} bg="blue.500" />
                            <Box>
                              <Text fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.500" letterSpacing="wider">
                                Current Organization
                              </Text>
                              <Text fontWeight="semibold" color="gray.900" fontSize="lg">
                                {selectedCompany?.company_name || "N/A"}
                              </Text>
                            </Box>
                          </HStack>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="xl" mb={1} color="gray.900">Audience Scope</Text>
                      <Text color="gray.500" fontSize="sm" mb={6}>Who should receive these courses?</Text>

                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                        {!isDepartmentHead && (
                          <TargetCard
                            title="Entire Company"
                            description="All current and future learners in the organization."
                            isSelected={assignmentTarget === "company"}
                            onClick={() => setAssignmentTarget("company")}
                          />
                        )}
                        <TargetCard
                          title="Specific Department"
                          description="Distribute exclusively to a defined team or department."
                          isSelected={assignmentTarget === "department"}
                          onClick={() => setAssignmentTarget("department")}
                        />
                        <TargetCard
                          title="Individual Users"
                          description="Hand-pick specific learners for tailored delivery."
                          isSelected={assignmentTarget === "users"}
                          onClick={() => setAssignmentTarget("users")}
                        />
                      </SimpleGrid>
                    </Box>

                    {assignmentTarget === "department" && (
                      <Box  bg="white" p={6} borderRadius="2xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
                        <Text fontWeight="bold" fontSize="md" mb={4}>Select Department</Text>
                        <Box maxW="500px">
                          <CustomInput
                            type="select"
                            name="assignment-department"
                            placeholder="Choose department..."
                            value={selectedDepartmentOption}
                            options={departmentOptions}
                            onChange={(option: any) => setDepartmentName(option?.value || "")}
                            isSearchable
                            isPortal
                          />
                        </Box>
                      </Box>
                    )}
                  </Stack>
                )}

                {/* STEP 2: RULES */}
                {step === 2 && (
                  <Stack spacing={6}>
                     <Box bg="white" p={6} borderRadius="2xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
                      <HStack justify="space-between" align="start" mb={noExpiry ? 0 : 6}>
                        <Box>
                          <Text fontWeight="bold" fontSize="xl" color="gray.900">Lifetime Access</Text>
                          <Text color="gray.500" fontSize="sm" mt={1}>Courses will never expire for the assigned users. Toggle off to set a deadline.</Text>
                        </Box>
                        <Switch colorScheme="blue" size="lg" isChecked={noExpiry} onChange={(e) => setNoExpiry(e.target.checked)} />
                      </HStack>

                      {!noExpiry && (
                        <SlideFade in offsetY="-10px">
                          <Divider my={6} />
                          <Box maxW="300px">
                            <CustomInput
                              type="date"
                              name="assignment-valid-till"
                              label="Expiration Date"
                              value={validTill}
                              minDate={new Date().toISOString().split("T")[0]}
                              onChange={(event: any) => setValidTill(event.target.value)}
                            />
                          </Box>
                        </SlideFade>
                      )}
                    </Box>

                    <Box bg="white" p={6} borderRadius="2xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
                       <HStack justify="space-between" align="start">
                        <Box pr={8}>
                          <Text fontWeight="bold" fontSize="xl" color="gray.900">Allow Downstream Assignment</Text>
                          <Text color="gray.500" fontSize="sm" mt={1}>Grants permission for sub-managers or department heads to re-distribute these courses to their own teams from this assignment block.</Text>
                        </Box>
                        <Switch colorScheme="blue" size="lg" isChecked={allowFurtherAssignment} onChange={(e) => setAllowFurtherAssignment(e.target.checked)} />
                      </HStack>
                    </Box>
                  </Stack>
                )}

                {/* STEP 3: REVIEW / USERS */}
                {step === 3 && (
                  <Stack spacing={8}>
                    {assignmentTarget === "users" && (
                      <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
                        
                        {/* Search Sidebar */}
                        <Box>
                          <Text fontWeight="bold" fontSize="lg" mb={1} color="gray.900">Find Learners</Text>
                          <Text color="gray.500" fontSize="sm" mb={4}>Search the company directory.</Text>
                          
                          <InputGroup mb={4}>
                            <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
                            <Input
                              value={userSearch}
                              onChange={(event) => setUserSearch(event.target.value)}
                              placeholder="Name or email..."
                              bg="white"
                              borderRadius="xl"
                              borderWidth="2px"
                              _focus={{ borderColor: "blue.500", bg: "white" }}
                            />
                          </InputGroup>

                          <Box bg="white" borderRadius="xl" borderWidth="1px" borderColor="gray.200" overflow="hidden" maxH="400px" overflowY="auto">
                            {userResults.length === 0 ? (
                              <Box p={6} textAlign="center">
                                <Text color="gray.400" fontSize="sm">Results will appear here.</Text>
                              </Box>
                            ) : (
                              <VStack align="stretch" spacing={0} divider={<Divider />}>
                                {userResults.map((row: any) => {
                                  const user = row.user || row;
                                  const isSelected = selectedUsers.some((item) => item._id === user._id);
                                  return (
                                    <HStack
                                      key={user._id}
                                      p={3}
                                      cursor="pointer"
                                      bg={isSelected ? "blue.50" : "transparent"}
                                      _hover={{ bg: isSelected ? "blue.100" : "gray.50" }}
                                      onClick={() => toggleSelectedUser(user)}
                                      justify="space-between"
                                    >
                                      <HStack spacing={3}>
                                        <Avatar size="sm" name={user.name || user.email} src={user.profilePicture} />
                                        <Box>
                                          <Text fontSize="sm" fontWeight="medium" color="gray.900" noOfLines={1}>{user.name || "Unnamed User"}</Text>
                                          <Text fontSize="xs" color="gray.500" noOfLines={1}>{user.email || user.username}</Text>
                                        </Box>
                                      </HStack>
                                      {isSelected && <Icon as={FiCheckCircle} color="blue.500" flexShrink={0} />}
                                    </HStack>
                                  );
                                })}
                              </VStack>
                            )}
                          </Box>
                        </Box>

                        {/* Selected Staging Area */}
                        <Box bg="white" p={6} borderRadius="2xl" borderWidth="1px" borderColor="gray.200" shadow="sm">
                           <Text fontWeight="bold" fontSize="lg" mb={1} color="gray.900">Selected Learners ({selectedUsers.length})</Text>
                           <Text color="gray.500" fontSize="sm" mb={6}>These individuals will receive the curriculum.</Text>

                           {selectedUsers.length === 0 ? (
                              <Flex align="center" justify="center" h="200px" border="2px dashed" borderColor="gray.200" borderRadius="xl" bg="gray.50">
                                <Text color="gray.400">No learners selected yet.</Text>
                              </Flex>
                           ) : (
                             <Wrap spacing={3}>
                               {selectedUsers.map((user) => (
                                 <WrapItem key={user._id}>
                                   <Tag size="lg" borderRadius="full" variant="subtle" colorScheme="blue" pl={1} pr={3} py={1.5} boxShadow="sm">
                                     <Avatar size="xs" name={user.name || user.email} src={user.profilePicture} mr={2} />
                                     <TagLabel fontWeight="medium" fontSize="sm">{user.name || user.email}</TagLabel>
                                     <TagCloseButton onClick={() => toggleSelectedUser(user)} ml={2} />
                                   </Tag>
                                 </WrapItem>
                               ))}
                             </Wrap>
                           )}
                        </Box>
                      </Grid>
                    )}

                    {/* Final Review Summary block */}
                    <Box bg="white" p={8} borderRadius="2xl" borderWidth="1px" borderColor="gray.200" shadow="sm" position="relative" overflow="hidden">
                      <Box position="absolute" top={0} left={0} w="4px" h="full" bg="blue.500" />
                      <Text fontWeight="bold" fontSize="xl" mb={6} color="gray.900">Assignment Summary</Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacingY={8} spacingX={6}>
                        <Box>
                          <Text fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.400" mb={2} letterSpacing="wider">Curriculum</Text>
                          <Text fontWeight="bold" fontSize="lg" color="gray.900">{selectedCourses.length} Course{selectedCourses.length !== 1 && 's'}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.400" mb={2} letterSpacing="wider">Organization</Text>
                          <Text fontWeight="bold" fontSize="lg" color="gray.900">{selectedCompany?.company_name || "N/A"}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.400" mb={2} letterSpacing="wider">Audience Scope</Text>
                          <Text fontWeight="bold" fontSize="lg" color="gray.900">
                            {assignmentTarget === "company" ? "Entire Company"
                              : assignmentTarget === "department" ? `Dept: ${departmentName}`
                              : `${selectedUsers.length} Selected Learner(s)`}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.400" mb={2} letterSpacing="wider">Access Expiry</Text>
                          <Text fontWeight="bold" fontSize="lg" color="gray.900">{noExpiry ? "Lifetime" : formatDate(validTill)}</Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </SlideFade>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" p={{ base: 6, md: 8 }} bg="white">
            <HStack justify="space-between" w="full">
              <Button size="lg" variant="ghost" colorScheme="gray" onClick={() => (step === 0 ? handleClose() : setStep((current) => current - 1))}>
                {step === 0 ? "Cancel" : "Back"}
              </Button>

              {step < STEPS.length - 1 ? (
                <Button size="lg" colorScheme="blue" onClick={() => setStep((current) => current + 1)} isDisabled={!canContinue} px={10}>
                  Continue
                </Button>
              ) : (
                <Button size="lg" colorScheme="blue" onClick={handleSubmit} isLoading={courseStore.isAssignmentSubmitting} isDisabled={!canContinue} px={10} shadow="md">
                  Confirm & Assign
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