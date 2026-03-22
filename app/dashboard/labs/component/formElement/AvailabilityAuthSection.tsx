import { Box, Text, GridItem, SimpleGrid } from "@chakra-ui/react";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";

interface AvailabilityAuthProps {
  values: any;
  handleChange: any;
  errors: any;
  touched: any;
  isEdit: boolean;
}

const AvailabilityAuthSection = ({
  values,
  handleChange,
  errors,
  isEdit,
}: AvailabilityAuthProps) => {
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
          Availability & Authentication
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {!isEdit && (
            <>
              <CustomInput
                label="Password"
                name="password"
                type="password"
                placeholder="Enter Password"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                showError={errors.password}
              />
              <CustomInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={values.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                showError={errors.confirmPassword}
              />
            </>
          )}
        </SimpleGrid>
      </Box>
    </GridItem>
  );
};

export default AvailabilityAuthSection;
