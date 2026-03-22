import { Box, Grid, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { useState } from 'react';
import BeeHiveLayout from './BeeHiveLayout';

const ServiceOffered = ({services, conditions} : any) => {
  const [tabIndex, setTabIndex] = useState(0);

  const content = [
    {
      title: "Services",
      description: "Explore various treatment modalities and conditions that the therapist specializes in."
    },
    {
      title: "Conditions",
      description: "Explore various treatment modalities and conditions that the therapist specializes in."
    }
  ];

  return (
    <Box maxW={{ base: "95%", lg: '95%' }} mx={'auto'} bg={'#FFF3F2B0'} borderTopLeftRadius={{ base: "30px", lg: '40px' }} borderBottomRightRadius={{ base: "30px", lg: '40px' }} p={{ base: 4, lg: 6 }}>
      <Grid templateColumns={{ lg: '1fr 1fr' }} gap={4} mx={{ lg: 12 }} justifyContent={{ base: 'center', lg: "start" }}>
        <Box mt={{ base: 4, lg: 16 }} p={4}>
          <Heading as="h2" size="lg" fontWeight={600} mb={4}>Service offered</Heading>
          <Tabs onChange={(index) => setTabIndex(index)} variant={'soft-rounded'} size={'sm'}>
            <TabPanels>
              {content.map((item, index) => (
                <TabPanel key={index} p={0}>
                  <Text color={'#616161'} fontSize={'sm'}>{item.description}</Text>
                </TabPanel>
              ))}
            </TabPanels>
            <TabList mt={4} borderRadius="full" bg="blackAlpha.200" color="white" w={"fit-content"} border={'1px solid white'}>
              <Tab fontWeight={400} borderLeft={'full'} _selected={{ color: "white", bg: "brand.100" }} color={'gray.800'}>Services</Tab>
              <Tab fontWeight={400} _selected={{ color: "white", bg: "brand.100" }} color={'gray.800'}>Conditions</Tab>
            </TabList>
          </Tabs>
        </Box>
        {tabIndex === 0 && <BeeHiveLayout services={services} />}
        {tabIndex === 1 && <BeeHiveLayout services={conditions} />}
        {/* <BeeHiveLayout /> */}
      </Grid>
    </Box>
  );
};

export default ServiceOffered;