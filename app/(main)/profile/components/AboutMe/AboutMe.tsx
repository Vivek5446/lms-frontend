import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";

const MAX_LENGTH = 800;

const AboutMe = ({ title, paragraphs = [] }) => {
  const [expanded, setExpanded] = useState(false);

  // Convert underscore-delimited content into separate paragraphs
  const rawContent = paragraphs[0] || "";
  const paraList = rawContent.split("_").map(p => p.trim()).filter(Boolean);

  // Flatten all content for truncation logic
  const fullText = paraList.join("\n\n");
  const isLong = fullText.length > MAX_LENGTH;

  // Logic for truncated preview
  const previewText = fullText.slice(0, MAX_LENGTH) + "...";
  const contentToShow = expanded || !isLong ? paraList : [previewText];

  return (
    <Box py={6} maxW={{ base: "90%", lg: "85%" }} mx="auto">
      <Heading as="h2" size="lg" fontWeight={600} mb={4}>
        {title}
      </Heading>

      <VStack align="start" spacing={4}>
        {contentToShow.map((para, index) => (
          <Text
            key={index}
            fontSize={{ base: "sm", lg: "15px" }}
            color="#616161"
            pr={{ base: 2, lg: 12 }}
            whiteSpace="pre-line"
          >
            {para}
          </Text>
        ))}
      </VStack>

      {isLong && (
        <Button mt={4} color="brand.100" variant="link" onClick={() => setExpanded(!expanded)}>
          {expanded ? "HIDE →" : "READ MORE →"}
        </Button>
      )}
    </Box>
  );
};

export default AboutMe;
