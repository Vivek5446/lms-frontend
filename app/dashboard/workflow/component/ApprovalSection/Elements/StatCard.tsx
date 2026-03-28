import { Box, Flex, Text } from "@chakra-ui/react";

const StatCard = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <Box
      p={3}
      border="1px solid"
      borderColor="gray.200"
      rounded="lg"
      bg="white"
    >
      <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
      <Flex align="baseline" gap={1}>
        <Text fontSize="xl" fontWeight="bold" color={`${color}.500`}>{value}</Text>
        <Text fontSize="sm" color="gray.400">/ {total}</Text>
      </Flex>
      <Box w="100%" h="2px" bg="gray.100" mt={2} rounded="full">
        <Box w={`${percentage}%`} h="2px" bg={`${color}.400`} rounded="full" />
      </Box>
    </Box>
  );
};

export default StatCard;