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
    FormControl,
    FormLabel,
    Icon,
    Input,
    Select,
    SimpleGrid,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { Layers, User } from "lucide-react";
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
  borderColor,
  muted,
  currentCompanyName,
  managerCompanyId,
  updateRole,
  setManagerSelection,
  onSubmit,
  loading,
}: any) => {
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

            {/* EMPLOYEE */}
            <SectionCard title="Employee Details" icon={User} color="blue">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Employee Code</FormLabel>
                  <Input
                    value={userForm.code}
                    onChange={(e) =>
                      setUserForm((p: any) => ({ ...p, code: e.target.value }))
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm((p: any) => ({ ...p, name: e.target.value }))
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm((p: any) => ({ ...p, email: e.target.value }))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Mobile</FormLabel>
                  <Input
                    value={userForm.mobileNumber}
                    onChange={(e) =>
                      setUserForm((p: any) => ({
                        ...p,
                        mobileNumber: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Designation</FormLabel>
                  <Input
                    value={userForm.designation}
                    onChange={(e) =>
                      setUserForm((p: any) => ({
                        ...p,
                        designation: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={userForm.role}
                    onChange={(e) => updateRole(e.target.value)}
                  >
                    {roleOptions.map((r: any) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Branch</FormLabel>
                  <Input
                    placeholder="Enter branch"
                    value={userForm.branch}
                    onChange={(e) =>
                      setUserForm((p: any) => ({
                        ...p,
                        branch: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input
                    placeholder="Enter city"
                    value={userForm.city}
                    onChange={(e) =>
                      setUserForm((p: any) => ({
                        ...p,
                        city: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>State</FormLabel>
                  <Input
                    placeholder="Enter state"
                    value={userForm.state}
                    onChange={(e) =>
                      setUserForm((p: any) => ({
                        ...p,
                        state: e.target.value,
                      }))
                    }
                  />
                </FormControl>
              </SimpleGrid>

              <Checkbox
                mt={4}
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
            </SectionCard>

            {/* COMPANY */}
            {/* <SectionCard title="Company" icon={Building2} color="purple">
              {isSuperadmin ? (
                <VStack align="stretch" spacing={4}>
                  <Checkbox
                    isChecked={userForm.createCompany}
                    onChange={(e) =>
                      setUserForm((p: any) => ({
                        ...p,
                        createCompany: e.target.checked,
                        companyId: "",
                      }))
                    }
                  >
                    Create new company
                  </Checkbox>

                  {userForm.createCompany ? (
                    <Input
                      placeholder="Company name"
                      value={userForm.companyName}
                      onChange={(e) =>
                        setUserForm((p: any) => ({
                          ...p,
                          companyName: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <Select
                      placeholder="Select company"
                      value={userForm.companyId}
                      onChange={(e) =>
                        setUserForm((p: any) => ({
                          ...p,
                          companyId: e.target.value,
                        }))
                      }
                    >
                      {filteredCompanies.map((c: any) => (
                        <option key={c._id} value={c._id}>
                          {c.company_name}
                        </option>
                      ))}
                    </Select>
                  )}
                </VStack>
              ) : (
                <Box p={3} borderRadius="md" bg="gray.100">
                  {currentCompanyName}
                </Box>
              )}
            </SectionCard> */}

            {/* HIERARCHY */}
            <SectionCard title="Manager Hierarchy" icon={Layers} color="orange">
              <ManagerHierarchy
                managers={userForm.managers}
                role={userForm.role}
                managerCompanyId={managerCompanyId}
                createCompany={userForm.createCompany}
                muted={muted}
                borderColor={borderColor}
                onChange={setManagerSelection}
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
