import { Box, Text, GridItem, SimpleGrid, useColorModeValue } from "@chakra-ui/react";
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
  const bgBox = useColorModeValue("white", "darkBrand.100");
  const borderColor = useColorModeValue("brand.200", "darkBrand.200");
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
