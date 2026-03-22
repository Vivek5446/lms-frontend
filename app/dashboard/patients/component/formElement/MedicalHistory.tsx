"use client";
import {
  Box,
  Checkbox,
  Input,
  Text,
  Grid,
  GridItem,
  FormControl,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";

const MedicalHistorySection = ({ values, setFieldValue }: any) => {
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const textColor = useColorModeValue("teal.600", "white");
  const bgActive = useColorModeValue("teal.50", "whiteAlpha.200");
  const bgInactive = useColorModeValue("gray.50", "darkBrand.200");
  const borderActive = useColorModeValue("teal.300", "brand.500");
  const borderInactive = useColorModeValue("gray.200", "gray.600");
  const borderHover = useColorModeValue("teal.400", "brand.400");

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
      bg={bgBox}
      mt={6}
      p={6}
    >
      <Text fontSize="2xl" fontWeight="bold" mb={6} color={textColor}>
        Medical History
      </Text>

      {/* Conditions */}
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
        Conditions
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        {/* Allergies */}
        <GridItem>
          <FormControl id="allergies">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.allergies?.checked ||
                  values.medicalHistory?.allergies?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.allergies?.checked ||
                  values.medicalHistory?.allergies?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Checkbox
                colorScheme="brand"
                isChecked={values.medicalHistory?.allergies?.checked || false}
                onChange={(e) => {
                  setFieldValue(
                    "medicalHistory.allergies.checked",
                    e.target.checked
                  );
                }}
              >
                allergies?
              </Checkbox>
              {values.medicalHistory?.allergies?.checked && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter allergy details"
                  value={values.medicalHistory?.allergies?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.allergies.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Blood Pressure */}
        <GridItem>
          <FormControl id="bloodPressure">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.bloodPressure?.option ||
                  values.medicalHistory?.bloodPressure?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.bloodPressure?.option ||
                  values.medicalHistory?.bloodPressure?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Blood pressure issues?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.bloodPressure?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.bloodPressure.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="high" colorScheme="brand">
                    High
                  </Radio>
                  <Radio value="low" colorScheme="brand">
                    Low
                  </Radio>
                </Stack>
              </RadioGroup>
              <Input
                size="sm"
                mt={3}
                placeholder="Details (e.g., medication)"
                value={values.medicalHistory?.bloodPressure?.text || ""}
                onChange={(e) => {
                  setFieldValue(
                    "medicalHistory.bloodPressure.text",
                    e.target.value
                  );
                }}
              />
            </Box>
          </FormControl>
        </GridItem>

        {/* Heart Disease */}
        <GridItem>
          <FormControl id="heartDisease">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.heartDisease?.checked ||
                  values.medicalHistory?.heartDisease?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.heartDisease?.checked ||
                  values.medicalHistory?.heartDisease?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Checkbox
                colorScheme="brand"
                isChecked={
                  values.medicalHistory?.heartDisease?.checked || false
                }
                onChange={(e) => {
                  setFieldValue(
                    "medicalHistory.heartDisease.checked",
                    e.target.checked
                  );
                }}
              >
                heart disease?
              </Checkbox>
              {values.medicalHistory?.heartDisease?.checked && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.heartDisease?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.heartDisease.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Pacemaker */}
        <GridItem>
          <FormControl id="pacemaker">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.pacemaker?.checked ||
                  values.medicalHistory?.pacemaker?.text
                  ? "teal.100" // changed from teal.50 for more contrast
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.pacemaker?.checked ||
                  values.medicalHistory?.pacemaker?.text
                  ? "teal.500" // stronger border for active state
                  : borderInactive
              }
              _hover={{
                borderColor: borderHover,
                bg: bgActive,
                transition: "all 0.2s ease",
              }}
            >
              <Checkbox
                colorScheme="brand"
                size="md"
                iconColor="white"
                sx={{
                  ".chakra-checkbox__control": {
                    bg: values.medicalHistory?.pacemaker?.checked
                      ? "teal.500"
                      : "white",
                    borderColor: "teal.500",
                    _checked: {
                      bg: "teal.600",
                      borderColor: "teal.600",
                    },
                  },
                }}
                isChecked={values.medicalHistory?.pacemaker?.checked || false}
                onChange={(e) => {
                  setFieldValue(
                    "medicalHistory.pacemaker.checked",
                    e.target.checked
                  );
                }}
                mb={3}
                fontSize="md"
                fontWeight="medium"
              >
                Pacemaker
              </Checkbox>
            </Box>
          </FormControl>

          {values.medicalHistory?.pacemaker?.checked && (
            <Box
              mt={1}
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={bgActive} // lighter secondary box background
              borderColor={borderActive}
              onClick={(e) => e.stopPropagation()}
              boxShadow="sm"
            >
              <Input
                size="sm"
                mb={4}
                placeholder="Enter pacemaker details (e.g., type, date implanted)"
                value={values.medicalHistory?.pacemaker?.text || ""}
                onChange={(e) => {
                  setFieldValue(
                    "medicalHistory.pacemaker.text",
                    e.target.value
                  );
                }}
                bg="white"
                borderColor="teal.400"
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px teal.500",
                }}
              />
            </Box>
          )}
        </GridItem>
      </Grid>
      <Box
        p={5}
        bg="gray.50"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="lg"
        _dark={{
          bg: "gray.800",
          borderColor: "gray.700",
        }}
        w="full"
        mt={8}
      >
        <Text
          fontSize="md"
          fontWeight="semibold"
          mb={4}
        // color={useColorModeValue("gray.700", "gray.100")}
        >
          Are you taking any of the following pacemaker-related medications?{" "}
        </Text>

        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
          {[
            { key: "aspirin", label: "Aspirin" },
            { key: "anticoagulants", label: "Anticoagulants (blood thinners)" },
            { key: "bloodPressureMeds", label: "High blood pressure medicine" },
            { key: "nitroglycerin", label: "Nitroglycerin" },
          ].map((med) => (
            <Checkbox
              key={med.key}
              colorScheme="brand"
              size="md"
              fontWeight="medium"
              iconColor="white"
              // borderColor={useColorModeValue("gray.300", "gray.600")}
              _hover={{
                // bg: useColorModeValue("teal.50", "teal.900"),
                borderColor: "teal.400",
              }}
              isChecked={
                values.medicalHistory?.pacemakerMeds?.[med.key] || false
              }
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                setFieldValue(
                  `medicalHistory.pacemakerMeds.${med.key}`,
                  e.target.checked
                );
              }}
              sx={{
                ".chakra-checkbox__control": {
                  transition: "all 0.2s ease-in-out",
                  boxShadow: "sm",
                  _checked: {
                    bg: "teal.500",
                    borderColor: "teal.500",
                  },
                },
              }}
            >
              {med.label}
            </Checkbox>
          ))}
        </SimpleGrid>
      </Box>

      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mt={8}>
        <GridItem>
          <FormControl id="diabetes">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.diabetes?.checked ||
                  values.medicalHistory?.diabetes?.insulin ||
                  values.medicalHistory?.diabetes?.text
                  ? "teal.100" // more contrast for active
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.diabetes?.checked ||
                  values.medicalHistory?.diabetes?.insulin ||
                  values.medicalHistory?.diabetes?.text
                  ? "teal.500" // stronger border for active
                  : borderInactive
              }
              _hover={{
                borderColor: borderHover,
                bg: bgActive,
                transition: "all 0.2s ease",
              }}
            >
              <Checkbox
                colorScheme="brand"
                size="md"
                iconColor="white"
                sx={{
                  ".chakra-checkbox__control": {
                    bg: values.medicalHistory?.diabetes?.checked
                      ? "teal.500"
                      : "white",
                    borderColor: "teal.500",
                    _checked: {
                      bg: "teal.600",
                      borderColor: "teal.600",
                    },
                  },
                }}
                isChecked={values.medicalHistory?.diabetes?.checked || false}
                onChange={(e) => {
                  setFieldValue(
                    "medicalHistory.diabetes.checked",
                    e.target.checked
                  );
                }}
                mb={3}
                fontSize="md"
                fontWeight="medium"
              >
                Diabetes
              </Checkbox>
            </Box>
          </FormControl>

          {(values.medicalHistory?.diabetes?.checked ||
            values.medicalHistory?.diabetes?.insulin) && (
              <Box
                mt={1}
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg={bgActive} // lighter sub-box color
                borderColor={borderActive}
                onClick={(e) => e.stopPropagation()}
                boxShadow="sm"
              >
                <Input
                  size="sm"
                  mb={4}
                  placeholder="Enter diabetes details (e.g., type, diagnosis date)"
                  value={values.medicalHistory?.diabetes?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.diabetes.text", e.target.value);
                  }}
                  bg="white"
                  borderColor="teal.400"
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px teal.500",
                  }}
                />
                <Checkbox
                  colorScheme="brand"
                  size="sm"
                  sx={{
                    ".chakra-checkbox__control": {
                      bg: values.medicalHistory?.diabetes?.insulin
                        ? "teal.500"
                        : "white",
                      borderColor: "teal.400",
                      _checked: {
                        bg: "teal.600",
                        borderColor: "teal.600",
                      },
                    },
                  }}
                  isChecked={values.medicalHistory?.diabetes?.insulin || false}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    setFieldValue(
                      "medicalHistory.diabetes.insulin",
                      e.target.checked
                    );
                    if (
                      e.target.checked &&
                      !values.medicalHistory?.diabetes?.checked
                    ) {
                      setFieldValue("medicalHistory.diabetes.checked", true);
                    }
                  }}
                  fontSize="sm"
                >
                  Taking insulin or other diabetes drug?
                </Checkbox>
              </Box>
            )}
        </GridItem>

        {/* Asthma */}
        <GridItem>
          <FormControl id="asthma">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.asthma?.option ||
                  values.medicalHistory?.asthma?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.asthma?.option ||
                  values.medicalHistory?.asthma?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Asthma?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.asthma?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.asthma.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.asthma?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.asthma?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.asthma.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Artificial Joint or Valve */}
        <GridItem>
          <FormControl id="artificialJointOrValve">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.artificialJointOrValve?.option ||
                  values.medicalHistory?.artificialJointOrValve?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.artificialJointOrValve?.option ||
                  values.medicalHistory?.artificialJointOrValve?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                An artificial joint or valve?
              </Text>
              <RadioGroup
                value={
                  values.medicalHistory?.artificialJointOrValve?.option || ""
                }
                onChange={(val) => {
                  setFieldValue(
                    "medicalHistory.artificialJointOrValve.option",
                    val
                  );
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.artificialJointOrValve?.option ===
                "yes" && (
                  <Input
                    size="sm"
                    mt={3}
                    placeholder="Enter details"
                    value={
                      values.medicalHistory?.artificialJointOrValve?.text || ""
                    }
                    onChange={(e) => {
                      setFieldValue(
                        "medicalHistory.artificialJointOrValve.text",
                        e.target.value
                      );
                    }}
                  />
                )}
            </Box>
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl id="thyroid">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.thyroid?.option ||
                  values.medicalHistory?.thyroid?.type ||
                  values.medicalHistory?.thyroid?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.thyroid?.option ||
                  values.medicalHistory?.thyroid?.type ||
                  values.medicalHistory?.thyroid?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Thyroid condition?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.thyroid?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.thyroid.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.thyroid?.option === "yes" && (
                <>
                  <Input
                    size="sm"
                    mt={3}
                    placeholder="Enter details (e.g., medication, diagnosis date)"
                    value={values.medicalHistory?.thyroid?.text || ""}
                    onChange={(e) => {
                      setFieldValue("medicalHistory.thyroid.text", e.target.value);
                    }}
                  />
                </>
              )}
            </Box>
          </FormControl>
        </GridItem>


        {/* Kidney Disease */}
        <GridItem>
          <FormControl id="kidneyDisease">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.kidneyDisease?.option ||
                  values.medicalHistory?.kidneyDisease?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.kidneyDisease?.option ||
                  values.medicalHistory?.kidneyDisease?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Kidney disease?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.kidneyDisease?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.kidneyDisease.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.kidneyDisease?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.kidneyDisease?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.kidneyDisease.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Tuberculosis or Other Lung Problems */}
        <GridItem>
          <FormControl id="tuberculosis">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.tuberculosis?.option ||
                  values.medicalHistory?.tuberculosis?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.tuberculosis?.option ||
                  values.medicalHistory?.tuberculosis?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Tuberculosis or other lung problems?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.tuberculosis?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.tuberculosis.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.tuberculosis?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.tuberculosis?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.tuberculosis.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Hepatitis or Other Liver Disease */}
        <GridItem>
          <FormControl id="hepatitis">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.hepatitis?.option ||
                  values.medicalHistory?.hepatitis?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.hepatitis?.option ||
                  values.medicalHistory?.hepatitis?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Hepatitis or other liver disease?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.hepatitis?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.hepatitis.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.hepatitis?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.hepatitis?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.hepatitis.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Blood Transfusion */}
        <GridItem>
          <FormControl id="bloodTransfusion">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.bloodTransfusion?.option ||
                  values.medicalHistory?.bloodTransfusion?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.bloodTransfusion?.option ||
                  values.medicalHistory?.bloodTransfusion?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Blood transfusion?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.bloodTransfusion?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.bloodTransfusion.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.bloodTransfusion?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.bloodTransfusion?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.bloodTransfusion.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Cancer or Tumour */}
        <GridItem>
          <FormControl id="cancer">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.cancer?.option ||
                  values.medicalHistory?.cancer?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.cancer?.option ||
                  values.medicalHistory?.cancer?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Cancer or a tumour?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.cancer?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.cancer.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.cancer?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.cancer?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.cancer.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Neurologic Condition */}
        <GridItem>
          <FormControl id="neurologicCondition">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.neurologicCondition?.option ||
                  values.medicalHistory?.neurologicCondition?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.neurologicCondition?.option ||
                  values.medicalHistory?.neurologicCondition?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Neurologic condition?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.neurologicCondition?.option || ""}
                onChange={(val) => {
                  setFieldValue(
                    "medicalHistory.neurologicCondition.option",
                    val
                  );
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.neurologicCondition?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.neurologicCondition?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.neurologicCondition.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Epilepsy, Seizures, or Fainting Spells */}
        <GridItem>
          <FormControl id="epilepsy">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.epilepsy?.option ||
                  values.medicalHistory?.epilepsy?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.epilepsy?.option ||
                  values.medicalHistory?.epilepsy?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Epilepsy, seizures, or fainting spells?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.epilepsy?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.epilepsy.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.epilepsy?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.epilepsy?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.epilepsy.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* AIDS Positive */}
        <GridItem>
          <FormControl id="aids">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.aids?.option ||
                  values.medicalHistory?.aids?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.aids?.option ||
                  values.medicalHistory?.aids?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                AIDS positive?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.aids?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.aids.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.aids?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.aids?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.aids.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* HIV Positive */}
        <GridItem>
          <FormControl id="hiv">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.hiv?.option ||
                  values.medicalHistory?.hiv?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.hiv?.option ||
                  values.medicalHistory?.hiv?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                HIV positive?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.hiv?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.hiv.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.hiv?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.hiv?.text || ""}
                  onChange={(e) => {
                    setFieldValue("medicalHistory.hiv.text", e.target.value);
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Anaemia or Blood Disorders */}
        <GridItem>
          <FormControl id="anaemia">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.anaemia?.option ||
                  values.medicalHistory?.anaemia?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.anaemia?.option ||
                  values.medicalHistory?.anaemia?.text
                  ? borderActive
                  : borderInactive
              }
            >
              <Text fontWeight="medium" mb={2}>
                Anaemia or blood disorders?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.anaemia?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.anaemia.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.anaemia?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details"
                  value={values.medicalHistory?.anaemia?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.anaemia.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl id="otherMedicalIssue">
            <Box
              p={5}
              borderWidth={1}
              borderRadius="xl"
              boxShadow="sm"
              bg={
                values.medicalHistory?.otherMedicalIssue?.option === "yes" ||
                  values.medicalHistory?.otherMedicalIssue?.text
                  ? bgActive
                  : bgInactive
              }
              borderColor={
                values.medicalHistory?.otherMedicalIssue?.option === "yes" ||
                  values.medicalHistory?.otherMedicalIssue?.text
                  ? borderActive
                  : borderInactive
              }
              transition="all 0.2s ease-in-out"
            >
              <Text fontWeight="semibold" fontSize="md" mb={3} color="gray.800">
                Any Other Medical Issue?
              </Text>

              {/* ✅ Radio Selection */}
              <RadioGroup
                value={values.medicalHistory?.otherMedicalIssue?.option || ""}
                onChange={(val) =>
                  setFieldValue("medicalHistory.otherMedicalIssue.option", val)
                }
              >
                <Stack direction="row" spacing={6}>
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>

              {/* ✅ Text Input for Details */}
              {values.medicalHistory?.otherMedicalIssue?.option === "yes" && (
                <Box mt={4}>
                  <Input
                    size="sm"
                    placeholder="Please specify the medical issue"
                    value={values.medicalHistory?.otherMedicalIssue?.text || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "medicalHistory.otherMedicalIssue.text",
                        e.target.value
                      )
                    }
                    bg="white"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "teal.400",
                      boxShadow: "0 0 0 1px teal.400",
                    }}
                  />
                </Box>
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Any Other Medical Issue */}
      </Grid>

      <Box>
        {/* ✅ Other Medical Issue Section */}

        {/* ✅ Medication Section */}
        <Box
          mt={4}
          p={5}
          borderWidth={1}
          borderRadius="xl"
          boxShadow="sm"
          bg={
            Object.values(values.medicalHistory?.medications || {}).some(
              (val) => val === true || (typeof val === "string" && val)
            )
              ? bgActive
              : bgInactive
          }
          borderColor={
            Object.values(values.medicalHistory?.medications || {}).some(
              (val) => val === true || (typeof val === "string" && val)
            )
              ? borderActive
              : borderInactive
          }
          transition="all 0.2s ease-in-out"
        >
          <Text fontWeight="semibold" fontSize="md" mb={3} color="gray.800">
            Are you taking any of the following ?
          </Text>

          {/* ✅ Checkbox List */}
          <Stack spacing={3} mt={2}>
            {[
              { key: "antibiotics", label: "Antibiotics" },
              {
                key: "antidepressants",
                label: "Antidepressants / Tranquilizers",
              },
              { key: "steroids", label: "Cortisone / Steroids" },
              { key: "osteoporosisMeds", label: "Osteoporosis Medicine" },
            ].map((med) => (
              <Checkbox
                key={med.key}
                colorScheme="brand"
                isChecked={
                  values.medicalHistory?.medications?.[med.key] || false
                }
                onChange={(e) =>
                  setFieldValue(
                    `medicalHistory.medications.${med.key}`,
                    e.target.checked
                  )
                }
                _hover={{ bg: "teal.50" }}
                px={2}
                borderRadius="md"
              >
                {med.label}
              </Checkbox>
            ))}

            {/* ✅ Additional Inputs */}
            <Divider my={3} borderColor="gray.300" />

            <Input
              size="sm"
              placeholder="Other medications (first)"
              value={values.medicalHistory?.medications?.other1 || ""}
              onChange={(e) =>
                setFieldValue(
                  "medicalHistory.medications.other1",
                  e.target.value
                )
              }
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "teal.400",
                boxShadow: "0 0 0 1px teal.400",
              }}
            />

            <Input
              size="sm"
              placeholder="Other medications (second)"
              value={values.medicalHistory?.medications?.other2 || ""}
              onChange={(e) =>
                setFieldValue(
                  "medicalHistory.medications.other2",
                  e.target.value
                )
              }
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "teal.400",
                boxShadow: "0 0 0 1px teal.400",
              }}
            />
          </Stack>
        </Box>
      </Box>

      {/* Divider */}
      <Divider my={8} />

      {/* Habits */}
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
        Habits
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        {/* Smoking */}
        <GridItem>
          <FormControl id="smoking">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.smoking?.option ||
                  values.medicalHistory?.smoking?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.smoking?.option ||
                  values.medicalHistory?.smoking?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Smoke? (Habitual)
              </Text>
              <RadioGroup
                value={values.medicalHistory?.smoking?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.smoking.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.smoking?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Details (e.g., daily use)"
                  value={values.medicalHistory?.smoking?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.smoking.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Chewing Tobacco */}
        <GridItem>
          <FormControl id="chewingTobacco">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.chewingTobacco?.option ||
                  values.medicalHistory?.chewingTobacco?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.chewingTobacco?.option ||
                  values.medicalHistory?.chewingTobacco?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Chew tobacco? (Habitual)
              </Text>
              <RadioGroup
                value={values.medicalHistory?.chewingTobacco?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.chewingTobacco.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.chewingTobacco?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Details (e.g., frequency)"
                  value={values.medicalHistory?.chewingTobacco?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.chewingTobacco.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Alcohol */}
        <GridItem>
          <FormControl id="alcohol">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.alcohol?.option ||
                  values.medicalHistory?.alcohol?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.alcohol?.option ||
                  values.medicalHistory?.alcohol?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Consume alcohol?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.alcohol?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.alcohol.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="occasional" colorScheme="brand">
                    Occasional
                  </Radio>
                  <Radio value="habitual" colorScheme="brand">
                    Habitual
                  </Radio>
                </Stack>
              </RadioGroup>
              <Input
                size="sm"
                mt={3}
                placeholder="Additional details"
                value={values.medicalHistory?.alcohol?.text || ""}
                onChange={(e) => {
                  setFieldValue("medicalHistory.alcohol.text", e.target.value);
                }}
              />
            </Box>
          </FormControl>
        </GridItem>
      </Grid>

      {/* Divider */}
      <Divider my={8} />

      {/* Women-specific */}
      {/* Women-specific */}
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
        Women
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        {/* Pregnancy */}
        <GridItem>
          <FormControl id="pregnant">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.women?.pregnant ||
                  values.medicalHistory?.women?.dueDate
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.women?.pregnant ||
                  values.medicalHistory?.women?.dueDate
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Checkbox
                colorScheme="brand"
                isChecked={values.medicalHistory?.women?.pregnant || false}
                onChange={(e) => {
                  setFieldValue(
                    "medicalHistory.women.pregnant",
                    e.target.checked
                  );
                }}
              >
                pregnant?
              </Checkbox>
              {values.medicalHistory?.women?.pregnant && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Expected delivery date (e.g., MM/DD/YYYY)"
                  value={values.medicalHistory?.women?.dueDate || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.women.dueDate",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>

        {/* Breast Feeding */}
        <GridItem>
          <FormControl id="breastFeeding">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.women?.breastFeeding
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.women?.breastFeeding
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Checkbox
                colorScheme="brand"
                isChecked={values.medicalHistory?.women?.breastFeeding || false}
                onChange={(e) => {
                  setFieldValue(
                    "medicalHistory.women.breastFeeding",
                    e.target.checked
                  );
                }}
              >
                breast feeding?
              </Checkbox>
            </Box>
          </FormControl>
        </GridItem>

        {/* PCOD/PCOS */}
        <GridItem>
          <FormControl id="pcodPcos">
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              bg={
                values.medicalHistory?.women?.pcodPcos?.option ||
                  values.medicalHistory?.women?.pcodPcos?.text
                  ? "teal.50"
                  : "gray.50"
              }
              borderColor={
                values.medicalHistory?.women?.pcodPcos?.option ||
                  values.medicalHistory?.women?.pcodPcos?.text
                  ? "teal.300"
                  : "gray.200"
              }
            >
              <Text fontWeight="medium" mb={2}>
                Diagnosed with PCOD/PCOS?
              </Text>
              <RadioGroup
                value={values.medicalHistory?.women?.pcodPcos?.option || ""}
                onChange={(val) => {
                  setFieldValue("medicalHistory.women.pcodPcos.option", val);
                }}
              >
                <Stack direction="row">
                  <Radio value="yes" colorScheme="brand">
                    Yes
                  </Radio>
                  <Radio value="no" colorScheme="brand">
                    No
                  </Radio>
                </Stack>
              </RadioGroup>
              {values.medicalHistory?.women?.pcodPcos?.option === "yes" && (
                <Input
                  size="sm"
                  mt={3}
                  placeholder="Enter details (e.g., treatment, symptoms)"
                  value={values.medicalHistory?.women?.pcodPcos?.text || ""}
                  onChange={(e) => {
                    setFieldValue(
                      "medicalHistory.women.pcodPcos.text",
                      e.target.value
                    );
                  }}
                />
              )}
            </Box>
          </FormControl>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default MedicalHistorySection;