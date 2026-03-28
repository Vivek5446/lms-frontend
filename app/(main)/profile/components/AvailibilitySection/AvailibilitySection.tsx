import { Box, Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import NewCarousel from "../../../../component/common/NewCarousel";

const images = [
  "/images/profile/clinicImage1.webp",
  "/images/profile/clinicImage2.webp",
  "/images/profile/clinicImage3.webp",
  "/images/profile/clinicImage4.webp",
  "/images/profile/clinicImage5.webp",
  "/images/profile/clinicImage6.webp",
];

const AvailibilitySection = ({ data }: any) => {
  return (
    <Box maxW={{ base: "95%", lg: "95%" }} mx={"auto"} bg={"#FFB8B220"} p={5}>
      <Grid
        templateColumns={{ lg: "1fr 1fr" }}
        gap={{ base: 8, lg: 4 }}
        alignItems={"center"}
      >
        <Box>
          <Flex
            gap={{ base: 2, lg: 8 }}
            direction={{ base: "column", md: "row" }}
          >
            <Heading
              fontWeight={600}
              size={{ base: "lg", lg: "lg" }}
              ml={{ lg: "62px" }}
            >
              Availibility
            </Heading>
            <Box>
              <Text fontWeight={600}>Dental Clinic</Text>
              <Text my={2} fontSize={"sm"} fontWeight={500} color={"#757575"}>
                {data?.address ||
                  "2nd  Floor,  LC Complex, Sector 49, Noida, UP"}
              </Text>
              <Text color={"#757575"} fontWeight={500}>
                Phone Number :{" "}
                <Text color={"black"} fontSize={"sm"} as={"span"}>
                  {data.phoneNumber || "+91  9090 404949"}
                </Text>{" "}
              </Text>
              <Flex gap={2} mt={6}>
                {data.availability?.map((it: any, index: number) => {
                  return (
                    <Button
                      key={index}
                      px={6}
                      fontSize={"sm"}
                      h={"36px"}
                      fontWeight={500}
                      color={"brand.100"}
                      variant={"outline"}
                      borderColor={"brand.100"}
                      _hover={{ bg: "transparent" }}
                    >
                      {it}
                    </Button>
                  );
                })}
              </Flex>
            </Box>
          </Flex>
        </Box>
        <Box>
          <NewCarousel images={images} />
        </Box>
      </Grid>
    </Box>
  );
};

export default AvailibilitySection;
