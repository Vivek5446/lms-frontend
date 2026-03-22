import {
  Box,
  Text,
  GridItem,
  Button,
  VStack,
  SimpleGrid,
  IconButton,
  Grid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon } from "@chakra-ui/icons";
import { FiPlus } from "react-icons/fi";
import { useState } from "react";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { vaccinationTypeOptions } from "../../../../config/constant";

const VaccinationHistorySection = ({
  values,
  handleChange,
  setFieldValue,
  errors,
}: any) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");
  const bgInput = useColorModeValue("gray.50", "darkBrand.50");
  const textColor = useColorModeValue("brand.600", "white");

  const confirmDelete = (remove: any) => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setDeleteIndex(null);
      onClose();
    }
  };

  return (
    <GridItem colSpan={2}>
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        boxShadow="sm"
        bg={bgBox}
        mt={3}
        borderColor={borderColor}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
          Vaccination History
        </Text>

        <FieldArray name="vaccinations">
          {({ remove, push }) => (
            <>
              <VStack spacing={6} align="stretch">
                {values.vaccinations && values.vaccinations.length > 0 ? (
                  values.vaccinations.map((vac, index) => (
                    <Box
                      key={index}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="xs"
                      bg={bgInput}
                      borderColor={borderColor}
                    >
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <CustomInput
                          label="Vaccine Type"
                          name={`vaccinations[${index}].type`}
                          type="select"
                          options={vaccinationTypeOptions}
                          value={vac.type || ""}
                          onChange={(e: any) =>
                            setFieldValue(
                              `vaccinations[${index}].type`,
                              e.target ? e.target.value : e
                            )
                          }
                          error={errors?.vaccinations?.[index]?.type}
                          showError={errors?.vaccinations?.[index]?.type}
                        />

                        <CustomInput
                          label="Date Administered"
                          type="date"
                          name={`vaccinations[${index}].dateAdministered`}
                          value={vac.dateAdministered || ""}
                          onChange={handleChange}
                          error={errors?.vaccinations?.[index]?.dateAdministered}
                          showError={
                            errors?.vaccinations?.[index]?.dateAdministered
                          }
                        />

                        <CustomInput
                          label="Next Due Date"
                          type="date"
                          name={`vaccinations[${index}].nextDueDate`}
                          value={vac.nextDueDate || ""}
                          onChange={handleChange}
                          error={errors?.vaccinations?.[index]?.nextDueDate}
                          showError={errors?.vaccinations?.[index]?.nextDueDate}
                        />

                        <CustomInput
                          label="Reminder Date"
                          type="date"
                          name={`vaccinations[${index}].reminder`}
                          value={vac.reminder || ""}
                          onChange={handleChange}
                          error={errors?.vaccinations?.[index]?.reminder}
                          showError={errors?.vaccinations?.[index]?.reminder}
                        />

                        <Grid gridColumn={{ base: "span 1", md: "span 2" }}>
                          <CustomInput
                            label="Remarks"
                            name={`vaccinations[${index}].remarks`}
                            value={vac.remarks || ""}
                            onChange={handleChange}
                            type="textarea"
                            placeholder="Any additional notes"
                            error={errors?.vaccinations?.[index]?.remarks}
                            showError={errors?.vaccinations?.[index]?.remarks}
                          />
                        </Grid>

                        <Grid
                          gridColumn={{ base: "span 1", md: "span 2" }}
                          textAlign="right"
                        >
                          <IconButton
                            aria-label="Remove Vaccine Entry"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteIndex(index);
                              onOpen();
                            }}
                          />
                        </Grid>
                      </SimpleGrid>
                    </Box>
                  ))
                ) : (
                  <Box p={6}
                    borderWidth={1}
                    borderRadius="md"
                    borderStyle="dashed"
                    borderColor={borderColor}
                    bg={bgInput}
                    textAlign="center"
                    position="relative">
                    <Text color="gray.500" textAlign="center">
                      No vaccination records added yet.
                    </Text>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="teal"
                      mt={4}
                      onClick={() =>
                        push({
                          type: "",
                          dateAdministered: "",
                          nextDueDate: "",
                          reminder: "",
                          remarks: "",
                        })
                      }
                    >
                      Add Vaccine
                    </Button>
                  </Box>
                )}
              </VStack>

              <Button
                leftIcon={<FiPlus />}
                colorScheme="brand"
                mt={4}
                onClick={() =>
                  push({
                    type: "",
                    dateAdministered: "",
                    nextDueDate: "",
                    reminder: "",
                    remarks: "",
                  })
                }
                display={values?.vaccinations?.length === 0 ? 'none' : undefined}
              >
                Add Vaccine
              </Button>

              {/* Delete Confirmation Modal */}
              <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Delete Confirmation</ModalHeader>
                  <ModalBody>
                    <Text>
                      Are you sure you want to delete this vaccination record?
                    </Text>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => confirmDelete(remove)}
                    >
                      Delete
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </>
          )}
        </FieldArray>
      </Box>
    </GridItem>
  );
};

export default VaccinationHistorySection;
