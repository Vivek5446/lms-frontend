import React from "react";
import {
  Box,
  Button,
  Grid,
  Radio,
  RadioGroup,
  IconButton,
  Text,
  Badge,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

interface Phone {
  number: string;
  primary: boolean;
}

interface PhoneNumbersInputProps {
  values: { phones: Phone[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const PhoneNumbersInput = ({
  values,
  setFieldValue,
  errors,
}: PhoneNumbersInputProps) => {
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("gray.200", "darkBrand.200");
  const textColor = useColorModeValue("black", "white");

  const primaryIndex = values.phones.findIndex((p) => p.primary);
  const handlePrimaryChange = (val: string) => {
    const idx = parseInt(val, 10);
    const updatedPhones = values.phones.map((p, i) => ({
      ...p,
      primary: i === idx,
    }));
    setFieldValue("phones", updatedPhones);
  };

  const canRemove = (index: number) => {
    if (values.phones.length === 1) return false;
    if (index === primaryIndex) return false;
    return true;
  };

  return (
    <FieldArray name="phones">
      {({ remove, push }) => (
        <Box bg={bgBox} p={4} borderRadius="md" boxShadow="md">
          <Text fontWeight="bold" fontSize="lg" mb={4} color={textColor}>
            Phone Numbers
          </Text>

          <RadioGroup
            value={primaryIndex.toString()}
            onChange={handlePrimaryChange}
          >
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              {values.phones.map((phone, index) => (
                <Box
                  key={index}
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  position="relative"
                  borderColor={borderColor}
                // bg={phone.primary ? "teal.50" : "white"}
                >
                  <Flex align="center" mb={2}>
                    <Radio
                      value={index.toString()}
                      mr={2}
                      aria-label={`Select primary phone ${phone.number || index + 1
                        }`}
                    />
                    <Text fontWeight="medium" flexGrow={1} noOfLines={1}>
                      <Flex gap={2}>
                        {" "}
                        <Text> phone entered </Text>
                        {phone.primary && (
                          <Text as="span" color="red">
                            {" "}
                            *
                          </Text>
                        )}
                      </Flex>
                    </Text>
                    {phone.primary && (
                      <Badge
                        colorScheme="brand"
                        ml={2}
                        fontSize="0.75rem"
                        py={1}
                        px={2}
                      >
                        Primary
                      </Badge>
                    )}
                  </Flex>

                  <CustomInput
                    name={`phones[${index}].number`}
                    placeholder="Enter phone number"
                    type="text"
                    value={phone.number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue(`phones[${index}].number`, e.target.value)
                    }
                    error={errors?.phones?.[index]?.number}
                    showError={errors?.phones?.[index]?.number}
                  />

                  <IconButton
                    aria-label="Remove phone"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    size="sm"
                    mt={2}
                    onClick={() => remove(index)}
                    isDisabled={!canRemove(index)}
                    title={
                      !canRemove(index)
                        ? "Cannot remove primary phone. Select another primary first."
                        : undefined
                    }
                    float="right"
                  />
                </Box>
              ))}
            </Grid>
          </RadioGroup>

          <Button
            leftIcon={<AddIcon />}
            mt={4}
            colorScheme="brand"
            onClick={() =>
              push({ number: "", primary: values.phones.length === 0 })
            }
          >
            Add Phone
          </Button>
        </Box>
      )}
    </FieldArray>
  );
};

export default PhoneNumbersInput;
