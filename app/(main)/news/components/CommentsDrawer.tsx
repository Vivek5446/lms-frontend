import React, { useEffect, useState, useRef } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  Text,
  Avatar,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  Skeleton,
  SkeletonCircle,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { FiSend, FiCornerDownRight, FiTrash2, FiArrowLeft, FiMessageCircle, FiRefreshCw } from 'react-icons/fi';
import { newsStore } from '../../../store/newsStore/newsStore';
import { authStore } from '../../../store/authStore/authStore';
import { formatDistanceToNow } from 'date-fns';
import { observer } from 'mobx-react-lite';

interface Comment {
  _id: string;
  content: string;
  user: { _id: string; name: string; username: string; pic?: { url: string } };
  parentComment: string | null;
  createdAt: string;
}

const COMMENT_COLLAPSE_LIMIT = 150;

const CommentNode = ({
  comment,
  onReply,
  onDelete,
  depth = 0,
  pendingReplies = {},
}: {
  comment: Comment & { replyCount?: number };
  onReply: (parentId: string, username: string) => void;
  onDelete: (commentId: string) => void;
  depth?: number;
  pendingReplies?: Record<string, any[]>;
}) => {
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.500', 'gray.400');
  const bg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [loadedReplies, setLoadedReplies] = useState<any[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
  
  const isMine = authStore.user?._id === comment.user?._id;
  const avatar = comment.user?.pic?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?._id}`;
  const displayName = comment.user?.name || comment.user?.username || 'User';
  const isLong = comment.content.length > COMMENT_COLLAPSE_LIMIT;
  const displayText = isLong && !isTextExpanded
    ? comment.content.slice(0, COMMENT_COLLAPSE_LIMIT) + '…'
    : comment.content;

  const isDeep = depth >= 1;

  // Pending replies added instantly by the drawer (before a fetch)
  const myPendingReplies = pendingReplies[comment._id] || [];
  // Total visible replies = fetched + pending (deduplicated by _id)
  const allReplies = [
    ...loadedReplies,
    ...myPendingReplies.filter(pr => !loadedReplies.find(lr => lr._id === pr._id))
  ];
  const totalReplyCount = replyCount + myPendingReplies.filter(
    pr => !loadedReplies.find(lr => lr._id === pr._id)
  ).length;
  // Auto-expand if a new reply was just added
  const hasNewPending = myPendingReplies.length > 0;

  const handleToggleReplies = async () => {
    if (!showReplies && loadedReplies.length === 0) {
      setIsLoadingReplies(true);
      const data = await newsStore.fetchReplies(comment._id);
      setLoadedReplies(data);
      setIsLoadingReplies(false);
    }
    setShowReplies(!showReplies);
  };

  // Auto-open replies panel when a pending reply arrives
  React.useEffect(() => {
    if (myPendingReplies.length > 0 && !showReplies) {
      setShowReplies(true);
    }
  }, [myPendingReplies.length]);

  return (
    // Cap visual indentation: depth 0 = top level, depth >= 1 = all indented at same level
    <Box w="full" pl={depth >= 1 ? { base: 10, md: 12 } : 0} mt={3}>
      <Box 
        position="relative" 
        _before={depth >= 1 ? {
          content: '""',
          position: 'absolute',
          left: { base: -6, md: -8 },
          top: '20px',
          bottom: 0,
          width: '2px',
          bg: borderColor,
          borderRadius: 'full'
        } : {}}
      >
        <HStack align="flex-start" spacing={3}>
          <Avatar src={avatar} name={displayName} size={isDeep ? "xs" : "sm"} flexShrink={0} />
          <Box flex={1} bg={bg} p={isDeep ? 2.5 : 3} borderRadius="lg" position="relative">
            <HStack justify="space-between" mb={1}>
              <Text fontWeight="bold" fontSize={isDeep ? "12px" : "13px"} color={textColor}>
                {displayName}
              </Text>
              <Text fontSize="11px" color={subtextColor}>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Text>
            </HStack>
            <Text fontSize={isDeep ? "13px" : "14px"} color={textColor} whiteSpace="pre-wrap">
              {displayText}
            </Text>
            {isLong && (
              <Button
                variant="unstyled"
                size="xs"
                color={subtextColor}
                fontWeight="600"
                height="auto"
                minW="auto"
                fontSize="13px"
                onClick={() => setIsTextExpanded(!isTextExpanded)}
                _hover={{ color: textColor }}
                mt={0.5}
                display="inline"
              >
                {isTextExpanded ? '...see less' : '...see more'}
              </Button>
            )}
            
            <HStack mt={2} spacing={4}>
              <Button 
                size="xs" 
                variant="ghost" 
                color={subtextColor} 
                leftIcon={<FiCornerDownRight />}
                onClick={() => {
                  onReply(comment._id, displayName);
                }}
                h="auto" p={0}
                fontSize="12px"
                _hover={{ color: useColorModeValue('brand.500', 'brand.300') }}
              >
                Reply
              </Button>
              {isMine && (
                <IconButton
                  aria-label="Delete comment"
                  icon={<FiTrash2 size={12} />}
                  size="xs"
                  variant="ghost"
                  color="red.400"
                  onClick={() => onDelete(comment._id)}
                  h="auto" minW="auto" p={0}
                />
              )}
            </HStack>
          </Box>
        </HStack>
      </Box>

      {/* Show reply toggle for ALL depths — Instagram style flat threading */}
      {(totalReplyCount > 0 || hasNewPending) && (
        <Box>
          <Button
            variant="unstyled"
            size="xs"
            mt={2}
            ml={{ base: 10, md: 12 }}
            color={useColorModeValue('brand.600', 'brand.300')}
            fontWeight="700"
            fontSize="13px"
            h="auto"
            isLoading={isLoadingReplies}
            leftIcon={
              !isLoadingReplies ? (
                <Box
                  w="20px"
                  h="1.5px"
                  bg={useColorModeValue('brand.500', 'brand.400')}
                  mt="1px"
                />
              ) : undefined
            }
            onClick={handleToggleReplies}
            _hover={{ opacity: 0.8 }}
          >
            {showReplies
              ? 'Hide replies'
              : `View ${totalReplyCount} ${totalReplyCount === 1 ? 'reply' : 'replies'}`}
          </Button>

          {showReplies && (
            <Box>
              {allReplies.map(reply => (
                <CommentNode
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                  depth={depth >= 1 ? 1 : 1} // Always render replies at depth=1 for consistent indent
                  pendingReplies={pendingReplies}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export const CommentsDrawer = observer(({
  isOpen,
  onClose,
  postId
}: {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  // Map of parentCommentId -> newly added replies (for instant UI update without re-fetch)
  const [pendingReplies, setPendingReplies] = useState<Record<string, any[]>>({});
  
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (!isOpen || !postId) {
      setComments([]);
      setReplyingTo(null);
      setPage(1);
      setHasMore(false);
      setPendingReplies({});
      return;
    }

    // Cleanup flag: prevents double-call from React 18 StrictMode
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      const result = await newsStore.fetchComments(postId, 1);
      if (cancelled) return; // Discard if effect was cleaned up
      setComments(result.data);
      setHasMore(result.pagination.hasMore);
      setTotalComments(result.pagination.total);
      setPage(1);
      setLoading(false);
    };

    fetch();
    return () => { cancelled = true; };
  }, [isOpen, postId]);

  const loadComments = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
      setPage(1);
    } else {
      setLoading(true);
    }
    const result = await newsStore.fetchComments(postId, 1);
    setComments(result.data);
    setHasMore(result.pagination.hasMore);
    setTotalComments(result.pagination.total);
    setPage(1);
    setLoading(false);
    setIsRefreshing(false);
  };

  const loadMoreComments = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    const result = await newsStore.fetchComments(postId, nextPage);
    setComments(prev => [...prev, ...result.data]);
    setHasMore(result.pagination.hasMore);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!authStore.user) {
      toast({
        title: "Login Required",
        description: "Please login to comment on this post",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const text = inputValue.trim();
    if (!text || isSubmitting) return;

    // --- OPTIMISTIC COMMENT ---
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: any = {
      _id: tempId,
      content: text,
      user: {
        _id: authStore.user._id || authStore.user.id || 'temp-user',
        name: authStore.user.name || 'You',
        username: authStore.user.username || 'user',
        pic: authStore.user.pic ? { url: authStore.user.pic.url || authStore.user.pic } : undefined
      },
      parentComment: replyingTo?.id || null,
      createdAt: new Date().toISOString(),
      replyCount: 0
    };

    // Apply Optimistic Update Immediately
    if (replyingTo) {
      const parentId = replyingTo.id;
      setPendingReplies(prev => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), optimisticComment]
      }));
    } else {
      setComments(prev => [optimisticComment, ...prev]);
      setTotalComments(prev => prev + 1);
    }

    const cachedReplyingTo = replyingTo;
    
    // Clear Input
    setInputValue('');
    setReplyingTo(null);

    // --- BACKGROUND API CALL ---
    setIsSubmitting(true); // Still keep this so we can't spam too fast, or disable the button
    try {
      const newComment = await newsStore.addComment(postId, text, cachedReplyingTo?.id);
      if (newComment) {
        if (cachedReplyingTo) {
          const parentId = cachedReplyingTo.id;
          setPendingReplies(prev => ({
            ...prev,
            [parentId]: prev[parentId]?.map(c => c._id === tempId ? { ...newComment, replyCount: 0 } : c) || []
          }));
        } else {
          setComments(prev => prev.map(c => c._id === tempId ? { ...newComment, replyCount: 0 } : c));
        }
      } else {
        // Rollback on failure
        toast({ title: "Failed to post comment", status: "error", duration: 3000 });
        if (cachedReplyingTo) {
          const parentId = cachedReplyingTo.id;
          setPendingReplies(prev => ({
            ...prev,
            [parentId]: prev[parentId]?.filter(c => c._id !== tempId) || []
          }));
        } else {
          setComments(prev => prev.filter(c => c._id !== tempId));
          setTotalComments(prev => prev - 1);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await newsStore.deleteComment(postId, commentId);
      setComments(comments.filter(c => c._id !== commentId && c.parentComment !== commentId));
    } catch (e) {
      console.error(e);
    }
  };

  // Backend now returns ONLY top-level comments — no client-side filtering needed

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="full">
      <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <DrawerContent h="100vh" bg={bg} borderTopRadius="none">
        <DrawerCloseButton display="none" />

        {/* ── Premium Header ── */}
        <Box
          w="100%"
          px={{ base: 5, md: 8 }}
          py={{ base: 4, md: 5 }}
          bg={bg}
          borderBottom="1px solid"
          borderColor={borderColor}
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
                <Box as="span" color={useColorModeValue("gray.900", "white")}>COMMENTS </Box>
                <Box as="span" bgGradient={useColorModeValue("linear(to-r, brand.500, brand.700)", "linear(to-r, brand.300, brand.500)")} bgClip="text">
                  ({comments.length})
                </Box>
              </Text>
              <Text fontSize="10px" color={useColorModeValue("gray.600", "gray.400")} fontWeight="700" letterSpacing="0.2em" mt={0.5}>
                JOIN THE CONVERSATION
              </Text>
            </Box>
            <IconButton
              aria-label="Refresh comments"
              icon={<FiRefreshCw size={15} />}
              onClick={() => loadComments(true)}
              variant="ghost"
              borderRadius="full"
              color={useColorModeValue("gray.500", "gray.400")}
              isLoading={isRefreshing}
              _hover={{ color: useColorModeValue("brand.500", "brand.300"), bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
              transition="all 0.2s"
              ml="auto"
            />
          </HStack>
        </Box>

        <DrawerBody p={4} pb={24}>
          {loading ? (
            <VStack align="stretch" spacing={4} pt={2}>
              {[1, 2, 3].map(i => (
                <HStack key={i} align="flex-start" spacing={3}>
                  <SkeletonCircle size="9" flexShrink={0} />
                  <Box flex={1}>
                    <Skeleton height="12px" mb={2} maxW="120px" borderRadius="full" />
                    <Skeleton height="40px" borderRadius="lg" />
                  </Box>
                </HStack>
              ))}
            </VStack>
          ) : comments.length === 0 ? (
            <Center py={16} flexDir="column" gap={4}>
              <Box
                w="80px" h="80px"
                borderRadius="full"
                bg={useColorModeValue('brand.50', 'brand.900')}
                display="flex" alignItems="center" justifyContent="center"
              >
                <FiMessageCircle size={36} color={useColorModeValue('#4F46E5', '#818CF8')} />
              </Box>
              <VStack spacing={1}>
                <Text fontWeight="800" fontSize="16px" color={useColorModeValue('gray.700', 'white')}>
                  No comments yet
                </Text>
                <Text fontSize="13px" color={useColorModeValue('gray.500', 'gray.400')} textAlign="center" maxW="240px">
                  Be the first to start the conversation below!
                </Text>
              </VStack>
            </Center>
          ) : (
            <VStack align="stretch" spacing={0}>
              {comments.map(comment => (
                <CommentNode
                  key={comment._id}
                  comment={comment}
                  onReply={(id, name) => setReplyingTo({ id, name })}
                  onDelete={handleDelete}
                  pendingReplies={pendingReplies}
                />
              ))}
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  w="full"
                  mt={3}
                  color={useColorModeValue('brand.600', 'brand.300')}
                  fontWeight="700"
                  isLoading={isLoadingMore}
                  onClick={loadMoreComments}
                  _hover={{ bg: useColorModeValue('brand.50', 'whiteAlpha.100') }}
                  borderRadius="xl"
                >
                  Load more comments ({totalComments - comments.length} remaining)
                </Button>
              )}
            </VStack>
          )}
        </DrawerBody>

        <Box 
          position="absolute" 
          bottom={0} left={0} right={0} 
          bg={bg} 
          px={4}
          pt={3}
          pb={{ base: 6, md: 4 }}
          borderTopWidth="1px" 
          borderColor={borderColor}
          backdropFilter="blur(10px)"
        >
          {replyingTo && (
            <HStack
              justify="space-between"
              mb={3} px={3} py={2}
              bg={useColorModeValue('blue.50', 'rgba(99, 102, 241, 0.15)')}
              border="1px solid"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
              borderRadius="xl"
            >
              <HStack spacing={2}>
                <Box w="3px" h="16px" bg="brand.500" borderRadius="full" />
                <Text fontSize="12px" color={useColorModeValue('brand.600', 'brand.300')} fontWeight="700">
                  Replying to {replyingTo.name}
                </Text>
              </HStack>
              <IconButton
                aria-label="Cancel reply"
                icon={<Text fontSize="11px" fontWeight="bold">✕</Text>}
                size="xs"
                variant="ghost"
                color={useColorModeValue('gray.500', 'gray.400')}
                borderRadius="full"
                onClick={() => setReplyingTo(null)}
              />
            </HStack>
          )}
          <form onSubmit={handleSubmit}>
            <HStack spacing={3} align="center">
              <Avatar
                src={authStore.user?.pic?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authStore.user?._id}`}
                name={authStore.user?.name || 'Me'}
                size="sm"
                flexShrink={0}
              />
              <InputGroup flex={1}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : "Add a comment..."}
                  borderRadius="full"
                  bg={useColorModeValue('gray.100', 'whiteAlpha.100')}
                  border="none"
                  _focus={{ bg: useColorModeValue('gray.200', 'whiteAlpha.200'), boxShadow: 'none', border: '1.5px solid', borderColor: 'brand.400' }}
                  _placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
                  fontSize="14px"
                  pr="50px"
                />
                <InputRightElement w="42px">
                  <IconButton
                    aria-label="Send"
                    icon={<FiSend size={15} />}
                    type="submit"
                    size="sm"
                    borderRadius="full"
                    bgGradient={inputValue.trim() ? "linear(to-r, brand.500, brand.600)" : undefined}
                    bg={inputValue.trim() ? undefined : useColorModeValue('gray.200', 'gray.700')}
                    color={inputValue.trim() ? 'white' : useColorModeValue('gray.400', 'gray.500')}
                    isLoading={isSubmitting}
                    isDisabled={!inputValue.trim()}
                    _hover={{ transform: inputValue.trim() ? 'scale(1.1)' : 'none' }}
                    transition="all 0.2s"
                  />
                </InputRightElement>
              </InputGroup>
            </HStack>
          </form>
        </Box>
      </DrawerContent>
    </Drawer>
  );
});
