"use client";

import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import BlogFeatureCard from "./BlogHeroSection/BlogHeroSection";
import BlogCardSection from "./BlogsCard/BlogCardSection";
import BookCallComponentBlog from "./bookcallcomponentblog/bookcallcomponentblog";
import StayTune from "./stayTuned/stayTuned";
import VideoCarousel from "./VideoCarousel/VideoCarousel";

const BlogsPage = observer(() => {
  return (
    <Box>
      <BlogFeatureCard />

      <Box mt={12}>
        <VideoCarousel />
      </Box>

      <Box mt={{ base: "50px", lg: "80px" }} maxW={{ md: "90%", xl: '85%' }} mx={'auto'} px={{ base: 3, md: 0 }}>
        <BlogCardSection />
        <Box mt={{ base: "40px", lg: "80px" }}>

          <BookCallComponentBlog />
        </Box>

        {/* StayTune Section */}
      </Box>
      <Box px={2} maxW={{ xl: '85%' }} mx={'auto'}>
        <StayTune />
      </Box>
      {/* <IndividualBlogPage/>
        <OtherBlogSection/> */}
    </Box>
  );
});

export default BlogsPage;
