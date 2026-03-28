import { Box, Flex, Image, Text } from '@chakra-ui/react';

const BeeHiveLayout = ({ services }) => {

  const getRandomColor = () => {
    const colors = ["pink.200", "red.200", "blue.200", "green.200", "yellow.200"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Box>
      <Flex direction="column" alignItems="center" p={4} position="relative" maxH={"28rem"} overflow={"auto"} my={4}>
        {/* Row 1 */}
        <Flex justifyContent="center" alignItems="flex-start" gap="0">
          <HexagonCard title={services[0]} borderColor={getRandomColor()} mr={{ base: "-16px", lg: "-35px" }} />
          <HexagonCard title={services[1]} borderColor={getRandomColor()} mt={{ base: "60px", lg: "90px" }} />
          <HexagonCard title={services[2]} borderColor={getRandomColor()} ml={{ base: "-16px", lg: "-35px" }} />
        </Flex>

        {/* Row 2 */}
        <Flex justifyContent="center" alignItems="flex-start" gap="0" mt={{ base: "-50px", lg: "-80px" }}>
          <HexagonCard title={services[3]} borderColor={getRandomColor()} mr={{ base: "-16px", lg: "-35px" }} />
          <HexagonCard title={services[4]} borderColor={getRandomColor()} mt={{ base: "60px", lg: "90px" }} />
          <HexagonCard title={services[5]} borderColor={getRandomColor()} ml={{ base: "-16px", lg: "-35px" }} />
        </Flex>

        {/* Row 3 */}
        <Flex justifyContent="center" alignItems="flex-start" gap="0" mt={{ base: "-50px", lg: "-80px" }}>
          <HexagonCard title={services[6]} borderColor={getRandomColor()} mr={{ base: "-16px", lg: "-35px" }} />
          <HexagonCard title={services[7]} borderColor={getRandomColor()} mt={{ base: "60px", lg: "90px" }} />
          <HexagonCard title={services[8]} borderColor={getRandomColor()} ml={{ base: "-16px", lg: "-35px" }} />
        </Flex>
      </Flex>
    </Box>
  );
};

const HexagonCard = ({ title, borderColor, mt, ml, mr }: any) => {
  return (
    <Box
      position="relative"
      width={{ base: "120px", lg: "190px" }}
      height={{ base: "110px", lg: "165px" }}
      mt={mt}
      ml={ml}

      transition='transform 0.3s'
      mr={mr}
      _hover={{
        transform: 'scale(1.05)',
        '& > div': {
          borderColor: `${borderColor.replace('.500', '.700')}`, // Darken the border color on hover
        },

      }}
      filter="drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.2))"
    >
      {/* Border Box */}
      <Box
        position="absolute"
        width="full"
        height="full"
        clipPath="polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
        bg={borderColor}
        transition="border-color 0.2s"
        _hover={{ bg: borderColor }}
      >
        {/* Inner Content */}
        <Box
          position="absolute"
          top="1px"
          left="1px"
          _hover={{ bg: borderColor }}
          transition={"all 0.3s ease-in-out"}
          right="1px"
          bottom="1px"
          clipPath="polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
          bg="white"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Image alt="Psychologist In Noida" boxSize={{ base: "40px", lg: "50px" }} src="/images/profile/service1.png" mb={{ base: 1, lg: 2 }} />
          <Text
            fontSize={{ base: "11px", lg: "14px" }}
            // fontSize={{ base: "x-small", lg: "md" }}
            fontWeight="600"
            textAlign="center"
            lineHeight="16px"
            px={2}
          >
            {title}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default BeeHiveLayout;