import { Box, Tabs, TabList, Tab, TabIndicator } from "@chakra-ui/react";

const TabsButton = ({ handleTabClick }) => {
  return (
    <Box
      position="sticky"
      top={{ base: "5rem", lg: "7rem" }}  // Adjusted for header height
      bg="white"
      py={1}
      zIndex="100"
    >
      <Box
        maxW={'85%'}
        mx={'auto'}
        mb={{ base: 2, lg: 8 }}
        py={1}
      >
        <Tabs position='relative' variant={{ base: "line", lg: 'unstyled' }} onChange={handleTabClick}>
          <TabList gap={{ base: 1, lg: 6 }} color={'#8A8A8A'} overflowX={'auto'}>
            <Tab whiteSpace={'nowrap'} fontWeight={500}>About Me</Tab>
            <Tab fontWeight={500}>Services</Tab>
            <Tab fontWeight={500}>Affiliation</Tab>
            <Tab fontWeight={500}>Availability</Tab>
            <Tab fontWeight={500}>Reviews</Tab>
            <Tab fontWeight={500}>Faqs</Tab>
          </TabList>
          <TabIndicator mt='-1.5px' height='2px' bg='brand.100' borderRadius='1px' display={{ base: "none", lg: "block" }} />
        </Tabs>
      </Box>
    </Box>
  );
};
export default TabsButton