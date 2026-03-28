'use client'
import { Box, Heading, Text, Flex, Avatar, useBreakpointValue, Button } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomCarousel from "../../../../component/common/CustomCarousal/CustomCarousal";
import stores from "../../../../store/stores";

const defaultTestimonialData = [
  {
    id: 1,
    description: "I have been under the supervision of Nikita for over a year. Her exceptional guidance and insightful supervision have significantly enhanced my professional skills as a psychotherapist. She provides a supportive and enriching environment, fostering both personal and professional growth. Her expertise, dedication, and approachable demeanor make her an outstanding supervisor. I am grateful for her mentorship and the positive impact she has had on my career.",
    name: "Disha Dang",
    designation: "4 Months Ago"
  },
  {
    id: 2,
    description: "Being supervised for several months now by Nikita, and her guidance has been invaluable. Her ability to deeply understand complex clinical situations and provide thoughtful, clear feedback has allowed me to grow tremendously as a therapist. Nikita's approach is both nurturing and challenging in the best possible way, helping me navigate difficult cases with confidence and clarity. Her supportive presence makes every supervision session feel productive and rewarding.",
    name: "Anonymous",
    designation: "4 Months Ago"
  },
  {
    id: 3,
    description: "She brings a balance of warmth, expertise, and practical knowledge to each session. Supervision has helped me refine my clinical skills and deepen my understanding of the therapeutic process. Her insightful feedback and willingness to explore different angles of challenging cases have been very helpful professionally.",
    name: "Axe Mey",
    designation: "4 Months Ago"
  }
];

// Card background colors to match the design
const cardColors = ["#86C6F459", "#F9C2C2", "#F5F7A9"];

const SupervisionTestimonialSection = observer(() => {
  const noOfSlides = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const showArrows = useBreakpointValue({ base: false, md: true });
  const [testimonialData, setTestimonialData] = useState(defaultTestimonialData);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<any>({});

  const {
    companyStore: { getPageContent, companyDetails }
  } = stores;

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const content = await getPageContent('supervision') || {};
        setContent(content);

        // Use dynamic testimonial data from CMS if available
        if (content?.supervisionTestimonials && Array.isArray(content.supervisionTestimonials) && content.supervisionTestimonials.length > 0) {
          // Make sure each item has an id field
          const formattedData = content.supervisionTestimonials.map((item: any, index: number) => ({
            ...item,
            id: item.id || index + 1
          }));

          setTestimonialData(formattedData);
        }
      } catch ({} : any) {
        // Keep using default data in case of error
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [companyDetails, getPageContent]);

  // Get the section title from CMS or use default
  const sectionTitle = content?.testimonialSectionTitle || "What Therapists Say About Us?";
  // Get the section subtitle from CMS or use default
  const sectionSubtitle = content?.testimonialSectionSubtitle || "OUR TESTIMONIALS";

  if (isLoading) {
    return (
      <Box bg="white" py={{ base: 8, md: 12 }} textAlign="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" py={{ base: 8, md: 12 }}>
      <Box
        maxW={{ base: "90%", md: "85%" }}
        mx="auto"
        px={{ base: 4, md: 0 }}
      >
        <CustomSmallTitle textAlign="center">{sectionSubtitle}</CustomSmallTitle>
        <Heading
          textAlign="center"
          as="h2"
          fontWeight={600}
          fontSize={{ base: "28px", md: "40px" }}
          my={{ base: 3, md: 6 }}
          color="black"
        >
          {sectionTitle}
        </Heading>

        <Box mt={{ base: 6, md: 10 }}>
          <CustomCarousel
            slidesToShow={noOfSlides}
            autoplay={true}
            showArrows={showArrows}
            showDots={true}
          >
            {testimonialData.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id || index}
                {...testimonial}
                bgColor={cardColors[index % cardColors.length]}
              />
            ))}
          </CustomCarousel>
        </Box>
      </Box>
    </Box>
  );
});

// Custom testimonial card component with fixed height and scrollable content
const TestimonialCard = ({ name, description, designation, bgColor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to truncate text to a specific length
  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={6}
      m={3}
      height={{ base: "300px", md: "320px" }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Box
        flex="1"
        overflow={isExpanded ? "auto" : "hidden"}
        css={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "gray.300",
            borderRadius: "24px",
          },
        }}
      >
        <Text
          fontSize={{ base: "sm", md: "md" }}
          color="black"
        >
          {isExpanded ? description : truncateText(description)}
        </Text>

        {description && description.length > 150 && (
          <Button
            variant="link"
            colorScheme="blue"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            mt={2}
          >
            {isExpanded ? "Read Less" : "Read More"}
          </Button>
        )}
      </Box>

      {/* Avatar and name at the bottom */}
      <Flex alignItems="center" mt={4}>
        <Avatar
          size="sm"
          bg="black"
          color="white"
          name={name || "Anonymous"}
          mr={3}
        />
        <Box>
          <Text fontWeight="bold" fontSize="sm" color="black">
            {name || "Anonymous"}
          </Text>
          <Text fontSize="xs" color="black">
            {designation || ""}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default SupervisionTestimonialSection;