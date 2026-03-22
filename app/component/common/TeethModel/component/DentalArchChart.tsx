import {
    Badge,
    Box,
    Button,
    Flex,
    Grid,
    GridItem,
    Heading,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import { useState } from "react";
import { getToothName, legend, teethData, ToothData } from "../utils/constant";
import TeethArch from "./TeethArch";
import TreatmentDialog from "./TreatmentDialog";


export default function DentalChartSymmetrical() {
  const [selectedTooth, setSelectedTooth] = useState<ToothData | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue("gray.50", "gray.900");
  

  const handleSelect = (tooth: ToothData) => {
    setSelectedTooth(tooth);
    onOpen();
  };

  const upperTeeth = teethData.slice(0, 16); 
  const lowerTeeth = teethData.slice(16).reverse();

  return (
    <Box bg={bg}>
      <Grid
        templateColumns={{ base: "1fr", xl: "350px 1fr" }}
        gap={4}
        maxW="8xl"
        mx="auto"
        alignItems="start"
      >
        {/* --- LEFT PANEL: Legend & Info --- */}
        <GridItem>
          <VStack spacing={2} align="stretch">
            
            {/* 1. Header Card */}
            <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
              <Heading size="lg" color="blue.700" mb={1}>Teeth Chart</Heading>
              <Text fontSize="sm" color="gray.500">Patient Treatment Portal</Text>
            </Box>

            {/* 2. Selection Details (Dynamic) */}
            <Box 
                bg="white" 
                p={6} 
                borderRadius="xl" 
                shadow="sm" 
                border="1px solid" 
                borderColor="gray.100" 
                minH="160px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
            >
                {selectedTooth ? (
                    <VStack align="start" spacing={3}>
                        <Badge colorScheme="blue" borderRadius="full" px={3}>Selected</Badge>
                        <Box>
                            <Heading size="md">Tooth #{selectedTooth.number}</Heading>
                            <Text fontSize="md" color="blue.600" fontWeight="medium">
                                {getToothName(selectedTooth.number)}
                            </Text>
                        </Box>
                        <Button size="sm" colorScheme="blue" w="full" onClick={onOpen}>
                            Add Treatment
                        </Button>
                    </VStack>
                ) : (
                    <Text textAlign="center" color="gray.400" fontSize="sm">
                        Select a tooth from the chart to see details.
                    </Text>
                )}
            </Box>

            {/* 3. The Requested Legend Table */}
            <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
              <Box p={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                 <Heading size="xs" textTransform="uppercase" color="gray.500">Eruption & Types</Heading>
              </Box>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Tooth Type</Th>
                    <Th isNumeric>Years</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {legend.map((item, i) => (
                    <Tr key={i} _hover={{ bg: "blue.50" }}>
                      <Td fontWeight="medium" fontSize="xs">{item.type}</Td>
                      <Td isNumeric color="gray.500" fontSize="xs">{item.years}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

          </VStack>
        </GridItem>

        {/* --- RIGHT PANEL: The Symmetrical Chart --- */}
        <GridItem 
        //   bg="white" 
        bgGradient={'linear(to-t, blue.200,blue.100,blue.50)'}
          p={8} 
          borderRadius="2xl" 
          shadow="sm" 
          border="1px solid" 
          borderColor="blue.100"
          minH="80vh"
        >
          <Flex direction="column" h="full" justify="center" align="center">
            
            {/* UPPER ARCH */}
            <TeethArch 
              teeth={upperTeeth} 
              isUpper={true} 
              selectedId={selectedTooth?.number}
              onSelect={handleSelect}
            />

            {/* CENTER DIVIDER (Midline Visual) */}
            <Flex w="100%" maxW="400px" align="center" py={2} opacity={0.3}>
                <Box h="1px" bg="gray.400" flex={1} />
                <Box mx={4} border="1px dashed" borderColor="gray.500" px={2} py={0.5} borderRadius="md">
                    <Text fontSize="12px" fontWeight="bold">MIDLINE</Text>
                </Box>
                <Box h="1px" bg="gray.400" flex={1} />
            </Flex>

            {/* LOWER ARCH */}
            <TeethArch 
              teeth={lowerTeeth} 
              isUpper={false} 
              selectedId={selectedTooth?.number}
              onSelect={handleSelect}
            />

          </Flex>
        </GridItem>
      </Grid>

      <TreatmentDialog
        isOpen={isOpen}
        onClose={onClose}
        tooth={selectedTooth}
      />
    </Box>
  );
}