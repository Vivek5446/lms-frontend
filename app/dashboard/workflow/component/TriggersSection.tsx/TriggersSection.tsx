import { Box, Button, Divider, Flex, Grid, Stack, Text, VStack } from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiZap } from "react-icons/fi";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { TriggerConfig, WorkflowConfig } from "../../types/config";

interface TriggersSectionProps {
  config: WorkflowConfig;
  onChange: (updates: Partial<WorkflowConfig>) => void;
  errors?: Record<string, string>;
}

const TriggersSection = ({ config, onChange, errors = {} }: TriggersSectionProps) => {
  const levelOptions = Array.from({ length: config.noOfLevels }, (_, i) => ({
    label: `Level ${i + 1}`,
    value: String(i + 1),
  }));

  const addTrigger = () => {
  const newTrigger: TriggerConfig = {
  id: crypto.randomUUID(),
  type: "approved",
  level: 1,
  isActive: true,
  action: "url",
  method: "",
  hasAuth: false,           // 👈 default false
  authType: "token",
  authToken: "",
  credentials: [],
};
    onChange({ triggers: [...config.triggers, newTrigger] });
  };

  const updateTrigger = (id: string, updates: Partial<TriggerConfig>) => {
    onChange({
      triggers: config.triggers.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    });
  };

  const removeTrigger = (id: string) => {
    onChange({ triggers: config.triggers.filter((t) => t.id !== id) });
  };

  const addCredential = (triggerId: string) => {
    const trigger = config.triggers.find((t) => t.id === triggerId);
    if (!trigger) return;
    updateTrigger(triggerId, {
      credentials: [...trigger.credentials, { key: "", value: "" }],
    });
  };

  const updateCredential = (
    triggerId: string,
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const trigger = config.triggers.find((t) => t.id === triggerId);
    if (!trigger) return;
    const creds = [...trigger.credentials];
    creds[index] = { ...creds[index], [field]: value };
    updateTrigger(triggerId, { credentials: creds });
  };

  const removeCredential = (triggerId: string, index: number) => {
    const trigger = config.triggers.find((t) => t.id === triggerId);
    if (!trigger) return;
    updateTrigger(triggerId, {
      credentials: trigger.credentials.filter((_, i) => i !== index),
    });
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Box mb={2}>
        <Text fontSize="xl" fontWeight="bold">
          Triggers
        </Text>
        <Text fontSize="sm" color="gray.500">
          Define actions triggered on approval or rejection events
        </Text>
      </Box>

      <Button leftIcon={<FiPlus />} colorScheme="brand" rounded="full" shadow="sm" alignSelf="flex-start" onClick={addTrigger}>
        Add Trigger
      </Button>

      {config.triggers.length === 0 ? (
        <Flex direction="column" align="center" justify="center" p={12} border="2px dashed" borderColor="gray.200" rounded="2xl" bg="gray.50">
          <Box p={4} bg="brand.100" color="brand.500" rounded="full" mb={4}>
            <FiZap size={24} />
          </Box>
          <Text fontSize="md" fontWeight="medium" color="gray.600">
            No triggers defined
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Click "Add Trigger" to configure event-based actions.
          </Text>
        </Flex>
      ) : (
        <Stack spacing={4}>
          {config.triggers.map((trigger, index) => (
            <Box
              key={trigger.id}
              p={5}
              border="1px solid"
              borderColor="gray.200"
              rounded="xl"
              bg="white"
              shadow="sm"
              transition="all 0.2s"
              _hover={{ shadow: "md", borderColor: "brand.200" }}
            >
              {/* Card Header */}
              <Flex justify="space-between" align="center" mb={4} pb={2} borderBottom="1px solid" borderColor="gray.100">
                <Flex align="center" gap={2}>
                  <Box p={1.5} bg="orange.100" color="orange.500" rounded="md">
                    <FiZap size={16} />
                  </Box>
                  <Text fontSize="sm" fontWeight="bold" color="brand.700">
                    Trigger #{index + 1}
                  </Text>
                </Flex>

                <Flex align="center" gap={4}>
                  <Flex align="center" gap={2}>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Active
                    </Text>
                    <CustomInput
                      name={`trigger-active-${trigger.id}`}
                      type="switch"
                      value={trigger.isActive}
                      onChange={(e: any) =>
                        updateTrigger(trigger.id, {
                          isActive: e.target.checked,
                        })
                      }
                    />
                  </Flex>

                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    rounded="full"
                    onClick={() => removeTrigger(trigger.id)}
                  >
                    <FiTrash2 />
                  </Button>
                </Flex>
              </Flex>

              {/* Row 1 */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                <CustomInput
                  label="Event Type"
                  name={`trigger-type-${trigger.id}`}
                  type="select"
                  value={{
                    label: trigger.type === "approved" ? "Approved" : "Rejected",
                    value: trigger.type,
                  }}
                  onChange={(opt: any) =>
                    updateTrigger(trigger.id, { type: opt?.value })
                  }
                  options={[
                    { label: "Approved", value: "approved" },
                    { label: "Rejected", value: "rejected" },
                  ]}
                />

                <CustomInput
                  label="Level"
                  name={`trigger-level-${trigger.id}`}
                  type="select"
                  value={{
                    label: `Level ${trigger.level}`,
                    value: String(trigger.level),
                  }}
                  onChange={(opt: any) =>
                    updateTrigger(trigger.id, {
                      level: parseInt(opt?.value),
                    })
                  }
                  options={levelOptions}
                />

                <CustomInput
                  label="Action"
                  name={`trigger-action-${trigger.id}`}
                  type="select"
                  value={{
                    label: trigger.action === "url" ? "URL (Webhook)" : "Email",
                    value: trigger.action,
                  }}
                  onChange={(opt: any) =>
                    updateTrigger(trigger.id, { action: opt?.value })
                  }
                  options={[
                    { label: "URL (Webhook)", value: "url" },
                    { label: "Email", value: "email" },
                  ]}
                />
              </Grid>

              {/* Action Target */}
              {trigger.action === "url" && (
                <Box mt={3}>
                  <CustomInput
                    label="URL / Method"
                    name={`trigger-url-${trigger.id}`}
                    placeholder="https://api.example.com/webhook"
                    value={trigger.method}
                    onChange={(e: any) =>
                      updateTrigger(trigger.id, { method: e.target.value })
                    }
                    error={(trigger.isActive && !trigger.method) ? "URL/Method required" : undefined}
                    showError={trigger.isActive && !trigger.method}
                  />
                </Box>
              )}

              {trigger.action === "email" && (
                <Box mt={3}>
                  <CustomInput
                    label="Email Address"
                    name={`trigger-email-${trigger.id}`}
                    placeholder="webhook@example.com"
                    value={trigger.method}
                    onChange={(e: any) =>
                      updateTrigger(trigger.id, { method: e.target.value })
                    }
                    error={(trigger.isActive && !trigger.method) ? "Email required" : undefined}
                    showError={trigger.isActive && !trigger.method}
                  />
                </Box>
              )}

              {/* Auth */}
              {/* Authentication */}
<Divider my={4} />

<Flex align="center" justify="space-between" mb={2} gap={2}>
  <Text fontSize="xs" fontWeight="semibold" color="gray.500">
    Authentication
  </Text>

  <CustomInput
    name={`trigger-auth-enabled-${trigger.id}`}
    type="checkbox"
    value={trigger.hasAuth}
    onChange={(e: any) =>
      updateTrigger(trigger.id, { hasAuth: e.target.checked })
    }
  />
</Flex>

{trigger.hasAuth && (
  <>
    <Box maxW="260px" mb={3}>
      <CustomInput
        name={`trigger-auth-type-${trigger.id}`}
        type="select"
        label="Auth Type"
        value={{
          label:
            trigger.authType === "token"
              ? "Bearer Token"
              : "Username & Password",
          value: trigger.authType,
        }}
        onChange={(opt: any) =>
          updateTrigger(trigger.id, { authType: opt?.value })
        }
        options={[
          { label: "Bearer Token", value: "token" },
          { label: "Username & Password", value: "credentials" },
        ]}
      />
    </Box>

    {trigger.authType === "token" && (
      <CustomInput
        type="password"
        label="Token"
        name={`trigger-token-${trigger.id}`}
        placeholder="Enter token..."
        value={trigger.authToken}
        onChange={(e: any) =>
          updateTrigger(trigger.id, { authToken: e.target.value })
        }
      />
    )}

    {trigger.authType === "credentials" && (
      <Stack spacing={2}>
        {trigger.credentials.map((cred, ci) => (
          <Flex key={ci} gap={2}>
            <Box flex="1">
              <CustomInput
                placeholder="Key (e.g. username)"
                name={`cred-key-${trigger.id}-${ci}`}
                value={cred.key}
                onChange={(e: any) =>
                  updateCredential(trigger.id, ci, "key", e.target.value)
                }
              />
            </Box>
            <Box flex="1">
              <CustomInput
                type="password"
                placeholder="Value"
                name={`cred-val-${trigger.id}-${ci}`}
                value={cred.value}
                onChange={(e: any) =>
                  updateCredential(trigger.id, ci, "value", e.target.value)
                }
              />
            </Box>
            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => removeCredential(trigger.id, ci)}
            >
              <FiTrash2 />
            </Button>
          </Flex>
        ))}

        <Button
          size="sm"
          variant="ghost"
          leftIcon={<FiPlus />}
          onClick={() => addCredential(trigger.id)}
        >
          Add Credential
        </Button>
      </Stack>
    )}
  </>
)}
            </Box>
          ))}
        </Stack>
      )}
    </VStack>
  );
};

export default TriggersSection;