// import { ToothData } from "@/data/teethData";
import {
    Badge,
    Box,
    Center,
    HStack,
    SimpleGrid,
    Text,
    VStack,
} from "@chakra-ui/react";
import { BsGrid3X3 } from "react-icons/bs";
import {
    FiHash,
    FiInfo,
} from "react-icons/fi";
import { TbFileDigit } from "react-icons/tb";
import { ToothData } from "../utils/teethData";

interface ToothInfoCardProps {
  tooth: ToothData | null;
}

export const ToothInfoCard = ({ tooth }: ToothInfoCardProps) => {
  if (!tooth) {
    return (
      <Box
        bg="gray.50"
        border="1px dashed"
        borderColor="gray.300"
        rounded="xl"
        p={6}
      >
        <Center flexDir="column" py={6} textAlign="center">
          <Center
            w="48px"
            h="48px"
            rounded="full"
            bg="gray.100"
            mb={3}
          >
            <FiInfo size={24} color="#718096" />
          </Center>

          <Text fontSize="sm" color="gray.500">
            Click on a tooth to view its details
          </Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      rounded="xl"
      p={5}
      boxShadow="sm"
      animation="scaleIn 0.2s ease-in-out"
    >
      {/* Header */}
      <HStack spacing={3} mb={4}>
        <Center
          w="40px"
          h="40px"
          rounded="full"
          bg="blue.50"
          fontWeight="bold"
          fontSize="lg"
          color="blue.600"
        >
          {tooth.fdi}
        </Center>

        <Text fontSize="lg" fontWeight="semibold">
          Selected Tooth
        </Text>
      </HStack>

      <VStack align="stretch" spacing={4}>
        {/* Tooth Name */}
        <Box>
          <Text fontSize="sm" color="gray.500" mb={1}>
            Tooth Name
          </Text>
          <Text fontWeight="medium">{tooth.name}</Text>
        </Box>

        {/* Numbering Grid */}
        <SimpleGrid columns={3} spacing={3}>
          <Box bg="gray.100" rounded="lg" p={3} textAlign="center">
            <HStack
              justify="center"
              spacing={1.5}
              color="gray.500"
              mb={1}
            >
              <FiHash size={14} />
              <Text fontSize="xs" fontWeight="medium">
                FDI
              </Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold">
              {tooth.fdi}
            </Text>
          </Box>

          <Box bg="gray.100" rounded="lg" p={3} textAlign="center">
            <HStack
              justify="center"
              spacing={1.5}
              color="gray.500"
              mb={1}
            >
              <BsGrid3X3 size={14} />
              <Text fontSize="xs" fontWeight="medium">
                Universal
              </Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold">
              {tooth.universal}
            </Text>
          </Box>

          <Box bg="gray.100" rounded="lg" p={3} textAlign="center">
            <HStack
              justify="center"
              spacing={1.5}
              color="gray.500"
              mb={1}
            >
              <TbFileDigit size={14} />
              <Text fontSize="xs" fontWeight="medium">
                Palmer
              </Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold">
              {tooth.palmer}
            </Text>
          </Box>
        </SimpleGrid>

        {/* Badges */}
        <HStack wrap="wrap" spacing={2}>
          <Badge colorScheme="gray" textTransform="capitalize">
            {tooth.position} Jaw
          </Badge>
          <Badge colorScheme="gray" textTransform="capitalize">
            {tooth.side} Side
          </Badge>
          <Badge variant="outline" textTransform="capitalize">
            {tooth.type}
          </Badge>
        </HStack>
      </VStack>
    </Box>
  );
};
