'use client';

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiFileText } from "react-icons/fi";

import { DentitionToggle } from "./component/DentitionToggle";
import { TeethChart } from "./component/TeethChart";
import { ToothFormDialog } from "./component/ToothFormDialog";
import { ToothInfoCard } from "./component/ToothInfoCard";
import { DentitionType, ToothData } from "./utils/teethData";
import { observer } from "mobx-react-lite";

const Index = observer(({isPatient, patientDetails} : any) => {
  const [dentitionType, setDentitionType] =
    useState<DentitionType>("adult");
  const [selectedTooth, setSelectedTooth] =
    useState<ToothData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToothClick = (tooth: ToothData) => {
    setSelectedTooth(tooth);
  };

  const handleOpenTreatmentForm = () => {
    if (selectedTooth) {
      setDialogOpen(true);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Page Title */}
          <VStack spacing={1} textAlign="center">
            <Heading size="md">Dental Chart</Heading>
            <Text fontSize="sm" color="gray.600">
              Select a tooth to view details or add a treatment plan
            </Text>
          </VStack>

          {/* Dentition Toggle */}
          <Flex justify="center">
            <DentitionToggle
              value={dentitionType}
              onChange={setDentitionType}
            />
          </Flex>

          {/* Main Content */}
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 300px" }}
            gap={6}
          >
            {/* Teeth Chart */}
            <Box order={{ base: 2, lg: 1 }}>
              <TeethChart
                dentitionType={dentitionType}
                selectedTooth={selectedTooth}
                onToothClick={handleToothClick}
              />
            </Box>

            {/* Sidebar */}
            <VStack
              order={{ base: 1, lg: 2 }}
              spacing={4}
              align="stretch"
              p={4}
              border="1px solid"
              borderColor="gray.200"
              rounded="lg"
              bg="white"
            >
              <ToothInfoCard tooth={selectedTooth} />

              {selectedTooth && (
                <Button
                  size="md"
                  width="100%"
                  leftIcon={<FiFileText />}
                  onClick={handleOpenTreatmentForm}
                >
                  Add Treatment Plan
                </Button>
              )}

              {!selectedTooth && (
                <Text
                  fontSize="sm"
                  color="gray.500"
                  textAlign="center"
                >
                  Select a tooth to continue
                </Text>
              )}
            </VStack>
          </Grid>
        </VStack>
      </Container>

      {/* Treatment Form Dialog */}
      <ToothFormDialog
        isPatient={isPatient}
        patientDetails={patientDetails}
        tooth={selectedTooth}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Box>
  );
});

export default Index;
