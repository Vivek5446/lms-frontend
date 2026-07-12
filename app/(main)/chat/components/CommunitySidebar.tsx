"use client";

import {
  Box, VStack, HStack, Text, Avatar, Spinner, useColorModeValue,
  IconButton, Divider, useDisclosure, Drawer, DrawerOverlay,
  DrawerContent, DrawerBody, Button, Input, Textarea, useToast,
  Image, Flex
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useRouter, useParams } from "next/navigation";
import stores from "../../../store/stores";
import { useEffect, useState, useRef } from "react";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import axios from "axios";
const CommunitySidebar = observer(() => {
  const { chatStore } = stores;
  const router = useRouter();
  const params = useParams();
  const communityId = params?.communityId as string;

  // ── Sidebar tokens ──
  const bgPanel       = useColorModeValue("white", "gray.800");
  const borderColor   = useColorModeValue("gray.200", "gray.700");

  // ── Drawer tokens ──
  const drawerBg      = useColorModeValue("#FFFFFA", "gray.900");
  const cardBg        = useColorModeValue("white", "gray.800");
  const inputBg       = useColorModeValue("white", "gray.700");
  const inputBorder   = useColorModeValue("gray.300", "gray.600");
  const inputColor    = useColorModeValue("gray.800", "white");
  const placeholderC  = useColorModeValue("gray.500", "gray.500");
  const labelColor    = useColorModeValue("gray.600", "gray.400");
  const headingColor  = useColorModeValue("gray.900", "white");
  const subColor      = useColorModeValue("gray.600", "gray.400");
  const iconBg        = useColorModeValue("gray.100", "gray.700");
  const iconSelBg     = useColorModeValue("brand.100", "rgba(98,105,255,0.15)");
  const privacyCardBg = useColorModeValue("white", "gray.700");
  const privacyCardBorder = useColorModeValue("gray.300", "gray.600");
  const catChipBg     = useColorModeValue("gray.100", "gray.700");
  const catChipBorder = useColorModeValue("gray.300", "gray.600");
  const footerBg      = useColorModeValue(
    "linear-gradient(to top, #FFFFFA 70%, transparent)",
    "linear-gradient(to top, #1a202c 70%, transparent)"
  );

  useEffect(() => {
    if (chatStore.communities.length === 0) {
      chatStore.fetchMyCommunities();
    }
  }, []);

  const handleSelectCommunity = (community: any) => {
    chatStore.setActiveCommunity(community);
    router.push(`/chat/${community._id}`);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy]       = useState("public");
  const [category, setCategory]     = useState("");
  const [icon, setIcon]             = useState("🎓");
  const [logoUrl, setLogoUrl]       = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast        = useToast();

  const handleDrawerClose = () => {
    onClose();
    chatStore.closeEditDrawer();
    setName("");
    setDescription("");
    setPrivacy("public");
    setCategory("");
    setIcon("🎓");
    setLogoUrl("");
  };

  useEffect(() => {
    if (chatStore.editingCommunity) {
      setName(chatStore.editingCommunity.name || "");
      setDescription(chatStore.editingCommunity.description || "");
      setPrivacy(chatStore.editingCommunity.privacy || "public");
      setCategory(chatStore.editingCommunity.category || "");
      setIcon(chatStore.editingCommunity.icon || "🎓");
      setLogoUrl(chatStore.editingCommunity.logo_url || "");
    }
  }, [chatStore.editingCommunity]);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const imageData = {
        file: {
          filename: file.name,
          type: file.type,
          buffer: base64String,
        },
      };
      try {
        const res = await axios.post("/file/upload", imageData);
        if (res.data?.data) { 
          setLogoUrl(res.data.data); 
          setIcon(""); 
        }
      } catch {
        toast({ title: "Image upload failed", status: "error", duration: 3000 });
      } finally { 
        setIsUploading(false); 
      }
    };
  };

  const handleSaveCommunity = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      if (chatStore.editingCommunity) {
        await chatStore.updateCommunity(chatStore.editingCommunity._id, {
          name, description, privacy,
          category: category || "General", icon, logo_url: logoUrl
        });
        toast({ title: "Community updated!", status: "success", duration: 3000 });
      } else {
        const result = await chatStore.createCommunity({
          name, description, privacy,
          category: category || "General", icon, logo_url: logoUrl
        });
        toast({ title: "Community created!", status: "success", duration: 3000 });
        router.push(`/chat/${result.data._id}`);
      }
      handleDrawerClose();
    } catch {
      toast({ title: "Error saving community", status: "error", duration: 3000 });
    } finally { setIsCreating(false); }
  };

  const emojiList = [
    { key: "grad",     emoji: "🎓" }, { key: "book",     emoji: "📚" },
    { key: "FiHeart",  emoji: "❤️" }, { key: "FiStar",   emoji: "⭐" },
    { key: "FiCoffee", emoji: "☕" }, { key: "party",    emoji: "🎉" },
    { key: "fire",     emoji: "🔥" }, { key: "rocket",   emoji: "🚀" },
    { key: "music",    emoji: "🎵" }, { key: "game",     emoji: "🎮" },
    { key: "art",      emoji: "🎨" }, { key: "sport",    emoji: "⚽" },
    { key: "food",     emoji: "🍕" }, { key: "travel",   emoji: "✈️" },
    { key: "code",     emoji: "💻" }, { key: "trophy",   emoji: "🏆" },
    { key: "idea",     emoji: "💡" }, { key: "globe",    emoji: "🌍" },
  ];

  const selectedEmoji = icon || "🎉";
  const categoryList = ["General", "Technology", "Marketing", "Social", "HR", "Design", "Finance"];

  // ─────────────────────────────────────────────
  return (
    <Box
      w={{ base: "full", md: "80px" }}
      h={{ base: "100vh", md: "calc(100vh - 64px)" }}
      bg={bgPanel} borderRight="1px solid" borderColor={borderColor}
    >
      {/* Mobile header */}
      <Box
        display={{ base: "flex", md: "none" }}
        h="64px" px={4}
        borderBottom="1px solid" borderColor={borderColor}
        alignItems="center" shadow="sm"
        justifyContent="space-between"
      >
        {/* Left: Back button + styled title */}
        <HStack spacing={3}>
          <Box
            as="button"
            onClick={() => router.push("/")}
            w="36px" h="36px"
            borderRadius="full"
            bg={useColorModeValue("gray.100", "gray.800")}
            display="flex" alignItems="center" justifyContent="center"
            _hover={{ bg: useColorModeValue("gray.200", "gray.700"), transform: "scale(1.05)" }}
            transition="all 0.2s"
            flexShrink={0}
            color={useColorModeValue("gray.800", "white")}
          >
            <FiArrowLeft size={16} />
          </Box>
          <Box>
            <Text fontSize="md" fontWeight="900" letterSpacing="tight" lineHeight="1.15">
              <Box as="span" color={useColorModeValue("gray.800", "white")}>COMMUNITY </Box>
              <Box
                as="span"
                bgGradient={useColorModeValue("linear(to-r, brand.500, brand.700)", "linear(to-r, brand.300, brand.500)")}
                bgClip="text"
              >
                CHAT
              </Box>
            </Text>
            <Text fontSize="9px" fontWeight="700" letterSpacing="0.2em"
              color={useColorModeValue("gray.400", "gray.500")} mt={0.5}
            >
              YOUR SPACES
            </Text>
          </Box>
        </HStack>

        {/* Right: create button */}
        <IconButton
          aria-label="Create Community" icon={<FiPlus size={20} />}
          onClick={onOpen} colorScheme="brand" borderRadius="full" size="sm"
          boxShadow="0 4px 14px rgba(98,105,255,0.35)"
          _hover={{ transform: "scale(1.08)" }} transition="all 0.2s"
        />
      </Box>

      {/* Community list */}
      <VStack 
        spacing={{ base: 0, md: 4 }} 
        align={{ base: "stretch", md: "center" }} 
        py={{ base: 0, md: 4 }}
        h={{ base: "calc(100vh - 64px)", md: "full" }}
        overflowY="auto"
      >
        <Box px={{ base: 0, md: 0 }} py={{ base: 0, md: 0 }} display={{ base: "none", md: "flex" }} justifyContent="center">
          <IconButton
            aria-label="Create Community" icon={<FiPlus size={24} />}
            onClick={onOpen} colorScheme="brand" borderRadius="full" size="md"
            boxShadow="0 4px 14px rgba(98,105,255,0.35)"
            _hover={{ transform: "scale(1.05)" }} transition="all 0.2s"
          />
        </Box>


        <Divider display={{ base: "none", md: "block" }} w="50%" borderColor={borderColor} />

        {chatStore.isLoading && chatStore.communities.length === 0 && (
          <Flex direction="column" align="center" justify="center" flex={1} py={20} gap={3} w="full">
            <Spinner
              thickness="3px"
              speed="0.8s"
              emptyColor={useColorModeValue("gray.100", "gray.800")}
              color="brand.500"
              size="md"
            />
            <Text fontSize="10px" fontWeight="800" color={useColorModeValue("gray.500", "gray.400")} letterSpacing="0.15em">
              LOADING SPACES
            </Text>
          </Flex>
        )}
        {chatStore.communities.map((community: any) => {
          const isActive = communityId === community._id;
          return (
            <Box key={community._id} borderBottom={{ base: "1px solid", md: "none" }} borderColor={borderColor}>
              <HStack
                onClick={() => handleSelectCommunity(community)}
                cursor="pointer"
                px={{ base: 4, md: 0 }} py={{ base: 2.5, md: 3 }}
                bg={isActive
                  ? useColorModeValue("linear-gradient(135deg,#f0f1ff 0%,#ede9fe 100%)", "linear-gradient(135deg,rgba(98,105,255,0.12) 0%,rgba(167,139,250,0.12) 100%)")
                  : "transparent"}
                _hover={{ bg: !isActive ? useColorModeValue("gray.50", "gray.750") : undefined }}
                justify={{ base: "flex-start", md: "center" }}
                spacing={{ base: 3, md: 0 }} transition="all 0.2s ease"
              >
                <Box
                  p="2px"
                  bgGradient={isActive ? "linear(to-tr, brand.400, brand.600)" : "transparent"}
                  border="2px solid"
                  borderColor={isActive ? "transparent" : useColorModeValue("gray.200", "gray.700")}
                  borderRadius="full"
                  boxShadow={isActive ? "0 4px 10px rgba(98,105,255,0.3)" : "none"}
                  transition="all 0.2s"
                >
                  {community.logo_url ? (
                    <Avatar
                      size={{ base: "md", md: "sm" }} name={community.name} src={community.logo_url}
                      border="1px solid"
                      borderColor={useColorModeValue("white", "gray.900")}
                    />
                  ) : (
                    <Flex
                      w={{ base: "44px", md: "28px" }}
                      h={{ base: "44px", md: "28px" }}
                      borderRadius="full"
                      bg={useColorModeValue("gray.50", "gray.800")}
                      align="center"
                      justify="center"
                      fontSize={{ base: "lg", md: "sm" }}
                    >
                      {community.icon || "🎉"}
                    </Flex>
                  )}
                </Box>
                <VStack display={{ base: "flex", md: "none" }} align="start" spacing={0.5} flex={1}>
                  <Text fontWeight="700" fontSize="md"
                    color={isActive ? useColorModeValue("brand.600", "brand.300") : "inherit"}
                    noOfLines={1}
                  >
                    {community.name}
                  </Text>
                  <Text fontSize="xs" fontWeight="600"
                    color={isActive ? useColorModeValue("brand.500", "brand.400") : "gray.500"}
                  >
                    {isActive ? "Currently active" : "Tap to open chat"}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          );
        })}
      </VStack>

      {/* ══════════ CREATE/EDIT COMMUNITY DRAWER ══════════ */}
      <Drawer isOpen={isOpen || chatStore.isEditDrawerOpen} placement="bottom" onClose={handleDrawerClose} size="full">
        <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <DrawerContent h="100vh" bg={drawerBg} color={inputColor} borderTopRadius="none">
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
              pb="130px"
            >

              {/* ── Header ── */}
              <HStack mb={{ base: 6, md: 10 }} spacing={4} align="center">
                <Box
                  as="button" onClick={handleDrawerClose}
                  w={{ base: "36px", md: "42px" }} h={{ base: "36px", md: "42px" }}
                  borderRadius="full"
                  bg={iconBg}
                  display="flex" alignItems="center" justifyContent="center"
                  _hover={{ bg: useColorModeValue("gray.200", "gray.600"), transform: "scale(1.05)" }}
                  transition="all 0.2s" flexShrink={0}
                  color={headingColor}
                >
                  <FiArrowLeft size={17} />
                </Box>
                <Box>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                    <Box as="span" color={headingColor}>{chatStore.editingCommunity ? "EDIT " : "CREATE "}</Box>
                    <Box as="span" bgGradient={useColorModeValue("linear(to-r, brand.500, brand.700)", "linear(to-r, brand.300, brand.500)")} bgClip="text">
                      COMMUNITY
                    </Box>
                  </Text>
                  <Text fontSize="10px" color={subColor} fontWeight="700" letterSpacing="0.2em" mt={0.5}>
                    {chatStore.editingCommunity ? "REFINE YOUR SPACE" : "BUILD YOUR TRIBE"}
                  </Text>
                </Box>
              </HStack>

              {/* ── Community Icon ── */}
              <Box mb={{ base: 6, md: 8 }}>
                <Text fontSize="11px" fontWeight="800" color={labelColor} letterSpacing="0.15em" mb={4}>
                  COMMUNITY ICON
                </Text>
                <Flex gap={{ base: 3, md: 5 }} align="flex-start" direction={{ base: "column", sm: "row" }}>
                  {/* Preview */}
                  <Box
                    w={{ base: "64px", md: "76px" }} h={{ base: "64px", md: "76px" }} minW={{ base: "64px", md: "76px" }}
                    borderRadius="2xl"
                    bg={iconBg}
                    border="2px solid"
                    borderColor="brand.500"
                    display="flex" alignItems="center" justifyContent="center"
                    overflow="hidden"
                    boxShadow={useColorModeValue("0 0 0 4px rgba(98,105,255,0.12)", "0 0 0 4px rgba(98,105,255,0.2)")}
                  >
                    {isUploading ? <Spinner color="brand.500" size="md" /> :
                      logoUrl ? <Image src={logoUrl} alt="Logo" w="100%" h="100%" objectFit="cover" /> :
                      <Text fontSize={{ base: "2xl", md: "3xl" }}>{selectedEmoji}</Text>}
                  </Box>

                  {/* Grid */}
                  <Box flex={1} w="100%">
                    <Text fontSize="10px" color={labelColor} fontWeight="700" letterSpacing="0.15em" mb={2}>POPULAR</Text>
                    <Flex flexWrap="wrap" gap={2}>
                      {/* Upload btn */}
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
                      {emojiList.map(item => (
                        <Box
                          as="button" key={item.key}
                          w={{ base: "38px", md: "42px" }} h={{ base: "38px", md: "42px" }}
                          borderRadius="xl"
                          bg={icon === item.emoji ? iconSelBg : iconBg}
                          border="2px solid"
                          borderColor={icon === item.emoji ? "brand.500" : "transparent"}
                          display="flex" alignItems="center" justifyContent="center"
                          onClick={() => { setIcon(item.emoji); setLogoUrl(""); }}
                          _hover={{ bg: useColorModeValue("gray.200", "gray.600"), transform: "scale(1.08)" }}
                          transition="all 0.15s"
                          fontSize={{ base: "md", md: "lg" }}
                        >
                          {item.emoji}
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                </Flex>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: "none" }} />
              </Box>

              {/* ── Name ── */}
              <Box mb={{ base: 5, md: 6 }}>
                <Text fontSize="11px" fontWeight="800" color={labelColor} letterSpacing="0.15em" mb={2}>
                  COMMUNITY NAME
                </Text>
                <Input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Tech Innovators"
                  bg={inputBg} border="1px solid" borderColor={inputBorder}
                  borderRadius="xl" h={{ base: "48px", md: "52px" }}
                  fontSize={{ base: "md", md: "md" }} color={inputColor} px={4}
                  _placeholder={{ color: placeholderC }}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)", bg: cardBg }}
                  _hover={{ borderColor: useColorModeValue("gray.300", "gray.500") }}
                  transition="all 0.2s"
                />
              </Box>

              {/* ── Privacy ── */}
              <Box mb={{ base: 5, md: 6 }}>
                <Text fontSize="11px" fontWeight="800" color={labelColor} letterSpacing="0.15em" mb={2}>
                  COMMUNITY PRIVACY
                </Text>
                <Flex gap={3} direction={{ base: "column", sm: "row" }}>
                  {[
                    { key: "public", emoji: "🌐", label: "PUBLIC", sub: "Anyone can join" },
                    { key: "private", emoji: "🔒", label: "PRIVATE", sub: "Request to join" },
                  ].map(opt => {
                    const isSelected = privacy === opt.key;
                    return (
                      <Box
                        as="button" key={opt.key} flex={1}
                        py={4} px={4} borderRadius="xl"
                        bg={isSelected
                          ? useColorModeValue("brand.500", "brand.600")
                          : privacyCardBg}
                        border="1px solid"
                        borderColor={isSelected ? "brand.500" : privacyCardBorder}
                        onClick={() => setPrivacy(opt.key)}
                        _hover={{
                          transform: "translateY(-1px)",
                          boxShadow: isSelected
                            ? "0 6px 20px rgba(98,105,255,0.3)"
                            : useColorModeValue("0 2px 8px rgba(0,0,0,0.08)", "0 2px 8px rgba(0,0,0,0.3)")
                        }}
                        transition="all 0.2s" textAlign="left"
                        boxShadow={isSelected ? "0 4px 14px rgba(98,105,255,0.25)" : "none"}
                      >
                        <HStack spacing={3}>
                          <Box
                            w="34px" h="34px" borderRadius="lg"
                            bg={isSelected ? "whiteAlpha.300" : useColorModeValue("gray.200", "gray.600")}
                            display="flex" alignItems="center" justifyContent="center"
                          >
                            <Text fontSize="lg">{opt.emoji}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight="800" color={isSelected ? "white" : headingColor}>{opt.label}</Text>
                            <Text fontSize="11px" color={isSelected ? "whiteAlpha.800" : subColor} fontWeight="500">{opt.sub}</Text>
                          </Box>
                        </HStack>
                      </Box>
                    );
                  })}
                </Flex>
              </Box>

              {/* ── Category ── */}
              <Box mb={{ base: 5, md: 6 }}>
                <Text fontSize="11px" fontWeight="800" color={labelColor} letterSpacing="0.15em" mb={2}>
                  COMMUNITY CATEGORY
                </Text>
                <Flex flexWrap="wrap" gap={2} mb={3}>
                  {categoryList.map(cat => {
                    const isSel = category === cat;
                    return (
                      <Box
                        as="button" key={cat}
                        px={4} py={2} borderRadius="full"
                        bg={isSel ? useColorModeValue("brand.500", "brand.600") : catChipBg}
                        border="1px solid" borderColor={isSel ? "brand.500" : catChipBorder}
                        onClick={() => setCategory(cat === category ? "" : cat)}
                        _hover={{ borderColor: "brand.400", transform: "scale(1.03)" }}
                        transition="all 0.15s"
                        boxShadow={isSel ? "0 2px 8px rgba(98,105,255,0.25)" : "none"}
                      >
                        <Text fontSize="xs" fontWeight="700" color={isSel ? "white" : inputColor}>{cat}</Text>
                      </Box>
                    );
                  })}
                </Flex>
                <Input
                  value={category} onChange={e => setCategory(e.target.value)}
                  placeholder="Or type a custom category..."
                  bg={inputBg} border="1px solid" borderColor={inputBorder}
                  borderRadius="xl" h={{ base: "42px", md: "46px" }}
                  fontSize="sm" color={inputColor} px={4}
                  _placeholder={{ color: placeholderC }}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)", bg: cardBg }}
                  _hover={{ borderColor: useColorModeValue("gray.300", "gray.500") }}
                  transition="all 0.2s"
                />
              </Box>

              {/* ── Description ── */}
              <Box mb={6}>
                <Text fontSize="11px" fontWeight="800" color={labelColor} letterSpacing="0.15em" mb={2}>
                  DESCRIPTION{" "}
                  <Box as="span" fontWeight="400" color={placeholderC}>(OPTIONAL)</Box>
                </Text>
                <Textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="What's this community about?"
                  bg={inputBg} border="1px solid" borderColor={inputBorder}
                  borderRadius="xl" color={inputColor} px={4} py={3}
                  fontSize="sm" rows={3}
                  _placeholder={{ color: placeholderC }}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)", bg: cardBg }}
                  _hover={{ borderColor: useColorModeValue("gray.300", "gray.500") }}
                  resize="none" transition="all 0.2s"
                />
              </Box>

            </Box>
          </DrawerBody>

          {/* ── Sticky CTA ── */}
          <Box
            position="absolute" bottom={0} left={0} right={0}
            bg={footerBg}
            px={{ base: 5, md: 8 }} pb={{ base: 6, md: 8 }} pt={8}
          >
            <Box maxW={{ base: "100%", md: "600px", lg: "680px" }} mx="auto">
              <Button
                w="full" h={{ base: "52px", md: "56px" }}
                borderRadius="xl"
                colorScheme="brand"
                fontSize={{ base: "sm", md: "md" }} fontWeight="900" letterSpacing="0.1em"
                onClick={handleSaveCommunity}
                isLoading={isCreating}
                isDisabled={!name.trim()}
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(98,105,255,0.4)" }}
                _active={{ transform: "translateY(0)" }}
                _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                transition="all 0.2s"
              >
                {chatStore.editingCommunity ? "SAVE CHANGES" : "CREATE COMMUNITY"}
              </Button>
            </Box>
          </Box>
        </DrawerContent>
      </Drawer>
    </Box>
  );
});

export default CommunitySidebar;
