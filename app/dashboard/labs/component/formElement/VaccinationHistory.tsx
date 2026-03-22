import {
  Box,
  Text,
  GridItem,
  Button,
  VStack,
  SimpleGrid,
  IconButton,
  Grid,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon } from "@chakra-ui/icons";
import { FiPlus } from "react-icons/fi";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { vaccinationTypeOptions } from "../../../../config/constant";

const VaccinationHistorySection = ({
  values,
  handleChange,
  setFieldValue,
  errors,
}: any) => {
  return (
    <GridItem colSpan={2}>
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        boxShadow="sm"
        bg="white"
        mt={3}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4} color="teal.600">
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
                      bg="gray.50"
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
                          error={
                            errors?.vaccinations?.[index]?.type
                          }
                          showError={
                            errors?.vaccinations?.[index]?.type
                          }
                        />

                        <CustomInput
                          label="Date Administered"
                          type="date"
                          name={`vaccinations[${index}].dateAdministered`}
                          value={vac.dateAdministered || ""}
                          onChange={handleChange}
                          error={
                            errors?.vaccinations?.[index]?.dateAdministered
                          }
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
                          error={
                            errors?.vaccinations?.[index]?.nextDueDate
                          }
                          showError={
                            errors?.vaccinations?.[index]?.nextDueDate                          }
                        />

                        <CustomInput
                          label="Reminder Date"
                          type="date"
                          name={`vaccinations[${index}].reminder`}
                          value={vac.reminder || ""}
                          onChange={handleChange}
                          error={
                            errors?.vaccinations?.[index]?.reminder
                          }
                          showError={
                            errors?.vaccinations?.[index]?.reminder

                          }
                        />

                        <Grid gridColumn={{ base: "span 1", md: "span 2" }}>
                          <CustomInput
                            label="Remarks"
                            name={`vaccinations[${index}].remarks`}
                            value={vac.remarks || ""}
                            onChange={handleChange}
                            type="textarea"
                            placeholder="Any additional notes"
                            error={
                              errors?.vaccinations?.[index]?.remarks
                            }
                            showError={
                              errors?.vaccinations?.[index]?.remarks
                            }
                          />
                        </Grid>

                        <Grid
                          gridColumn={{ base: "span 1", md: "span 2" }}
                          textAlign="right"
                          display={
                            values?.vaccinations?.length === 1
                              ? "none"
                              : undefined
                          }
                        >
                          <IconButton
                            aria-label="Remove Vaccine Entry"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                          />
                        </Grid>
                      </SimpleGrid>
                    </Box>
                  ))
                ) : (
                  <Text>No vaccination records added yet.</Text>
                )}
              </VStack>

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
            </>
          )}
        </FieldArray>
      </Box>
    </GridItem>
  );
};

export default VaccinationHistorySection;
