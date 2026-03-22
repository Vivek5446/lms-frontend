import { Box, Grid } from "@chakra-ui/react";
import React from "react";
import LeftSection from "./LeftSection/LeftSection";
import RightSection from "./RightSection/RightSection";

const SupervisionServicesSection = () => {
  return (
    <Box>
      <Box
        bg={"#FDFFDD"}
        maxW={"95%"}
        mx={"auto"}
        rounded={"16px"}
        pt={12}
        px={0}
        minHeight={{ base: "800px", lg: "580px" }} // changed from height to minHeight
      >
        <Grid templateColumns={{ lg: "repeat(2, 1fr)" }} gap={4}>
          <LeftSection />
          <RightSection />
        </Grid>
      </Box>
    </Box>
  );
};

export default SupervisionServicesSection;
