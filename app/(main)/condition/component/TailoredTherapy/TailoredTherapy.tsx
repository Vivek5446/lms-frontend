import { Box, Grid, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation';
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle'
import CustomSubHeading from '../../../../component/common/CustomSubHeading/CustomSubHeading'
import CustomButton from "../../../../component/common/CustomButton/CustomButton";
import Link from 'next/link';
import ServiceOfferingCard from '../../../services/component/ServiceOfferingSection/ServiceOfferingCard';
// Updated data with route properties
// Updated data with route properties
const cardData = [
  {
    id: 1,
    coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1745780028/Mask_group_2_gv3yow.png',
    imageUrl: '/images/service/offering1.png',
    tag: 'AGES 18+',
    title: 'Individual Therapy',
    description: 'One-on-one sessions to help you feel better and handle life’s challenges.',
    buttonText: 'EXPLORE',
    bg: "#9DEAB2",
    route: '/services/individual-therapy'  // Added route for individual therapy
  },
  {
    id: 2,
    coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1745780010/Mask_group_4_yv86a9.png',
    imageUrl: '/images/service/offering2.png',
    tag: 'AGES 13+',
    title: 'Teen Therapy',
    description: 'Safe, understanding support for teens navigating life’s ups and downs.',
    buttonText: 'EXPLORE',
    bg: "#EAF475",
    route: '/services/teen-therapy'  // Added route for teen therapy
  },
  {
    id: 3,
    coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746203003/iStock-2167121054_cx0ybf.png',
    imageUrl: '/images/service/offering3.png',
    tag: '',
    title: 'Family Therapy',
    description: 'Guided conversations to improve relationships and resolve conflicts together.',
    buttonText: 'EXPLORE',
    bg: "#86C6F4",
    route: '/services/family-therapy'  // Added route for family therapy
  },
]
const TailoredTherapy = ({ data }) => {
  const router = useRouter();

  return (
    <Box py={16}>
      <CustomSmallTitle>OUR OFFERINGS</CustomSmallTitle>
      <CustomSubHeading highlightText="built for You">
        Expert care,
      </CustomSubHeading>
      <Text
        mt={4}
        textAlign={{ base: "center", md: "center" }}
        color="#4D4D4D"
        px={{ base: 3, md: 1 }}
        fontSize={{ base: "14px", md: "16px" }}
        maxW={{ lg: '65%' }}
        mx={'auto'}
        whiteSpace="normal"
      >
        {data?.offer}
      </Text>

      <Grid
        templateColumns={{
          base: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr",
        }}
        maxW={{ base: "90%", md: "70%" }}
        mx="auto"
        gap={6}
        mt={8}
      >
        {cardData.map((service) => (
          <ServiceOfferingCard key={service.id} service={service} />
        ))}
      </Grid>

      {/* Explore All Services Button */}
      <Box
        textAlign="center"
        position="relative"
        top={{ base: "25px", md: "30px" }}
        mb={{ base: "0px", md: "0px" }}
      >
        <Link href="/services" passHref legacyBehavior>
          <a target="_blank" rel="noopener noreferrer">
            <CustomButton
              size="md"
              fontSize="16px"
              colorScheme="teal"
              _hover={{ bg: "#2A8A94" }}
              onClick={(e) => {
                e.preventDefault();
                router.push('/services');
              }}
            >
              Explore All Services
            </CustomButton>
          </a>
        </Link>
      </Box>
    </Box>
  );
}

export default TailoredTherapy;