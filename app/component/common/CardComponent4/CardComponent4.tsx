import { Box, Flex, Image, ResponsiveValue, Text } from "@chakra-ui/react";
import type { Property } from "csstype";

interface CardComponentProps {
  imageSrc: string;
  title: string;
  description: string;
  hasBorder?: boolean;
  textAlign?: ResponsiveValue<Property.TextAlign>;
  imageAlign?: ResponsiveValue<Property.JustifyContent>;
  imageSpacing?: number;
  titleFontWeight?: string | number; // ✅ Add this line
}

const CardComponent: React.FC<CardComponentProps> = ({
  imageSrc,
  title,
  description,
  hasBorder = false,
  textAlign = { base: "center", md: "center" },
  imageAlign = { base: "center", md: "center" },
  imageSpacing = 3,
  titleFontWeight, // ✅ Accept prop here
  ...props
}) => {
  return (
    <Box
      px={{ base: 5, md: 4 }}
      py={2}
      borderRight={{
        base: "none",
        lg: hasBorder ? "1px solid #D4D4D482" : "none",
      }}
      {...props}
    >
      <Flex justify={imageAlign}>
        <Image
          src={imageSrc}
          boxSize={{ base: "70px", md: "75px" }}
          objectFit="contain"
          alt="Best Psychotherapist In Noida (with Psychotherapists)"
        />
      </Flex>

      {/* ✅ Update title text to use titleFontWeight */}
      <Text
        mt={{ md: imageSpacing }}
        mb={1}
        fontSize={{ base: "16px", md: "20px" }}
        fontWeight={titleFontWeight || 500}
        textAlign={textAlign}
      >
        {title}
      </Text>

      <Text
        fontSize={{ base: "14px", md: "15px" }}
        fontWeight={400}
        pr={2}
        textAlign={textAlign}
      >
        {description}
      </Text>
    </Box>
  );
};

export default CardComponent;
