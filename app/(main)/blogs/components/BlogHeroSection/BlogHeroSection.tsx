"use client";
import {
  Box,
  Heading,
  Tab,
  TabList,
  Tabs,
  Text,
  Button
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import stores from "../../../../store/stores";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";

interface TabContent {
  featuredLabel?: string;
  title?: string;
  description?: string;
  image?: string;
  buttonText?: string; // Added button text field
  buttonLink?: string; // Added button link field
}

interface BlogContent {
  heroTitle?: string;
  mainTitle?: string;
  highlightText?: string;
  blog?: TabContent;
  event?: TabContent;
  defaultImage?: string;
}

const BlogFeatureCard = observer(() => {
  const [activeTab, setActiveTab] = useState<'blog' | 'event'>('blog');
  const [content, setContent] = useState<BlogContent>({});

  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  // Load content from store
  useEffect(() => {
    const blogContent = getPageContent("blogs");
    setContent(blogContent || {});
  }, [companyDetails, getPageContent]);

  const handleTabChange = (tab: 'blog' | 'event') => {
    setActiveTab(tab);
  }

  // Get the appropriate background image
  const getBackgroundImage = () => {
    if (activeTab === 'blog' && content.blog?.image) {
      return content.blog.image;
    }
    if (activeTab === 'event' && content.event?.image) {
      return content.event.image;
    }
    return content.defaultImage || "https://res.cloudinary.com/dekfm4tfh/image/upload/v1745779098/Mask_group_tuuhqb.png";
  };

  // Get button text based on active tab
  const getButtonText = () => {
    if (activeTab === 'blog') {
      return content.blog?.buttonText || "Read Blog";
    }
    return content.event?.buttonText || "View Event";
  };

  // Get button link based on active tab
  const getButtonLink = () => {
    if (activeTab === 'blog') {
      return content.blog?.buttonLink || "#";
    }
    return content.event?.buttonLink || "#";
  };

  // Check if content is available
  if (!content || Object.keys(content).length === 0) {
    return null;
  }

  return (
    <Box
      position="relative"
      maxW={"95%"}
      mx={"auto"}
      borderRadius="lg"
      overflow="hidden"
      width="full"
      height={{ base: "50vh", lg: "75vh" }}
      backgroundImage={`url(${getBackgroundImage()})`}
      backgroundSize="cover"
      backgroundPosition="center"
      display="flex"
      alignItems="end"
      p={{ base: 4, md: 6 }}
      color="white"
    >
      {/* Tab Navigation */}
      <Tabs position="absolute" top={6} left={12} variant={"soft-rounded"} size={'sm'}>
        <TabList borderRadius="full" bg="blackAlpha.200" color="white" w={"fit-content"} border={'1px solid white'}>
          <Tab
            onClick={() => handleTabChange('blog')}
            _selected={{ color: "brand.100", bg: "white" }}
            color={'white'}
          >
            Blog
          </Tab>
          <Tab
            onClick={() => handleTabChange('event')}
            _selected={{ color: "brand.100", bg: "white" }}
            color={'white'}
          >
            Event
          </Tab>
        </TabList>
      </Tabs>

      {/* Content Area */}
      <Box
        p={{ base: 4, md: 6 }}
        borderRadius="md"
        maxW={{ base: "100%", lg: "95%" }}
        mx={{ base: "-1rem", lg: '1rem' }}
        textAlign={{ base: "start", md: "start" }}
      >
        <CustomSmallTitle textAlign={{ base: "start", md: "start" }}>
          {activeTab === 'blog'
            ? content.blog?.featuredLabel || "FEATURED BLOG"
            : content.event?.featuredLabel || "FEATURED EVENT"}
        </CustomSmallTitle>

        <Heading
          as="h1"
          fontSize={{ base: "xl", md: "3xl", lg: "4xl" }}
          mt={1}
          fontWeight={600}
        >
          {activeTab === 'blog'
            ? content.blog?.title || "How to Choose the Right Therapist"
            : content.event?.title || "The Power of Mindfulness"}
        </Heading>

        <Text
          fontSize={{ base: "sm", lg: "lg" }}
          mt={2}
          w={{ base: "100%", lg: "80%" }}
          fontWeight={400}
          noOfLines={{ base: 2, md: 3 }}
          mb={4}
        >
          {activeTab === 'blog'
            ? content.blog?.description || "Default blog description..."
            : content.event?.description || "Default event description..."}
        </Text>
        
        {/* Button */}
        <Button 
          as="a"
          href={getButtonLink()}
          size={{ base: "sm", md: "md" }}
          mt={1}
          colorScheme="teal"
          bg="white"
          color="brand.100"
          _hover={{ bg: "gray.100" }}
          fontWeight={500}
        >
          {getButtonText()}
        </Button>
      </Box>
    </Box>
  );
});

export default BlogFeatureCard;