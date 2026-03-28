import { Box, Grid, Heading, useBreakpointValue } from "@chakra-ui/react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CardComponent5 from "./CardComponent5";
import CustomCarousel from "../../../../component/common/CustomCarousal/CustomCarousal";

const dummyData = [
  {
    image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1746126275/image_15_lwgvip.png",
    date: "12 January",
    title: "What Happens During Your First Therapy Session? | Dental Health",
    description:
      "Many people seek therapy because they want something in their life to change. However, they may have misunderstandings about how therapy works..Starting therapy can be a life-changing experience. Whether you’re unsure about what’s bothering you or have specific concerns, therapy provides a safe space to talk and heal. Every therapist has their own approach, but the first session usually follows a simple process. Let’s get some insights with Dental Health.",
    link: "/blogs/what-happens-during-your-first-therapy-session",
  },
  {
    image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1746126275/image_fsonqh.png",
    date: "29 January",
    title: "Difference Between Psychologist and Psychiatrist | Dental Health",
    description:
      "Difference Between Psychologist and Psychiatrist:- The mental health field has many kinds of experts who can help people facing different emotional and mental health problems.Two common types of professionals are psychologists and psychiatrists. Their job titles may sound similar, but they are different in how they study, get trained, and treat people. ",
    link: "/blogs/difference-between-psychologist-and-psychiatrist",
  },
  {
    image: "https://res.cloudinary.com/dekfm4tfh/image/upload/v1746126279/image_1_vcq3mg.png",
    date: "17 February",
    title: "Common Mental Health Conditions in India and How to Recognize Them?",
    description:
      "Common Mental Health Conditions in India - The World Health Organization says that being healthy means feeling well physically, mentally, socially, and spiritually. It is not just about not having a disease. In India, both physical and mental health have always been seen as important for a healthy and happy life. The saying “There is no health without mental health” shows how important mental well-being is.",
    link: "/blogs/common-mental-health-conditions-in-india",
  },
];

const HowWeWorkSection2 = ({ data }) => {
  const showDots = useBreakpointValue({ base: true, lg: false });
  const slidesToShow = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  return (
    <Box bg="#FFF3F2" py={{ base: "20px", lg: "60px" }}>
      <CustomSmallTitle> Blogs and Resources </CustomSmallTitle>
      <Box textAlign="center" mt={1} px={{ base: 3, md: 8 }} py={4}>
        <Heading
          as="h2"
          fontSize={{ base: "16px", md: "32px" }}
          fontWeight={600}
          lineHeight={{ base: "22px", md: "38px" }}
          maxW={{ base: "90%", lg: "70%" }}
          mx="auto"
          mb={3}
        >
          {data?.heading}
        </Heading>
        <Heading
          as="h2"
          fontSize={{ base: "16px", md: "28px" }}
          fontWeight={400}
          lineHeight={{ base: "22px", md: "38px" }}
          maxW={{ base: "90%", lg: "70%" }}
          mx="auto"
        >
          Explore simple, practical articles and tools designed to help you take
          small, meaningful steps toward better mental health.
        </Heading>
      </Box>

      <Grid
        templateColumns={"1fr 1fr 1fr"}
        maxW={{ lg: "80%", xl: "75%" }}
        mx="auto"
        gap={6}
        mt={8}
        display={{ base: "none", lg: "grid" }}
      >
        {dummyData.map((item, index) => (
          <CardComponent5 key={index} {...item} />
        ))}
      </Grid>
      <Box display={{ base: "block", lg: "none" }} maxW={{ base: "95%" }} mx="auto">
        <CustomCarousel autoplay={true} showArrows={false} showDots={showDots} slidesToShow={slidesToShow}>
          {dummyData.map((item, index) => (
            <CardComponent5 key={index} {...item} />
          ))}
        </CustomCarousel>
      </Box>
    </Box>
  );
};

export default HowWeWorkSection2;
