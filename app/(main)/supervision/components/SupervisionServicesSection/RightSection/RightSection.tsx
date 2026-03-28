'use client'
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import stores from "../../../../../store/stores";

const defaultAccordionData = [
  {
    id: 1,
    title: "Our Individual Clinical Supervision Style",
    paragraph: `Our individual supervision sessions are deeply rooted in a relational framework, designed to cultivate a collaborative and reflective space for therapists.

    As you present your cases, we focus not just on the technical aspects of your work but also on the emotional and relational aspects that arise within the therapy room. By reflecting on the interactions between you and your patients, we explore the nuanced ways in which unconscious dynamics, such as projective identification and countertransference, shape the therapeutic process. This allows you to gain insight into how your own emotional responses and experiences influence your clinical work, fostering greater self-awareness and emotional attunement to your patients.

    Through this relational framework, individual supervision offers a safe, transformative space for you to evolve as a clinician, deepening your ability to engage with your patients on an authentic and empathetic level.`,
  },
  {
    id: 2,
    title: "Our Group Supervision Style",
    paragraph: `In our supervision group, we offer a dynamic approach in deepening your clinical skills and enhancing the therapeutic presence. Participants are invited to present their clinical cases and engage in role-plays where they embody their patients. This immersive experience allows you to step into the subjective world of your patients, fostering a deeper understanding and empathy that can transform your approach to therapy.

    The supervision process is highly interactive, with a focus on learning through experiential dialogues. As you role-play your patients, you'll receive live feedback and guidance from your supervisor, allowing for spontaneous, improvisational learning moments that mirror the organic flow of a therapeutic relationship.

    Our supervision space is designed to cultivate not only technical proficiency but also emotional resilience and self-awareness, empowering you to grow as both a therapist and a person. Whether you're navigating the challenges of early-career work or seeking to refine your therapeutic identity, this approach offers a comprehensive, hands-on learning experience that evolves with your practice.`,
  },
];

const RightSection = observer(() => {
  const [accordionData, setAccordionData] = useState(defaultAccordionData);
  const [expandedPanels, setExpandedPanels] = useState<{ [key: number]: boolean }>({ 1: false, 2: false });
  const [isLoading, setIsLoading] = useState(true);

  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const content = await getPageContent("supervision");

        // Use the dynamic data from CMS if available
        if (content?.supervisionContent && Array.isArray(content.supervisionContent) && content.supervisionContent.length > 0) {
          // Make sure each item has an id field
          const formattedData = content.supervisionContent.map((item: any, index: number) => ({
            ...item,
            id: item.id || index + 1
          }));

          setAccordionData(formattedData);

          // Initialize the expanded panels state based on the new data
          const newExpandedPanels: { [key: number]: boolean } = {};
          formattedData.forEach((item: any) => {
            newExpandedPanels[item.id] = false;
          });
          setExpandedPanels(newExpandedPanels);
        }
      } catch ({} : any) {
        // Keep using default data in case of error
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [companyDetails, getPageContent]);

  const toggleReadMore = (id: number) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <Box py={{ base: "3rem", md: "4rem", lg: "6rem" }} px={{ base: 4 }}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box mt={{ base: "-2rem", lg: "-6rem" }} py={{ base: "3rem", md: "4rem", lg: "6rem" }} px={{ base: 4 }} overflowY="auto">
      <Box
        maxHeight={{ base: "22rem", lg: "28rem" }}
        overflowY="auto"
        my={4}
        px={2}
        pr={3}>
        <VStack spacing={4} align="stretch" w={{ base: "100%", lg: "90%" }}>
          {accordionData.map((item) => (
            <Box
              key={item.id}
              bg="white"
              boxShadow="md"
              borderRadius="12px"
              overflow="hidden"
            >
              <Flex
                as="button"
                onClick={() => toggleReadMore(item.id)}
                align="center"
                justify="space-between"
                width="100%"
                px={6}
                py={4}
                _hover={{ bg: "gray.50" }}
              >
                <Text
                  fontSize={{ base: "16px", md: "18px" }}
                  fontWeight="500"
                  color="#292929"
                >
                  {item.title}
                </Text>
                <Box>
                  {expandedPanels[item.id] ? (
                    <Box as="span" fontSize="1.5rem">-</Box>
                  ) : (
                    <Box as="span" fontSize="1.5rem">+</Box>
                  )}
                </Box>
              </Flex>

              {/* Always show some content, but limit lines unless "Read More" is clicked */}
              <Box
                px={6}
                pb={4}
                borderBottom={expandedPanels[item.id] ? "none" : "3px solid #DF837C"}
              >
                <Text
                  color="#292929"
                  fontSize={{ base: "14px", md: "16px" }}
                  lineHeight={{ base: "20px", md: "24px" }}
                  whiteSpace="pre-line"
                  noOfLines={expandedPanels[item.id] ? undefined : 4}
                >
                  {item.paragraph}
                </Text>
                <Button
                  mt={2}
                  variant="link"
                  size="sm"
                  color="#045B64"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReadMore(item.id);
                  }}
                >
                  {expandedPanels[item.id] ? "Read Less" : "Read More"}
                </Button>
              </Box>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
});

export default RightSection;