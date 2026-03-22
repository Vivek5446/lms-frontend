import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  VStack,
  Radio,
  RadioGroup,
  IconButton,
  Text,
  Flex,
  Badge,
  Grid,
  GridItem,
  Center,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { MdAccountBalance } from "react-icons/md";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

interface BankAccount {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch?: string;
  primary: boolean;
}

interface BankDetailsInputProps {
  values: { bankAccounts: BankAccount[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const BankDetailsInput = ({
  values,
  setFieldValue,
  errors,
}: BankDetailsInputProps) => {
  const primaryIndex = values.bankAccounts.findIndex((b) => b.primary);

  const [isOpen, setIsOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const cancelRef = useRef<any>(null);

  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");
  const bgInput = useColorModeValue("gray.50", "darkBrand.50");
  const textColor = useColorModeValue("brand.600", "white");

  const handlePrimaryChange = (val: string) => {
    const idx = parseInt(val, 10);
    const updatedBanks = values.bankAccounts.map((b, i) => ({
      ...b,
      primary: i === idx,
    }));
    setFieldValue("bankAccounts", updatedBanks);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setIsOpen(true);
  };

  const confirmDelete = (remove: any) => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
    }
    setDeleteIndex(null);
    setIsOpen(false);
  };

  return (
    <GridItem colSpan={3}>
      <Box p={4}
        borderWidth={1}
        borderRadius="md"
        boxShadow="sm"
        bg={bgBox}
        mt={3}
        borderColor={borderColor}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
          Bank Details
        </Text>
        <FieldArray name="bankAccounts">
          {({ remove, push }) => (
            <Box
              p={6}
              borderWidth={1}
              borderRadius="md"
              borderStyle="dashed"
              borderColor={borderColor}
              bg={bgInput}
              textAlign="center"
              position="relative"
              mt={6}
            >
              {values.bankAccounts.length === 0 ? (
                <Center flexDirection="column" py={12} color="gray.500">
                  <MdAccountBalance size={50} />
                  <Text fontSize="md" mt={3}>
                    No bank accounts added yet
                  </Text>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="brand"
                    mt={4}
                    onClick={() =>
                      push({
                        accountHolder: "",
                        bankName: "",
                        accountNumber: "",
                        ifscCode: "",
                        branch: "",
                        primary: true,
                      })
                    }
                  >
                    Add Bank Account
                  </Button>
                </Center>
              ) : (
                <>
                  <RadioGroup
                    value={primaryIndex.toString()}
                    onChange={handlePrimaryChange}
                  >
                    <VStack spacing={6} align="stretch">
                      {values.bankAccounts.map((bank, index) => (
                        <Box
                          key={index}
                          borderWidth="1px"
                          borderRadius="lg"
                          p={4}
                          boxShadow="sm"
                          _hover={{ boxShadow: "md" }}
                          transition="0.2s"
                          position="relative"
                        >
                          <Flex align="center" justify="space-between" mb={4}>
                            <Flex align="center">
                              <Radio
                                value={index.toString()}
                                aria-label={`Select primary bank account ${bank.accountNumber || index + 1
                                  }`}
                                mr={2}
                              />
                              <Text fontWeight="semibold" noOfLines={1}>
                                {bank.bankName || "Bank Name"}
                              </Text>
                              {bank.primary && (
                                <Badge colorScheme="teal" ml={3}>
                                  Primary
                                </Badge>
                              )}
                            </Flex>

                            <IconButton
                              aria-label="Remove bank account"
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              size="sm"
                              onClick={() =>
                                handleDeleteClick(index)
                              }
                            />
                          </Flex>
                          <Grid
                            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                            gap={4}
                          >
                            <CustomInput
                              name={`bankAccounts[${index}].accountHolder`}
                              placeholder="Account Holder"
                              label="Account Holder"
                              required
                              value={bank.accountHolder}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setFieldValue(
                                  `bankAccounts[${index}].accountHolder`,
                                  e.target.value
                                )
                              }
                              error={
                                errors?.bankAccounts?.[index]?.accountHolder
                              }
                              showError={
                                errors?.bankAccounts?.[index]?.accountHolder
                              }
                            />

                            <CustomInput
                              name={`bankAccounts[${index}].bankName`}
                              placeholder="Bank Name"
                              label="Bank Name"
                              required
                              value={bank.bankName}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setFieldValue(
                                  `bankAccounts[${index}].bankName`,
                                  e.target.value
                                )
                              }
                              error={errors?.bankAccounts?.[index]?.bankName}
                              showError={
                                errors?.bankAccounts?.[index]?.bankName
                              }
                            />

                            <CustomInput
                              name={`bankAccounts[${index}].accountNumber`}
                              placeholder="Account Number"
                              label="Account Number"
                              required
                              value={bank.accountNumber}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setFieldValue(
                                  `bankAccounts[${index}].accountNumber`,
                                  e.target.value
                                )
                              }
                              error={
                                errors?.bankAccounts?.[index]?.accountNumber
                              }
                              showError={
                                errors?.bankAccounts?.[index]?.accountNumber
                              }
                            />

                            <CustomInput
                              name={`bankAccounts[${index}].ifscCode`}
                              placeholder="IFSC Code"
                              label="IFSC Code"
                              required
                              value={bank.ifscCode}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setFieldValue(
                                  `bankAccounts[${index}].ifscCode`,
                                  e.target.value
                                )
                              }
                              error={errors?.bankAccounts?.[index]?.ifscCode}
                              showError={
                                errors?.bankAccounts?.[index]?.ifscCode
                              }
                            />

                            <GridItem colSpan={{ base: 1, md: 2 }}>
                              <CustomInput
                                name={`bankAccounts[${index}].branch`}
                                placeholder="Branch"
                                label="Branch"
                                value={bank.branch}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  setFieldValue(
                                    `bankAccounts[${index}].branch`,
                                    e.target.value
                                  )
                                }
                                error={errors?.bankAccounts?.[index]?.branch}
                                showError={
                                  errors?.bankAccounts?.[index]?.branch
                                }
                              />
                            </GridItem>
                          </Grid>
                        </Box>
                      ))}
                    </VStack>
                  </RadioGroup>

                  <Button
                    leftIcon={<AddIcon />}
                    mt={6}
                    colorScheme="brand"
                    onClick={() =>
                      push({
                        accountHolder: "",
                        bankName: "",
                        accountNumber: "",
                        ifscCode: "",
                        branch: "",
                        primary: values.bankAccounts.length === 0,
                      })
                    }
                  >
                    Add Bank Account
                  </Button>

                  {/* ✅ Confirmation Dialog */}
                  <AlertDialog
                    isOpen={isOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={() => setIsOpen(false)}
                    motionPreset="slideInBottom"
                    isCentered
                  >
                    <AlertDialogOverlay>
                      <AlertDialogContent borderRadius="xl" boxShadow="2xl">
                        <AlertDialogHeader
                          fontSize="xl"
                          fontWeight="bold"
                          borderBottomWidth="1px"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Box
                            bg="red.100"
                            p={2}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <DeleteIcon color="red.500" />
                          </Box>
                          Remove Bank Account
                        </AlertDialogHeader>

                        <AlertDialogBody fontSize="md" color="gray.600" py={6}>
                          Are you sure you want to remove this bank account?{" "}
                          <Text as="span" fontWeight="semibold" color="red.500">
                            This action cannot be undone.
                          </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter borderTopWidth="1px">
                          <Button
                            ref={cancelRef}
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            mr={3}
                          >
                            Cancel
                          </Button>
                          <Button
                            colorScheme="red"
                            onClick={() => confirmDelete(remove)}
                            _hover={{ bg: "red.600" }}
                          >
                            Remove
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialogOverlay>
                  </AlertDialog>
                </>
              )}
            </Box>
          )}
        </FieldArray>
      </Box>
    </GridItem>
  );
};

export default BankDetailsInput;