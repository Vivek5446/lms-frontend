  import { Box, Heading, Text, useBreakpointValue } from "@chakra-ui/react";
  import CustomCarousel from "../common/CustomCarousal/CustomCarousal";
  import NewTestimonialCard from "../common/NewTestimonialCard/NewTestimonialCard";
  import CustomSmallTitle from "../common/CustomSmallTitle/CustomSmallTitle";
  import { observer } from "mobx-react-lite";
  import stores from "../../store/stores";
  import { useEffect } from "react";

  const TestimonialSection2 = observer(() => {
    const {testimonialStore : {getTestimonials, testimonials}} = stores
    const noOfSlides = useBreakpointValue({ base: 1, md: 2, lg: 3 });
    const showArrows = useBreakpointValue({ base: false, md: true });

    useEffect(() => {
      getTestimonials({page : 1})
    },[getTestimonials])

    return (
      <Box bg={"white"}>
        <Box
          maxW={{ md: "90%" }}
          // py={{ base: "3rem", md: "6rem" }}
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
          <CustomSmallTitle>OUR TESTIMONIALS</CustomSmallTitle>
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
              showDots={true}
            >
              {testimonials?.data.map((testimonial, index) => (
                <NewTestimonialCard key={index} showBorder={false} {...testimonial} />
              ))}
            </CustomCarousel>
          </Box>
        </Box>
      </Box>
    );
  });

  export default TestimonialSection2;
