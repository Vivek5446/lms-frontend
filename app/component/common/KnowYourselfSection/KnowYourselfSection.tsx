import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import CardComponent3 from "../CardComponent3/CardComponent3";
import CustomButton from "../CustomButton/CustomButton";
import CustomCarousel from "../CustomCarousal/CustomCarousal";
import CustomSmallTitle from "../CustomSmallTitle/CustomSmallTitle";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const data = [
  {
    bgGradient: "linear(to-br, #FFB8B2 80%, #FFFFFF)",
    borderColor: "#C686819E",
    rotatedText: "DEPRESSION",
    mainText: "“Feeling Low or Just a Rough Patch?”",
    imageSrc: "images/home/depression.png",
    link: "/condition/depression"
  },
  {
    bgGradient: "linear(to-br, #86C6F4 80%, #FFFFFF)",
    borderColor: "#819EC6",
    rotatedText: "TRAUMA",
    mainText: "“Are you grieving or experiencing trauma?”",
    imageSrc: "images/home/trauma.png",
    link: "/condition/trauma"
  },
  {
    bgGradient: "linear-gradient(140.65deg, #EAF475 74.21%, #FFFFFF 120.46%);",
    borderColor: "#819EC6",
    rotatedText: "ANXIETY & MORE",
    mainText: "“Are you dealing with anxiety or everyday stress?”",
    imageSrc: "images/home/anxiety.png",
    link: "self-assessment"
  },
  {
    bgGradient: "linear-gradient(140.65deg, #86C6F4 74.21%, #FFFFFF 120.46%)",
    borderColor: "#819EC6",
    rotatedText: "ADHD ASSESSMENT",
    mainText: "“Could ADHD be affecting your attention?”",
    imageSrc: "images/home/adhd.png",
    link: "/condition/adhd"
  },
  {
    bgGradient: "linear-gradient(140.65deg, #9DEAB2 74.21%, #FFFFFF 120.46%);",
    borderColor: "#819EC6",
    rotatedText: "OCD",
    mainText: "“Worried About Every Little Thing?”",
    imageSrc: "images/home/ocd.png",
    link: "/condition/ocd"
  },
  {
    bgGradient: "linear-gradient(140.65deg, #86C6F4 74.21%, #FFFFFF 120.46%);",
    borderColor: "#819EC6",
    rotatedText: "BIPOLAR",
    mainText: "“Could mood swings be a sign of bipolar disorder?”",
    imageSrc: "images/home/bipolar.png",
    link: "/condition/bipolar-disorder"
  },
];

const KnowYourselfSection = () => {
  const router = useRouter();
  const [activeCard, setActiveCard] = useState(0);
  const buttonSize = useBreakpointValue({ base: "md", md: "xl" });
  const buttonWidth = useBreakpointValue({ base: "170px", md: "200px" });
  const noOfSlides = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  const memoizedData = useMemo(() => data, []);

  useEffect(() => {
    if (!memoizedData || memoizedData.length === 0) return;

    setActiveCard(0);

    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, [memoizedData]);

  const handleCardClick = (link) => {
    router.push(link);
  };

  return (
    <Box py={{ base: 2, md: 8 }}>
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={{ md: 2, xl: 4 }}
        alignItems="center"
        display={{ base: "block", md: "grid" }}
      >
        {/* Left Section */}
        <Box py={6} maxW={{ lg: "90%" }} px={2} ml={{ md: 8 }}>
          <Text
            textTransform="uppercase"
            color="#DF837C"
            textAlign={{ base: "center", lg: "start" }}
            fontSize={{ base: "14px", md: "16px" }}
          ></Text>
          <CustomSmallTitle textAlign={{ base: "center", lg: "start" }} ml={{ lg: "0.2rem" }}>
            Know Yourself Better
          </CustomSmallTitle>
          <Heading
            as="h2"
            fontWeight={400}
            fontSize={{ base: "26px", md: "48px", xl: "52px" }}
            my={3}
            lineHeight="1.2"
            textAlign={{ base: "center", lg: "start" }}
          >
            Not Sure What you <br />
            are{" "}
            <Text as="span" fontWeight={600}>
              struggling with?
            </Text>
          </Heading>

          {/* Mobile View Carousel */}
          <Box display={{ base: "block", md: "none" }}>
            <CustomCarousel slidesToShow={noOfSlides} autoplay={true} showArrows={false} showDots={true}>
              {data.map((item, index) => (
                <Link href={item.link} passHref legacyBehavior key={index}>
                  <a target="_blank" rel="noopener noreferrer">
                    <CardComponent3
                      bgGradient={item.bgGradient}
                      borderColor={item.borderColor}
                      rotatedText={item.rotatedText}
                      mainText={item.mainText}
                      imageSrc={item.imageSrc}
                      isActive={activeCard === index}
                      onMouseEnter={() => setActiveCard(index)}
                      onClick={(e) => {
                        e.preventDefault();
                        handleCardClick(item.link);
                      }}
                    />
                  </a>
                </Link>
              ))}
            </CustomCarousel>
          </Box>

          <Text
            color="#434343"
            fontSize={{ base: "sm", md: "18px" }}
            mt={4}
            lineHeight={{ base: "22px", md: "30px", xl: "32px" }}
            textAlign={{ base: "center", lg: "start" }}
          >
            Take a quick, simple assessment to see if your symptoms match common mental health conditions.
            It&apos;s not a diagnostic tool, but a helpful tool to understand what&apos;s going on.
            Just answer a few easy questions to our Counselling psychologist in Noida, and we&apos;ll guide you from there.
          </Text>
          <Flex justify={{ base: "center", lg: "start" }}>
            <Link href="/self-assessment" passHref legacyBehavior>
              <a target="_blank" rel="noopener noreferrer">
                <CustomButton
                  mt={6}
                  size={buttonSize}
                  width={buttonWidth}
                >
                  Take Free Assessment
                </CustomButton>
              </a>
            </Link>
          </Flex>
        </Box>

        {/* Desktop view - only first 3 cards */}
        <Box position="relative" overflow="hidden" maxW={{ md: "85%", lg: "unset" }} mx={'auto'}>
          <Flex gap={2} mt={2} display={{ base: "none", md: "flex" }}>
            {data.slice(0, 3).map((item, index) => (
              <Link href={item.link} passHref legacyBehavior key={index}>
                <a target="_blank" rel="noopener noreferrer">
                  <CardComponent3
                    bgGradient={item.bgGradient}
                    borderColor={item.borderColor}
                    rotatedText={item.rotatedText}
                    mainText={item.mainText}
                    imageSrc={item.imageSrc}
                    isActive={activeCard === index}
                    onMouseEnter={() => setActiveCard(index)}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCardClick(item.link);
                    }}
                  />
                </a>
              </Link>
            ))}
          </Flex>
        </Box>
      </Grid>
    </Box>
  );
};

export default KnowYourselfSection;