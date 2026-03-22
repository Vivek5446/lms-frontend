import React from "react";
import {
  Box,
  Button,
  IconButton,
  Text,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

interface Item {
  itemName: string;
  itemCode?: string;
  quantity: number | "";
  price: number | "";
  total: number | "";
  patientName:any
}

interface ItemOrderingInputProps {
  values: { items: Item[] };
  setFieldValue: any;
  errors?: any;
  touched?: any;
}

const ItemOrderingInput = ({
  values,
  setFieldValue,
  errors,
}: ItemOrderingInputProps) => {
  // ✅ move all useColorModeValue here
  const cardBg = useColorModeValue("white", "gray.800");
  const tableHeadBg = useColorModeValue("gray.100", "gray.700");
  const rowHoverBg = useColorModeValue("gray.50", "gray.700");

  const calculateTotal = (qty: number | "", price: number | "") => {
    if (qty && price) return Number(qty) * Number(price);
    return "";
  };

  const grandTotal = values.items.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );

  return (
    <GridItem colSpan={3}>
      <Box
        p={6}
        borderWidth={1}
        borderRadius="xl"
        boxShadow="lg"
        bg={cardBg}
        mt={3}
      >
        <Text fontWeight="bold" fontSize="xl" mb={6}>
          Item Ordering & Pricing
        </Text>

        <FieldArray name="items">
          {({ remove, push }) => (
            <>
              <Table size="sm" variant="simple">
                <Thead bg={tableHeadBg}>
                  <Tr>
                    <Th>Patient Name</Th>
                    <Th>Item Name</Th>
                    <Th>Item Code / SKU</Th>
                    <Th isNumeric>Quantity</Th>
                    <Th isNumeric>Price (per unit)</Th>
                    <Th isNumeric>Total</Th>
                    <Th textAlign="center">Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {values.items.map((item, index) => (
                    <Tr key={index} _hover={{ bg: rowHoverBg }}>
                      <Td w={350}>
                        <CustomInput
                          name={`items[${index}].patientName`}
                          placeholder="Patient Name"
                          type="real-time-user-search"
                          value={item.patientName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              `items[${index}].patientName`,
                              e
                            )
                          }
                          error={errors?.items?.[index]?.itemName}
                          showError={errors?.items?.[index]?.itemName}
                          query={{type : "patient"}}
                        />
                        </Td>
                        <Td w={220}>
                        <CustomInput
                          name={`items[${index}].itemName`}
                          placeholder="Item Name"
                          value={item.itemName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              `items[${index}].itemName`,
                              e.target.value
                            )
                          }
                          error={errors?.items?.[index]?.itemName}
                          showError={errors?.items?.[index]?.itemName}
                        />
                      </Td>

                      <Td>
                        <CustomInput
                          name={`items[${index}].itemCode`}
                          placeholder="Code"
                          value={item.itemCode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFieldValue(
                              `items[${index}].itemCode`,
                              e.target.value
                            )
                          }
                          error={errors?.items?.[index]?.itemCode}
                          showError={errors?.items?.[index]?.itemCode}
                        />
                      </Td>

                      <Td isNumeric>
                        <CustomInput
                          name={`items[${index}].quantity`}
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const qty = e.target.value
                              ? parseInt(e.target.value)
                              : "";
                            setFieldValue(`items[${index}].quantity`, qty);
                            setFieldValue(
                              `items[${index}].total`,
                              calculateTotal(qty, item.price)
                            );
                          }}
                          error={errors?.items?.[index]?.quantity}
                          showError={errors?.items?.[index]?.quantity}
                        />
                      </Td>

                      <Td isNumeric>
                        <CustomInput
                          name={`items[${index}].price`}
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const price = e.target.value
                              ? parseFloat(e.target.value)
                              : "";
                            setFieldValue(`items[${index}].price`, price);
                            setFieldValue(
                              `items[${index}].total`,
                              calculateTotal(item.quantity, price)
                            );
                          }}
                          error={errors?.items?.[index]?.price}
                          showError={errors?.items?.[index]?.price}
                        />
                      </Td>

                      <Td isNumeric>
                        <CustomInput
                          name={`items[${index}].total`}
                          type="number"
                          value={item.total}
                        />
                      </Td>

                      <Td textAlign="center">
                        <IconButton
                          aria-label="Remove item"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => remove(index)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* Add Item Button */}
              <Button
                leftIcon={<AddIcon />}
                mt={4}
                colorScheme="teal"
                onClick={() =>
                  push({
                    patientName:undefined,
                    itemName: "",
                    itemCode: "",
                    quantity: "",
                    price: "",
                    total: "",
                    add:1
                  })
                }
              >
                Add Item
              </Button>

              {/* Grand Total */}
              <Flex justify="flex-end" mt={6}>
                <HStack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg">
                    Grand Total:
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="teal.600">
                    ₹ {grandTotal.toFixed(2)}
                  </Text>
                </HStack>
              </Flex>
            </>
          )}
        </FieldArray>
      </Box>
    </GridItem>
  );
};

export default ItemOrderingInput;