import { Box, Button, Flex, Grid, HStack, Stack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiUser } from "react-icons/fi";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { UserApproval, WorkflowConfig } from "../../types/config";
import UserSearchInput from "./UserSearchInput";

interface UserApprovalsSectionProps {
  config: WorkflowConfig;
  onChange: (updates: Partial<WorkflowConfig>) => void;
  errors?: Record<string, string>;
}

const UserApprovalsSection = ({ config, onChange, errors = {} }: UserApprovalsSectionProps) => {
  const levelOptions = Array.from({ length: config.noOfLevels }, (_, i) => ({
    label: `Level ${i + 1}`,
    value: String(i + 1),
  }));

  const addUser = () => {
    const newUser: UserApproval = {
      id: crypto.randomUUID(),
      email: "",
      designation: "",
      role: "approver",
      level: 1,
      active: true,
      canViewDocument: true,
      canDownloadDocument: false,
    };
    onChange({ userApprovals: [...config.userApprovals, newUser] });
  };

  const updateUser = (id: string, updates: Partial<UserApproval>) => {
    onChange({
      userApprovals: config.userApprovals.map((u) =>
        u.id === id ? { ...u, ...updates } : u
      ),
    });
  };

  const removeUser = (id: string) => {
    onChange({
      userApprovals: config.userApprovals.filter((u) => u.id !== id),
    });
  };

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Box mb={2}>
        <Text fontSize="xl" fontWeight="bold">
          User Approvals
        </Text>
        <Text fontSize="sm" color="gray.500">
          Search for existing users or create new ones and assign their roles and levels
        </Text>
      </Box>

      {/* Add User Button */}
      <Flex justify="flex-end">
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={addUser}
          rounded="full"
          shadow="sm"
          px={6}
          _hover={{ transform: "translateY(-1px)", shadow: "md" }}
        >
          Add User
        </Button>
      </Flex>

      {/* Empty State */}
      {config.userApprovals.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={12}
          border="2px dashed"
          borderColor={borderColor}
          rounded="2xl"
          bg={useColorModeValue("gray.50", "gray.900")}
        >
          <Box p={4} bg="brand.100" color="brand.500" rounded="full" mb={4}>
            <FiUser size={24} />
          </Box>
          <Text fontSize="md" fontWeight="medium" color="gray.600">
            No users added yet
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Click "Add User Slot" to start defining the approval chain.
          </Text>
        </Flex>
      ) : (
        <Stack spacing={4}>
          {config.userApprovals.map((user, index) => (
            <Box
              key={user.id}
              p={{base:2,md:6}}
              border="1px solid"
              borderColor={borderColor}
              rounded="2xl"
              bg={bgCard}
              shadow="sm"
              transition="all 0.2s"
              _hover={{ shadow: "md", borderColor: "brand.200" }}
            >
              {/* Card Header */}
              <Flex
                justify="space-between"
                align="center"
                mb={5}
                pb={3}
                borderBottom="1px solid"
                borderColor={borderColor}
              >
                <HStack>
                  <Box p={2} bg="brand.50" color="brand.500" rounded="lg">
                    <FiUser size={16} />
                  </Box>
                  <Text fontSize="sm" color="brand.700" fontWeight="bold">
                    User #{index + 1}
                  </Text>
                </HStack>

                <HStack gap={4}>
                  <Flex align="center" gap={2}>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Active
                    </Text>
                    <CustomInput
                      name={`active-${user.id}`}
                      type="switch"
                      value={user.active}
                      onChange={(e: any) =>
                        updateUser(user.id, { active: e.target.checked })
                      }
                    />
                  </Flex>

                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeUser(user.id)}
                    rounded="full"
                  >
                    <FiTrash2 />
                  </Button>
                </HStack>
              </Flex>

              {/* Row 1 — User Search + Designation + Role */}
              <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={5}>
                {/* Real-time user search */}
                <UserSearchInput
                  label="User"
                  value={
                    user.email
                      ? { email: user.email, name: (user as any).name || user.email }
                      : null
                  }
                  onChange={(selected) => {
                    if (selected) {
                      updateUser(user.id, {
                        email: selected.email,
                        designation: selected.designation || user.designation,
                        ...(selected.userId ? ({ userId: selected.userId } as any) : {}),
                      });
                    } else {
                      updateUser(user.id, { email: "", designation: "" });
                    }
                  }}
                  placeholder="Search by name or email..."
                />

                <CustomInput
                  label="Designation"
                  name={`designation-${user.id}`}
                  type="text"
                  placeholder="e.g. Manager"
                  value={user.designation}
                  onChange={(e: any) =>
                    updateUser(user.id, { designation: e.target.value })
                  }
                />

                <CustomInput
                  label="Role"
                  name={`role-${user.id}`}
                  type="select"
                  value={{
                    label: user.role,
                    value: user.role,
                  }}
                  onChange={(opt: any) =>
                    updateUser(user.id, { role: opt?.value })
                  }
                  options={[
                    { label: "Approver", value: "approver" },
                    { label: "Viewer", value: "viewer" },
                    { label: "Uploader", value: "uploader" },
                    { label: "Admin", value: "admin" },
                  ]}
                />
              </Grid>

              {/* Row 2 — Level + Permissions */}
              <Grid
                templateColumns={{ base: "1fr", md: "160px 1fr" }}
                gap={5}
                mt={5}
                alignItems="start"
              >
                <CustomInput
                  label="Level"
                  name={`level-${user.id}`}
                  type="select"
                  value={{
                    label: `Level ${user.level}`,
                    value: String(user.level),
                  }}
                  onChange={(opt: any) =>
                    updateUser(user.id, { level: parseInt(opt?.value) })
                  }
                  options={levelOptions}
                />

                <Flex gap={3} pt={{ base: 0, md: 6 }} wrap="wrap">
                  <Flex
                    align="center"
                    gap={3}
                    p={2}
                    rounded="lg"
                    bg={useColorModeValue("gray.50", "gray.700")}
                    flex="1"
                    minW="120px"
                  >
                    <CustomInput
                      name={`canView-${user.id}`}
                      type="switch"
                      value={user.canViewDocument}
                      onChange={(e: any) =>
                        updateUser(user.id, {
                          canViewDocument: e.target.checked,
                        })
                      }
                    />
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      fontWeight="medium"
                      whiteSpace="nowrap"
                    >
                      Can View
                    </Text>
                  </Flex>

                  <Flex
                    align="center"
                    gap={3}
                    p={2}
                    rounded="lg"
                    bg={useColorModeValue("gray.50", "gray.700")}
                    flex="1"
                    minW="150px"
                  >
                    <CustomInput
                      name={`canDownload-${user.id}`}
                      type="switch"
                      value={user.canDownloadDocument}
                      onChange={(e: any) =>
                        updateUser(user.id, {
                          canDownloadDocument: e.target.checked,
                        })
                      }
                    />
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      fontWeight="medium"
                      whiteSpace="nowrap"
                    >
                      Can Download
                    </Text>
                  </Flex>
                </Flex>
              </Grid>
            </Box>
          ))}
        </Stack>
      )}
    </VStack>
  );
};

export default UserApprovalsSection;