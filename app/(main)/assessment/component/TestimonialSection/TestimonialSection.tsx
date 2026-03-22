'use client';
import {
  Box,
  Heading,
  Text,
  useBreakpointValue
} from "@chakra-ui/react";

import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import stores from "../../../../store/stores";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomCarousel from "../../../../component/common/CustomCarousal/CustomCarousal";
import NewTestimonialCard from "../../../../component/common/NewTestimonialCard/NewTestimonialCard";
// import StatsGrid from "../../../../component/common/StatsComponent/StatsComponrnt";

// const statsData = [
//   { value: 12, label: "Therapies Offered" },
//   { value: 13, label: "Years of Experience" },
//   { value: 19000, label: "Therapy Hours Delivered" },
//   { value: 2000, label: "Assessments Taken" },
//   { value: "100%", label: "Licensed Professional" },
// ];

const AssessmentTestimonialSection = observer(({ bg = "white" }: any) => {
  const { testimonialStore: { getTestimonials, testimonials } } = stores;

  useEffect(() => {
    getTestimonials({ page: 1 });
  }, [getTestimonials]);

  const noOfSlides = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const showArrows = useBreakpointValue({ base: false, md: true });
  const showDots = useBreakpointValue({ base: true, lg: false });

  const cardColors = ["#ffb8b2", "#B9DDFF", "#EAF475", "#9DEAB2"]; // Custom card background colors

  return (
    <Box bg={bg}>
      <Box
        maxW={{ md: "90%" }}
        py={{ base: "3rem", md: "5rem" }}
        px={{ base: 4, md: 0 }}
        mx={"auto"}
      >
        <Text
          textAlign={"center"}
          color={"#DF837C"}
          textTransform={"uppercase"}
          fontSize={{ base: "14px", md: "16px" }}
        >
        </Text>
        <CustomSmallTitle textAlign={{ base: "center" }} ml={{ lg: "0.2rem" }} >
          OUR TESTIMONIALS
        </CustomSmallTitle>
        <Heading
          textAlign={"center"}
          as={"h2"}
          fontWeight={400}
          fontSize={{ base: "24px", md: "48px" }}
          my={{ base: 1, md: 2 }}
          px={1}
        >
          Hear from Those Who’ve{" "}
          <Text as={"span"} fontWeight={600}>
            Found Recovery
          </Text>
        </Heading>

        <Box mt={{ base: 4, md: 8 }}>
          <CustomCarousel
            slidesToShow={noOfSlides}
            autoplay={true}
            showArrows={showArrows}
            showDots={showDots}
          >
            {testimonials?.data?.map((testimonial, index) => {
              const bgColor = cardColors[index % cardColors.length];
              return (
                <NewTestimonialCard
                  key={index}
                  {...testimonial}
                  bgColor={bgColor}
                />
              );
            })}
          </CustomCarousel>
        </Box>

        {/* <StatsGrid statsData={statsData} /> */}
      </Box>
    </Box>
  );
});

export default AssessmentTestimonialSection;
