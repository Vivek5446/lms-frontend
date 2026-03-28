import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Image,
  Text,
  VStack,
  useBreakpointValue
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";
import EnquireFormModal from "../../../../component/common/EnquireFormModal/EnquireFormModal";
import AssessmentGrid from "./RightAssesmentCardSection";
import { assessments } from "./utils/constant"; // Fallback data
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";

const RightAssesment = observer(() => {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isMobile = useBreakpointValue({ base: true, lg: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  const handleItemClick = (index) => {
    setExpandedIndex(index === expandedIndex ? -1 : index);
  };

  const [content, setContent] = useState({});
  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  // Merge dashboard data with fallback icons from utils
  const mergedAssessments = ((content as any)?.assessmentTest || []).map((itemFromDashboard) => {
    const fallback = assessments.find(
      (a) => a.title === itemFromDashboard.title || a.id === itemFromDashboard.id
    );
    return {
      ...fallback,
      ...itemFromDashboard, // Dashboard content overrides fallback, except icon
      icon: itemFromDashboard.icon || fallback?.icon, // Prefer dashboard icon, fallback if not provided
    };
  });

  const assessmentsData = mergedAssessments.length > 0 ? mergedAssessments : assessments;


  useEffect(() => {
    setContent(getPageContent("assessment") || {});
  }, [companyDetails, getPageContent]);

  return (
    <Box maxW={{ base: "100%", lg: "90%", xl: "85%" }} mx={"auto"} my={8} px={{ base: 2, md: 6 }}>
      <Grid templateColumns={{ base: "1fr", md: "1fr", lg: "1fr 1fr" }} gap={{ base: 2, md: 8 }}>
        <Box>
          <CustomSmallTitle textAlign={{ base: "center", lg: "start" }}>
            OUR ASSESSMENT
          </CustomSmallTitle>
          <CustomSubHeading
            highlightText="Right Assessment for You"
            textAlign={{ base: "center", lg: "start" }}
          >
            Find the
          </CustomSubHeading>
          <Text
            mt={4}
            fontWeight={500}
            w={{ base: "100%", lg: "90%" }}
            color="#434343"
            textAlign={{ base: "center", lg: "start" }}
          >
            Choose the purpose of your assessment.
            Click on a category to explore available tests.
          </Text>

          {isMobile ? (
            <>
              {/* Horizontally scrollable cards */}
              <Flex
                overflowX="auto"
                maxW={'96vw'}
                py={4}
                css={{
                  "&::-webkit-scrollbar": { display: "none" },
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {assessmentsData.map((assessment, index) => (
                  <Box
                    key={assessment.id || index}
                    flex="0 0 auto"
                    mx={2}
                    p={3}
                    borderRadius="lg"
                    borderWidth={2}
                    borderColor={expandedIndex === index ? "#DF837C" : "gray.200"}
                    bg={expandedIndex === index ? "#FFF5F3" : "white"}
                    textAlign="center"
                    cursor="pointer"
                    onClick={() => handleItemClick(index)}
                  >
                    {assessment.icon && (
                      <Flex justify="center" align="center" mb={2}>
                        <Image
                          src={assessment.icon}
                          alt={assessment.title}
                          width="26"
                          height="16"
                        />
                      </Flex>
                    )}
                    <Text fontSize="xs" fontWeight={500}>
                      {assessment.title}
                    </Text>
                  </Box>
                ))}
              </Flex>

              {/* Show expanded content for selected card */}
              {expandedIndex >= 0 && assessmentsData[expandedIndex] && (
                <Box mt={4} px={2}>
                  <Text color="#8A8A8A" fontSize="sm" mt={2}>
                    {assessmentsData[expandedIndex].description}
                  </Text>
                  <Text fontSize="sm" mt={2}>
                    Best for: {assessmentsData[expandedIndex].bestFor}
                  </Text>
                  <Button
                    color="white"
                    bg={assessmentsData[expandedIndex].color || "brand.100"}
                    mt={2}
                    fontWeight={500}
                    rightIcon={<ChevronRightIcon />}
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                    w="100%"
                  >
                    {assessmentsData[expandedIndex].CTA || "Enquire"}
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <VStack
              align="start"
              rounded="xl"
              w={{ base: "100%", lg: "85%" }}
              spacing={0}
              mt={4}
            >
              {assessmentsData.map((assessment, index) => (
                <React.Fragment key={assessment.id || index}>
                  <Box
                    px={4}
                    py={3}
                    w="100%"
                    borderWidth={1}
                    borderColor={expandedIndex === index ? "#DF837C" : "gray.200"}
                    borderLeftWidth={1}
                    borderRightWidth={1}
                    borderTopWidth={index === 0 ? 1 : 0}
                    borderBottomWidth={index === assessmentsData.length - 1 ? 2 : 0}
                    borderTopRadius={index === 0 ? "xl" : "none"}
                    borderBottomRadius={
                      index === assessmentsData.length - 1 ? "xl" : "none"
                    }
                    transition="all 0.2s ease"
                    _hover={{
                      borderColor: expandedIndex !== index ? "gray.300" : "#DF837C",
                    }}
                  >
                    <Box onClick={() => handleItemClick(index)} cursor="pointer">
                      <Text
                        fontWeight={500}
                        fontSize={{ base: "md", md: "lg" }}
                        color={expandedIndex === index ? "inherit" : "#8A8A8A"}
                        transition="color 0.2s ease"
                      >
                        {assessment.title}
                      </Text>
                    </Box>

                    <Box
                      overflow="hidden"
                      maxHeight={expandedIndex === index ? "200px" : "0"}
                      transition="all 0.3s ease"
                    >
                      <Text color="#8A8A8A" fontSize="sm" mt={2}>
                        {assessment.description}
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        Best for: {assessment.bestFor}
                      </Text>
                      <Button
                        color="white"
                        bg={assessment.color || "brand.100"}
                        mt={2}
                        mb={1}
                        fontWeight={500}
                        rightIcon={<ChevronRightIcon />}
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        _hover={{
                          transform: "translateX(2px)",
                        }}
                        transition="transform 0.2s ease"
                        w={{ base: "100%", md: "auto" }}
                      >
                        {assessment.CTA || "Enquire"}
                      </Button>
                    </Box>
                  </Box>
                  {index < assessmentsData.length - 1 && (
                    <Divider borderWidth={1} borderColor="gray.200" w="100%" />
                  )}
                </React.Fragment>
              ))}
            </VStack>
          )}
        </Box>

        {(expandedIndex >= 0 || !isMobile) && (
          <Box
            mt={{ base: 6, lg: 0 }}
            display={{ base: expandedIndex >= 0 ? "block" : "none", lg: "block" }}
          >
            <AssessmentGrid
              cards={expandedIndex >= 0 ? assessmentsData[expandedIndex]?.cards || [] : []}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </Box>
        )}
      </Grid>

      <EnquireFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
});

export default RightAssesment;