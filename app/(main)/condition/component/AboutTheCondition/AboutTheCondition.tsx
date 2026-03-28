import {
  Box,
  Flex,
  Grid,
  GridItem,
  Image,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import CustomButton from '../../../../component/common/CustomButton/CustomButton';
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle';
import CustomSubHeading from '../../../../component/common/CustomSubHeading/CustomSubHeading';

const AboutTheCondition = ({ data, id }) => {
  return (
    <Box bg="#065F68" rounded="16px" maxW="98vw" mx="auto" p={{ base: 4, md: 8 }}>
      <Grid
        templateColumns={{
          base: '1fr',
          md: '1fr 1fr',
          lg: '1fr 1fr 1fr',
        }}
        templateAreas={{
          base: `"text" "image" "list"`,
          md: `"text image" "list list"`,
          lg: `"text image list"`,
        }}
        gap={8}
        maxW="95%"
        mx="auto"
        my={{ base: 8, md: 12 }}
      >
        {/* Text Section */}
        <GridItem area="text" my={{ base: 4, md: 8 }}>
          <CustomSmallTitle textAlign={{ base: 'center', lg: 'start' }}>
            ABOUT THE CONDITION
          </CustomSmallTitle>

          <CustomSubHeading
            highlightText=""
            textAlign={{ base: 'center', lg: 'start' }}
            color="white"
            fontSize={{ base: '18px', md: '24px' }}
          >
            {data?.heading}
          </CustomSubHeading>

          <Text
            fontSize={{ base: '14px', md: 'sm' }}
            mt={4}
            lineHeight="26px"
            color="white"
            textAlign={{ base: 'center', lg: 'start' }}
          >
            {data?.description}
          </Text>

          <Box display="flex" justifyContent={{ base: 'center', lg: 'flex-start' }} mt={6}>
            <a href={`/self-assessment/${id.id}`}>
              <CustomButton as="span" bg="#FFB8B2" color="#000000">
                Take free Assessment
              </CustomButton>
            </a>
          </Box>
        </GridItem>

        {/* Image Section */}
        <GridItem
          area="image"
          display="flex"
          alignItems="center"
          justifyContent={{ base: 'center', md: 'flex-end', lg: 'center' }}
          mt={{ base: 0, md: 14 }}
        >
          <Image
            alt="best counseling psychologist in Noida"
            w="100%"
            maxW={{ base: "300px", md: "350px", lg: "400px" }}
            ml={{ base: "2rem", md: 0 }}
            h={{ base: '250px', md: '350px', lg: '420px' }}
            objectFit="contain"
            src={data?.image}
          />
        </GridItem>

        {/* Scrollable List Section */}
        <GridItem
          area="list"
          mt={{ base: 4, md: 0, lg: '6rem' }}
          pl={{ md: 8, lg: 0 }}
        >
          <CustomSubHeading
            highlightText={data?.name || "Conditions"}
            textAlign={{ base: 'center', lg: 'start' }}
            color="white"
            fontSize={{ base: '18px', md: '30px' }}
          >
            Symptoms of
          </CustomSubHeading>

          <Flex justify={{ md: 'center', lg: 'unset' }}>
            <Box
              maxH={{ base: '180px', md: '240px' }}
              overflowY="auto"
              overflowX="hidden"
              mt={4}
              px={{ base: 2, md: 0 }}
              sx={{
                direction: 'rtl',
                '&::-webkit-scrollbar': {
                  width: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'white',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                },
              }}
            >
              <UnorderedList
                color="white"
                spacing={3}
                pl={4}
                fontSize={{ base: '14px', md: '16px' }}
                sx={{ direction: 'ltr' }}
              >
                {data?.symptoms?.map((symptom, index) => (
                  <ListItem key={index}>{symptom}</ListItem>
                ))}
              </UnorderedList>
            </Box>
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AboutTheCondition;
