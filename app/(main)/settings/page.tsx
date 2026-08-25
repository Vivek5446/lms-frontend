"use client";

import stores from "@/app/store/stores";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Switch,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Globe2,
  KeyRound,
  LogOut,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PreferenceKey =
  | "soundEffects"
  | "pushNotifications"
  | "emailDigest"
  | "courseReminders"
  | "twoFactor"
  | "publicProfile"
  | "autoDownload";

const preferenceGroups: Array<{
  title: string;
  rows: Array<{ key: PreferenceKey | "darkMode"; icon: typeof Bell; label: string; description: string }>;
}> = [
  {
    title: "Appearance",
    rows: [
      { key: "darkMode", icon: Moon, label: "Dark mode", description: "Comfortable viewing at night" },
      { key: "soundEffects", icon: Volume2, label: "Sound effects", description: "Subtle audio feedback" },
    ],
  },
  {
    title: "Notifications",
    rows: [
      { key: "pushNotifications", icon: Bell, label: "Push notifications", description: "Course and team alerts" },
      { key: "emailDigest", icon: Mail, label: "Weekly email digest", description: "Your progress summary" },
      { key: "courseReminders", icon: Sparkles, label: "Course reminders", description: "Nudges to keep your streak" },
    ],
  },
  {
    title: "Privacy & security",
    rows: [
      { key: "twoFactor", icon: ShieldCheck, label: "Two-factor authentication", description: "Extra protection when signing in" },
      { key: "publicProfile", icon: Eye, label: "Public profile", description: "Visible to your organisation" },
    ],
  },
  {
    title: "Downloads",
    rows: [
      { key: "autoDownload", icon: Download, label: "Auto-download certificates", description: "Save PDFs after course completion" },
    ],
  },
];

const SettingsPage = observer(() => {
  const router = useRouter();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const user = stores.auth.user;
  const [preferences, setPreferences] = useState<Record<PreferenceKey, boolean>>({
    soundEffects: true,
    pushNotifications: true,
    emailDigest: true,
    courseReminders: true,
    twoFactor: false,
    publicProfile: false,
    autoDownload: false,
  });

  const pageBg = useColorModeValue("white", "gray.950");
  const cardBg = useColorModeValue("white", "gray.800");
  const mutedBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const headingColor = useColorModeValue("gray.900", "gray.50");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const fullName = String(user?.name || "Learner");
  const email = String(user?.username || "");

  const togglePreference = (key: PreferenceKey) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  const showPlaceholder = (title: string) => {
    toast({ title, description: "This setting will be connected to your account provider soon.", status: "info", duration: 2600 });
  };

  const handleLogout = () => {
    stores.auth.logout();
    router.push("/login");
  };

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 4, sm: 6 }} py={{ base: 3, md: 8 }}>
      <Box maxW="760px" mx="auto" pb={{ base: 12, md: 16 }}>
        <Grid position={{ base: "sticky", md: "static" }} top={0} zIndex={20} templateColumns="40px minmax(0,1fr) 40px" alignItems="center" gap={3} py={3} mb={{ base: 3, md: 7 }} bg={isDark ? "rgba(23,25,35,.88)" : "rgba(255,255,255,.88)"} backdropFilter="blur(16px)">
          <Link href="/user-profile" aria-label="Back to profile">
            <Flex as="span" w={10} h={10} align="center" justify="center" borderRadius="full" border="1px solid" borderColor={borderColor} bg={cardBg}>
              <ChevronLeft size={18} />
            </Flex>
          </Link>
          <Text textAlign="center" fontSize={{ base: "md", md: "2xl" }} fontWeight="900" color={headingColor}>Settings</Text>
          <Box />
        </Grid>

        <Grid templateColumns="minmax(0,1fr) auto" gap={4} alignItems="center" p={{ base: 4, md: 6 }} mb={5} borderRadius="3xl" bg="brand.500" color="white" boxShadow={isDark ? "none" : "0 14px 32px rgba(15,23,42,.12)"}>
          <Flex align="center" gap={3} minW={0}>
            <Avatar name={fullName} src={String(user?.pic?.url || "")} size={{ base: "sm", md: "md" }} bg="whiteAlpha.300" />
            <Box minW={0}>
              <Text fontSize="9px" fontWeight="800" textTransform="uppercase" letterSpacing=".1em" opacity={0.7}>Signed in as</Text>
              <Text noOfLines={1} mt={1} fontSize={{ base: "sm", md: "lg" }} fontWeight="900">{fullName}</Text>
              <Text noOfLines={1} fontSize="xs" opacity={0.72}>{email}</Text>
            </Box>
          </Flex>
          <Button size="sm" variant="outline" borderColor="whiteAlpha.400" color="white" borderRadius="xl" _hover={{ bg: "whiteAlpha.200" }} onClick={() => router.push("/user-profile")}>View profile</Button>
        </Grid>

        <VStack spacing={4} align="stretch">
          {preferenceGroups.map((group) => (
            <Box key={group.title} border="1px solid" borderColor={borderColor} borderRadius="3xl" bg={cardBg} p={{ base: 2, md: 3 }} boxShadow={isDark ? "none" : "0 6px 20px rgba(15,23,42,.04)"}>
              <Text px={3} pt={2} pb={1} fontSize="10px" fontWeight="800" color={mutedColor} textTransform="uppercase" letterSpacing=".08em">{group.title}</Text>
              <VStack spacing={0} align="stretch" divider={<Box borderTop="1px solid" borderColor={borderColor} />}>
                {group.rows.map((row) => {
                  const checked = row.key === "darkMode" ? isDark : preferences[row.key];
                  const onChange = row.key === "darkMode" ? toggleColorMode : () => togglePreference(row.key as PreferenceKey);
                  return (
                    <Grid key={row.key} templateColumns="auto minmax(0,1fr) auto" alignItems="center" gap={3.5} p={3}>
                      <Flex w={10} h={10} align="center" justify="center" borderRadius="xl" bg={mutedBg} color={mutedColor}><row.icon size={17} /></Flex>
                      <Box minW={0}><Text noOfLines={1} fontSize="sm" fontWeight="800" color={headingColor}>{row.label}</Text><Text noOfLines={1} fontSize="11px" color={mutedColor}>{row.description}</Text></Box>
                      <Switch aria-label={row.label} isChecked={checked} onChange={onChange} colorScheme="brand" />
                    </Grid>
                  );
                })}
              </VStack>
            </Box>
          ))}

          <Box border="1px solid" borderColor={borderColor} borderRadius="3xl" bg={cardBg} p={{ base: 2, md: 3 }}>
            <Text px={3} pt={2} pb={1} fontSize="10px" fontWeight="800" color={mutedColor} textTransform="uppercase" letterSpacing=".08em">Account</Text>
            {[
              { icon: KeyRound, title: "Change password", description: "Managed by your account provider" },
              { icon: Globe2, title: "Language", description: "English" },
            ].map((item) => (
              <Grid as="button" type="button" key={item.title} onClick={() => showPlaceholder(item.title)} w="full" templateColumns="auto minmax(0,1fr) auto" alignItems="center" gap={3.5} p={3} textAlign="left" borderTop="1px solid" borderColor={borderColor}>
                <Flex w={10} h={10} align="center" justify="center" borderRadius="xl" bg={mutedBg} color={mutedColor}><item.icon size={17} /></Flex>
                <Box minW={0}><Text noOfLines={1} fontSize="sm" fontWeight="800" color={headingColor}>{item.title}</Text><Text noOfLines={1} fontSize="11px" color={mutedColor}>{item.description}</Text></Box>
                <ChevronRight size={15} color={isDark ? "#718096" : "#A0AEC0"} />
              </Grid>
            ))}
          </Box>

          <Button onClick={handleLogout} size="lg" variant="outline" colorScheme="red" borderRadius="2xl" leftIcon={<LogOut size={17} />}>Log out</Button>
          <Button onClick={() => showPlaceholder("Delete account")} size="lg" variant="ghost" colorScheme="red" borderRadius="2xl" leftIcon={<Trash2 size={17} />}>Delete account</Button>
          <Text textAlign="center" fontSize="10px" fontWeight="600" color={mutedColor}>LMS · Account settings</Text>
        </VStack>
      </Box>
    </Box>
  );
});

export default SettingsPage;
