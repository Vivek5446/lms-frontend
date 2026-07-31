import React, { useMemo, useState } from 'react';
import { Box, Flex, Avatar, Text, Image, IconButton, HStack, useColorModeValue, Icon, Button, Divider, Collapse, Popover, PopoverTrigger, PopoverContent, Tooltip } from '@chakra-ui/react';
import { FiThumbsUp, FiMessageSquare, FiMoreHorizontal, FiShare2, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { CommentsDrawer } from './CommentsDrawer';
import { ReactionsDrawer } from './ReactionsDrawer';
import { authStore } from '../../../store/authStore/authStore';

export const REACTIONS = {
  like: { icon: '👍', label: 'Like', color: '#0a66c2' },
  celebrate: { icon: '👏', color: 'green.500', label: 'Celebrate' },
  support: { icon: '🤝', color: 'purple.500', label: 'Support' },
  love: { icon: '❤️', color: 'red.500', label: 'Love' },
  insightful: { icon: '💡', color: 'orange.500', label: 'Insightful' },
  funny: { icon: '😂', color: 'yellow.500', label: 'Funny' },
};

export const NewsPost = observer(({
  post,
  onLike,
  onComment,
  isMine,
  onDelete
}: {
  post: any;
  onLike: (type?: string) => void;
  onComment: () => void;
  isMine: boolean;
  onDelete?: () => void;
}) => {
  const bg = useColorModeValue('white', '#1b1f23');
  const borderColor = useColorModeValue('#e5e5e5', '#38444d');
  const textColor = useColorModeValue('gray.900', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isReactionsOpen, setIsReactionsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hoverTimeout = React.useRef<any>(null);
  const touchTimer = React.useRef<any>(null);
  
  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsMenuOpen(true);
  };
  
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 400); // Increased timeout to prevent the popup from disappearing too quickly
  };
  
  const handleTouchStart = () => {
    touchTimer.current = setTimeout(() => {
      setIsMenuOpen(true);
    }, 350); // 350ms long press on mobile
  };
  
  const handleTouchEnd = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
  };

  const displayName = post.user?.name || post.user?.username || 'User';
  const avatar = post.user?.pic?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?._id}`;
  const dateStr = format(new Date(post.createdAt || Date.now()), 'MMM d, yyyy');

  const { text, isLong, fontStyle } = useMemo(() => {
    const fullContent = post.content || '';
    const parts = fullContent.split('[STYLE]');
    const contentText = parts.length < 2 ? fullContent : parts[0].trim();
    const style = parts.length >= 2 ? parts[1].trim() : 'standard';
    
    const isTextLong = contentText.length > 300;
    
    return { text: contentText, isLong: isTextLong, fontStyle: style };
  }, [post.content]);

  const currentUserReaction = useMemo(() => {
    const userId = authStore.user?._id;
    if (!userId) return null;
    
    if (post.userReaction) return post.userReaction;

    // Fallback for newly created posts before reload, or legacy
    if (post.reactions && post.reactions.length > 0) {
      const r = post.reactions.find((r: any) => r.user === userId || r.user?._id === userId);
      if (r) return r.reactionType;
    }
    
    if (post.likes && post.likes.some((l: any) => l === userId || l?._id === userId)) {
      return 'like';
    }
    return null;
  }, [post.userReaction, post.reactions, post.likes, authStore.user]);

  const reactionSummary = useMemo(() => {
    let total = 0;
    const typeCounts: Record<string, number> = {};

    // 1. Use scalable reactionCounts if available
    if (post.reactionCounts && Object.keys(post.reactionCounts).length > 0) {
      Object.entries(post.reactionCounts).forEach(([type, count]) => {
        typeCounts[type] = Number(count);
        total += Number(count);
      });
    } else {
      // 2. Fallback to legacy arrays (for UI immediate updates or old posts without migration)
      if (post.reactions && post.reactions.length > 0) {
        total += post.reactions.length;
        post.reactions.forEach((r: any) => {
          typeCounts[r.reactionType] = (typeCounts[r.reactionType] || 0) + 1;
        });
      }
      if (post.likes && post.likes.length > 0) {
        total += post.likes.length;
        typeCounts['like'] = (typeCounts['like'] || 0) + post.likes.length;
      }
    }
    
    if (total === 0) return null;
    
    const topTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => REACTIONS[type as keyof typeof REACTIONS]?.icon || '👍');
      
    return `${topTypes.join('')} ${total}`;
  }, [post.reactionCounts, post.reactions, post.likes]);

  return (
    <Box 
      bg={bg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="md" 
      overflow="hidden" 
      mb={3}
    >
      <Flex px={4} py={3} align="flex-start" justify="space-between">
        <HStack spacing={3}>
          <Avatar 
            src={avatar} 
            name={displayName} 
            size="md" 
            borderRadius="full"
          />
          <Box>
            <Text 
              fontWeight="bold" 
              fontSize="14px" 
              color={textColor}
              lineHeight="1.2"
            >
              {displayName}
            </Text>
            <Text fontSize="12px" color={subtextColor} mt={0.5}>{dateStr} • 🌐</Text>
          </Box>
        </HStack>
        <HStack>
          {isMine && onDelete && (
            <IconButton
              aria-label="Delete post"
              icon={<FiTrash2 />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              color={subtextColor}
              borderRadius="full"
              onClick={onDelete}
              _hover={{ bg: hoverBg }}
            />
          )}
          <IconButton
            aria-label="More options"
            icon={<FiMoreHorizontal />}
            size="sm"
            variant="ghost"
            color={subtextColor}
            borderRadius="full"
            _hover={{ bg: hoverBg }}
          />
        </HStack>
      </Flex>
      
      <Box px={4} pb={post.image_urls && post.image_urls.length > 0 ? 3 : 4}>
        <Collapse startingHeight={isLong ? 63 : undefined} in={isExpanded || !isLong}>
          <Box 
            fontSize="14px" 
            color={textColor} 
            lineHeight="1.5"
            wordBreak="break-word"
            fontFamily={
              fontStyle === 'classic' ? 'Georgia, serif' : 
              fontStyle === 'typewriter' ? 'monospace' : 'inherit'
            }
            sx={{
              '*': {
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap !important',
                maxWidth: '100%'
              },
              'p': { mb: 2 },
              'a': { color: '#0a66c2', textDecoration: 'underline', fontWeight: '600' },
              'ul': { paddingLeft: 5, mb: 2, listStyleType: 'disc' },
              'ol': { paddingLeft: 5, mb: 2, listStyleType: 'decimal' }
            }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </Collapse>
        {isLong && (
          <Button
            variant="unstyled"
            size="sm"
            color={subtextColor}
            fontWeight="600"
            height="auto"
            minW="auto"
            onClick={() => setIsExpanded(!isExpanded)}
            _hover={{ color: textColor, textDecoration: 'underline' }}
            mt={1}
          >
            {isExpanded ? '...see less' : '...see more'}
          </Button>
        )}
      </Box>

      {post.image_urls && post.image_urls.length > 0 && (
        <Box 
          w="full" 
          position="relative" 
          bg={useColorModeValue('gray.100', 'black')}
          borderTopWidth="1px" 
          borderBottomWidth="1px" 
          borderColor={borderColor}
        >
          <Image 
            src={post.image_urls[0]} 
            alt="Post image" 
            objectFit="contain" 
            w="full" 
            maxH="600px"
            onDoubleClick={() => onLike('like')}
          />
        </Box>
      )}

      {/* Social Counts */}
      <Flex px={4} py={2} justify="space-between" align="center">
        <Text 
          fontSize="12px" 
          color={subtextColor}
          cursor={reactionSummary ? "pointer" : "default"}
          _hover={reactionSummary ? { textDecoration: 'underline' } : undefined}
          onClick={() => {
            if (reactionSummary) setIsReactionsOpen(true);
          }}
        >
          {reactionSummary || ''}
        </Text>
        <Text fontSize="12px" color={subtextColor} _hover={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setIsCommentsOpen(true)}>
          {post.commentCount > 0 ? `${post.commentCount} comments` : ''}
        </Text>
      </Flex>

      <Divider borderColor={borderColor} />

      {/* Action Buttons */}
      <Flex px={3} py={2} justify="space-between" align="center" gap={3}>
        
        <Popover isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} placement="top-start" openDelay={0} closeOnBlur={true}>
          <PopoverTrigger>
            <Box flex={1}>
                <Button 
                  flex={1}
                  px={1}
                  variant="ghost" 
                  height="36px"
                  w="full"
                  borderRadius="md"
                  color={currentUserReaction ? REACTIONS[currentUserReaction as keyof typeof REACTIONS]?.color : subtextColor}
                  leftIcon={
                    currentUserReaction && currentUserReaction !== 'like' ? (
                      <Text fontSize="xl">{REACTIONS[currentUserReaction as keyof typeof REACTIONS]?.icon}</Text>
                    ) : (
                      <Icon as={FiThumbsUp} fill={currentUserReaction ? 'currentColor' : 'none'} fontSize="lg" />
                    )
                  }
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => {
                    // Do not call onLike here. We only want it to trigger from the popover icons.
                    if (!isMenuOpen) {
                      setIsMenuOpen(true);
                    }
                  }}
                  _hover={{ bg: hoverBg }}
                  _active={{ transform: 'scale(0.95)', bg: 'transparent' }}
                  transition="all 0.2s"
                >
                  <Text fontWeight="600" fontSize="13px">
                    {currentUserReaction ? REACTIONS[currentUserReaction as keyof typeof REACTIONS]?.label : 'Like'}
                  </Text>
                </Button>
            </Box>
          </PopoverTrigger>

          <PopoverContent 
            w="auto" 
            borderRadius="full" 
            p={1.5} 
            bg={useColorModeValue('white', 'gray.800')} 
            boxShadow="0 4px 14px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)"
            border="none" 
            _focus={{ outline: "none" }}
            mb={2}
            zIndex={9999}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
                <HStack spacing={1}>
                  {Object.entries(REACTIONS).map(([key, data]) => (
                    <Tooltip key={key} label={data.label} placement="top" hasArrow bg="black" color="white" fontSize="xs">
                      <Box
                        as="button"
                        p={2}
                        borderRadius="full"
                        cursor="pointer"
                        transition="all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                        _hover={{ 
                          transform: 'scale(1.4) translateY(-5px)', 
                          bg: useColorModeValue('gray.100', 'gray.700') 
                        }}
                        onClick={(e) => {
                           e.stopPropagation();
                           setIsMenuOpen(false);
                           onLike(key);
                        }}
                      >
                        <Text fontSize="2xl" lineHeight="1" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                          {data.icon}
                        </Text>
                      </Box>
                    </Tooltip>
                  ))}
                </HStack>
              </PopoverContent>
        </Popover>

        <Divider orientation="vertical" h="20px" borderColor={borderColor} />

        <Button 
          flex={1}
          px={1}
          variant="ghost" 
          height="36px"
          borderRadius="md"
          color={subtextColor}
          leftIcon={<Icon as={FiMessageSquare} fontSize="lg" />}
          onClick={onComment}
          _hover={{ bg: hoverBg }}
          _active={{ transform: 'scale(0.95)', bg: 'transparent' }}
          transition="all 0.2s"
        >
          <Text fontWeight="600" fontSize="13px">Comment</Text>
        </Button>

        <Divider orientation="vertical" h="20px" borderColor={borderColor} />

        <Button 
          flex={1}
          px={1}
          variant="ghost" 
          height="36px"
          borderRadius="md"
          color={subtextColor}
          leftIcon={<Icon as={FiShare2} fontSize="lg" />}
          _hover={{ bg: hoverBg }}
          _active={{ transform: 'scale(0.95)', bg: 'transparent' }}
          transition="all 0.2s"
        >
          <Text fontWeight="600" fontSize="13px">Share</Text>
        </Button>
      </Flex>

      {/* Comments Drawer */}
      <CommentsDrawer 
        isOpen={isCommentsOpen} 
        onClose={() => setIsCommentsOpen(false)} 
        postId={post._id} 
      />

      {/* Reactions Drawer */}
      <ReactionsDrawer
        isOpen={isReactionsOpen}
        onClose={() => setIsReactionsOpen(false)}
        postId={post._id}
        reactionCounts={post.reactionCounts || {}}
      />
    </Box>
  );
});
