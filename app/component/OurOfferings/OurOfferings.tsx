import { Box, Flex, Grid, Heading, Text, useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";
import CardComponent1 from "../common/CardComponent1/CardComponent1";
import CustomButton from "../common/CustomButton/CustomButton";
import CustomCarousel from "../common/CustomCarousal/CustomCarousal";
import CustomSmallTitle from "../common/CustomSmallTitle/CustomSmallTitle";
import Link from "next/link";

const cardData = [
  {
    title: "Individual Therapy",
    description:
      " In one-on-one sessions with an expert by your side, including top clinical psychologists in Noida, you will work through life’s challenges and attain personal growth.",
    image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1745780028/Mask_group_2_gv3yow.png",
    buttonText: "Explore service",
    buttonLink: "/services/individual-therapy",
    bgColor: "#9DEAB2",
  },
  {
    title: "Couples & Family Therapy",
    description:
      "Relationships are tough—couple’s & family therapy can provide a safe space to build stronger relationships and resolve conflict.",
    image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1745780029/Mask_group_3_v0etho.png",
    buttonText: "Explore service",
    buttonLink: "/services/couple-therapy",
    bgColor: "#ffb8b2",
  },
  {
    title: "Teen Therapy",
    description:
      "We support teenagers (ages 13-18 years) navigating mental health challenges and helping teens feel heard and understood. Whether you’re seeking the best child psychologist in Noida or specialized care for adolescents, we’ve got you covered.",
    image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1745780010/Mask_group_4_yv86a9.png",
    buttonText: "Explore service",
    buttonLink: "/services/teen-therapy",
    bgColor: "#EAF475",
  },
  {
    title: "Psychological Assessments",
    description:
      "We offer in-depth evaluations for adults and teens, conducted by the best counseling psychologists in Noida, to diagnose their concerns and help you understand what’s really going on.",
    image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1745780007/Mask_group_5_cnmz0a.png",
    buttonText: "Explore service",
    buttonLink: "/assessment",
    bgColor: "#B9DDFF",
  },
];

const OurOfferings = () => {
  const [hoverBgColor, setHoverBgColor] = useState("white");
  const [selectedBgColor, setSelectedBgColor] = useState(null); // Track clicked card bg color
  const buttonSize = useBreakpointValue({ base: "lg", md: "xl" });
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Function to handle card click on mobile
  const handleCardClick = (bgColor) => {
    setSelectedBgColor(prevColor => (prevColor === bgColor ? null : bgColor)); // Toggle bg color
  };

  // Reset bg color on slide change
  const handleSlideChange = () => {
    setSelectedBgColor(null);
  };

  return (
    <Box
      bg={isMobile ? selectedBgColor || "white" : hoverBgColor}
      transition="background-color 0.5s ease-in-out"
      py={{ base: "3rem", md: "2rem" }}
      my={{ base: "2rem", lg: "2rem" }}
      pt={"4rem"}
      px={{ base: 4, md: 0 }}
      borderTopLeftRadius={{ base: "50px", lg: "90px" }}
      borderBottomRightRadius={{ base: "50px", lg: "90px" }}
    >
      <Box maxW={{ md: "90vw", lg: "95%", xl: "85%" }} mx={"auto"}>
        <CustomSmallTitle>OUR OFFERINGS</CustomSmallTitle>
        <Heading
          textAlign={"center"}
          as={"h2"}
          fontWeight={400}
          fontSize={{ base: "24px", md: "48px" }}
          my={{ md: 2 }}
        >
          Specialized care for{" "}
          <Text as={"span"} fontWeight={600}>
            all ages
          </Text>
        </Heading>
        <Grid
          templateColumns={{ md: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }}
          gap={4}
          mt={8}
          justifyContent={"center"}
          display={{ base: "none", md: "grid" }}
        >
          {cardData.map((card, index) => (
            <Box
              key={index}
              onMouseEnter={() => setHoverBgColor(card.bgColor)}
              onMouseLeave={() => setHoverBgColor("white")}
            >
              <CardComponent1
                title={card.title}
                description={card.description}
                image={card.image}
                buttonText={card.buttonText}
                buttonLink={card.buttonLink}
                bgColor={card.bgColor}
              />
            </Box>
          ))}
        </Grid>
        <Box display={{ base: "block", md: "none" }}>
          <CustomCarousel
            slidesToShow={1}
            showArrows={false}
            showDots={true}
            autoplay={true}
            afterChange={handleSlideChange} // Reset background on slide change
          >
            {cardData.map((card, index) => (
              <Box key={index} onClick={() => handleCardClick(card.bgColor)}>
                <CardComponent1
                  title={card.title}
                  description={card.description}
                  image={card.image}
                  buttonText={card.buttonText}
                  buttonLink={card.buttonLink}
                  bgColor={card.bgColor}
                />
              </Box>
            ))}
          </CustomCarousel>
        </Box>
      </Box>
      <Flex justify={"center"}>
        <Link href="/services" passHref>
          <CustomButton
            as="a"
            size={buttonSize}
            fontSize="14px"
            width={"210px"}
            mt={8}
          >
            Explore All Services
          </CustomButton>
        </Link>
      </Flex>
    </Box>
  );
};

export default OurOfferings;
