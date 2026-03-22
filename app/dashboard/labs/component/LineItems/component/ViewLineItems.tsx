import { Box, SimpleGrid, Text, Divider } from "@chakra-ui/react";
import { formatDate } from "../../../../../component/config/utils/dateUtils";

const InfoCard = ({ label, value }: { label: string; value: any }) => (
  <Box
    p={4}
    borderWidth="1px"
    borderRadius="lg"
    shadow="sm"
    bg="gray.50"
    _dark={{ bg: "gray.700" }}
  >
    <Text fontSize="sm" fontWeight="bold" color="gray.600" _dark={{ color: "gray.300" }}>
      {label}
    </Text>
    <Text fontSize="md" mt={1} color="gray.800" _dark={{ color: "white" }}>
      {value || "-"}
    </Text>
  </Box>
);

const ViewLineItems = ({ data }: { data: any }) => {
  return (
    <Box>
      {/* Section 1: Item Info */}
      <Text fontSize="lg" fontWeight="bold" mb={3}>
        Item Information
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
        <InfoCard label="Item Name" value={data.itemName} />
        <InfoCard label="Item Code" value={data.itemCode} />
        <InfoCard label="Quantity" value={data.quantity} />
        <InfoCard label="Price" value={data.price} />
        <InfoCard label="Total" value={data.total} />
        <InfoCard label="Created At" value={formatDate(data.createdAt)} />
      </SimpleGrid>

      <Divider mb={6} />

      {/* Section 2: Patient Info */}
      <Text fontSize="lg" fontWeight="bold" mb={3}>
        Patient Information
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <InfoCard label="Name" value={data?.patientDetails?.name} />
        <InfoCard label="Code" value={data?.patientDetails?.code} />
        <InfoCard label="Username" value={data?.patientDetails?.username} />
      </SimpleGrid>
    </Box>
  );
};

export default ViewLineItems;
