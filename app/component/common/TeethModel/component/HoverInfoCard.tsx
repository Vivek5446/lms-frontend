import { Box, Text } from "@chakra-ui/react";

export default function HoverInfoCard({ tooth, position }: any) {
  if (!tooth) return null;

  return (
    <Box
      position="fixed"
      left={position.x + 12}
      top={position.y + 12}
      px={3}
      py={2}
      bg="gray.50"
      border="1px solid"
      borderColor="gray.200"
      rounded="xl"
      shadow="md"
      zIndex={9999}
      pointerEvents="none"
      animation="fadeIn 0.12s ease-out"
      sx={{
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "scale(0.95)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
      }}
    >
      <Text fontWeight="700" fontSize="sm">
        Tooth #{tooth.number}
      </Text>

      <Text fontSize="xs" color="gray.600">
        {tooth.name}
      </Text>

      <Text fontSize="xs" color="blue.600" >
        {tooth.type}
      </Text>

      {tooth.condition && (
        <Text
          fontSize="xs"
          color="red.500"
          textTransform={'capitalize'}
          mt={1}
          fontWeight="semibold"
        >
          Condition: {tooth.condition}
        </Text>
      )}
    </Box>
  );
}
