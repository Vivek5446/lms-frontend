import {
    Badge,
    Box,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    HStack,
    Text,
    VStack
} from "@chakra-ui/react";

export default function HistoryDrawer({
  isOpen,
  onClose,
  tooth,
}: any) {
  if (!tooth) return null;

  const history = tooth.history || [];

  return (
    <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottom="1px solid #EDF2F7">
          Tooth #{tooth.number} — History
          <Text fontSize="sm" color="gray.500">
            {tooth.name}
          </Text>
        </DrawerHeader>

        <DrawerBody>
          {history.length === 0 ? (
            <Text mt={4} color="gray.400" textAlign="center">
              No treatment history for this tooth.
            </Text>
          ) : (
            <VStack align="stretch" spacing={4} mt={2}>
              {history
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry) => (
                  <Box
                    key={entry.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    shadow="sm"
                    bg="white"

                  >
                    <HStack justify="space-between">
                      <Badge colorScheme="blue">{entry.condition}</Badge>
                      <Text fontSize="xs" color="gray.500">
                        {entry.date}
                      </Text>
                    </HStack>

                    <Text fontWeight="bold" mt={2}>
                      {entry.treatment}
                    </Text>

                    {entry.notes && (
                      <Text mt={1} fontSize="sm" color="gray.600">
                        {entry.notes}
                      </Text>
                    )}
                  </Box>
                ))}
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
