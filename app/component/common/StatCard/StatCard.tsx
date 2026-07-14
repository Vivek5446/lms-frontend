import { Box, Flex, Stat, StatLabel, StatNumber, Text, Icon, useColorModeValue } from "@chakra-ui/react";
import { IconType } from "react-icons";

export type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon: IconType | any;
  colorScheme?: string;
};

export default function StatCard({
  label,
  value,
  helper,
  icon,
  colorScheme = "blue",
}: StatCardProps) {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={{ base: 3.5, md: 4 }}
      boxShadow="sm"
      transition="transform .18s ease, box-shadow .18s ease"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
      minW={0}
    >
      <Flex justify="space-between" gap={3}>
        <Stat minW={0}>
          <StatLabel color="gray.500" fontSize="xs" noOfLines={1}>
            {label}
          </StatLabel>
          <StatNumber mt={1} fontSize={{ base: "xl", md: "2xl" }} lineHeight="1.15">
            {typeof value === "number" ? value.toLocaleString() : value}
          </StatNumber>
          {helper && (
            <Text mt={1.5} fontSize="xs" color="gray.500" noOfLines={1}>
              {helper}
            </Text>
          )}
        </Stat>
        <Flex
          align="center"
          justify="center"
          w={{ base: "36px", md: "42px" }}
          h={{ base: "36px", md: "42px" }}
          flexShrink={0}
          borderRadius="lg"
          bg={useColorModeValue(`${colorScheme}.50`, "gray.700")}
          color={useColorModeValue(`${colorScheme}.600`, `${colorScheme}.300`)}
        >
          <Icon as={icon} boxSize={{ base: 4, md: 5 }} />
        </Flex>
      </Flex>
    </Box>
  );
}
