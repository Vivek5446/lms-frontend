import React from "react";
import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

interface AddressesInputProps {
  values: {
    addresses: {
      residential: string;
      office: string;
      other?: string;
    };
  };
  errors?: any;
  touched?: any;
  handleChange: any
}

const AddressesInput = ({
  values,
  errors,
  handleChange
}: AddressesInputProps) => {
  return (
    <Box
      borderWidth={1}
      borderRadius="md"
      boxShadow="sm"
      bg="white"
      mt={3}
      p={4}
    >
      <Text fontWeight="bold" fontSize="lg" mb={4}>
        Addresses
      </Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <CustomInput
          label="Residential Address"
          name="addresses.residential"
          placeholder="Enter Residential Address"
          value={values.addresses?.residential}
          onChange={handleChange}
          error={errors?.addresses?.residential}
          showError={errors?.addresses?.residential}
        />
        <CustomInput
          label="Office Address"
          name="addresses.office"
          placeholder="Enter Office Address"
          value={values.addresses?.office}
          onChange={handleChange}
          error={errors?.addresses?.office}
          showError={errors?.addresses?.office}
        />
        <CustomInput
          label="Other Address"
          name="addresses.other"
          placeholder="Enter Other Address (optional)"
          value={values.addresses?.other || ""}
          onChange={handleChange}
          error={errors?.addresses?.other}
          showError={errors?.addresses?.other}
        />
      </SimpleGrid>
    </Box>
  );
};

export default AddressesInput;
