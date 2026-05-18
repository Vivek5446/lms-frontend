"use client";

import { Box } from "@chakra-ui/react";
import HeroSection from "../../component/common/HeroSection/HeroSection";
import { observer } from "mobx-react-lite";

const Home = observer(() => {
  return (
    <Box>
      <HeroSection />
    </Box>
  );
});

export default Home;
