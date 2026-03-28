import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Text,
  VStack
} from "@chakra-ui/react";

const RightSection = ({ data }) => {
  return (
    <Box pb={4}>
      <Box
        maxHeight={{ base: "22rem", lg: "26rem" }}
        overflowY="auto"
        my={4}
        px={2}
        pr={3} // gives a little space so scrollbar doesn't overlay text
      >
        <Accordion w={{ base: "100%", lg: "90%" }} defaultIndex={0} allowToggle>
          <VStack spacing={4} align="stretch">
            {data?.AccordionData?.map((feature, index) => (
              <AccordionItem key={index} border="none">
                {({ isExpanded }) => (
                  <>
                    <AccordionButton
                      px={6}
                      pt={isExpanded ? 4 : 3}
                      pb={isExpanded ? 0 : 3}
                      bg={isExpanded ? "white" : "white"}
                      rounded={"12px"}
                      borderBottomRadius={isExpanded ? "0px" : "16px"}
                      boxShadow={isExpanded ? "lg" : "none"}
                      _hover={{ bg: "white" }}
                    >
                      <Flex align="center" gap={4} flex="1">
                        <Text
                          fontSize={{ base: "16px", md: "18px" }}
                          fontWeight={isExpanded ? "500" : "normal"}
                          textAlign="left"
                          color={isExpanded ? "#292929" : "#111111AB"}
                        >
                          {feature.title}
                        </Text>
                      </Flex>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel
                      pb={4}
                      px={6}
                      borderBottom={isExpanded ? "3px solid #DF837C" : "none"}
                      bg={isExpanded ? "white" : "#FFFFFF9C"}
                      borderBottomRadius={"16px"}
                    >
                      <Text
                        color="#292929"
                        fontSize={{ base: "12px", md: "16px" }}
                        lineHeight={{ base: "20px", lg: "24px" }}
                      >
                        {feature.paragraph}
                      </Text>
                    </AccordionPanel>
                  </>
                )}
              </AccordionItem>
            ))}
          </VStack>
        </Accordion>
      </Box>
    </Box>
  );
};

export default RightSection;