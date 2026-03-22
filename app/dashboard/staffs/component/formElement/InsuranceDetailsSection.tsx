import {
  Box,
  Text,
  GridItem,
  Button,
  VStack,
  SimpleGrid,
  IconButton,
  Grid,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon } from "@chakra-ui/icons";
import { FiPlus } from "react-icons/fi";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { insuranceTypeOptions } from "../../../../config/constant";

const InsuranceDetailsSection = ({
  values,
  handleChange,
  setFieldValue,
  errors,
}: any) => {
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");
  const bgInput = useColorModeValue("gray.50", "darkBrand.50");
  const textColor = useColorModeValue("brand.600", "white");
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
          Insurance Details
        </Text>

        <FieldArray name="insurances">
          {({ remove, push }) => (
            <>
              <VStack spacing={6} align="stretch">
                {values.insurances && values.insurances.length > 0 ? (
                  values.insurances.map((insurance: any, index: number) => (
                    <Box
                      key={index}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="xs"
                      bg={bgInput}
                      borderColor={borderColor}
                    >
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        {/* Insurance Type */}
                        <CustomInput
                          label="Type"
                          name={`insurances[${index}].type`}
                          type="select"
                          options={insuranceTypeOptions}
                          value={insurance.type || ""}
                          onChange={(e: any) =>
                            setFieldValue(
                              `insurances[${index}].type`,
                              e.target ? e.target.value : e
                            )
                          }
                          error={errors?.insurances?.[index]?.type}
                          showError={errors?.insurances?.[index]?.type}
                        />

                        {/* Start Date */}
                        <CustomInput
                          label="Start Date"
                          type="date"
                          name={`insurances[${index}].startDate`}
                          value={insurance.startDate || ""}
                          onChange={handleChange}
                          error={errors?.insurances?.[index]?.startDate}
                          showError={errors?.insurances?.[index]?.startDate}
                        />

                        {/* Renewal Date */}
                        <CustomInput
                          label="Renewal Date"
                          type="date"
                          name={`insurances[${index}].renewalDate`}
                          value={insurance.renewalDate || ""}
                          onChange={handleChange}
                          error={errors?.insurances?.[index]?.renewalDate}
                          showError={errors?.insurances?.[index]?.renewalDate}
                        />

                        {/* Amount Insured */}
                        <CustomInput
                          label="Amount Insured"
                          type="number"
                          name={`insurances[${index}].amountInsured`}
                          value={insurance.amountInsured || ""}
                          onChange={handleChange}
                          placeholder="Enter insured amount"
                          error={errors?.insurances?.[index]?.amountInsured}
                          showError={errors?.insurances?.[index]?.amountInsured}
                        />

                        {/* Amount Paid */}
                        <CustomInput
                          label="Amount Paid"
                          type="number"
                          name={`insurances[${index}].amountPaid`}
                          value={insurance.amountPaid || ""}
                          onChange={handleChange}
                          placeholder="Enter amount paid"
                          error={errors?.insurances?.[index]?.amountPaid}
                          showError={errors?.insurances?.[index]?.amountPaid}
                        />

                        {/* Remarks - full width */}
                        <Grid gridColumn={{ base: "span 1", md: "span 3" }}>
                          <CustomInput
                            label="Remarks"
                            name={`insurances[${index}].remarks`}
                            value={insurance.remarks || ""}
                            onChange={handleChange}
                            type="textarea"
                            placeholder="Any additional notes"
                          />
                        </Grid>

                        {/* Delete Button - full width */}
                        <Grid
                          gridColumn={{ base: "span 1", md: "span 3" }}
                          textAlign="right"
                        >
                          <IconButton
                            aria-label="Remove Insurance Entry"
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
                  // Empty state card
                  <Box
                    p={6}
                    borderWidth={1}
                    borderRadius="md"
                    borderStyle="dashed"
                    borderColor={borderColor}
                    bg={bgInput}
                    textAlign="center"
                    position="relative"
                  >
                    <Text fontSize="md" color={textColor} mb={3}>
                      No insurance records yet.
                    </Text>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="brand"
                      onClick={() =>
                        push({
                          type: "",
                          startDate: "",
                          renewalDate: "",
                          amountInsured: "",
                          amountPaid: "",
                          remarks: "",
                        })
                      }
                    >
                      Add Your First Insurance
                    </Button>
                  </Box>
                )}
              </VStack>

              {/* Always show Add Insurance button if there is at least one insurance */}
              {values.insurances && values.insurances.length > 0 && (
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="brand"
                  mt={4}
                  onClick={() =>
                    push({
                      type: "",
                      startDate: "",
                      renewalDate: "",
                      amountInsured: "",
                      amountPaid: "",
                      remarks: "",
                    })
                  }
                >
                  Add Insurance
                </Button>
              )}
            </>
          )}
        </FieldArray>
      </Box>
    </GridItem>
  );
};

export default InsuranceDetailsSection;
