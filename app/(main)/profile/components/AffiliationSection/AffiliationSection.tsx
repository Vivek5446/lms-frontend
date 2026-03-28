import { Box, Flex, Heading, Step, StepIndicator, Stepper, StepSeparator, Text, useBreakpointValue } from '@chakra-ui/react';

const affiliations = [
  {
    title: 'Licensed Clinical Psychologist',
    organization: 'Private Practice · Full-time ',
    location: 'Noida, Uttar Pradesh, India',
    color: '#FFB8B2', // Soft pink
  },
  {
    title: 'PhD (Clinical Psychology)',
    organization: 'AIIMS (All India Institute of Medical Sciences, New Delhi)',
    location: 'New Delhi, India',
    color: '#86C6F4', // Light blue
  },
  {
    title: 'Research Associate',
    organization: 'AIIMS (All India Institute of Medical Sciences, New Delhi)',
    location: 'New Delhi, India',
    color: '#A8E6CF', // Light green (similar in tone)
  }
];


const AffiliationSection = ({data} : any) => {
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <Box p={4}>
      <Heading size="lg" fontWeight="600" color="black" mb={4} ml={{ lg: '100px' }}>
        Affiliations
      </Heading>

      {isDesktop ? (
        <Box position="relative" ml="100px">
          <Flex
            position="relative"
            align="flex-start"
            width="fit-content" // Constrain container width to content
          >
            {/* Connecting line */}
            <Box
              position="absolute"
              height="2px"
              bg="gray.200"
              top="16px"
              left="16px" // Start from center of first circle
              width="calc(100% - 240px)" // End at center of last circle
              zIndex={0}
            />

            {/* Affiliation items */}
            {data.map((affiliation, index) => (
              <Flex
                key={index}
                direction="column"
                align="flex-start"
                mr={index === data.length - 1 ? 0 : "100px"} // Fixed margin
                position="relative"
              >
                {/* Circle */}
                <Box
                  width="32px"
                  height="32px"
                  borderRadius="full"
                  bg={affiliations[index].color}
                  mb={4}
                  zIndex={1}
                />

                {/* Text content */}
                <Box textAlign="left" maxW="250px">
                  <Text fontSize="sm" fontWeight="bold" color="black">
                    {affiliation.title}
                  </Text>
                  <Text fontSize="xs" fontWeight="medium" color="black">
                    {affiliation.organization}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {affiliation.location}
                  </Text>
                </Box>
              </Flex>
            ))}
          </Flex>
        </Box>
      ) : (
        <Stepper index={0} orientation="vertical" gap="4px" size="sm">
          {data.map((affiliation, index) => (
            <Step key={index}>
              <StepIndicator bg={affiliations[index].color} />

              {index < data.length - 1 && <StepSeparator />}

              <Box textAlign="left" mt={2} mx={2} maxW="full">
                <Text fontSize="sm" fontWeight="bold" color="black" noOfLines={2}>
                  {affiliation.title}
                </Text>
                <Text fontSize="xs" fontWeight="medium" color="black" noOfLines={2}>
                  {affiliation.organization}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {affiliation.location}
                </Text>
              </Box>
            </Step>
          ))}
        </Stepper>
      )}
    </Box>
  );
};

export default AffiliationSection;