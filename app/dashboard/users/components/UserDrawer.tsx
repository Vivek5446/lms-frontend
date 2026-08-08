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
import { Country, State, City } from "country-state-city";

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
const PHONE_PATTERN = /^(?:\+?[0-9]{1,3})?[-.\s]?[0-9]{10}$/;

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
  availableDepartments: any[];
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

  if (userForm.id && isSuperadmin && !String(userForm.companyId || "").trim()) {
    errors.companyId = "Company selection is required.";
  }

  const departmentNames = availableDepartments.map((d: any) => typeof d === 'object' ? d.departmentName || d.name || d.code : d);

  if (isDepartmentRequired && !trimmedDepartment) {
    errors.department = "Department is required for this role.";
  } else if (
    trimmedDepartment &&
    departmentNames.length > 0 &&
    !departmentNames.includes(trimmedDepartment)
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
  availableDepartments = [],
  updateRole,
  onSubmit,
  loading
}: any) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const allCountries = Country.getAllCountries();
  const selectedCountry = allCountries.find((c: any) => c.name === userForm.country);
  const countryCode = selectedCountry?.isoCode || "";

  const availableStates = countryCode ? State.getStatesOfCountry(countryCode) : [];
  const selectedState = availableStates.find((s: any) => s.name === userForm.state);
  const stateCode = selectedState?.isoCode || "";

  const availableCities = (countryCode && stateCode) ? City.getCitiesOfState(countryCode, stateCode) : [];
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
    <Drawer isOpen={isOpen} placement={placement} size="full" onClose={onClose} blockScrollOnMount={false}>
      <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <DrawerContent maxW={{ base: "100%", md: "85%" }} w={{ base: "100%", md: "85%" }} h="100vh" overflow="hidden" bg={useColorModeValue("white", "gray.900")} borderTopRadius={{ base: "2xl", md: "none" }}>

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
                  disabled={!!userForm?.id}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, code: e.target.value }))
                  }
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
                  options={availableDepartments.map((department: any) => {
                    const deptName = typeof department === 'object' ? department.departmentName || department.name || department.code : department;
                    return {
                      label: deptName,
                      value: deptName,
                    };
                  })}
                />
                <CustomInput
                  label="Bio"
                  name="bio"
                  placeholder="Enter bio"
                  value={userForm.bio}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, bio: e.target.value }))
                  }
                />
                <CustomInput
                  type="select"
                  label="Country"
                  name="country"
                  placeholder="Select country"
                  value={userForm.country ? { label: userForm.country, value: userForm.country } : null}
                  onChange={(option: any) =>
                    setUserForm((p: any) => ({ ...p, country: option?.value || "", state: "", city: "" }))
                  }
                  options={allCountries.map((c: any) => ({ label: c.name, value: c.name }))}
                  isSearchable
                />
                <CustomInput
                  type="select"
                  label="State"
                  name="state"
                  placeholder="Select state"
                  value={userForm.state ? { label: userForm.state, value: userForm.state } : null}
                  onChange={(option: any) =>
                    setUserForm((p: any) => ({ ...p, state: option?.value || "", city: "" }))
                  }
                  options={availableStates.map((s: any) => ({ label: s.name, value: s.name }))}
                  isSearchable
                  disabled={!userForm.country}
                />
                <CustomInput
                  type="select"
                  label="City"
                  name="city"
                  placeholder="Select city"
                  value={userForm.city ? { label: userForm.city, value: userForm.city } : null}
                  onChange={(option: any) =>
                    setUserForm((p: any) => ({ ...p, city: option?.value || "" }))
                  }
                  options={availableCities.map((c: any) => ({ label: c.name, value: c.name }))}
                  isSearchable
                  disabled={!userForm.state}
                />
                <CustomInput
                  label="Location"
                  name="location"
                  placeholder="Enter location"
                  value={userForm.address}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, address: e.target.value }))
                  }
                />
              </SimpleGrid>

            </SectionCard>

            </VStack>
          </Box>
        </DrawerBody>

        {/* FOOTER */}
        <Box
          position="absolute" bottom={0} left={0} right={0}
          bg={useColorModeValue("linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 30%)", "linear-gradient(180deg, rgba(23,25,35,0) 0%, rgba(23,25,35,1) 30%)")}
          px={{ base: 5, md: 8 }}
          pb={{ base: "calc(env(safe-area-inset-bottom, 20px) + 32px)", md: 8 }}
          pt={8}
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
