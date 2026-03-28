import { Box, Center, Flex, Image, Text } from "@chakra-ui/react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";

const Mission = () => {
  return (
    <Box maxW={{ base: "100%", md: "92%", lg: "90%" }} mx="auto" px={{ base: 4, md: 6 }}>
      <CustomSmallTitle textAlign="center">Care at Dental</CustomSmallTitle>
      <CustomSubHeading fontSize={{ base: "24px", md: "32px" }} highlightText="believe in" >What we </CustomSubHeading>

      {/* Mobile Layout: Image on Top, Problem and Solution below */}
      <Box display={{ base: "block", md: "none" }} textAlign="center">
        <Center>
          <Image
            src="/images/about/roundImage.png"
            boxSize={{ base: "300px", md: "440px" }}
            objectFit="contain"
            alt="top psychologist in noida"
          />
        </Center>

        {/* Problem and Solution below the image on mobile */}
        <Box mt={4}>
          <InfoBox
            title="The Problem"
            description="Over 150 million people in India require mental health support, yet more than 80% do not receive the effective treatment they need."
            boldWords={["150 million people in India", "more than 80%", "effective treatment they need."]}
            image="/images/about/problem.svg"
          />
          <InfoBox
            title="The Solution"
            description="We bring together expert care and a holistic approach to help clients heal and stay on the path to recovery."
            boldWords={["expert care", "holistic approach"]}
            image="/images/about/solution.svg"
          />
        </Box>
      </Box>

      {/* Tablet Layout (2 boxes above, image, 2 boxes below) */}
      <Box display={{ base: "none", md: "block", lg: "none" }} textAlign="center">
        {/* Top two boxes (Problem and Solution) */}
        <Flex justify="center" gap={6} mt={6} mb={4}>
          <Box>
            <InfoBox
              title="The Problem"
              description="Over 150 million people in India require mental health support, yet more than 80% do not receive the effective treatment they need."
              boldWords={["150 million people in India", "more than 80%", "effective treatment they need."]}
              image="/images/about/problem.svg"
            />
          </Box>
          <Box>
            <InfoBox
              title="Our Mission"
              description="Our mission is to help individuals and families improve their mental well-being by providing specialized mental healthcare."
              boldWords={["help individuals and families"]}
              image="/images/about/mission.svg"
            />
          </Box>
        </Flex>

        {/* Center Image */}
        <Center my={4}>
          <Image
            src="/images/about/roundImage.png"
            boxSize={{ base: "300px", md: "360px", lg: "440px" }}
            objectFit="contain"
            alt="psychologist in noida"
          />
        </Center>

        {/* Bottom two boxes (Solution and Vision) */}
        <Flex justify="center" gap={6} mt={4}>
          <Box>
            <InfoBox
              title="The Solution"
              description="We bring together expert care and a holistic approach to help clients heal and stay on the path to recovery."
              boldWords={["expert care", "holistic approach"]}
              image="/images/about/solution.svg"
            />
          </Box>
          <Box>
            <InfoBox
              title="Our Vision"
              description="We want to build a holistic mental health system that helps people recover and live better lives with high quality, evidence-based care for all ages."
              boldWords={["high quality, evidence-based care for all ages"]}
              image="/images/about/vision.svg"
            />
          </Box>
        </Flex>
      </Box>

      {/* Desktop Layout */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="center"
        gap={{ base: 6, md: 6, lg: 4 }}
        mt={{ base: 4, md: 6, lg: 8 }}
        align={{ base: "center", md: "flex-start" }}
        display={{ base: "none", lg: "flex" }}
        flexWrap={{ md: "wrap", lg: "nowrap" }}
      >
        {/* Left Column: Problem and Solution */}
        <Flex direction="column" gap={6} justify="space-between" my={2} align="center" maxW={{ md: "48%" }}>
          <Box sx={{ transform: { md: "translateX(-4rem)" }, mr: { md: "3rem" } }}>
            <InfoBox
              title="The Problem"
              description="Over 150 million people in India require mental health support, yet more than 80% do not receive the effective treatment they need."
              boldWords={["150 million people in India", "more than 80%", "effective treatment they need."]}
              image="/images/about/problem.svg"
            />
          </Box>
          <InfoBox
            title="The Solution"
            description="We bring together expert care and a holistic approach to help clients heal and stay on the path to recovery."
            boldWords={["expert care", "holistic approach"]}
            image="/images/about/solution.svg"
          />
        </Flex>

        {/* Center Image (Desktop) */}
        <Center mb={{ base: 0, md: 4 }}>
          <Image
            src="/images/about/roundImage.png"
            boxSize={{ base: "300px", md: "360px", lg: "440px" }}
            objectFit="contain"
            alt="psychologist in noida"
          />
        </Center>

        {/* Right Column: Mission and Vision */}
        <Flex direction="column" gap={6} justify="space-between" my={2} align="center" maxW={{ md: "48%" }}>
          <Box sx={{ transform: { md: "translateX(4rem)" }, pl: { md: "2rem" } }}>
            <InfoBox
              title="Our Mission"
              description="Our mission is to help individuals and families improve their mental well-being by providing specialized mental healthcare."
              boldWords={["help individuals and families"]}
              image="/images/about/mission.svg"
            />
          </Box>
          <InfoBox
            title="Our Vision"
            description="We want to build a holistic mental health system that helps people recover and live better lives with high quality, evidence-based care for all ages."
            boldWords={["high quality, evidence-based care for all ages"]}
            image="/images/about/vision.svg"
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Mission;

const InfoBox = ({ title, description, boldWords, image }) => {
  // Function to bold the specific words
  const getDescriptionWithBoldWords = () => {
    let updatedDescription = description;
    boldWords.forEach((word) => {
      const regex = new RegExp(`(${word})`, 'gi');
      updatedDescription = updatedDescription.replace(regex, '<strong>$1</strong>');
    });
    return updatedDescription;
  };

  return (
    <Box maxW={{ base: "100%", md: "18rem" }} p={2} textAlign="center">
      <Flex align="center" gap={2} justify="center" mr={2}>
        <Image src={image} alt="psychologist in noida sector 62" boxSize={{ base: "40px", md: "50px" }} objectFit="contain" />
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight={600}>
          {title}
        </Text>
      </Flex>
      <Text
        mt={1}
        fontSize={{ base: "sm", md: "md" }}
        color="#4D4D4D"
        dangerouslySetInnerHTML={{ __html: getDescriptionWithBoldWords() }}
      />
    </Box>
  );
};