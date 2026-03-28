import { Box, Grid } from "@chakra-ui/react";
import React from "react";
import LeftSection from "./LeftSection/LeftSection";
import RightSection from "./RightSrction/RightSection";

const IndServicesSection = ({ data }) => {
  return (
    <Box>
      <Box
        bg={"#D5EBF8"}
        maxW={"95%"}
        mx={"auto"}
        rounded={"16px"}
        pt={12}
        px={0}
        height={{ base: "800px", lg: "580px" }}
      >
        <Grid templateColumns={{ lg: "repeat(2, 1fr)" }} gap={4}>
          <LeftSection data={data} />
          <RightSection data={data} />
        </Grid>
      </Box>
    </Box>
  );
};

export default IndServicesSection;
