import React, { useState, useRef } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  Button,
  useToast,
  Box,
  Textarea,
  Image as ChakraImage,
  VStack,
  Text,
  HStack,
  IconButton,
  Flex,
  useColorModeValue,
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlus, FiEye } from 'react-icons/fi';
import { NewsPost } from './NewsPost';
import { newsStore } from '../../../store/newsStore/newsStore';
import { authStore } from '../../../store/authStore/authStore';
import { observer } from 'mobx-react-lite';
import axios from 'axios';
import dynamic from 'next/dynamic';
// @ts-ignore
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill: any = dynamic(() => import('react-quill-new').then((mod: any) => mod.default || mod), { 
  ssr: false,
  loading: () => <Box p={4} minH="150px">Loading editor...</Box>
});

export const CreateNewsModal = observer(({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
  const [content, setContent] = useState('');
  const [fontStyle, setFontStyle] = useState('standard');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isOrgOnly, setIsOrgOnly] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drawerBg      = useColorModeValue("#FFFFFA", "gray.900");
  const inputBg       = useColorModeValue("white", "gray.700");
  const inputBorder   = useColorModeValue("gray.300", "gray.600");
  const inputColor    = useColorModeValue("gray.800", "white");
  const placeholderC  = useColorModeValue("gray.500", "gray.500");
  const labelColor    = useColorModeValue("gray.600", "gray.400");
  const headingColor  = useColorModeValue("gray.900", "white");
  const subColor      = useColorModeValue("gray.600", "gray.400");
  const borderColor   = useColorModeValue("gray.200", "gray.700");
  const iconBg        = useColorModeValue("gray.100", "gray.700");
  const cardBg        = useColorModeValue("white", "gray.800");
  const footerBg      = useColorModeValue(
    "linear-gradient(to top, #FFFFFA 70%, transparent)",
    "linear-gradient(to top, #1a202c 70%, transparent)"
  );

  const hasCompany = !!authStore.user?.company || !!authStore.company;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      toast({ title: "Error", description: "Content cannot be empty", status: "error" });
      return;
    }
    
    setIsPosting(true);
    try {
      let imageUrl = "";
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const reader = new FileReader();
        
        const base64String = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const imageData = {
          file: {
            filename: file.name,
            type: file.type,
            buffer: base64String,
          },
        };
        const uploadRes = await axios.post("/file/upload", imageData);
        if (uploadRes.data?.data) {
          imageUrl = uploadRes.data.data;
        }
      }

      const payload: any = { 
        content: fontStyle !== 'standard' ? `${content}[STYLE]${fontStyle}` : content, 
        isOrgOnly 
      };
      if (imageUrl) {
        payload.image_urls = [imageUrl];
      }
      if (isOrgOnly) {
        payload.company = authStore.user?.company || authStore.company;
      }

      const res = await newsStore.createPost(payload);
      
      if (res.success) {
        toast({ title: "Success", description: "News pinned to the board!", status: "success" });
        onOpenChange(false);
        setContent('');
        setImagePreview(null);
        setIsOrgOnly(false);
      } else {
        toast({ title: "Error", description: res.message, status: "error" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to post", status: "error" });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
    <Drawer placement="bottom" onClose={() => onOpenChange(false)} isOpen={open} size="full">
      <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <DrawerContent h="100vh" bg={drawerBg} color={inputColor} borderTopRadius="none">
        
        {/* ── Full Width Sticky Header ── */}
        <Box
          w="100%"
          px={{ base: 5, md: 8 }}
          py={{ base: 4, md: 5 }}
          bg={drawerBg}
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
              onClick={() => onOpenChange(false)}
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
            <Box>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                <Box as="span" color={headingColor}>CREATE </Box>
                <Box as="span" bgGradient={useColorModeValue("linear(to-r, brand.500, brand.700)", "linear(to-r, brand.300, brand.500)")} bgClip="text">
                  NEWS
                </Box>
              </Text>
              <Text fontSize="10px" color={subColor} fontWeight="700" letterSpacing="0.2em" mt={0.5}>
                SHARE AN UPDATE
              </Text>
            </Box>
          </HStack>
          
          <IconButton
            aria-label="Preview"
            icon={<FiEye size={18} />}
            onClick={() => setIsPreviewOpen(true)}
            variant="ghost"
            position="absolute"
            right={{ base: 5, md: 8 }}
            top="50%"
            transform="translateY(-50%)"
            borderRadius="full"
            color={useColorModeValue("brand.600", "brand.300")}
            bg={useColorModeValue("brand.50", "rgba(59, 130, 246, 0.1)")}
            _hover={{ bg: useColorModeValue("brand.100", "rgba(59, 130, 246, 0.2)") }}
          />
        </Box>

        <DrawerBody
          p={0} overflowY="auto"
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#ccc", borderRadius: "4px" },
          }}
        >
          <Box
            w="100%"
            maxW={{ base: "100%", md: "600px", lg: "680px" }}
            mx="auto"
            px={{ base: 5, md: 8 }}
            pt={{ base: 6, md: 10 }}
            pb="180px"
          >
            <VStack spacing={6} align="stretch">
              
              {/* ── Content ── */}
              <Box>
                <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb={3} gap={3}>
                  <Text fontSize="11px" fontWeight="800" color={labelColor} letterSpacing="0.15em">
                    WHAT'S HAPPENING?
                  </Text>
                  <HStack spacing={1} bg={useColorModeValue('gray.100', 'gray.800')} p={1} borderRadius="full">
                    {['standard', 'classic', 'typewriter'].map(f => {
                      const isActive = fontStyle === f;
                      return (
                        <Box
                          key={f}
                          as="button"
                          onClick={() => setFontStyle(f)}
                          px={4}
                          py={1.5}
                          borderRadius="full"
                          bg={isActive ? useColorModeValue('white', 'gray.600') : 'transparent'}
                          boxShadow={isActive ? useColorModeValue('0 2px 8px rgba(0,0,0,0.08)', '0 2px 8px rgba(0,0,0,0.4)') : 'none'}
                          color={isActive ? useColorModeValue('brand.600', 'brand.300') : useColorModeValue('gray.500', 'gray.400')}
                          fontSize="11px"
                          fontWeight={isActive ? '800' : '600'}
                          fontFamily={
                            f === 'classic' ? 'Georgia, serif' : 
                            f === 'typewriter' ? 'monospace' : 'inherit'
                          }
                          textTransform="capitalize"
                          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                          _hover={!isActive ? { color: useColorModeValue('gray.700', 'gray.200') } : {}}
                        >
                          {f}
                        </Box>
                      );
                    })}
                  </HStack>
                </Flex>
                <Box
                  bg={inputBg} border="1px solid" borderColor={inputBorder}
                  borderRadius="xl" color={inputColor} 
                  overflow="hidden"
                  sx={{
                    '.ql-toolbar': {
                      border: 'none',
                      borderBottom: `1px solid ${inputBorder}`,
                      bg: useColorModeValue('gray.50', 'gray.800'),
                      borderColor: inputBorder,
                      padding: '12px 16px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px'
                    },
                    '.ql-formats': {
                      display: 'flex',
                      alignItems: 'center',
                      marginRight: '12px !important'
                    },
                    '.ql-toolbar button': {
                      borderRadius: 'md',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: useColorModeValue('gray.200', 'gray.700'),
                      }
                    },
                    '.ql-toolbar button.ql-active': {
                      bg: useColorModeValue('brand.50', 'rgba(59, 130, 246, 0.15)'),
                      '.ql-stroke': { stroke: 'brand.500 !important' },
                      '.ql-fill': { fill: 'brand.500 !important' }
                    },
                    '.ql-container': {
                      border: 'none',
                      fontFamily: fontStyle === 'classic' ? 'Georgia, serif' : 
                                  fontStyle === 'typewriter' ? 'monospace' : 'inherit',
                      fontSize: '15px',
                      minH: '160px'
                    },
                    '.ql-editor': {
                      minH: '160px',
                      padding: '16px',
                      lineHeight: '1.6'
                    },
                    '.ql-editor.ql-blank::before': {
                      color: placeholderC,
                      fontStyle: 'normal',
                      left: '16px',
                      right: '16px'
                    },
                    '.ql-stroke': {
                      stroke: inputColor,
                      transition: 'all 0.2s'
                    },
                    '.ql-fill': {
                      fill: inputColor,
                      transition: 'all 0.2s'
                    },
                    '.ql-picker': {
                      color: inputColor
                    }
                  }}
                  _focusWithin={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)", bg: cardBg }}
                  _hover={{ borderColor: useColorModeValue("gray.300", "gray.500") }}
                  transition="all 0.2s"
                >
                  {/* @ts-ignore */}
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder="Share an update with your organization..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                      ]
                    }}
                  />
                </Box>
              </Box>

              {/* ── Image Upload ── */}
              <Box>
                <Text fontSize="11px" fontWeight="800" color={labelColor} letterSpacing="0.15em" mb={2}>
                  ATTACH IMAGE <Box as="span" fontWeight="400" color={placeholderC}>(OPTIONAL)</Box>
                </Text>
                <Flex gap={{ base: 3, md: 5 }} align="flex-start" direction={{ base: "column", sm: "row" }}>
                  <Box
                    w={{ base: "64px", md: "76px" }} h={{ base: "64px", md: "76px" }} minW={{ base: "64px", md: "76px" }}
                    borderRadius="2xl"
                    bg={iconBg}
                    border="2px solid"
                    borderColor={imagePreview ? "brand.500" : inputBorder}
                    display="flex" alignItems="center" justifyContent="center"
                    overflow="hidden"
                    boxShadow={imagePreview ? useColorModeValue("0 0 0 4px rgba(98,105,255,0.12)", "0 0 0 4px rgba(98,105,255,0.2)") : "none"}
                  >
                    {imagePreview ? (
                      <ChakraImage src={imagePreview} w="100%" h="100%" objectFit="cover" />
                    ) : (
                      <Text fontSize={{ base: "2xl", md: "3xl" }}>📸</Text>
                    )}
                  </Box>

                  <Box flex={1} w="100%" display="flex" alignItems="center">
                    <Box
                      as="button"
                      w={{ base: "38px", md: "42px" }} h={{ base: "38px", md: "42px" }}
                      borderRadius="xl" bg={iconBg}
                      border="1px dashed" borderColor={inputBorder}
                      display="flex" alignItems="center" justifyContent="center"
                      onClick={() => fileInputRef.current?.click()}
                      _hover={{ borderColor: "brand.500", transform: "scale(1.05)" }}
                      transition="all 0.2s"
                      color={labelColor}
                    >
                      <FiPlus size={14} />
                    </Box>
                    <Text fontSize="xs" fontWeight="600" color={placeholderC} ml={3}>
                      Click to upload an image
                    </Text>
                  </Box>
                </Flex>
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" style={{ display: "none" }} />
              </Box>

              {/* ── Visibility Toggle ── */}
              {hasCompany && (
                <Box pt={2}>
                  <FormControl display="flex" alignItems="center" justifyContent="space-between" bg="transparent" p={4} borderRadius="xl" border="1px solid" borderColor={inputBorder}>
                    <Box>
                      <FormLabel htmlFor="org-only" mb="0" fontSize="13px" fontWeight="800" color={inputColor} letterSpacing="0.05em">
                        POST TO ORGANIZATION ONLY
                      </FormLabel>
                      <Text fontSize="11px" color={placeholderC} mt={1}>
                        If enabled, only members of your organization will see this post.
                      </Text>
                    </Box>
                    <Switch id="org-only" colorScheme="brand" isChecked={isOrgOnly} onChange={(e) => setIsOrgOnly(e.target.checked)} />
                  </FormControl>
                </Box>
              )}

            </VStack>
          </Box>
        </DrawerBody>

        {/* ── Sticky CTA ── */}
        <Box
          position="absolute" bottom={0} left={0} right={0}
          bg={footerBg}
          px={{ base: 5, md: 8 }} pb={{ base: "64px", md: 8 }} pt={8}
        >
          <Box maxW={{ base: "100%", md: "600px", lg: "680px" }} mx="auto">
            <Button
              w="full" h={{ base: "52px", md: "56px" }}
              borderRadius="xl"
              colorScheme="brand"
              fontSize={{ base: "sm", md: "md" }} fontWeight="900" letterSpacing="0.1em"
              onClick={handlePost}
              isLoading={isPosting}
              isDisabled={!content.trim()}
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(98,105,255,0.4)" }}
              _active={{ transform: "translateY(0)" }}
              _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
              transition="all 0.2s"
            >
              POST NEWS
            </Button>
          </Box>
        </Box>
      </DrawerContent>
    </Drawer>

    {/* ── Live Preview Drawer ── */}
    <Drawer placement="bottom" onClose={() => setIsPreviewOpen(false)} isOpen={isPreviewOpen} size="full">
      <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <DrawerContent h="100vh" bg={drawerBg} color={inputColor} borderTopRadius="none">
        
        {/* Preview Header */}
        <Box
          w="100%"
          px={{ base: 5, md: 8 }}
          py={{ base: 4, md: 5 }}
          bg={drawerBg}
          borderBottom="1px solid"
          borderColor={borderColor}
          position="sticky"
          top={0}
          zIndex={20}
        >
          <HStack spacing={4} align="center">
            <IconButton
              aria-label="Close Preview"
              icon={<FiArrowLeft size={17} />}
              onClick={() => setIsPreviewOpen(false)}
              variant="solid"
              borderRadius="full"
              w={{ base: "36px", md: "42px" }} h={{ base: "36px", md: "42px" }}
              bg={useColorModeValue("gray.100", "gray.750")}
              color={useColorModeValue("gray.700", "gray.200")}
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.600")}
              boxShadow="sm"
            />
            <Box>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                <Box as="span" color={headingColor}>LIVE </Box>
                <Box as="span" bgGradient={useColorModeValue("linear(to-r, brand.500, brand.700)", "linear(to-r, brand.300, brand.500)")} bgClip="text">
                  PREVIEW
                </Box>
              </Text>
            </Box>
          </HStack>
        </Box>

        <DrawerBody
          p={{ base: 4, md: 8 }} overflowY="auto"
          bg={useColorModeValue("gray.50", "gray.900")}
        >
          <Box maxW="600px" mx="auto">
              <NewsPost 
                post={{
                  _id: 'preview',
                  content: fontStyle !== 'standard' ? `${content}[STYLE]${fontStyle}` : content,
                  image_urls: imagePreview ? [imagePreview] : [],
                  user: authStore.user,
                  likes: [],
                  reactions: [],
                  createdAt: new Date().toISOString()
                }} 
                onLike={() => {}}
                onComment={() => {}}
                isMine={true}
              />
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
    </>
  );
});
