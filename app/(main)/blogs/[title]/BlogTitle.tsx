"use client";
import {
  Box,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  Link as ChakraLink,
  Text,
  useToast,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoShareSocialOutline } from "react-icons/io5";
import PageLoader from "../../../component/common/Loader/PageLoader";
import SeoHead from "../../../component/config/component/SeoHead/SeoHead";
import stores from "../../../store/stores";
import { useRouter } from 'next/navigation';
import CustomButton from "../../../component/common/CustomButton/CustomButton";
import Link from 'next/link';
import { stripHtmlTags } from "../../../config/utils/utils";

const socialLinks = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/Dental-healthcare/",
    icon: FaLinkedinIn,
  },
  {
    name: "FaXTwitter",
    url: "https://x.com/Dentalhealth",
    icon: FaXTwitter,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/Dentalhealth/",
    icon: FaInstagram,
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61562244046160",
    icon: FaFacebook,
  },
];

const BlogTitle = observer(() => {
  const router = useRouter();
  const toast = useToast();
  const [blogData, setBlogData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const {
    BlogStore: { getSingleBlogs },
  } = stores;

  const { title } = useParams();

  useEffect(() => {
    if (!title) return;

    const key = {
      title: title
    };

    setLoading(true);
    getSingleBlogs(key)
      .then((data) => {
        if (data) {
          setBlogData({
            ...data,
          });
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [title, getSingleBlogs]);


  const handleShare = async () => {
    const currentUrl = window.location.href;
    const shareData = {
      title: blogData?.title?.split("-").join(" ") || 'Check out this blog',
      text: stripHtmlTags(blogData?.subTitle) || 'Interesting read from Dental Healthcare',
      url: currentUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(currentUrl);
        toast({
          title: 'Link copied to clipboard!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch ({ }) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast({
          title: 'Link copied to clipboard!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch {
        toast({
          title: 'Failed to copy link',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Heading as="h2">Loading...</Heading>
        <Text>Please wait while we fetch the blog data.</Text>
      </Box>
    );
  }

  if (!blogData) {
    return (
      <Box textAlign="center" py={10}>
        <Text>No Such Blog Exists</Text>
      </Box>
    );
  }

  return (
    <PageLoader loading={loading} noRecordFoundText={!blogData} height="15vh">
      <Box maxW={{ base: "95%", md: "90%" }} mx="auto">
        {/* Blog Title and Description */}
        <Box maxW="800px" mx="auto" px={{ base: 2, md: 4 }}>
          <Heading
            as="h1"
            textAlign="center"
            fontWeight={600}
            mt={2}
            mb={2}
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
          >
            {blogData?.title?.split("-").join(" ")}
          </Heading>
        </Box>
        {blogData?.subTitle && (
          <SeoHead
            title={blogData.title?.split("-").join(" ") || blogData.slug?.split("-").join(" ")}
            description={blogData.subTitle}
            image={blogData.coverImage?.url}
          />
        )}

        {/* Blog Image */}
        <Image
          alt={blogData?.title?.split("-").join(" ")}
          borderTopRightRadius="50px"
          borderBottomLeftRadius="50px"
          mt={6}
          h={{ base: "50vh", lg: "80vh" }}
          objectFit="cover"
          w="100%"
          src={blogData?.coverImage?.url}
        />

        {/* Main Content Grid */}
        <Grid
          templateColumns={{ base: "1fr", lg: "0.75fr 4fr 1fr" }}
          gap={{ base: 6, md: 4 }}
          my={{ base: 6, md: 12 }}
        >
          {/* Social Shares Section */}
          <Box>
            <Box cursor="pointer" onClick={handleShare}>
              <Center>
                <Icon as={IoShareSocialOutline} boxSize={5} />
              </Center>
              <Text mt={1} textAlign="center" fontWeight={700} lineHeight={1} fontSize="sm">
                Share
              </Text>
            </Box>
            <Flex
              direction={{ base: "row", lg: "column" }}
              align="center"
              justify="center"
              gap={{ base: 3, md: 10, lg: 1 }}
              mt={6}
            >
              {socialLinks.map((social) => (
                <ChakraLink key={social.name} href={social.url} isExternal>
                  <Box
                    boxSize={8}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    rounded="full"
                    bg="brand.100"
                    _hover={{ color: "gray.300" }}
                    mb={{ base: 0, md: 3 }}
                    mr={{ base: 3, md: 0 }}
                  >
                    <Icon as={social.icon} boxSize="60%" color="white" />
                  </Box>
                </ChakraLink>
              ))}
            </Flex>
          </Box>

          {/* Blog Content Section */}
          <Box
            pr={{ base: 0, md: 4 }}
            dangerouslySetInnerHTML={{ __html: blogData?.content }}
          />

          {/* Contact Section */}
          <Box px={{ base: 0, md: 0, lg: 4 }} mt={{ base: 6, lg: 0 }}>
            <Text
              fontWeight={700}
              fontSize={{ base: "18px", md: "lg" }}
              whiteSpace="nowrap"
            >
              Need Help?
            </Text>
            <Text color="#616161" fontSize={{ base: "17px", md: "md" }}>
              Find expert support for your concerns by consulting a Dental therapist.
            </Text>
            <Link href="/therapist" passHref legacyBehavior>
              <a target="_blank" rel="noopener noreferrer">
                <CustomButton
                  variant="outline"
                  py={5}
                  px={6}
                  fontSize="sm"
                  mt={4}
                  colorScheme="teal"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/therapist");
                  }}
                >
                  Explore therapist
                </CustomButton>
              </a>
            </Link>
          </Box>
        </Grid>
      </Box>
    </PageLoader>
  );
});

export default BlogTitle;