import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tab,
  TabList,
  Tabs,
  Tag,
  Text,
  useBreakpointValue,
  Checkbox,
  Stack,
  Collapse,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { IoFilterOutline } from "react-icons/io5";
import stores from "../../store/stores";
import CustomSmallTitle from "../common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../common/CustomSubHeading/CustomSubHeading";
import PsychologistCard from "../common/PsychologistCard/PsychologistCard";
import "../FAQ/FAQAccordion/scroll.css";

// Define types for tab category
type TherapyType = "Adult" | "Couple & family" | "Teen" | "Specialities" | "Couple" | "Family" | "Psychodynamic Psychotherapy";

// Define props interface for the component
interface PsychologistSectionProps {
  visibleTabs?: TherapyType[];
  defaultTab?: TherapyType | null;
  title?: string;
  subtitle?: string;
}

// Expertise categories organized by therapy type
const expertiseByCategory: Record<TherapyType, string[]> = {
  "Adult": [
    "Anxiety",
    "Depression",
    "Stress Management",
    "Self-esteem issues",
    "Grief & Loss",
    "Trauma & PTSD",
    "Relationship challenges",
    "Life transitions",
    "Work-related stress",
    "Anger management",
    "Bipolar disorders",
    "Emotional regulation issues",
    "Feeling stuck",
    "Overthinking",
    "Loneliness",
    "Lack of motivation",
    "Body image concerns",
    "Negative Thinking",
    "Sleep disorders",
    "OCD",
    "Schizophrenia",
    "Adult ADHD",
    "Eating disorder",
    "Adult Autism",
    "Geriatric disorders",
    "Post-Partum depression",
    "Phobia"
  ],
  "Couple & family": [
    "Pre-marital issues",
    "Marital problems",
    "Intimacy",
    "Separation or Divorce",
    "Infidelity",
    "Conflicts",
    "Communication problems",
    "Family conflicts",
    "Parenting issues",
    "Divorce and separation",
    "Communication problems",
    "Blended family struggles",
    "Grieving",
    "Boundaries",
    "Coping with illness",
    "Conflicts",
    "Struggles with step-parents or siblings"
  ],
  Teen: [
    "Academic stress",
    "Bullying",
    "Peer pressure",
    "Anxiety",
    "Depression",
    "Identity concerns",
    "Family conflicts",
    "Low self-esteem",
    "Behavioral issues",
    "Anger and emotional outbursts",
    "Substance use concerns",
    "Social withdrawal",
    "Self-harm",
    "Online or gaming addiction",
    "Breakups or friendship issues",
    "Autism",
    "Social anxiety",
    "Lack of interest in hobbies",
    "Inattention & hyperactivity",
    "Unexplained physical complaints"
  ],
  Specialities: [
    "Eating Disorder",
    "MATS",
    "Psychodynamic Psychotherapy",
    "Supervision",
  ],
  Couple: [
    "Pre-marital issues",
    "Marital problems",
    "Intimacy",
    "Separation or Divorce",
    "Infidelity",
    "Conflicts",
    "Communication problems",
  ],
  Family: [
    "Family conflicts",
    "Parenting issues",
    "Divorce and separation",
    "Communication problems",
    "Blended family struggles",
    "Grieving",
    "Boundaries",
    "Coping with illness",
    "Conflicts",
    "Struggles with step-parents or siblings"
  ],
  "Psychodynamic Psychotherapy": [
    "Relationship patterns",
    "Low self-esteem",
    "Inner conflicts",
    "Childhood trauma",
    "Chronic emptiness",
    "Anxiety",
    "Depression",
    "Personality",
    "Psychosomatic",
    "Eating disorder",
    "Fear of being abandoned",
    "Unresolved past issues",
    "Emotional numbness",
    "Dissociation",
    "Inner child work",
  ]
};

const visibleTagsCount = 6;

// Define tab categories
const tabCategories = [
  { id: "Adult" as TherapyType, label: "Adult" },
  { id: "Couple & family" as TherapyType, label: "Couple & Family" },
  { id: "Teen" as TherapyType, label: "Teen" },
  { id: "Specialities" as TherapyType, label: "Specialities" },
];

const PsychologistSection: React.FC<PsychologistSectionProps> = observer(({
  // Props to control which tabs are shown and default selection
  visibleTabs = ["Adult", "Couple & Family", "Teen", "Specialities"], // All tabs by default
  defaultTab = null, // No default - will use first tab in visibleTabs
  title = "MEET OUR THERAPISTS",
  subtitle = "What are you "
}) => {
  const { userStore: { getAllUsers } } = stores;
  const { userStore: { user } } = stores;

  // Filter the tabs array based on visibleTabs prop
  const displayTabs = tabCategories.filter(tab => visibleTabs.includes(tab.id));

  // If defaultTab is provided, use it, otherwise use the first tab in visibleTabs
  const initialTabId = defaultTab || visibleTabs[0] || "Adult";

  // Find the index of the default tab
  const defaultTabIndex = displayTabs.findIndex(tab => tab.id === initialTabId);

  const [selectedTab, setSelectedTab] = useState(defaultTabIndex >= 0 ? defaultTabIndex : 0);
  const [selectedExpertises, setSelectedExpertises] = useState<string[]>([]);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get current category based on selected tab
  const getCurrentCategory = (): TherapyType => {
    if (displayTabs[selectedTab]) {
      return displayTabs[selectedTab].id;
    }
    return (visibleTabs[0] || "Adult") as TherapyType;
  };

  // Get current expertise list based on selected tab
  const getCurrentExpertiseList = (): string[] => {
    return expertiseByCategory[getCurrentCategory()] || [];
  };

  useEffect(() => {
    getAllUsers({ page: 1, limit: 30 });
  }, [getAllUsers]);

  // Reset selected expertises when tab changes
  useEffect(() => {
    setSelectedExpertises([]);
    setShowMobileFilters(false);
  }, [selectedTab]);

  const handleFilterClick = (expertise: string) => {
    setSelectedExpertises((prev) =>
      prev.includes(expertise)
        ? prev.filter((item) => item !== expertise)
        : [...prev, expertise]
    );
  };

  const filteredPsychologists =
    selectedExpertises.length > 0
      ? user?.data?.filter((psychologist) =>
        selectedExpertises.some((expertise) =>
          psychologist?.profileDetails?.personalInfo?.expertise?.includes(expertise)
        )
      )
      : user?.data || [];

  // Render expertise filters based on current category
  const renderExpertiseFilters = () => {
    return (
      <>
        {/* Mobile expertise selector */}
        {isMobile ? (
          <Box mt={3}>
            <Button
              width="100%"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              bg={showMobileFilters ? "#045B64" : "white"}
              color={showMobileFilters ? "white" : "#045B64"}
              borderColor="#045B64"
              borderWidth="1px"
              leftIcon={<Icon as={IoFilterOutline} />}
              _hover={{ bg: showMobileFilters ? "#034850" : "#E6F7F8" }}
            >
              {selectedExpertises.length > 0
                ? `Filters (${selectedExpertises.length})`
                : "Select Filters"}
            </Button>

            <Collapse in={showMobileFilters} animateOpacity>
              <Box
                mt={2}
                p={4}
                bg="white"
                borderRadius="md"
                boxShadow="md"
                maxH="300px"
                overflowY="auto"
                className="customScrollBar"
              >
                <Stack spacing={2}>
                  {getCurrentExpertiseList().map((expertise, index) => (
                    <Checkbox
                      key={index}
                      isChecked={selectedExpertises.includes(expertise)}
                      onChange={() => handleFilterClick(expertise)}
                      colorScheme="teal"
                    >
                      {expertise}
                    </Checkbox>
                  ))}
                </Stack>
              </Box>
            </Collapse>

            {selectedExpertises.length > 0 && (
              <Flex mt={2} flexWrap="wrap" gap={2}>
                {selectedExpertises.map((expertise, index) => (
                  <Tag
                    key={index}
                    size="sm"
                    borderRadius="full"
                    variant="solid"
                    bg="#045B64"
                    color="white"
                    px={2}
                    py={1}
                    onClick={() => handleFilterClick(expertise)}
                  >
                    {expertise}
                    <Box ml={1} fontWeight="bold">×</Box>
                  </Tag>
                ))}
              </Flex>
            )}
          </Box>
        ) : (
          <Flex wrap="wrap" gap={{ md: 2, xl: 4 }} mt={4} justify="center">
            {getCurrentExpertiseList().slice(0, visibleTagsCount).map((expertise, index) => (
              <Tag
                key={index}
                py={{ md: 2, xl: 2.5 }}
                px={{ md: 4, xl: 6 }}
                fontSize="sm"
                border="1px solid"
                borderColor={selectedExpertises.includes(expertise) ? "#188691" : "#8A8A8A"}
                color={selectedExpertises.includes(expertise) ? "white" : "#8A8A8A"}
                bg={selectedExpertises.includes(expertise) ? "#045B64" : "transparent"}
                rounded="full"
                cursor="pointer"
                onClick={() => handleFilterClick(expertise)}
              >
                {expertise}
              </Tag>
            ))}
            {getCurrentExpertiseList().length > visibleTagsCount && (
              <Menu>
                <MenuButton
                  as={Button}
                  leftIcon={<Icon as={IoFilterOutline} />}
                  bg={"#045B64"}
                  color={"white"}
                  variant="solid"
                  _hover={{ bg: "teal.500" }}
                  px={6}
                >
                  More
                </MenuButton>
                <MenuList
                  maxH="250px"
                  overflowY="auto"
                  sx={{
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#188691",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f0f0f0",
                    },
                  }}
                >
                  {getCurrentExpertiseList().slice(visibleTagsCount).map((expertise, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleFilterClick(expertise)}
                      bg={selectedExpertises.includes(expertise) ? "#E6F7F8" : "white"}
                      _hover={{ bg: "#D5F1F3" }}
                      py={2}
                    >
                      {expertise}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            )}
          </Flex>
        )}
      </>
    );
  };

  return (
    <Box mt={{ base: "70px", lg: "140px" }} py={12} bg={"#F3F7F7"}>
      <Box maxW={{ base: "95%", xl: "90%" }} mx={"auto"}>
        <CustomSmallTitle>{title}</CustomSmallTitle>
        <CustomSubHeading highlightText="Struggling With?">
          {subtitle}
        </CustomSubHeading>

        <Text textAlign={"center"} color={"#434343"} mb={8}>
          We carefully select our therapists and work exclusively with the most experienced ones. Explore our services by symptom or condition.
        </Text>

        {/* Only show tabs if there's more than one tab to display */}
        {displayTabs.length > 1 ? (
          <Tabs
            variant="solid-rounded"
            onChange={(index) => setSelectedTab(index)}
            defaultIndex={defaultTabIndex >= 0 ? defaultTabIndex : 0}
          >
            <Center>
              <TabList
                justifyContent="center"
                bg="#F3F7F7"
                rounded="full"
                p={1}
                w={{ base: '100%', md: 'fit-content' }}
                overflowX="auto"
                border="1px solid #E2E8F0"
              >
                {displayTabs.map((tab, index) => (
                  <Tab
                    fontSize={{ base: "13px", md: "md" }}
                    key={index}
                    color="brand.100"
                    _selected={{ color: "white", bg: "#045B64" }}
                    fontWeight={500}
                  >
                    {tab.label}
                  </Tab>
                ))}
              </TabList>
            </Center>

            <Box mt={8}>
              {renderExpertiseFilters()}
            </Box>
          </Tabs>
        ) : (
          // If only one tab, just show the filters without tabs UI
          <Box mt={6}>
            {renderExpertiseFilters()}
          </Box>
        )}

        {/* Display Psychologists based on filter */}
        {filteredPsychologists.length === 0 ? (
          <Text mt={12} textAlign={"center"} fontSize={"xl"} color="gray.500">
            No Therapist found for the selected filters.
          </Text>
        ) : (
          <Box
            maxH={"80vh"}
            overflow={"auto"}
            pr={{ base: 1, md: 4 }}
            className="customScrollBar"
            my={10}
            mx={{ base: 2, md: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Grid
                templateColumns={{ lg: "1fr 1fr" }}
                gap={{ base: 2, xl: 6 }}
                justifyContent={"center"}
              >
                {filteredPsychologists.map((psychologist, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <PsychologistCard data={psychologist} />
                  </motion.div>
                ))}
              </Grid>
            </motion.div>
          </Box>
        )}
      </Box>
    </Box>
  );
});

export default PsychologistSection;