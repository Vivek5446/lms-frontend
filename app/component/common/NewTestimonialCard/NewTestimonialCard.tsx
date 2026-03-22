import { StarIcon } from "@chakra-ui/icons";
import { Avatar, Box, Card, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React from "react";

const NewTestimonialCard = ({
  rating,
  description,
  image,
  name,
  profession,
  createdAt,
  companyLogo,
  showBorder = true,
  bgColor = "#FFFFFF",
  starColor = "gold",
}) => {
  return (
    <Box>
      <Card
        h={{ base: "240px", md: "300px" }} // Set a fixed height for the card
        py={{ base: 4, md: 6, lg: 10 }}
        px={{ base: 4, md: 6 }}
        rounded={"16px"}
        border={showBorder ? "1px solid #045B64" : "none"} // Conditional border
        bg={bgColor} // Use the bgColor prop
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"} // Ensure content is spaced appropriately
      >
        {/* Rating & Review */}
        <Box>
          <Flex gap={1} mb={2}>
            {Array.from({ length: rating }, (_, i) => (
              <Icon key={i} color={starColor} as={StarIcon} boxSize={4} />
            ))}
          </Flex>
          <Text
            noOfLines={4} // Now allows 4 lines instead of 3 for better content display
            fontSize={{ base: "15px", md: "17px" }}
            fontWeight="medium"
            mt={3}
            lineHeight="1.5"
            color="#444" // Slightly softened color for better readability
          >
            {description.length > 140 ? `${description.substring(0, 140)}...` : description}
          </Text>
        </Box>

        {/* User Info */}
        <Flex justify="space-between" align="center" mt={6}>
          <Flex gap={3} align="center">
            <Avatar boxSize={{ base: "40px", md: "50px" }} name={name} src={image?.url} />
            <Box>
              <Text fontSize={{ base: "16px", md: "18px" }} fontWeight="medium" color="#063231">
                {name}
              </Text>
              <Text fontSize="sm" color="#777">
                {profession}
              </Text>
              <Text fontSize="xs" color="#063231">
                {new Date(createdAt).toLocaleDateString()} {/* Properly formatted date */}
              </Text>
            </Box>
          </Flex>
          {companyLogo && (
            <Box boxSize={{ base: 10, md: 12 }} rounded="full" overflow="hidden">
              <Image src={companyLogo} alt={`${name}'s Company Logo`} />
            </Box>
          )}
        </Flex>
      </Card>
    </Box>
  );
};

export default NewTestimonialCard;
