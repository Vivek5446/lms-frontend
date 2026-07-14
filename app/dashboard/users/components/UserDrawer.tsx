"use client";

import {
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
  Flex,
  HStack,
  IconButton,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Building2, Image as ImageIcon, Layers, Lock, User, ArrowLeft } from "lucide-react";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import { genderOptions } from "../../../config/constant";
import ManagerHierarchy from "./ManagerHierarchy";

/* ================= SECTION CARD ================= */
const SectionCard = ({ title, icon, children, color }: any) => {
  const labelColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box mb={{ base: 2, md: 4 }}>
      <Flex align="center" mb={4} gap={2}>
        <Icon as={icon} color={labelColor} boxSize={4} />
        <Text fontSize="11px" fontWeight="800" color={labelColor} letterSpacing="0.15em" textTransform="uppercase">
          {title}
        </Text>
      </Flex>
      {children}
    </Box>
  );
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;

const getTodayDateValue = () => {
  const today = new Date();
  return today.toISOString().slice(0, 10);
};

const isFutureDate = (value?: string) => {
  if (!value) {
    return false;
  }

  const selectedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(selectedDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate.getTime() > today.getTime();
};

const buildUserFormErrors = ({
  userForm,
  isSuperadmin,
  availableDepartments,
  isDepartmentRequired,
}: {
  userForm: any;
  isSuperadmin: boolean;
  availableDepartments: string[];
  isDepartmentRequired: boolean;
}) => {
  const errors: Record<string, string> = {};
  const trimmedCode = String(userForm.code || "").trim();
  const trimmedName = String(userForm.name || "").trim();
  const trimmedEmail = String(userForm.email || "").trim().toLowerCase();
  const trimmedMobile = String(userForm.mobileNumber || "").trim();
  const trimmedDesignation = String(userForm.designation || "").trim();
  const trimmedDepartment = String(userForm.department || "").trim();
  const requiresGender = !userForm.id;

  if (!trimmedCode) {
    errors.code = "Employee code is required.";
  }

  if (!trimmedName) {
    errors.name = "Full name is required.";
  }

  if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!trimmedMobile) {
    errors.mobileNumber = "Mobile number is required.";
  } else if (!PHONE_PATTERN.test(trimmedMobile)) {
    errors.mobileNumber = "Enter a valid mobile number.";
  }

  if (!trimmedDesignation) {
    errors.designation = "Designation is required.";
  }

  if (!String(userForm.role || "").trim()) {
    errors.role = "Role is required.";
  }

  if (isSuperadmin && !String(userForm.companyId || "").trim()) {
    errors.companyId = "Company selection is required.";
  }

  if (isDepartmentRequired && !trimmedDepartment) {
    errors.department = "Department is required for this role.";
  } else if (
    trimmedDepartment &&
    availableDepartments.length > 0 &&
    !availableDepartments.includes(trimmedDepartment)
  ) {
    errors.department = "Select a valid department for the chosen company.";
  }

  if (requiresGender && !userForm.gender) {
    errors.gender = "Gender is required.";
  }

  if (userForm.dateOfBirth && isFutureDate(userForm.dateOfBirth)) {
    errors.dateOfBirth = "Date of birth cannot be in the future.";
  }

  return errors;
};

/* ================= MAIN ================= */
const UserDrawer = ({
  isOpen,
  onClose,
  userForm,
  setUserForm,
  roleOptions,
  isSuperadmin,
  filteredCompanies,
  currentCompanyDepartments,
  borderColor,
  muted,
  currentCompanyName,
  managerCompanyId,
  updateRole,
  setManagerSelection,
  onSubmit,
  loading,
  canAssignManagers = true,
}: any) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const availableDepartments = isSuperadmin
    ? filteredCompanies.find((company: any) => company?._id === userForm.companyId)?.departments || []
    : currentCompanyDepartments || [];
  const isDepartmentRequired = userForm.role === "departmenthead";
  const validationErrors = useMemo(
    () =>
      buildUserFormErrors({
        userForm,
        isSuperadmin,
        availableDepartments,
        isDepartmentRequired,
      }),
    [
      availableDepartments,
      isDepartmentRequired,
      isSuperadmin,
      userForm,
    ]
  );

  useEffect(() => {
    if (userForm?.pic?.file instanceof File) {
      const url = URL.createObjectURL(userForm.pic.file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    setPreview(userForm?.pic?.url || null);
  }, [userForm?.pic]);

  const todayDate = getTodayDateValue();

  useEffect(() => {
    if (!isOpen) {
      setSubmitAttempted(false);
    }
  }, [isOpen]);

  const handleValidatedSubmit = async () => {
    setSubmitAttempted(true);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit();
  };

  const placement = useBreakpointValue({ base: "bottom", md: "right" }) as "bottom" | "right";

  return (
    <Drawer isOpen={isOpen} placement={placement} size={{ base: "full", md: "xl" }} onClose={onClose} blockScrollOnMount={false}>
      <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <DrawerContent h="100vh" overflow="hidden" bg={useColorModeValue("white", "gray.900")} borderTopRadius={{ base: "2xl", md: "none" }}>

        {/* BODY */}
        <DrawerBody 
          p={0} 
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "4px" },
          }}
        >
          <Box w="100%" px={{ base: 5, md: 8 }} pt={{ base: 4, md: 5 }} pb="130px">
            
            {/* HEADER */}
            <HStack mb={{ base: 4, md: 5 }} spacing={4} align="center" justify="space-between">
              <HStack spacing={4}>
                <IconButton
                  aria-label="Close"
                  icon={<ArrowLeft size={17} />}
                  onClick={onClose}
                  variant="solid"
                  borderRadius="full"
                  w={{ base: "36px", md: "42px" }} h={{ base: "36px", md: "42px" }}
                  bg={useColorModeValue("gray.100", "gray.800")}
                  color={useColorModeValue("gray.700", "gray.200")}
                  border="1px solid"
                  borderColor={useColorModeValue("gray.200", "gray.700")}
                  boxShadow="sm"
                  _hover={{ bg: useColorModeValue("gray.200", "gray.700"), transform: "scale(1.05)" }}
                  _active={{ transform: "scale(0.95)" }}
                  transition="all 0.2s"
                  flexShrink={0}
                />
                <Box>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                    <Box as="span" color={useColorModeValue("gray.800", "white")}>{userForm.id ? "EDIT " : "ADD "}</Box>
                    <Box as="span" bgGradient="linear(to-r, #6269FF, #8A2BE2)" bgClip="text">
                      USER
                    </Box>
                  </Text>
                  <Text fontSize="10px" color={useColorModeValue("gray.500", "gray.400")} fontWeight="700" letterSpacing="0.2em" mt={0.5}>
                    {userForm.id ? "UPDATE USER DETAILS" : "CREATE A NEW USER"}
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">
                {userForm.role}
              </Badge>
            </HStack>

            <VStack align="stretch" spacing={6}>
            <SectionCard title="Profile Image" icon={ImageIcon} color="purple">
              {preview ? (
                <Flex direction="column" gap={4}>
                  <Box
                    borderRadius="lg"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="gray.200"
                    maxW="200px"
                  >
                    <img
                      src={preview}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() =>
                      setUserForm((p: any) => ({
                        ...p,
                        pic: {
                          ...p.pic,
                          file: null,
                          url: "",
                          isDeleted: 1,
                          isAdd: 0,
                        },
                      }))
                    }
                  >
                    Remove Image
                  </Button>
                </Flex>
              ) : (
                <CustomInput
                  type="file-drag"
                  name="pic"
                  accept="image/*"
                  onChange={(e: any) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      return;
                    }

                    setUserForm((p: any) => ({
                      ...p,
                      pic: {
                        ...p.pic,
                        file,
                        isAdd: 1,
                        isDeleted: 0,
                        url: "",
                      },
                    }));
                  }}
                />
              )}
            </SectionCard>

            {/* EMPLOYEE */}
            <SectionCard title="Employee Details" icon={User} color="blue">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <CustomInput
                  label="Employee Code"
                  name="code"
                  placeholder="Enter employee code"
                  value={userForm.code}
                  error={validationErrors.code}
                  showError={submitAttempted}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, code: e.target.value }))
                  }
                />
                <CustomInput
                  label="Profile ID"
                  name="profileId"
                  placeholder="Generated automatically after creation"
                  value={userForm.profileId || ""}
                  disabled
                  readOnly
                />
                <CustomInput
                  label="Full Name"
                  name="name"
                  placeholder="Enter full name"
                  value={userForm.name}
                  error={validationErrors.name}
                  showError={submitAttempted}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, name: e.target.value }))
                  }
                />
                <CustomInput
                  label="Email (Optional)"
                  name="email"
                  placeholder="Enter email address"
                  value={userForm.email}
                  error={validationErrors.email}
                  showError={submitAttempted}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, email: e.target.value }))
                  }
                />
                <CustomInput
                  label="Phone Number"
                  name="mobileNumber"
                  placeholder="Enter mobile number"
                  value={userForm.mobileNumber}
                  error={validationErrors.mobileNumber}
                  showError={submitAttempted}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, mobileNumber: e.target.value }))
                  }
                />
                <CustomInput
                  label="Designation"
                  name="designation"
                  placeholder="Enter designation"
                  value={userForm.designation}
                  error={validationErrors.designation}
                  showError={submitAttempted}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, designation: e.target.value }))
                  }
                />
                <CustomInput
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  maxDate={todayDate}
                  value={userForm.dateOfBirth}
                  error={validationErrors.dateOfBirth}
                  showError={submitAttempted}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, dateOfBirth: e.target.value }))
                  }
                />
                <CustomInput
                  type="select"
                  label="Gender"
                  name="gender"
                  placeholder="Select gender"
                  value={genderOptions.find((option: any) => option.value === userForm.gender) || null}
                  error={validationErrors.gender}
                  showError={submitAttempted}
                  onChange={(option: any) =>
                    setUserForm((p: any) => ({ ...p, gender: option?.value ?? "" }))
                  }
                  options={genderOptions}
                />
                <CustomInput
                  label="Joining Date"
                  name="joiningDate"
                  type="date"
                  value={userForm.joiningDate}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, joiningDate: e.target.value }))
                  }
                />
                <CustomInput
                  type="select"
                  label="Role"
                  name="role"
                  placeholder="Select role"
                  value={roleOptions.find((r: any) => r.value === userForm.role) || null}
                  error={validationErrors.role}
                  showError={submitAttempted}
                  onChange={(option: any) => updateRole(option?.value || "user")}
                  options={roleOptions}
                />
                <CustomInput
                  type="select"
                  label="Department"
                  name="department"
                  required={isDepartmentRequired}
                  placeholder="Select department"
                  value={
                    userForm.department
                      ? { label: userForm.department, value: userForm.department }
                      : null
                  }
                  error={validationErrors.department}
                  showError={submitAttempted}
                  onChange={(option: any) =>
                    setUserForm((p: any) => ({ ...p, department: option?.value || "" }))
                  }
                  options={availableDepartments.map((department: string) => ({
                    label: department,
                    value: department,
                  }))}
                />
                <CustomInput
                  label="City"
                  name="city"
                  placeholder="Enter city"
                  value={userForm.city}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, city: e.target.value }))
                  }
                />
                <CustomInput
                  label="State"
                  name="state"
                  placeholder="Enter state"
                  value={userForm.state}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, state: e.target.value }))
                  }
                />
              </SimpleGrid>

            </SectionCard>

            <SectionCard title="Authentication" icon={Lock} color="green">
              <Text fontSize="sm" color={muted}>
                All managed accounts now sign in with their phone number and OTP. No password setup or account emails are sent from this flow.
              </Text>
            </SectionCard>

            {/* COMPANY */}
            <SectionCard title="Company" icon={Building2} color="purple">
              {isSuperadmin ? (
                <VStack align="stretch" spacing={4}>
                  <CustomInput
                    type="select"
                    label="Select company"
                    name="companyId"
                    placeholder="Select company"
                    value={
                      filteredCompanies
                        .map((c: any) => ({ label: c.company_name, value: c._id }))
                        .find((option: any) => option.value === userForm.companyId) || null
                    }
                    error={validationErrors.companyId}
                    showError={submitAttempted}
                    onChange={(option: any) =>
                      setUserForm((p: any) => ({
                        ...p,
                        companyId: option?.value || "",
                        department: "",
                      }))
                    }
                    options={filteredCompanies.map((c: any) => ({
                      label: c.company_name,
                      value: c._id,
                    }))}
                    isSearchable
                  />
                </VStack>
              ) : (
                <Box p={3} borderRadius="md" bg="gray.100">
                  {currentCompanyName}
                </Box>
              )}
            </SectionCard>

            {/* HIERARCHY */}
            <SectionCard title="Manager Hierarchy" icon={Layers} color="orange">
              {!canAssignManagers ? (
                <Text fontSize="sm" color={muted}>
                  Manager assignment is disabled for this account.
                </Text>
              ) : null}
              <ManagerHierarchy
                managers={userForm.managers}
                role={userForm.role}
                managerCompanyId={managerCompanyId}
                createCompany={userForm.createCompany}
                muted={muted}
                borderColor={borderColor}
                onChange={setManagerSelection}
                isDisabled={!canAssignManagers}
              />
            </SectionCard>

            </VStack>
          </Box>
        </DrawerBody>

        {/* FOOTER */}
        <Box
          position="absolute" bottom={0} left={0} right={0}
          bg={useColorModeValue("linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 30%)", "linear-gradient(180deg, rgba(23,25,35,0) 0%, rgba(23,25,35,1) 30%)")}
          px={{ base: 5, md: 8 }} pb={{ base: 6, md: 8 }} pt={8}
          zIndex={10}
        >
          <Box w="100%">
            <Button
              w="full" h={{ base: "52px", md: "56px" }}
              borderRadius="xl"
              bgGradient="linear(to-r, #6269FF, #4F46E5)"
              color="white"
              fontSize={{ base: "sm", md: "md" }} fontWeight="900" letterSpacing="0.1em"
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 10px 30px rgba(98,105,255,0.5)", bgGradient: "linear(to-r, #4F46E5, #6269FF)" }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
              onClick={handleValidatedSubmit} 
              isLoading={loading}
              border="1px solid"
              borderColor="rgba(255,255,255,0.1)"
            >
              {userForm.id ? "UPDATE USER" : "CREATE USER"}
            </Button>
          </Box>
        </Box>
      </DrawerContent>
    </Drawer>
  );
};

export default UserDrawer;
