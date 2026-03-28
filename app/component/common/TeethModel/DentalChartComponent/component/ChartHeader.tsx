import { Box, Center, Container, Flex, Heading, Text } from "@chakra-ui/react";
import { FiActivity } from "react-icons/fi";

export const ChartHeader = () => {
  return (
    <Box bg="white" borderBottom="1px solid" borderColor="gray.200">
      <Container maxW="7xl" px={4} py={4}>
        <Flex align="center" gap={3}>
          <Center
            w="40px"
            h="40px"
            rounded="xl"
            bg="blue.500"
            color="white"
          >
            <FiActivity size={20} />
          </Center>

          <Box>
            <Heading size="md">DentalChart Pro</Heading>
            <Text fontSize="xs" color="gray.500">
              Interactive Dental Treatment Planner
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};
