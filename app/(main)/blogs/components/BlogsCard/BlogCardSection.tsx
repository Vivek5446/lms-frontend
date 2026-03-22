import {
  Box,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Select,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import BlogsCard from "./BlogsCard";
import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";
import { getStatusType } from "../../../../config/utils/function";
import useDebounce from "../../../../component/config/component/customHooks/useDebounce";

const BlogCardSection = observer(() => {
  const {
    auth: { openNotification },
    BlogStore: { getBlogs, blogs },
    EventStore: { getEvent, event },
  } = stores;

  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");

  const [blogTopics, setBlogTopics] = useState<string[]>([]);
  const [blogAudiences, setBlogAudiences] = useState<string[]>([]);

  const [eventTopics, setEventTopics] = useState<string[]>([]);
  const [eventAudiences, setEventAudiences] = useState<string[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const fetchData = useCallback(() => {
    const query: any = {
      page: 1,
      limit: 10,
    };

    if (debouncedSearchQuery.trim()) query.search = debouncedSearchQuery.trim();
    if (selectedTopic) query.category = selectedTopic;
    if (selectedAudience) query.target = selectedAudience;

    if (selectedTab === 0) {
      getBlogs(query).catch((err: any) => {
        openNotification({
          title: "Failed to Retrieve Blogs",
          message: err?.data?.message,
          type: getStatusType(err.status),
        });
      });
    } else {
      getEvent(query).catch((err: any) => {
        openNotification({
          title: "Failed to Retrieve Events",
          message: err?.data?.message,
          type: getStatusType(err.status),
        });
      });
    }
  }, [
    debouncedSearchQuery,
    selectedTopic,
    selectedAudience,
    selectedTab,
    getBlogs,
    getEvent,
    openNotification,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (blogs?.data && selectedTab === 0) {
      const topics = blogs.data
        .map((item: any) => item.category)
        .filter(Boolean);
      const audiences = blogs.data
        .map((item: any) => item.target)
        .filter(Boolean);

      setBlogTopics(Array.from(new Set(topics)));
      setBlogAudiences(Array.from(new Set(audiences)));
    }
    if (event?.data && selectedTab === 1) {
      const topics = event.data
        .map((item: any) => item.category)
        .filter(Boolean);
      const audiences = event.data
        .map((item: any) => item.target)
        .filter(Boolean);

      setEventTopics(Array.from(new Set(topics)));
      setEventAudiences(Array.from(new Set(audiences)));
    }
  }, [blogs?.data, event?.data, selectedTab]);

  const getCurrentData = () => {
    return selectedTab === 0 ? blogs?.data || [] : event?.data || [];
  };

  const isLoading = selectedTab === 0 ? blogs?.loading : event?.loading;

  return (
    <Box>
      <CustomSmallTitle>Resources & Insights</CustomSmallTitle>

      <Heading
        mt={2}
        as="h2"
        textAlign="center"
        fontSize={{ base: "24px", md: "44px" }}
        fontWeight={400}
        px={{ base: 2, md: 0 }}
      >
        <strong style={{ fontWeight: 600 }}>Explore Blogs, Events & More</strong>
      </Heading>

      <Tabs
        variant="solid-rounded"
        colorScheme="teal"
        size="sm"
        mt={{ base: 6, lg: 12 }}
        onChange={(index) => {
          setSelectedTab(index);
          setSelectedTopic("");
          setSelectedAudience("");
          setSearchQuery("");
        }}
      >
        <Center>
          <TabList
            gap={2}
            justifyContent="center"
            p={1}
            bg="#F3F7F7"
            rounded="full"
            w="fit-content"
          >
            <Tab
              fontWeight={400}
              _selected={{ color: "white", bg: "brand.100" }}
              color="brand.100"
              py={1}
              fontSize="lg"
              w="100px"
            >
              Blogs
            </Tab>
            <Tab
              fontWeight={400}
              _selected={{ color: "white", bg: "brand.100" }}
              color="brand.100"
              py={1}
              fontSize="lg"
              w="100px"
            >
              Events
            </Tab>
          </TabList>
        </Center>

        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
          px={4}
          gap={6}
          mt={8}
        >
          <FormControl>
            <FormLabel fontWeight={700}>Search</FormLabel>
            <Input
              size="sm"
              placeholder="I'm looking for"
              variant="flushed"
              borderColor="gray.400"
              focusBorderColor="#8A8A8A"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight={700}>Topic</FormLabel>
            <Select
              size="sm"
              placeholder="Select Topic"
              variant="flushed"
              borderColor="gray.400"
              focusBorderColor="#8A8A8A"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              {(selectedTab === 0 ? blogTopics : eventTopics).map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight={700}>Audience</FormLabel>
            <Select
              size="sm"
              placeholder="Select Audience"
              variant="flushed"
              borderColor="gray.400"
              focusBorderColor="#8A8A8A"
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
            >
              {(selectedTab === 0 ? blogAudiences : eventAudiences).map((aud) => (
                <option key={aud} value={aud}>
                  {aud}
                </option>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <TabPanels>
          {/* Blogs */}
          <TabPanel px={0}>
            <Box
              maxH="550px"
              overflowY="auto"
              px={2}
              sx={{
                scrollbarWidth: "thin",
                scrollbarColor: "#188691 #f0f0f0",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#188691",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": { background: "#f0f0f0" },
              }}
            >
              {isLoading ? (
                <Flex height="250px" justifyContent="center" alignItems="center">
                  <Spinner size="xl" />
                </Flex>
              ) : getCurrentData().length > 0 ? (
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={4}
                >
                  {getCurrentData().map((blog) => (
                    <BlogsCard key={blog.id} {...blog} otherBlog={false} />
                  ))}
                </Grid>
              ) : (
                <Text textAlign="center" mt={2}>
                  No blogs available.
                </Text>
              )}
            </Box>
          </TabPanel>

          {/* Events */}
          <TabPanel px={0}>
            <Box
              maxH="550px"
              overflowY="auto"
              px={2}
              sx={{
                scrollbarWidth: "thin",
                scrollbarColor: "#188691 #f0f0f0",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#188691",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": { background: "#f0f0f0" },
              }}
            >
              {isLoading ? (
                <Center mt={4}>
                  <Spinner size="xl" />
                </Center>
              ) : getCurrentData().length > 0 ? (
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={4}
                >
                  {getCurrentData().map((event) => (
                    <BlogsCard key={event.id} {...event} otherBlog={true} />
                  ))}
                </Grid>
              ) : (
                <Text textAlign="center" mt={2}>
                  No events available.
                </Text>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
});

export default BlogCardSection;
