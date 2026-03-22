import { Box, Grid } from "@chakra-ui/react";
import React from "react";
import OurVisionCard from "../../../about-us/component/OurVision/OurVisionCard";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";

const cards = [
  {
    imageSrc: "/images/service/newcare1.png",
    title: "Integrity in Care",
    description:
      "We make every recommendation, treatment, and decision with our clients' best interests in mind.",
  },
  {
    imageSrc: "/images/service/newcare2.png",
    title: "Put Clients First",
    description:
      " Our treatments are designed to create meaningful change in our clients' lives.",
  },
  {
    imageSrc: "/images/service/newcare3.png",
    title: "Backed By Science",
    description:
      "We combine empathy with research-backed therapy to support your mental health.",
  },
];

const MakesUniqueSection = () => {

  return (
    <Box bgGradient={"linear(to-r,#065F68, #2A8A94)"} pt={{ base: "22px", md: "20px" }}>
      <CustomSmallTitle mt={{ base: "2rem" }} as="h2" px={2} textAlign="center" mb={2} fontSize={{ base: "15px", md: "18px" }} >
        Care at Dental
      </CustomSmallTitle>

      <CustomSubHeading color="white" fontSize={{ base: "20px", md: "28px" }} textAlign="center">
        Culture is how we create a{" "}
        <span
          style={{ fontWeight: "bold", display: "inline-block", }}
        >
          safe, supportive space
        </span>
      </CustomSubHeading>

      <Grid

        templateColumns={{
          base: "1fr",
          md: "1fr 1fr 1fr",
          lg: "1fr 1fr 1fr",
        }}
        gap={{ base: 2, lg: 4 }}
        pt={{ base: 2, md: 4 }}
        pb={{ base: 12, md: 16 }} // Significantly reduced bottom padding
        maxW={{ base: "95%", lg: "90%" }}
        mx="auto"
      >

        {cards?.map((card, index) => (
          <Box
            key={index}
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: "10%",
              bottom: "10%",
              left: 0,
              width: "1px",
              bg: "whiteAlpha.300",
              transform: "translateX(-50%)",
              display: index === 0 ? "none" : { base: "none", lg: "block" },
            }}
          >
            <OurVisionCard
              shadow="none"
              color="white"
              bg="transparent"
              imageSrc={card.imageSrc}
              title={card.title}
              description={card.description}
              imageAlign={{ base: "center", md: "center" }}
              textAlign={{ base: "center", md: "center" }}
            />
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default MakesUniqueSection;
