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

interface Email {
  email: string;
  primary: boolean;
}

interface EmailsInputProps {
  values: { emails: Email[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const EmailsInput = ({
  values,
  setFieldValue,
  errors
}: EmailsInputProps) => {
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("gray.200", "darkBrand.200");
  const textColor = useColorModeValue("black", "white");

  const primaryIndex = values.emails.findIndex((e) => e.primary);

  const handlePrimaryChange = (val: string) => {
    const idx = parseInt(val, 10);
    const updatedEmails = values.emails.map((e, i) => ({
      ...e,
      primary: i === idx,
    }));
    setFieldValue("emails", updatedEmails);
  };

  const canRemove = (index: number) => {
    if (values.emails.length === 1) return false;
    if (index === primaryIndex) return false;
    return true;
  };

  return (
    <FieldArray name="emails">
      {({ remove, push }) => (
        <Box bg={bgBox} p={4} borderRadius="md" boxShadow="md">
          <Text fontWeight="bold" fontSize="lg" mb={4} color={textColor}>
            Email Addresses
          </Text>

          <RadioGroup
            value={primaryIndex.toString()}
            onChange={handlePrimaryChange}
          >
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              {values.emails.map((email, index) => {
                return (
                  <Box
                    key={index}
                    borderWidth="1px"
                    borderRadius="md"
                    p={3}
                    position="relative"
                    borderColor={borderColor}
                  //   bg={email.primary ? "teal.50" : "white"}
                  >
                    <Flex align="center" mb={2}>
                      <Radio
                        value={index.toString()}
                        mr={2}
                        aria-label={`Select primary email ${email.email || index + 1
                          }`}
                      />
                      <Text fontWeight="medium" flexGrow={1} noOfLines={1}>
                        <Flex gap={2}> <Text> email entered </Text>{email.primary && <Text as="span" color="red">
                          {" "}
                          *
                        </Text>}</Flex>
                      </Text>

                      {email.primary && (
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
                      name={`emails[${index}].email`}
                      placeholder="Enter email address"
                      type="text"
                      value={email.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue(`emails[${index}].email`, e.target.value)
                      }
                      error={errors?.emails?.[index]?.email}
                      showError={errors?.emails?.[index]?.email}
                    />

                    <IconButton
                      aria-label="Remove email"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      mt={2}
                      onClick={() => remove(index)}
                      isDisabled={!canRemove(index)}
                      title={
                        !canRemove(index)
                          ? "Cannot remove primary email. Select another primary first."
                          : undefined
                      }
                      float="right"
                    />
                  </Box>
                );
              })}
            </Grid>
          </RadioGroup>

          <Button
            leftIcon={<AddIcon />}
            mt={4}
            colorScheme="brand"
            onClick={() =>
              push({ email: "", primary: values.emails.length === 0 })
            }
          >
            Add Email
          </Button>
        </Box>
      )}
    </FieldArray>
  );
};

export default EmailsInput;
