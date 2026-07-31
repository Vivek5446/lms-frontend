'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { newsStore } from '../../store/newsStore/newsStore';
import { NewsPost } from './components/NewsPost';
import { CreateNewsModal } from './components/CreateNewsModal';
import { Box, Button, Container, Flex, Heading, Text, VStack, useColorModeValue, Center, Icon, IconButton, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react';
import { FiPlus, FiInbox } from 'react-icons/fi';

const NewsSkeleton = () => {
  const bg = useColorModeValue('white', '#1b1f23');
  const borderColor = useColorModeValue('#e5e5e5', '#38444d');
  
  return (
    <Box bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="md" overflow="hidden" mb={3} p={4}>
      <Flex align="center" mb={4}>
        <SkeletonCircle size="10" />
        <Box ml={3} flex="1">
          <SkeletonText mt="1" noOfLines={2} spacing="2" skeletonHeight="2" maxW="200px" />
        </Box>
      </Flex>
      <SkeletonText mt="4" noOfLines={3} spacing="3" skeletonHeight="3" />
      <Skeleton height="200px" w="full" mt={4} borderRadius="md" />
      <Flex mt={4} justify="space-between" align="center" px={2}>
        <Skeleton height="16px" w="60px" />
        <Skeleton height="16px" w="80px" />
      </Flex>
    </Box>
  );
};

const NewsFeed = observer(() => {
  const [showCreate, setShowCreate] = useState(false);

  const bg = useColorModeValue('#f3f2ef', 'gray.900'); // Authentic LinkedIn gray background
  const headerBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    newsStore.fetchPosts({ page: 1, limit: 30 });
  }, []);

  const handleLike = async (postId: string, reactionType: string = 'like') => {
    await newsStore.toggleLike(postId, reactionType);
  };

  const handleComment = (postId: string) => {
    console.log("Comment on post:", postId);
  };

  const handleDelete = async (postId: string) => {
     console.log("Delete post:", postId);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 100;
    if (bottom && !newsStore.loading && newsStore.pagination.page < newsStore.pagination.totalPages) {
      newsStore.fetchPosts({ page: newsStore.pagination.page + 1, limit: 20 });
    }
  };

  return (
    <Box flex={1} h="full" bg={bg} position="relative" display="flex" flexDirection="column">
      <Flex 
        as="header" 
        h="60px" 
        bg={headerBg} 
        align="center" 
        justify="space-between" 
        px={4} 
        borderBottom="1px solid" 
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={20}
      >
        <Box>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
            <Box as="span" color={useColorModeValue('gray.900', 'white')}>LATEST </Box>
            <Box as="span" bgGradient={useColorModeValue("linear(to-r, brand.500, brand.700)", "linear(to-r, brand.300, brand.500)")} bgClip="text">
              NEWS
            </Box>
          </Text>
        </Box>
        <Button 
          onClick={() => setShowCreate(true)} 
          leftIcon={<FiPlus />} 
          colorScheme="brand" 
          variant="solid" 
          borderRadius="full" 
          size="sm"
        >
          New Pin
        </Button>
      </Flex>
      
      <Box flex={1} overflowY="auto" position="relative" onScroll={handleScroll}>
        <Container maxW="2xl" pt={3} pb={32} px={{ base: 3, md: 4 }}>
          <VStack spacing={2} align="stretch">
            {newsStore.loading && newsStore.posts.length === 0 ? (
              <Box opacity={0.7} animation="pulse 1.5s infinite">
                <NewsSkeleton />
                <NewsSkeleton />
                <NewsSkeleton />
              </Box>
            ) : newsStore.posts.length === 0 ? (
              <Center py={20} flexDir="column" gap={4} opacity={0.5} textAlign="center">
                <Icon as={FiInbox} boxSize={12} color="gray.400" />
                <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="gray.500">
                  The board is empty
                </Text>
              </Center>
            ) : (
              newsStore.posts.map(post => (
                <NewsPost
                  key={post._id}
                  post={post}
                  onLike={(reactionType) => handleLike(post._id, reactionType)}
                  onComment={() => handleComment(post._id)}
                  isMine={false} // Update with actual auth store check
                  onDelete={() => handleDelete(post._id)}
                />
              ))
            )}
          </VStack>
        </Container>
      </Box>
      
      <CreateNewsModal open={showCreate} onOpenChange={setShowCreate} />
    </Box>
  );
});

export default NewsFeed;
