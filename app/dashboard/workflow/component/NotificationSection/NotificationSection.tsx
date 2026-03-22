import { Box, Flex, Grid, Stack, Text, VStack } from "@chakra-ui/react";
import { FiCheck, FiX } from "react-icons/fi";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { WorkflowConfig } from "../../types/config";

interface NotificationSectionProps {
  config: WorkflowConfig;
  onChange: (updates: Partial<WorkflowConfig>) => void;
  errors?: Record<string, string>;
}

const NotificationSection = ({ config, onChange, errors = {} }: NotificationSectionProps) => {
  const levels = Array.from({ length: config.noOfLevels }, (_, i) => i + 1);

  const updateNotification = (
    type: "onApproved" | "onRejected",
    level: number,
    field: "email" | "notification" | "sms",
    value: boolean
  ) => {
    onChange({
      notifications: {
        ...config.notifications,
        [type]: {
          ...config.notifications[type],
          [level]: {
            ...config.notifications[type]?.[level],
            [field]: value,
          },
        },
      },
    });
  };

  const renderLevelToggles = (
    type: "onApproved" | "onRejected",
    level: number
  ) => {
    const data = config.notifications[type]?.[level] || {
      email: false,
      notification: false,
      sms: false,
    };

    return (
      <>
        <Flex justify="center" bg={'white'} align="center">
          <Box>
          <CustomInput
            name={`${type}-email-${level}`}
            type="switch"
            value={data.email}
            onChange={(e: any) =>
              updateNotification(type, level, "email", e.target.checked)
            }
            />
            </Box>
        </Flex>
        <Flex justify="center" bg={'white'} align="center">
          <Box>
          <CustomInput
            name={`${type}-app-${level}`}
            type="switch"
            value={data.notification}
            onChange={(e: any) =>
              updateNotification(type, level, "notification", e.target.checked)
            }
            />
            </Box>
        </Flex>
        <Flex justify="center" bg={'white'} align="center">
          <Box>
          <CustomInput
            name={`${type}-sms-${level}`}
            type="switch"
            value={data.sms}
            onChange={(e: any) =>
              updateNotification(type, level, "sms", e.target.checked)
            }
            />
            </Box>
        </Flex>
      </>
    );
  };

  const renderNotificationCard = (
    title: string,
    description: string,
    type: "onApproved" | "onRejected",
    icon: any,
    colorScheme: string
  ) => (
    <Box
      p={{base:2,md:6}}
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      rounded="xl"
      shadow="sm"
    >
      <Flex align="center" gap={3} mb={6}>
        <Box p={2} bg={`${colorScheme}.50`} color={`${colorScheme}.500`} rounded="lg">
          {icon}
        </Box>
        <Box>
          <Text fontSize="md" fontWeight="bold" color="gray.800">
            {title}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {description}
          </Text>
        </Box>
      </Flex>

      <Box
        border="1px solid"
        borderColor="gray.100"
        rounded="lg"
        overflow="hidden"
        overflowX={{ base: "auto", md: "visible" }}
      >
        {/* Header Grid */}
        <Grid
          templateColumns={{ base: "80px repeat(3, 80px)", md: "120px repeat(3, 1fr)" }}
          minW={{ base: "max-content", md: "auto" }}
          bg="gray.50"
          borderBottom="1px solid"
          borderColor="gray.200"
          px={4}
          py={3}
        >
          <Text fontSize="xs" fontWeight="bold" color="gray.500">
            LEVEL
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textAlign="center">
            EMAIL
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textAlign="center">
            IN-APP
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textAlign="center">
            SMS
          </Text>
        </Grid>

        {/* Rows */}
        {levels.map((lvl) => (
          <Grid
            key={lvl}
            templateColumns={{ base: "80px repeat(3, 80px)", md: "120px repeat(3, 1fr)" }}
            minW={{ base: "max-content", md: "auto" }}
            px={4}
            w="100%"
            py={3}
            borderBottom="1px solid"
            borderColor="gray.100"
            _last={{ borderBottom: "none" }}
            bg="white"
            alignItems="end"
          >
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              Level {lvl}
            </Text>
            {renderLevelToggles(type, lvl)}
          </Grid>
        ))}
      </Box>
    </Box>
  );

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <Box mb={2}>
        <Text fontSize="xl" fontWeight="bold">
          Notifications
        </Text>
        <Text fontSize="sm" color="gray.500">
          Configure who gets notified when actions happen
        </Text>
      </Box>

      <Stack spacing={8}>
        {renderNotificationCard(
          "On Approval",
          "Notifications sent when a user approves a document at their level.",
          "onApproved",
          <FiCheck size={20} />,
          "green"
        )}

        {renderNotificationCard(
          "On Rejection",
          "Notifications sent when a document is rejected.",
          "onRejected",
          <FiX size={20} />,
          "red"
        )}

        {/* Completion Notifications */}
        <Box
          p={{base:4,md:6}}
          border="1px solid"
          borderColor="gray.200"
          rounded="xl"
          bg="white"
          shadow="sm"
        >
          <Text fontSize="md" fontWeight="bold" color="gray.800" mb={1}>
            Final Completion Notifications
          </Text>
          <Text fontSize="sm" color="gray.500" mb={6}>
            Who needs to know when the entire workflow is fully completed or
            terminated?
          </Text>

          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {/* Notify Final Completion */}
            <Box
              p={4}
              border="1px solid"
              borderColor={config.notifyFinalCompletion ? "brand.400" : "gray.200"}
              bg={config.notifyFinalCompletion ? "brand.50" : "transparent"}
              rounded="lg"
              transition="0.2s"
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={config.notifyFinalCompletion ? "brand.700" : "gray.700"}>
                    Notify Final Completion
                  </Text>
                  <Text fontSize="xs" color={config.notifyFinalCompletion ? "brand.600" : "gray.500"} mt={1}>
                    Send alerts when the flow is fully approved
                  </Text>
                </Box>
                <Flex align="center" justify="center" minW="40px">
                  <CustomInput
                    name="notifyFinalCompletion"
                    type="switch"
                    value={config.notifyFinalCompletion}
                    onChange={(e: any) =>
                      onChange({ notifyFinalCompletion: e.target.checked })
                    }
                  />
                </Flex>
              </Flex>
            </Box>

            {/* Notify Creator */}
            <Box
              p={4}
              border="1px solid"
              borderColor={config.notifyCreator ? "brand.400" : "gray.200"}
              bg={config.notifyCreator ? "brand.50" : "transparent"}
              rounded="lg"
              transition="0.2s"
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color={config.notifyCreator ? "brand.700" : "gray.700"}>
                    Notify Creator On Reject
                  </Text>
                  <Text fontSize="xs" color={config.notifyCreator ? "brand.600" : "gray.500"} mt={1}>
                    Tell the original submitter if rejected
                  </Text>
                </Box>
                <Flex align="center" justify="center" minW="40px">
                  <CustomInput
                    name="notifyCreator"
                    type="switch"
                    value={config.notifyCreator}
                    onChange={(e: any) =>
                      onChange({ notifyCreator: e.target.checked })
                    }
                  />
                </Flex>
              </Flex>
            </Box>
          </Grid>
        </Box>
      </Stack>
    </VStack>
  );
};

export default NotificationSection;