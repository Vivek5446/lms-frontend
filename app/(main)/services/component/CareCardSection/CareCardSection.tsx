import { Box, Grid } from '@chakra-ui/react';
import OurVisionCard from '../../../about-us/component/OurVision/OurVisionCard';
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle';
import CustomSubHeading from '../../../../component/common/CustomSubHeading/CustomSubHeading';

const CareCardSection = () => {
  const cards = [
    {
      imageSrc: "/images/service/care1.png",
      title: "Integrity in Care",
      description: "We make every recommendation, treatment, and decision with our clients' best interests in mind.",
    },
    {
      imageSrc: "/images/service/care2.png",
      title: "Put Clients First",
      description: " Our treatments are designed to create meaningful change in our clients' lives.",
    },
    {
      imageSrc: "/images/service/care3.png",
      title: "Backed By Science",
      description: "We combine empathy with research-backed therapy to support your mental health.",
    },
  ];
  return (
    <Box>
      <CustomSmallTitle as="h2" px={2} textAlign={'center'} mb={2} >
        Care at Dental
      </CustomSmallTitle>
      <CustomSubHeading highlightText="safe, supportive space">
        Culture is how we create a
        <br />
      </CustomSubHeading>

      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr 1fr", lg: "1fr 1fr 1fr" }}
        gap={{ base: 2, lg: 6 }}
        mt={{ base: 3, md: 8 }}
        maxW={{ base: "95%", lg: '70%' }}
        mx={"auto"}
      >
        {cards?.map((card: any, index: any) => (
          <OurVisionCard
            key={index}
            shadow='none'
            imageSrc={cards[index].imageSrc}
            title={card.title}
            description={card.description}
            // hasBorder={0} // Apply border to all except the last card
            imageAlign={{ base: 'center', md: 'center' }}
            textAlign={{ base: 'center', md: 'center' }}
          />
        ))}
      </Grid>
    </Box>
  )
}

export default CareCardSection