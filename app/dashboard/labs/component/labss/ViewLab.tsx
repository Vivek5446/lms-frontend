import React from "react";
import {
  Box,
  Text,
  Heading,
  Stack,
  Badge,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
} from "@chakra-ui/react";
import { MdLocationOn, MdGroup, MdAccountBalance } from "react-icons/md";

// Circle Icon for Section Header
const CircleIcon = ({ icon }: { icon: any }) => {
  const bg = useColorModeValue("teal.100", "teal.700");
  const color = useColorModeValue("teal.600", "teal.200");
  return (
    <Box
      w={10}
      h={10}
      borderRadius="full"
      bg={bg}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Icon as={icon} boxSize={5} color={color} />
    </Box>
  );
};

// Card Component for each Section
const SectionCard = ({ icon, title, children }: any) => {
  const bg = useColorModeValue("white", "gray.800");
  return (
    <Card bg={bg} borderRadius="xl" shadow="lg" overflow="hidden">
      <Box h="2px" bg="teal.400" />
      <CardHeader pb={0}>
        <HStack spacing={3} mt={2}>
          <CircleIcon icon={icon} />
          <Heading size="sm">{title}</Heading>
        </HStack>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

// Main Component
const ViewLab = ({ data }: { data: any }) => {
  // ✅ Call hooks at top level only
  const theadBg = useColorModeValue("gray.100", "gray.700");

  if (!data) return <Text>No data available</Text>;

  return (
    <Box p={6}>
      {/* Avatar & Info */}
      <Stack direction={["column", "row"]} spacing={6} align="center">
        <Box mb={10}>
          <Heading size="xl" mb={2}>
            {data.name}
          </Heading>
          <HStack spacing={4} align="center">
            <Badge
              colorScheme={data.isActive ? "green" : "red"}
              px={4}
              py={1}
              borderRadius="full"
              fontSize="0.9rem"
            >
              {data.isActive ? "Active" : "Inactive"}
            </Badge>
            <Text fontSize="sm" color="gray.400">
              Created: {new Date(data.createdAt).toLocaleDateString()}
            </Text>
          </HStack>
        </Box>
      </Stack>

      <SimpleGrid columns={[1, 2]} spacing={6}>
        {/* Addresses */}
        <SectionCard icon={MdLocationOn} title="Addresses">
          <VStack align="stretch" spacing={3}>
            <Text>
              <b>Residential:</b> {data.addresses?.residential || "—"}
            </Text>
            <Divider />
            <Text>
              <b>Office:</b> {data.addresses?.office || "—"}
            </Text>
            <Divider />
            <Text>
              <b>Other:</b> {data.addresses?.other || "—"}
            </Text>
          </VStack>
        </SectionCard>

        {/* Staffs in Table Format */}
        <SectionCard icon={MdGroup} title="Staff Members">
          {data.staffs?.length ? (
            <Table size="sm" variant="striped" colorScheme="teal">
              <Thead bg={theadBg}>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.staffs.map((s: any, idx: number) => (
                  <Tr key={idx}>
                    <Td>{s.name}</Td>
                    <Td>{s.email}</Td>
                    <Td>{s.phone}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text>No staff members</Text>
          )}
        </SectionCard>
      </SimpleGrid>

      {/* Bank Accounts */}
      <Box mt={6}>
        <SectionCard icon={MdAccountBalance} title="Bank Accounts">
          {data.bankAccounts?.length ? (
            <Table size="sm" variant="simple">
              <Thead bg={theadBg}>
                <Tr>
                  <Th>Holder</Th>
                  <Th>Bank</Th>
                  <Th>Account No.</Th>
                  <Th>IFSC</Th>
                  <Th>Branch</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.bankAccounts.map((b: any, idx: number) => (
                  <Tr key={idx}>
                    <Td>{b.accountHolder}</Td>
                    <Td>{b.bankName}</Td>
                    <Td>{b.accountNumber}</Td>
                    <Td>{b.ifscCode}</Td>
                    <Td>{b.branch}</Td>
                    <Td>
                      {b.primary && <Badge colorScheme="green">Primary</Badge>}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text>No bank accounts</Text>
          )}
        </SectionCard>
      </Box>
    </Box>
  );
};

export default ViewLab;
