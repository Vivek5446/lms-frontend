import { Box, Flex, Image, Text, useBreakpointValue } from "@chakra-ui/react";

// Define a new custom theme breakpoint if it's not already defined  
// Ensure to use this if you have a custom theme setup  
// const breakpoints = {
//   base: '0em', // mobile  
//   sm: '30em', // small tablets  
//   md: '46em', // default for tablets  
//   lg: '62em', // desktop  
//   xl: '80em', // large desktop  
// };

const CarouselCard = ({ imageSrc, iconSrc, title, description }) => {
  // Responsive values with tablet view adjustments  
  const imageWidth = useBreakpointValue({ base: "100%", sm: "90%", lg: "85%" });
  const overlayWidth = useBreakpointValue({ base: "90%", sm: "85%", lg: "80%" });
  const overlayBottom = useBreakpointValue({ base: 4, sm: 6, lg: 14 });
  const overlayLeft = useBreakpointValue({ base: "5%", sm: "7%", lg: 16 });
  const titleFontSize = useBreakpointValue({ base: "md", sm: "lg", lg: "lg" });
  const descriptionFontSize = useBreakpointValue({ base: "xs", sm: "sm", lg: "sm" });
  const iconBoxSize = useBreakpointValue({ base: 10, sm: 10, lg: 12 });
  const iconSize = useBreakpointValue({ base: 4, sm: 5, lg: 7 });

  return (
    <Box>
      <Flex justify="center" pb={{ lg: 10 }} position="relative">
        <Box w={imageWidth}>
          {/* Background Image */}
          <Image
            src={imageSrc}
            h={"100%"}
            w="100%"
            objectFit="cover"
            borderTopLeftRadius="50px"
            borderBottomRightRadius="50px"
            alt="psychologist in noida sector 62"
          />

          {/* Overlay Box */}
          <Box
            p={4}
            px={{ base: 4, lg: 6 }}
            w={overlayWidth}
            position="absolute"
            bottom={overlayBottom}
            left={overlayLeft}
            backdropFilter="blur(20px)"
            bg="rgba(255, 255, 255, 0.10)"
            borderBottomRightRadius="50px"
            border={"1px solid rgba(255, 255, 255, 0.2)"}
          >
            {/* Circular Icon Box */}
            <Box
              p={1}
              boxSize={iconBoxSize}
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              backdropFilter="blur(40px)"
              bg="rgba(255, 255, 255, 0.1)"
              mb={1}
              border={"2px solid rgba(255, 255, 255, 0.3)"}
            >
              <Image src={iconSrc} boxSize={iconSize} alt="best child psychologist in noida" />
            </Box>

            {/* Text Content */}
            <Text fontSize={titleFontSize} color="white" fontWeight={600}>
              {title}
            </Text>
            <Text fontSize={descriptionFontSize} color="white">
              {description}
            </Text>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default CarouselCard;  