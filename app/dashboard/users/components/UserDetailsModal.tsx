"use client";

import {
  Badge,
  Box,
  Divider,
  Flex,
  HStack,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  SimpleGrid,
  Text,
  VStack,
  IconButton,
  Icon,
  Avatar,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  User,
  Phone,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Award,
} from "lucide-react";

const getUserStatusMeta = (user: any) => {
  if (user?.status === "INACTIVE" || user?.isEnabled === false || user?.is_enabled === false) {
    return { label: "Inactive", colorScheme: "red" };
  }

  if (user?.status === "ACTIVE" || user?.isActive) {
    return { label: "Active", colorScheme: "green" };
  }

  return { label: "Pending", colorScheme: "orange" };
};

/* ================= SECTION CARD ================= */
const SectionCard = ({ title, icon, color, children }: any) => {
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.900");
  const cardBorder = useColorModeValue("gray.100", "gray.800");

  return (
    <Box mb={{ base: 5, md: 6 }}>
      <Flex align="center" mb={3} gap={2} px={1}>
        <Flex 
          w="24px" 
          h="24px" 
          borderRadius="lg" 
          bg={useColorModeValue(`${color}.50`, `${color}.950/20`)} 
          align="center" 
          justify="center"
        >
          <Icon as={icon} color={`${color}.500`} boxSize={3.5} />
        </Flex>
        <Text fontSize="11px" fontWeight="800" color={labelColor} letterSpacing="0.15em" textTransform="uppercase">
          {title}
        </Text>
      </Flex>
      <Box
        p={{ base: 5, md: 6 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor={cardBorder}
        bg={cardBg}
        boxShadow="sm"
      >
        {children}
      </Box>
    </Box>
  );
};

/* ================= DETAIL ROW FIELD ================= */
const DetailField = ({ label, value, icon, color }: { label: string; value?: string | null; icon: any; color: string }) => {
  return (
    <HStack spacing={3.5} align="center" minW={0} py={1}>
      <Flex 
        w="34px" 
        h="34px" 
        borderRadius="xl" 
        bg={useColorModeValue(`${color}.50`, `${color}.950/20`)} 
        align="center" 
        justify="center" 
        flexShrink={0}
      >
        <Icon as={icon} color={`${color}.500`} boxSize={4} />
      </Flex>
      <Box minW={0} flex={1}>
        <Text fontSize="9px" color={useColorModeValue("gray.450", "gray.500")} fontWeight="800" textTransform="uppercase" letterSpacing="0.05em" mb={0.5}>
          {label}
        </Text>
        <Text fontSize="sm" fontWeight="700" color={useColorModeValue("gray.800", "white")} noOfLines={1}>
          {value || "--"}
        </Text>
      </Box>
    </HStack>
  );
};

const UserDetailsModal = ({
  isOpen,
  onClose,
  user,
  formatRoleLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  formatRoleLabel: (role: string) => string;
}) => {
  const muted = useColorModeValue("gray.600", "gray.400");
  const statusMeta = getUserStatusMeta(user);
  const placement = useBreakpointValue({ base: "bottom", md: "right" }) as "bottom" | "right";
  const headerBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(10, 10, 10, 0.9)");

  return (
    <Drawer isOpen={isOpen} placement={placement} size="full" onClose={onClose} blockScrollOnMount={false}>
      <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <DrawerContent 
        maxW={{ base: "100%", md: "85%" }} 
        w={{ base: "100%", md: "85%" }} 
        h="100vh" 
        overflow="hidden" 
        bg={useColorModeValue("white", "gray.900")} 
        borderRadius="none"
      >
        {/* PREMIUM STICKY HEADER WITH GLASS EFFECT */}
        <Box
          position="sticky"
          top={0}
          bg={headerBg}
          backdropFilter="blur(15px)"
          zIndex={10}
          borderBottom="1px solid"
          borderColor={useColorModeValue("gray.100", "gray.850")}
          py={4}
          px={{ base: 4, md: 8 }}
        >
          <HStack spacing={4} align="center" justify="space-between" w="100%">
            <HStack spacing={3} align="center" minW={0} flex={1}>
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
              
              <Box minW={0}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                  <Box as="span" color={useColorModeValue("gray.800", "white")}>VIEW </Box>
                  <Box as="span" bgGradient="linear(to-r, #6269FF, #8A2BE2)" bgClip="text">
                    USER
                  </Box>
                </Text>
                <Text fontSize="10px" color={useColorModeValue("gray.500", "gray.400")} fontWeight="700" letterSpacing="0.2em" mt={0.5}>
                  VIEWING DETAILED ACCOUNT DETAILS
                </Text>
              </Box>
            </HStack>

            {/* Badges */}
            <HStack spacing={1.5} flexShrink={0}>
              <Badge colorScheme="blue" px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="bold">
                {formatRoleLabel(user?.role || "user").toUpperCase()}
              </Badge>
              <Badge colorScheme={statusMeta.colorScheme} px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="bold">
                {statusMeta.label.toUpperCase()}
              </Badge>
            </HStack>
          </HStack>
        </Box>

        <DrawerBody 
          p={0} 
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "4px" },
          }}
        >
          <Box w="100%" px={{ base: 4, md: 8 }} pt={5} pb="150px">
            
            {/* CONTENT BODY */}
            <VStack align="stretch" spacing={5}>
              
              {/* Profile Card */}
              <SectionCard title="Profile Summary" icon={User} color="blue">
                <HStack spacing={5} align="center">
                  <Avatar
                    size="xl"
                    name={user?.name || "User"}
                    src={user?.pic?.url}
                    bgGradient="linear(to-br, blue.400, purple.500)"
                    color="white"
                    fontWeight="bold"
                    boxShadow="sm"
                  />
                  <Box>
                    <Text fontSize="lg" fontWeight="900" color={useColorModeValue("gray.800", "white")}>
                      {user?.name}
                    </Text>
                    <Text fontSize="sm" color={muted} fontWeight="500">
                      {user?.email || "No email available"}
                    </Text>
                  </Box>
                </HStack>
              </SectionCard>

              {/* Account Details */}
              <SectionCard title="Account Information" icon={Layers} color="purple">
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacingY={5} spacingX={6}>
                  <DetailField label="Employee Code" value={user?.code} icon={User} color="purple" />
                  <DetailField label="Mobile Number" value={user?.mobileNumber} icon={Phone} color="green" />
                  <DetailField label="Designation" value={user?.designation} icon={Briefcase} color="blue" />
                  <DetailField label="Department" value={user?.department} icon={Layers} color="teal" />
                  <DetailField label="City" value={user?.city} icon={MapPin} color="orange" />
                  <DetailField label="State" value={user?.state} icon={MapPin} color="orange" />
                  <DetailField label="Country" value={user?.country || "India"} icon={MapPin} color="orange" />
                  <DetailField label="Joining Date" value={user?.joiningDate ? String(user.joiningDate).slice(0, 10) : "--"} icon={Calendar} color="cyan" />
                </SimpleGrid>
              </SectionCard>

              {/* Company Details */}
              <SectionCard title="Organization Context" icon={Building2} color="blue">
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacingY={5} spacingX={6}>
                  <DetailField label="Current Company" value={user?.company?.name || user?.company?.company_name || "Unassigned"} icon={Building2} color="indigo" />
                  <DetailField label="Created By" value={user?.createdBy?.name || user?.createdBy?.email || "System"} icon={Award} color="pink" />
                </SimpleGrid>
              </SectionCard>

            </VStack>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default UserDetailsModal;
