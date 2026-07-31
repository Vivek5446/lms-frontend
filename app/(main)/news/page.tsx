'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { newsStore } from '../../store/newsStore/newsStore';
import { NewsPost } from './components/NewsPost';
import { CreateNewsModal } from './components/CreateNewsModal';
import { CommentsDrawer } from './components/CommentsDrawer';
import { Box, Button, Container, Flex, Heading, Text, VStack, useColorModeValue, Center, Icon, IconButton, Skeleton, SkeletonCircle, SkeletonText, useToast } from '@chakra-ui/react';
import { FiPlus, FiInbox, FiImage, FiFeather, FiEdit3 } from 'react-icons/fi';

import { authStore } from '../../store/authStore/authStore';

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
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const bg = useColorModeValue('#f3f2ef', 'gray.900'); // Authentic LinkedIn gray background
  const headerBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  useEffect(() => {
    newsStore.fetchPosts({ page: 1, limit: 30 });
  }, []);

  const checkAuth = (action: string) => {
    if (!authStore.user) {
      toast({
        title: "Login Required",
        description: `Please login to ${action}`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const handleLike = async (postId: string, reactionType: string = 'like') => {
    if (!checkAuth('react to posts')) return;
    await newsStore.toggleLike(postId, reactionType);
  };

  const handleComment = (postId: string) => {
    if (!checkAuth('comment on posts')) return;
    setSelectedPostId(postId);
  };

  const handleCreatePost = () => {
    if (!checkAuth('create a post')) return;
    setShowCreate(true);
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
          onClick={handleCreatePost} 
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
              <Center py={24} px={4} flexDir="column" textAlign="center" w="full">
                <Box 
                  p={8} 
                  bg={useColorModeValue('white', 'gray.800')} 
                  borderRadius="2xl" 
                  boxShadow="sm" 
                  borderWidth="1px" 
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  maxW="sm"
                  w="full"
                >
                  <Center 
                    w="80px" 
                    h="80px" 
                    bg={useColorModeValue('brand.50', 'brand.900')} 
                    color={useColorModeValue('brand.500', 'brand.300')} 
                    borderRadius="full" 
                    mx="auto"
                    mb={6}
                    boxShadow={`inset 0 0 0 1px ${useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)')}`}
                  >
                    <Icon as={FiEdit3} boxSize={8} />
                  </Center>
                  <Text fontSize="xl" fontWeight="900" color={useColorModeValue('gray.900', 'white')} mb={3} letterSpacing="tight">
                    No Posts Yet
                  </Text>
                  <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} mb={8} lineHeight="1.6">
                    The community board is waiting! Be the first to share an update, announcement, or something interesting.
                  </Text>
                  <Button
                    colorScheme="brand"
                    size="md"
                    borderRadius="full"
                    leftIcon={<FiPlus />}
                    onClick={handleCreatePost}
                    w="full"
                    boxShadow="0 4px 14px 0 rgba(0, 0, 0, 0.1)"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15)' }}
                    transition="all 0.2s"
                  >
                    Create First Post
                  </Button>
                </Box>
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
      {selectedPostId && (
        <CommentsDrawer 
          isOpen={!!selectedPostId} 
          onClose={() => setSelectedPostId(null)} 
          postId={selectedPostId} 
        />
      )}
    </Box>
  );
});

export default NewsFeed;
