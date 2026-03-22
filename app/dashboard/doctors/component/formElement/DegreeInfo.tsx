import {
  Box,
  Flex,
  IconButton,
  SimpleGrid,
  Text,
  Button,
  Divider,
  Center,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import React from "react";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

const DegreeInfo = ({ errors, values, handleChange }: any) => {
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("gray.300", "darkBrand.200");
  const bgInput = useColorModeValue("gray.50", "darkBrand.200");
  const textColor = useColorModeValue("black", "white");


  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
      bg={bgBox}
      borderColor={borderColor}
      mt={3}
    >
      <Text fontWeight="bold" fontSize="xl" mb={4} color={textColor}>
        Degree Information
      </Text>

      <FieldArray name="degreeInfo">
        {({ remove, push }) => (
          <>
            {values.degreeInfo.length === 0 ? (
              <Center
                py={8}
                flexDir="column"
                borderWidth={1}
                borderRadius="md"
                borderStyle="dashed"
                borderColor={borderColor}
                bg={bgInput}
                mb={4}
              >
                <Text fontSize="md" color="gray.500">
                  No degree information exists.
                </Text>
                <Button
                  colorScheme="brand"
                  size="sm"
                  mt={3}
                  leftIcon={<AddIcon />}
                  onClick={() => push({ name: "", university: "", year: "" })}
                >
                  Add First Degree
                </Button>
              </Center>
            ) : (
              <>
                {values.degreeInfo.map((deg: any, index: number) => (
                  <Box
                    key={index}
                    p={4}
                    mb={4}
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <Text fontWeight="semibold" fontSize="md">
                        Degree {index + 1}
                      </Text>
                      {values.degreeInfo.length > 1 && (
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          aria-label="Remove Degree"
                          onClick={() => remove(index)}
                        />
                      )}
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <CustomInput
                        label="Degree Name"
                        name={`degreeInfo[${index}].name`}
                        placeholder="e.g., B.Sc Nursing"
                        value={deg.name}
                        onChange={handleChange}
                        error={
                          errors.degreeInfo && errors.degreeInfo[index]?.name
                        }
                        showError={
                          errors.degreeInfo && errors.degreeInfo[index]?.name
                        }
                      />
                      <CustomInput
                        label="University / Institution"
                        name={`degreeInfo[${index}].university`}
                        placeholder="e.g., Delhi University"
                        value={deg.university}
                        onChange={handleChange}
                        error={
                          errors.degreeInfo &&
                          errors.degreeInfo[index]?.university
                        }
                        showError={
                          errors.degreeInfo &&
                          errors.degreeInfo[index]?.university
                        }
                      />
                      <CustomInput
                        label="Year of Completion"
                        name={`degreeInfo[${index}].year`}
                        type="text"
                        placeholder="e.g., 2020"
                        value={deg.year}
                        onChange={handleChange}
                        error={
                          errors.degreeInfo && errors.degreeInfo[index]?.year
                        }
                        showError={
                          errors.degreeInfo && errors.degreeInfo[index]?.year
                        }
                      />
                    </SimpleGrid>
                  </Box>
                ))}

                <Divider my={4} />

                <Button
                  colorScheme="brand"
                  leftIcon={<AddIcon />}
                  mt={4}
                  onClick={() =>
                    push({ name: "", university: "", year: "" })
                  }
                >
                  Add Another Degree
                </Button>
              </>
            )}
          </>
        )}
      </FieldArray>
    </Box>
  );
};

export default DegreeInfo;
