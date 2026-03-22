import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Image, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import CustomButton from "../../../../component/common/CustomButton/CustomButton";

const BlogsCard = ({
  coverImage,
  subTitle,
  createdAt,
  title,
  tags,
  otherBlog,
  slug,
  image,
  price,
  trigger,
  description,
  eventDate
}: any) => {
  const formatDate = (createdAt?: string) => {
    if (!createdAt) return { month: "", day: "", year: "", time: "" };

    const date = new Date(createdAt);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const time = `${hours}:${minutes} ${ampm}`;

    return {
      day: date.getDate().toString(),
      month: date.toLocaleString("en-US", { month: "short" }),
      year: date.getFullYear().toString(),
      time: time,
    };
  };

  const formattedDate = formatDate(eventDate || createdAt);

  return (
    <Box
      rounded={"16px"}
      borderWidth={1}
      overflow="hidden"
      bg={otherBlog ? "white" : "transparent"}
    >
      <Box position={"relative"}>
        <Image
          src={coverImage?.url || image?.url}
          h={{ base: "210px", lg: "260px" }}
          objectFit={"cover"}
          alt="best counseling psychologist in Noida"
          rounded={"12px"}
          w={"100%"}
          filter={"brightness(0.7)"}
        />
        {!otherBlog && (
          <Flex position={"absolute"} top={4} left={4} gap={1} wrap="wrap">
            {tags?.map((tag, index) => (
              <Text
                key={index}
                color={"white"}
                py={1}
                px={2}
                rounded={"6px"}
                fontSize={"sm"}
                backdropBlur={"lg"}
                bg={"whiteAlpha.300"}
                backdropFilter={"blur(10px)"}
                m={1}
                _hover={{ bg: "whiteAlpha.500", cursor: "pointer" }}
              >
                {tag}
              </Text>
            ))}
          </Flex>
        )}
        {otherBlog && (
          <Box
            bg={"white"}
            position={"absolute"}
            top={4}
            left={4}
            px={2}
            py={1}
            rounded={"6px"}
          >
            <Text fontSize={"sm"} fontWeight={600} color={"black"}>
              {price}
            </Text>
          </Box>
        )}
      </Box>

      <Box mt={{ lg: 2 }} p={{ base: 2, lg: 4 }}>
        {otherBlog ? (
          <Flex alignItems={"center"} gap={{ base: 2, lg: 4 }}>
            <Stack spacing={0} alignItems="center">
              <Text
                fontSize={"sm"}
                color="brand.100"
                fontWeight={600}
                fontFamily={"Montserrat, sans-serif"}
              >
                {formattedDate.month}
              </Text>
              <Text fontSize={"2xl"} fontWeight={700}>
                {formattedDate.day}
              </Text>
              <Text fontSize="xs">{formattedDate.time}</Text>
            </Stack>
            <Stack spacing={1}>
              <Text
                fontSize={{ base: "18px", lg: "20px" }}
                fontWeight={700}
                noOfLines={2}
                cursor="pointer"
              >
                {title}
              </Text>
              <Text mt={1}>{description}</Text>
            </Stack>
          </Flex>
        ) : (
          <>
            <Text color={"#868080"} fontSize={"xs"}>
              {formattedDate.day} {formattedDate.month}, {formattedDate.year}
            </Text>
            <Link href={`/blogs/${slug}`} passHref>
              <Text
                as="a"
                fontSize={{ base: "16px", lg: "20px" }}
                fontWeight={700}
                noOfLines={2}
                mt={1}
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                {title}
              </Text>
            </Link>
            <Text mt={1} dangerouslySetInnerHTML={{ __html: subTitle }} />
          </>
        )}
        <Flex justifyContent={"space-between"} alignItems={"center"} mt={2}>
          {otherBlog ? (
            <CustomButton
              onClick={() => window.open(trigger, "_blank")}
              size={{ base: "sm", md: "md" }}
              bg={"brand.100"}
              color={"white"}
              _hover={{ bg: "brand.200" }}
            >
              BOOK NOW
            </CustomButton>
          ) : (
            <Link href={`/blogs/${slug}`} passHref>
              <Button
                as="a"
                p={"0px"}
                size={{ base: "sm", md: "md" }}
                _hover={{ bg: "transparent", textDecoration: "underline" }}
                color={"brand.100"}
                variant={"ghost"}
                rightIcon={<ArrowForwardIcon />}
              >
                READ MORE
              </Button>
            </Link>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default BlogsCard;
