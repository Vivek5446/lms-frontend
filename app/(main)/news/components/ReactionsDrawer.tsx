import React, { useEffect, useState, useRef } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  Text,
  Avatar,
  HStack,
  VStack,
  Button,
  useColorModeValue,
  Center,
  SkeletonCircle,
  Skeleton,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { observer } from 'mobx-react-lite';
import { newsStore } from '../../../store/newsStore/newsStore';
import { REACTIONS } from './NewsPost';

export const ReactionsDrawer = observer(({
  isOpen,
  onClose,
  postId,
  reactionCounts
}: {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  reactionCounts: Record<string, number>;
}) => {
  const [reactions, setReactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('All');
  
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const tabs = [
    { type: 'All', count: Object.values(reactionCounts).reduce((a, b) => a + b, 0) },
    ...Object.entries(reactionCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([type, count]) => ({ type, count }))
  ];

  useEffect(() => {
    if (!isOpen || !postId) {
      setReactions([]);
      setPage(1);
      setHasMore(false);
      setActiveTab('All');
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      const result = await newsStore.fetchReactions(postId, 1, activeTab);
      if (cancelled) return;
      setReactions(result.data);
      setHasMore(result.pagination.hasMore);
      setPage(1);
      setLoading(false);
    };

    fetch();
    return () => { cancelled = true; };
  }, [isOpen, postId, activeTab]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    const result = await newsStore.fetchReactions(postId, nextPage, activeTab);
    setReactions(prev => [...prev, ...result.data]);
    setHasMore(result.pagination.hasMore);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={{ base: "full", md: "md" }}>
      <DrawerOverlay />
      <DrawerContent bg={bg}>
        <DrawerCloseButton display="none" />

        {/* ── Premium Header ── */}
        <Box
          w="100%"
          px={{ base: 5, md: 8 }}
          py={{ base: 4, md: 5 }}
          bg={bg}
          position="sticky"
          top={0}
          zIndex={20}
        >
          <HStack spacing={4} align="center">
            <IconButton
              aria-label="Close"
              icon={<FiArrowLeft size={17} />}
              onClick={onClose}
              variant="solid"
              borderRadius="full"
              w={{ base: "36px", md: "42px" }} h={{ base: "36px", md: "42px" }}
              bg={useColorModeValue("gray.100", "gray.750")}
              color={useColorModeValue("gray.700", "gray.200")}
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.600")}
              boxShadow="sm"
              _hover={{ bg: useColorModeValue("gray.200", "gray.700"), transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.95)" }}
              transition="all 0.2s"
              flexShrink={0}
            />
            <Box flex={1}>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                <Box as="span" color={useColorModeValue("gray.900", "white")}>REACTIONS </Box>
                <Box as="span" bgGradient={useColorModeValue("linear(to-r, brand.500, brand.700)", "linear(to-r, brand.300, brand.500)")} bgClip="text">
                  ({tabs[0]?.count || 0})
                </Box>
              </Text>
              <Text fontSize="10px" color={useColorModeValue("gray.600", "gray.400")} fontWeight="700" letterSpacing="0.2em" mt={0.5}>
                SEE WHO REACTED
              </Text>
            </Box>
          </HStack>

          {/* ── Tabs ── */}
          <HStack mt={5} spacing={6} overflowX="auto" sx={{ '&::-webkit-scrollbar': { display: 'none' } }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.type;
              const isAll = tab.type === 'All';
              const reactionInfo = !isAll ? REACTIONS[tab.type as keyof typeof REACTIONS] : null;

              return (
                <Box
                  key={tab.type}
                  cursor="pointer"
                  onClick={() => setActiveTab(tab.type)}
                  position="relative"
                  pb={2}
                >
                  <HStack spacing={1.5} opacity={isActive ? 1 : 0.6} transition="all 0.2s" _hover={{ opacity: 1 }}>
                    {!isAll && <Text fontSize="md">{reactionInfo?.icon}</Text>}
                    <Text fontWeight={isActive ? "700" : "600"} fontSize="14px" color={isActive ? (isAll ? 'brand.500' : reactionInfo?.color) : useColorModeValue('gray.600', 'gray.400')}>
                      {isAll ? 'All' : ''} {tab.count}
                    </Text>
                  </HStack>
                  {isActive && (
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      height="3px"
                      borderRadius="t-md"
                      bg={isAll ? 'brand.500' : reactionInfo?.color}
                    />
                  )}
                </Box>
              );
            })}
          </HStack>
        </Box>
        <Divider borderColor={borderColor} />

        <DrawerBody p={0} pb={8}>
          {loading ? (
            <VStack align="stretch" spacing={0} pt={2}>
              {[1, 2, 3, 4, 5].map(i => (
                <HStack key={i} p={4} spacing={3} borderBottomWidth="1px" borderColor={borderColor}>
                  <SkeletonCircle size="12" flexShrink={0} />
                  <Box flex={1}>
                    <Skeleton height="14px" mb={2} maxW="150px" borderRadius="full" />
                    <Skeleton height="12px" maxW="200px" borderRadius="full" />
                  </Box>
                </HStack>
              ))}
            </VStack>
          ) : reactions.length === 0 ? (
            <Center h="200px">
              <Text color={useColorModeValue('gray.500', 'gray.400')} fontWeight="600">
                No reactions yet.
              </Text>
            </Center>
          ) : (
            <VStack align="stretch" spacing={0}>
              {reactions.map((reaction: any) => {
                const user = reaction.user;
                const reactionType = reaction.reactionType;
                const reactionInfo = REACTIONS[reactionType as keyof typeof REACTIONS];
                const avatar = user?.pic?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?._id}`;
                const displayName = user?.name || user?.username || 'User';

                return (
                  <HStack 
                    key={reaction._id} 
                    p={4} 
                    spacing={3} 
                    borderBottomWidth="1px" 
                    borderColor={borderColor}
                    _hover={{ bg: hoverBg }}
                    transition="background 0.2s"
                  >
                    <Box position="relative">
                      <Avatar src={avatar} name={displayName} size="md" />
                      <Box
                        position="absolute"
                        bottom="-2px"
                        right="-2px"
                        bg={useColorModeValue('white', 'gray.800')}
                        borderRadius="full"
                        p="1px"
                        boxShadow="sm"
                      >
                        <Text fontSize="12px">{reactionInfo?.icon || '👍'}</Text>
                      </Box>
                    </Box>
                    <Box flex={1} overflow="hidden">
                      <Text fontWeight="bold" fontSize="14px" color={useColorModeValue('gray.900', 'white')} isTruncated>
                        {displayName}
                      </Text>
                      {/* Placeholder until headline available */}
                      <Text fontSize="12px" color={useColorModeValue('gray.500', 'gray.400')} isTruncated>
                         Employee
                      </Text>
                    </Box>
                  </HStack>
                );
              })}
              
              {hasMore && (
                <Box p={4}>
                  <Button
                    variant="outline"
                    size="sm"
                    w="full"
                    color={useColorModeValue('gray.700', 'gray.300')}
                    fontWeight="600"
                    isLoading={isLoadingMore}
                    onClick={loadMore}
                    borderRadius="full"
                  >
                    Load more
                  </Button>
                </Box>
              )}
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});
