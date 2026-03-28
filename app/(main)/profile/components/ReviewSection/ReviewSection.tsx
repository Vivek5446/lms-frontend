import {
  Avatar,
  Box,
  Flex,
  Icon,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { HiStar } from 'react-icons/hi';
import '../../../../component/FAQ/FAQAccordion/scroll.css';
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle';

interface Review {
  id: number;
  name: string;
  dateInfo: string;
  image: string;
  rating: number;
  description: string;
  icon: string;
}

interface ReviewSectionProps {
  data?: Review[];
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ data = [] }) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(data[0] || null);

  const handleCardClick = (review: Review) => {
    setSelectedReview(review);
  };

  return (
    <Box>
      <CustomSmallTitle textAlign={{ base: "center" }} ml={{ lg: "0.2rem" }}>
        OUR TESTIMONIALS
      </CustomSmallTitle>
      <Text
        textAlign={'center'}
        as={'h2'}
        fontWeight={400}
        fontSize={{ base: '24px', md: '42px',lg: '48px' }}
        my={{ base: 1, md: 2 }}
        px={1}
      >
        Hear from Those Who’ve{' '}
        <Text as={'span'} fontWeight={600}>
          Found Recovery
        </Text>
      </Text>

      <Flex
  direction={{ base: 'column', md: 'row' }}
  w="full"
  gap={{ base: 9, md: 6, lg: 2 }}
  maxW={{ base: "90%", md: "95%", lg: '85%' }}
  mt={8}
  mx="auto"
  justify={{ md: 'space-between', lg: 'space-between' }}
>
        {/* Left scrollable section */}
        <Box
    w={{ base: 'full', md: '40%', lg: '30%' }}
    h="200px"
    overflowY="auto"
    pr={2}
    className="customScrollBar"
  >
          <Stack spacing={{ base: 2, lg: 4 }}>
            {data.length > 0 ? (
              data.map((review) => (
                <Flex
                  cursor={'pointer'}
                  key={review.id}
                  onClick={() => handleCardClick(review)}
                  rounded={'2xl'}
                  p={{ base: 3, lg: 4 }}
                  borderWidth={1}
                  pr={{ base: 2, lg: 6 }}
                  align={'center'}
                  gap={2}
                  shadow={'base'}
                  w="full"
                  justifyContent="space-between"
                  _hover={{ bg: 'blue.100' }}
                >
                  <Flex align={'center'} gap={2}>
                    <Avatar size="sm" name={review.name} />
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="bold">{review.name}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {review.dateInfo}
                      </Text>
                    </VStack>
                  </Flex>
                  <Icon as={FcGoogle} fontSize={'36px'} />
                </Flex>
              ))
            ) : (
              <Text textAlign="center" color="gray.500">
                No reviews available
              </Text>
            )}
          </Stack>
        </Box>

        {/* Right section displaying the selected review */}
        <Box
    w={{ base: '100%', md: '58%', lg: '60%' }}
    mx={{ base: 'auto', md: '0', lg: '0' }}
  >
          {selectedReview ? (
            <Flex direction="column" align="flex-start">
              <Flex align="center" mt={2} justifyContent={{ base: "center", md: "flex-start" }} w="full">
                {Array(selectedReview.rating).fill(null).map((_, index) => (
                  <Icon as={HiStar} fontSize={{ base: "18px", lg: '20px' }} key={index} color="gold" mr={1} />
                ))}
              </Flex>
              <Text lineHeight={{ lg: '24px' }} mt={3} fontSize={{ base: "xs", lg: "sm" }} fontWeight={500} color={'#4D4D4D'} textAlign={{ base: 'center', lg: 'left' }} px={{ base: 2, lg: 0 }}>
                {selectedReview.description}
              </Text>
            </Flex>
          ) : (
            <Text textAlign="center" color="gray.500">
              Select a review to display
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ReviewSection;
