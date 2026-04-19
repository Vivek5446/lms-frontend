"use client";

import {
    Badge,
    Box,
    Button,
    Checkbox,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Icon,
    SimpleGrid,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Building2, Image as ImageIcon, Layers, Lock, User } from "lucide-react";
import CustomInput from "../../../component/config/component/customInput/CustomInput";
import ManagerHierarchy from "./ManagerHierarchy";

/* ================= SECTION CARD ================= */
const SectionCard = ({ title, icon, children, color }: any) => {
  const bg = useColorModeValue("white", "gray.800");

  const colorMap: any = {
    blue: { icon: "blue.500", text: "blue.600", bg: "blue.50" },
    green: { icon: "green.500", text: "green.600", bg: "green.50" },
    purple: { icon: "purple.500", text: "purple.600", bg: "purple.50" },
    orange: { icon: "orange.500", text: "orange.600", bg: "orange.50" },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <Box
      p={5}
      borderRadius="xl"
      bg={bg}
      boxShadow="base"
      border="1px solid"
      borderColor="gray.200"
    >
      <Flex align="center" mb={4} gap={2}>
        <Box p={2} borderRadius="md" bg={theme.bg}>
          <Icon as={icon} color={theme.icon} />
        </Box>
        <Text fontSize="lg" fontWeight="bold" color={theme.text}>
          {title}
        </Text>
      </Flex>
      {children}
    </Box>
  );
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
  const availableDepartments = isSuperadmin
    ? filteredCompanies.find((company: any) => company?._id === userForm.companyId)?.departments || []
    : currentCompanyDepartments || [];
  const needsDirectPassword =
    userForm.role === "admin" || userForm.role === "departmenthead";

  useEffect(() => {
    if (userForm?.pic?.file instanceof File) {
      const url = URL.createObjectURL(userForm.pic.file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    setPreview(userForm?.pic?.url || null);
  }, [userForm?.pic]);

  return (
    <Drawer isOpen={isOpen} placement="right" size="xl" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent bg={useColorModeValue("gray.50", "gray.900")}>
        <DrawerCloseButton />

        {/* HEADER */}
        <DrawerHeader borderBottom="1px solid" borderColor="gray.200">
          <Flex align="center" justify="space-between">
            <Text fontWeight="bold">
              {userForm.id ? "Edit User" : "Add User"}
            </Text>

            <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
              {userForm.role}
            </Badge>
          </Flex>
        </DrawerHeader>

        {/* BODY */}
        <DrawerBody>
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
                  value={userForm.code}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, code: e.target.value }))
                  }
                />
                <CustomInput
                  label="Name"
                  name="name"
                  value={userForm.name}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, name: e.target.value }))
                  }
                />
                <CustomInput
                  label="Email"
                  name="email"
                  value={userForm.email}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, email: e.target.value }))
                  }
                />
                <CustomInput
                  label="Mobile"
                  name="mobileNumber"
                  value={userForm.mobileNumber}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, mobileNumber: e.target.value }))
                  }
                />
                <CustomInput
                  label="Designation"
                  name="designation"
                  value={userForm.designation}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, designation: e.target.value }))
                  }
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
                  value={roleOptions.find((r: any) => r.value === userForm.role) || null}
                  onChange={(option: any) => updateRole(option?.value || "user")}
                  options={roleOptions}
                />
                <CustomInput
                  type="select"
                  label="Department"
                  name="department"
                  value={
                    userForm.department
                      ? { label: userForm.department, value: userForm.department }
                      : null
                  }
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
                  value={userForm.city}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, city: e.target.value }))
                  }
                />
                <CustomInput
                  label="State"
                  name="state"
                  value={userForm.state}
                  onChange={(e: any) =>
                    setUserForm((p: any) => ({ ...p, state: e.target.value }))
                  }
                />
              </SimpleGrid>

            </SectionCard>

            <SectionCard title="Authentication" icon={Lock} color="green">
              {needsDirectPassword ? (
                <>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <CustomInput
                      label={userForm.id ? "New Password" : "Password"}
                      name="password"
                      type="password"
                      value={userForm.password}
                      onChange={(e: any) =>
                        setUserForm((p: any) => ({ ...p, password: e.target.value }))
                      }
                    />
                    <CustomInput
                      label={userForm.id ? "Confirm New Password" : "Confirm Password"}
                      name="confirmPassword"
                      type="password"
                      value={userForm.confirmPassword}
                      onChange={(e: any) =>
                        setUserForm((p: any) => ({ ...p, confirmPassword: e.target.value }))
                      }
                    />
                  </SimpleGrid>
                  <Text fontSize="sm" color={muted} mt={3}>
                    {userForm.id
                      ? "Leave these blank if you do not want to change the password."
                      : "Admin and department head accounts get an immediate password instead of a setup email."}
                  </Text>
                </>
              ) : (
                <>
                  <Checkbox
                    isChecked={userForm.resendSetupEmail}
                    onChange={(e) =>
                      setUserForm((p: any) => ({
                        ...p,
                        resendSetupEmail: e.target.checked,
                      }))
                    }
                  >
                    Send setup email
                  </Checkbox>
                  <Text fontSize="sm" color={muted} mt={3}>
                    Users and managers receive an email to set their own password.
                  </Text>
                </>
              )}
            </SectionCard>

            {/* COMPANY */}
            <SectionCard title="Company" icon={Building2} color="purple">
              {isSuperadmin ? (
                <VStack align="stretch" spacing={4}>
                  <CustomInput
                    type="select"
                    label="Select company"
                    name="companyId"
                    value={
                      filteredCompanies
                        .map((c: any) => ({ label: c.company_name, value: c._id }))
                        .find((option: any) => option.value === userForm.companyId) || null
                    }
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
        </DrawerBody>

        {/* FOOTER */}
        <DrawerFooter borderTop="1px solid" borderColor="gray.200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={onSubmit} isLoading={loading}>
            {userForm.id ? "Update User" : "Create User"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default UserDrawer;
