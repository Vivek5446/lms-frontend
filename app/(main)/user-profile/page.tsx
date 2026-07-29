"use client";

import React, { useEffect, useState } from "react";
import stores from "@/app/store/stores";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Award,
  Bookmark,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
  Moon,
  Sun,
  Edit2,
  Play,
  BookOpen,
  ShieldCheck,
  FileText,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
  Sparkles,
  Download,
} from "lucide-react";
import { FiBriefcase, FiCalendar, FiEdit2, FiHash, FiMail, FiMapPin, FiUser } from "react-icons/fi";
import { MdOutlineVerified } from "react-icons/md";
import EditProfileModal from "./component/EditProfileModal";
import { genderOptions } from "@/app/config/constant";
import { formatDateForInput } from "@/app/component/config/utils/dateUtils";

function s(v: any): string {
  if (v == null || typeof v === "object") return "";
  return String(v);
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function genderLabel(value?: number | string) {
  if (value == null || value === "") return "";
  const match = genderOptions.find((option: any) => option.value === Number(value));
  return match?.label || "";
}

function profileField(user: any, personalInfo: any, key: string) {
  return s(user?.[key] || personalInfo?.[key]);
}

const emptyForm = {
  firstName: "",
  lastName: "",
  title: "",
  address: "",
  city: "",
  state: "",
  country: "",
  gender: "" as number | "",
  dateOfBirth: "",
  bio: "",
};

function buildFormFromUser(user: any, personalInfo: any) {
  const { firstName, lastName } = splitName(s(user?.name || personalInfo?.name));
  const genderValue = user?.gender ?? personalInfo?.gender;
  const dob = user?.dateOfBirth || personalInfo?.dateOfBirth;

  return {
    firstName,
    lastName,
    title: profileField(user, personalInfo, "title"),
    address: profileField(user, personalInfo, "address"),
    city: profileField(user, personalInfo, "city"),
    state: profileField(user, personalInfo, "state"),
    country: profileField(user, personalInfo, "country"),
    gender: typeof genderValue === "number" ? genderValue : ("" as number | ""),
    dateOfBirth: dob ? formatDateForInput(String(dob)) : "",
    bio: profileField(user, personalInfo, "bio"),
  };
}

const dummyCertificates = [
  { id: "CERT-9041", title: "Web Dev Masterclass", issueDate: "Jan 2026", grade: "A+", issuer: "CRAFT LMS Academy" },
  { id: "CERT-8820", title: "UI/UX Design Systems", issueDate: "Nov 2025", grade: "Pass", issuer: "CRAFT LMS Design Guild" },
  { id: "CERT-7412", title: "Leadership Essentials", issueDate: "Aug 2025", grade: "Honors", issuer: "Executive Development" },
  { id: "CERT-6029", title: "AI & Prompt Engineering", issueDate: "May 2025", grade: "A", issuer: "CRAFT AI Lab" },
];

const dummyBookmarks = [
  { title: "React 19 & Next.js Server Components", author: "Sarah Connor", category: "Development", pct: 45 },
  { title: "Figma Advanced Component Design", author: "Alex Rivera", category: "Design", pct: 80 },
  { title: "Data Driven Growth Marketing", author: "Michael Chang", category: "Marketing", pct: 15 },
];

const dummyTeamMembers = [
  { name: "Alex Lawson", role: "Frontend Lead", email: "alex@learnhub.io", status: "Active" },
  { name: "David Miller", role: "Backend Developer", email: "david@learnhub.io", status: "Active" },
  { name: "Priya Sharma", role: "UI Designer", email: "priya@learnhub.io", status: "Active" },
  { name: "Carlos Vance", role: "DevOps Engineer", email: "carlos@learnhub.io", status: "Away" },
];

const ProfilePage: React.FC = observer(() => {
  const toast = useToast();
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [activeModal, setActiveModal] = useState<"certificates" | "bookmarks" | "teams" | "help" | "details" | null>(null);

  const user = stores.auth.user;
  const personalInfo = user?.profile_details?.personalInfo || {};

  const [tempForm, setTempForm] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const resolvedPhone = s(user?.mobileNumber || personalInfo?.mobileNumber || personalInfo?.phoneNumber);
  const roleName = s(user?.role).toLowerCase().replace(/_/g, " ");

  useEffect(() => {
    if (!user) return;
    setForm(buildFormFromUser(user, personalInfo));
  }, [user]);

  const fullName = `${form.firstName} ${form.lastName}`.trim() || s(user?.name) || "Learner";
  const location = [form.city, form.state, form.country].filter(Boolean).join(", ");

  const handleOpenEdit = () => {
    setTempForm(form);
    onEditOpen();
  };

  const handleSave = async () => {
    if (!user?._id) return;
    setSaving(true);
    const name = `${tempForm.firstName} ${tempForm.lastName}`.trim();

    try {
      await stores.userStore.updateUser({
        _id: user._id,
        name: s(name || user?.name),
        title: s(tempForm.title),
        address: s(tempForm.address),
        city: s(tempForm.city),
        state: s(tempForm.state),
        country: s(tempForm.country),
        gender: tempForm.gender ? Number(tempForm.gender) : undefined,
        dateOfBirth: tempForm.dateOfBirth || undefined,
        bio: s(tempForm.bio),
        username: s(user?.username),
        mobileNumber: s(resolvedPhone),
        role: s(user?.role),
        code: s(user?.code || personalInfo?.code),
        company: s(user?.company || user?.companyId || personalInfo?.company),
      });

      setForm(tempForm);
      await stores.auth.fetchUser();
      toast({ title: "Profile updated", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      onEditClose();
    } catch (err: any) {
      toast({ title: "Save failed", description: typeof err?.message === "string" ? err.message : "Please try again.", status: "error", duration: 4000, position: "top-right" });
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    if (!user) return onEditClose();
    setForm(buildFormFromUser(user, personalInfo));
    onEditClose();
  };

  const handleLogout = () => {
    stores.auth.logout();
    router.push("/login");
  };

  const pageBg = useColorModeValue("gray.50", "gray.950");
  const pageHeadingColor = useColorModeValue("gray.900", "gray.50");
  const pageSubColor = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.85)", "rgba(26, 32, 44, 0.85)");
  const accentGradient = useColorModeValue("linear(to-br, blue.500, blue.300)", "linear(to-br, blue.400, blue.600)");

  const menuItems = [
    {
      key: "certificates",
      icon: Award,
      label: "Certificates",
      badge: "5",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      desc: "View & download earned certificates",
      onClick: () => setActiveModal("certificates"),
    },
    {
      key: "bookmarks",
      icon: Bookmark,
      label: "Bookmarks",
      badge: "3",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      desc: "Saved courses & resources",
      onClick: () => setActiveModal("bookmarks"),
    },
    {
      key: "teams",
      icon: Users,
      label: "Teams & Organization",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      desc: "View department team members",
      onClick: () => setActiveModal("teams"),
    },
    {
      key: "details",
      icon: UserIcon,
      label: "Personal & Account Details",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      desc: "Phone, address, DOB & employee code",
      onClick: () => setActiveModal("details"),
    },
    {
      key: "help",
      icon: HelpCircle,
      label: "Help & Support",
      color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
      desc: "FAQs, guides & support contact",
      onClick: () => setActiveModal("help"),
    },
  ];

  const renderCertificatesContent = (
    <VStack spacing={3} align="stretch">
      {dummyCertificates.map((cert) => (
        <div
          key={cert.id}
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
            isDark ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div className="min-w-0 flex-1 pr-3">
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {cert.id}
            </span>
            <h4 className="mt-1 text-sm font-bold truncate">{cert.title}</h4>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {cert.issuer} • Issued {cert.issueDate}
            </p>
          </div>
          <Button
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            colorScheme="amber"
            borderRadius="xl"
            fontSize="xs"
            onClick={() =>
              toast({
                title: "Certificate Downloaded",
                description: `Downloaded ${cert.title} (${cert.id})`,
                status: "success",
                duration: 3000,
              })
            }
          >
            PDF
          </Button>
        </div>
      ))}
    </VStack>
  );

  const renderBookmarksContent = (
    <VStack spacing={3} align="stretch">
      {dummyBookmarks.map((bm, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
            isDark ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400">
              {bm.category}
            </span>
            <h4 className="mt-1 truncate text-xs font-bold">{bm.title}</h4>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{bm.author}</p>
          </div>
          <button
            onClick={() => router.push("/course")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 active:scale-95"
          >
            <Play className="h-4 w-4 fill-current ml-0.5" />
          </button>
        </div>
      ))}
    </VStack>
  );

  const renderTeamsContent = (
    <VStack spacing={3} align="stretch">
      {dummyTeamMembers.map((member, i) => (
        <div
          key={i}
          className={`flex items-center justify-between p-3.5 rounded-2xl border ${
            isDark ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <Avatar size="sm" name={member.name} bg="emerald.600" color="white" />
            <div>
              <h4 className="text-xs font-bold">{member.name}</h4>
              <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{member.role}</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
            {member.status}
          </span>
        </div>
      ))}
    </VStack>
  );

  const renderDetailsContent = (
    <VStack spacing={3} align="stretch">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: Mail, label: "Email Address", val: s(user?.username) || "N/A" },
          { icon: Phone, label: "Mobile Number", val: resolvedPhone || "N/A" },
          { icon: ShieldCheck, label: "Role", val: roleName || "Learner" },
          { icon: FileText, label: "Employee Code", val: s(user?.code) || "N/A" },
          { icon: Calendar, label: "Joined Date", val: fmtDate(user?.joiningDate) },
          { icon: Calendar, label: "Date of Birth", val: fmtDate(form.dateOfBirth || user?.dateOfBirth) },
          { icon: UserIcon, label: "Gender", val: genderLabel(form.gender || user?.gender) || "N/A" },
          { icon: MapPin, label: "Address", val: form.address || "N/A" },
          { icon: MapPin, label: "City / Country", val: [form.city, form.country].filter(Boolean).join(", ") || "N/A" },
        ].map((item, i) => (
          <div
            key={i}
            className={`p-3 rounded-2xl border ${
              isDark ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200/80"
            }`}
          >
            <p className={`text-[10px] font-extrabold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {item.label}
            </p>
            <p className="mt-1 text-xs font-bold truncate">{item.val}</p>
          </div>
        ))}
      </div>
      {form.bio && (
        <div className={`mt-2 p-3.5 rounded-2xl border ${isDark ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200/80"}`}>
          <p className={`text-[10px] font-extrabold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Bio</p>
          <p className="mt-1 text-xs leading-relaxed">{form.bio}</p>
        </div>
      )}
    </VStack>
  );

  const renderHelpContent = (
    <VStack spacing={3} align="stretch">
      {[
        { q: "How do I download my course certificates?", a: "Go to Profile > Certificates and click PDF next to any completed course." },
        { q: "Can I access courses offline on mobile?", a: "Yes, downloaded video lessons will appear under My Learning on mobile." },
        { q: "How to update my email or phone number?", a: "Contact your LMS administrator or tap Edit Profile to submit details." },
      ].map((faq, i) => (
        <div key={i} className={`p-3.5 rounded-2xl border ${isDark ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200/80"}`}>
          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400">Q: {faq.q}</h4>
          <p className={`mt-1 text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>{faq.a}</p>
        </div>
      ))}
      <Button
        leftIcon={<Mail className="h-4 w-4" />}
        colorScheme="blue"
        borderRadius="2xl"
        mt={2}
        onClick={() => {
          toast({
            title: "Support Request Sent",
            description: "Our support team will email you shortly.",
            status: "info",
            duration: 3000,
          });
          setActiveModal(null);
        }}
      >
        Contact Support Desk
      </Button>
    </VStack>
  );

  const getModalTitle = () => {
    switch (activeModal) {
      case "certificates": return { title: "My Certificates", sub: "Earned achievements & verified credentials", icon: Award, color: "text-amber-500 bg-amber-500/10" };
      case "bookmarks": return { title: "Saved Bookmarks", sub: "Courses saved for later review", icon: Bookmark, color: "text-purple-500 bg-purple-500/10" };
      case "teams": return { title: "Team & Organization", sub: `Department: ${s(user?.department) || "Engineering Guild"}`, icon: Users, color: "text-emerald-500 bg-emerald-500/10" };
      case "details": return { title: "Account Information", sub: "Verified user profile details", icon: UserIcon, color: "text-blue-500 bg-blue-500/10" };
      case "help": return { title: "Help & Support", sub: "FAQs & support team assistance", icon: HelpCircle, color: "text-slate-500 bg-slate-500/10" };
      default: return null;
    }
  };

  const modalMeta = getModalTitle();

  return (
    <Box
      bg={pageBg}
      minH="100vh"
      py={{ base: 2, md: 8 }}
      px={{ base: 4, sm: 6, md: "60px" }}
      transition="background 0.2s"
    >
      <Box display={{ base: "none", md: "block" }}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="24px" fontWeight="800" color={pageHeadingColor} letterSpacing="-0.02em">
              Profile
            </Text>
            <Text fontSize="13px" color={pageSubColor} mt="2px">
              View and manage your personal details, achievements & preferences
            </Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
              onClick={toggleColorMode}
              size="sm"
              px={4}
              borderRadius="12px"
              fontSize="13px"
              fontWeight="600"
              variant="outline"
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              {isDark ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button
              leftIcon={<FiEdit2 size={14} />}
              onClick={handleOpenEdit}
              size="sm"
              px={5}
              borderRadius="12px"
              fontSize="13px"
              fontWeight="600"
              colorScheme="blue"
            >
              Edit Profile
            </Button>
          </HStack>
        </Flex>

        <Grid templateColumns={{ base: "1fr", lg: "360px 1fr", xl: "380px 1fr" }} gap={6}>
          <VStack spacing={6} align="stretch">
            <Box
              bg={cardBg}
              position="relative"
              overflow="hidden"
              borderRadius="32px"
              boxShadow="xl"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={8}
              border="1px solid"
              borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "38%",
                bgGradient: accentGradient,
                opacity: 0.15,
                zIndex: 0,
              }}
            >
              <Box position="relative" zIndex={1} mb={4}>
                <Box p="6px" borderRadius="full" bgGradient={accentGradient} boxShadow="0 10px 25px -5px rgba(59, 130, 246, 0.3)">
                  <Avatar
                    name={fullName}
                    src={s(user?.pic?.url)}
                    w="130px"
                    h="130px"
                    border="4px solid"
                    borderColor={cardBg}
                  />
                </Box>
                <Box
                  position="absolute"
                  bottom="8px"
                  right="8px"
                  w="20px"
                  h="20px"
                  borderRadius="full"
                  bg="emerald.400"
                  border="4px solid"
                  borderColor={cardBg}
                />
              </Box>

              <VStack spacing={1} zIndex={1} textTransform="capitalize">
                <Text fontSize="22px" fontWeight="800" letterSpacing="-0.03em" color={useColorModeValue("gray.900", "white")}>
                  {form.title ? `${form.title} ${fullName}` : fullName}
                </Text>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-3 w-3" /> {roleName || "Learner"}
                </span>
              </VStack>

              <Divider my={5} opacity={0.6} />

              <VStack spacing={2.5} w="full" align="center" zIndex={1}>
                <HStack color="gray.500" fontSize="13px">
                  <FiMail size={14} />
                  <Text fontWeight="600" fontSize="sm">{s(user?.username)}</Text>
                </HStack>
                {location && (
                  <HStack color="gray.500" fontSize="13px">
                    <FiMapPin size={14} />
                    <Text fontWeight="500" fontSize="xs">{location}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            <Box bg={cardBg} borderRadius="28px" p={5} border="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.100")} boxShadow="md">
              <Text fontSize="12px" fontWeight="800" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={3}>
                Learning Activity
              </Text>
              <Grid templateColumns="repeat(3, 1fr)" gap={2} className="text-center">
                <div className="p-3 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10">
                  <p className="text-xl font-black text-blue-600 dark:text-blue-400">12</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Courses</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10">
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400">5</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Certs</p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10">
                  <p className="text-xl font-black text-purple-600 dark:text-purple-400">148h</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Hours</p>
                </div>
              </Grid>
            </Box>
          </VStack>

          <VStack spacing={6} align="stretch">
            <Box
              bg={glassBg}
              backdropFilter="blur(10px)"
              borderRadius="32px"
              border="1px solid"
              borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
              boxShadow="xl"
              p={7}
            >
              <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={3}>
                  <Icon as={MdOutlineVerified} color="blue.400" boxSize={6} />
                  <Text fontSize="18px" fontWeight="700">My Profile Details</Text>
                </HStack>
                <Box w="8px" h="8px" borderRadius="full" bg="emerald.400" />
              </Flex>

              <Grid templateColumns="repeat(2, 1fr)" gap={5}>
                {[
                  { icon: FiBriefcase, label: "Department", value: s(user?.department), color: "purple.400" },
                  { icon: FiHash, label: "Employee Code", value: s(user?.code), color: "red.400" },
                  { icon: FiCalendar, label: "Joined Date", value: fmtDate(user?.joiningDate), color: "teal.400" },
                  { icon: FiCalendar, label: "Date of Birth", value: fmtDate(form.dateOfBirth || user?.dateOfBirth), color: "pink.400" },
                  { icon: FiUser, label: "Gender", value: genderLabel(form.gender || user?.gender), color: "cyan.400" },
                  { icon: FiMapPin, label: "Address", value: form.address, color: "green.400" },
                  { icon: FiMapPin, label: "City", value: form.city, color: "yellow.500" },
                  { icon: FiMapPin, label: "Country", value: form.country, color: "orange.300" },
                ].map((item, idx) => (
                  <HStack key={idx} spacing={4} _hover={{ transform: "translateX(4px)" }} transition="0.2s">
                    <Flex
                      align="center"
                      justify="center"
                      p={2.5}
                      borderRadius="14px"
                      bg={useColorModeValue(`${item.color.split('.')[0]}.50`, "whiteAlpha.100")}
                    >
                      <Icon as={item.icon} color={item.color} boxSize={5} />
                    </Flex>
                    <VStack align="flex-start" spacing={0}>
                      <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">{item.label}</Text>
                      <Text fontWeight="600" fontSize="14px">{item.value || "N/A"}</Text>
                    </VStack>
                  </HStack>
                ))}
              </Grid>

              {form.bio && (
                <Box mt={6} pt={4} borderTop="1px border" borderColor={useColorModeValue("gray.100", "gray.800")}>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>
                    About Me
                  </Text>
                  <Box
                    p={4}
                    bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                    borderRadius="20px"
                    borderLeft="4px solid"
                    borderColor="blue.400"
                  >
                    <Text fontSize="13px" lineHeight="1.7" color={useColorModeValue("gray.700", "gray.300")}>
                      {form.bio}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Box
                  onClick={() => setActiveModal("certificates")}
                  cursor="pointer"
                  p={5}
                  bg={cardBg}
                  borderRadius="28px"
                  border="1px solid"
                  borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
                  boxShadow="md"
                  className="group"
                >
                  <Flex align="center" justify="space-between">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
                      <Award className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      5 Certs
                    </span>
                  </Flex>
                  <h3 className="mt-4 text-base font-bold group-hover:text-blue-600 transition-colors">Certificates</h3>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">View and download your earned PDF certificates</p>
                </Box>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Box
                  onClick={() => setActiveModal("bookmarks")}
                  cursor="pointer"
                  p={5}
                  bg={cardBg}
                  borderRadius="28px"
                  border="1px solid"
                  borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
                  boxShadow="md"
                  className="group"
                >
                  <Flex align="center" justify="space-between">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-500/10 text-purple-500">
                      <Bookmark className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                      3 Saved
                    </span>
                  </Flex>
                  <h3 className="mt-4 text-base font-bold group-hover:text-purple-600 transition-colors">Bookmarks</h3>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Access saved courses & learning materials</p>
                </Box>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Box
                  onClick={() => setActiveModal("teams")}
                  cursor="pointer"
                  p={5}
                  bg={cardBg}
                  borderRadius="28px"
                  border="1px solid"
                  borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
                  boxShadow="md"
                  className="group"
                >
                  <Flex align="center" justify="space-between">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                      <Users className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Team
                    </span>
                  </Flex>
                  <h3 className="mt-4 text-base font-bold group-hover:text-emerald-600 transition-colors">Teams & Department</h3>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Department colleagues and team leads</p>
                </Box>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Box
                  onClick={() => setActiveModal("help")}
                  cursor="pointer"
                  p={5}
                  bg={cardBg}
                  borderRadius="28px"
                  border="1px solid"
                  borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
                  boxShadow="md"
                  className="group"
                >
                  <Flex align="center" justify="space-between">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/10 text-blue-500">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                      Support
                    </span>
                  </Flex>
                  <h3 className="mt-4 text-base font-bold group-hover:text-blue-600 transition-colors">Help & Support</h3>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">FAQs, guidebooks & contact support desk</p>
                </Box>
              </motion.div>
            </Grid>
          </VStack>
        </Grid>
      </Box>

      <Box display={{ base: "block", md: "none" }} pb={{ base: 28, md: 0 }}>
        <div className="flex items-center justify-between pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Profile</h1>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Manage your personal info & preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleColorMode}
              aria-label="Toggle color mode"
              className={`grid h-10 w-10 place-items-center rounded-2xl transition-transform active:scale-95 ring-1 ${
                isDark ? "bg-slate-900 ring-slate-800 text-amber-400" : "bg-white ring-slate-200 text-slate-700 shadow-sm"
              }`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleOpenEdit}
              aria-label="Edit Profile"
              className={`grid h-10 w-10 place-items-center rounded-2xl transition-transform active:scale-95 ring-1 ${
                isDark ? "bg-slate-900 ring-slate-800 text-blue-400" : "bg-white ring-slate-200 text-blue-600 shadow-sm"
              }`}
            >
              <Edit2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-5 text-white shadow-xl shadow-blue-500/20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
          <div className="relative flex items-center gap-4">
            <Avatar
              size="lg"
              name={fullName}
              src={s(user?.pic?.url)}
              bg="white/20"
              color="white"
              className="ring-4 ring-white/30 shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur text-blue-100 mb-1">
                <Sparkles className="h-3 w-3" /> {roleName || "Member"}
              </span>
              <h2 className="text-lg font-bold truncate leading-tight">
                {form.title ? `${form.title} ${fullName}` : fullName}
              </h2>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-blue-100 truncate">
                <Mail className="h-3 w-3 shrink-0 opacity-80" />
                <span className="truncate">{s(user?.username) || "No email"}</span>
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur-md ring-1 ring-white/15">
            <div className="text-center">
              <p className="text-lg font-black">12</p>
              <p className="text-[10px] font-semibold text-blue-100 uppercase">Courses</p>
            </div>
            <div className="text-center border-x border-white/15">
              <p className="text-lg font-black">5</p>
              <p className="text-[10px] font-semibold text-blue-100 uppercase">Certificates</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black">148h</p>
              <p className="text-[10px] font-semibold text-blue-100 uppercase">Learned</p>
            </div>
          </div>
        </div>

        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={toggleColorMode}
          className={`mt-4 flex items-center justify-between rounded-3xl p-4 cursor-pointer transition-all ring-1 ${
            isDark ? "bg-slate-900/90 ring-slate-800" : "bg-white ring-slate-200/80 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`grid h-10 w-10 place-items-center rounded-2xl ${
                isDark ? "bg-amber-400/10 text-amber-400" : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-bold">Theme Mode</p>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {isDark ? "Dark Mode 🌙" : "Light Mode ☀️"}
              </p>
            </div>
          </div>
          <div
            className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
              isDark ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
            }`}
          >
            <motion.div layout className="h-4 w-4 rounded-full bg-white shadow-md" />
          </div>
        </motion.div>

        <div
          className={`mt-4 overflow-hidden rounded-3xl ring-1 ${
            isDark ? "bg-slate-900/90 ring-slate-800" : "bg-white ring-slate-200/80 shadow-sm"
          }`}
        >
          {menuItems.map((m, i) => (
            <motion.button
              key={m.key}
              whileTap={{ backgroundColor: isDark ? "rgba(30, 41, 59, 0.6)" : "rgb(248, 250, 252)" }}
              onClick={m.onClick}
              className={`flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors ${
                i !== menuItems.length - 1 ? (isDark ? "border-b border-slate-800/80" : "border-b border-slate-100") : ""
              }`}
            >
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${m.color}`}>
                <m.icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{m.label}</span>
                  {m.badge && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:text-blue-400">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className={`mt-0.5 truncate text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{m.desc}</p>
              </div>
              <ChevronRight className={`h-4 w-4 shrink-0 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-3xl py-4 text-sm font-bold transition-colors ${
            isDark
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 ring-1 ring-red-500/20"
              : "bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-100"
          }`}
        >
          <LogOut className="h-4 w-4" /> Log out
        </motion.button>
      </Box>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={handleModalClose}
        form={tempForm}
        handleChange={(field: string, value: any) => setTempForm((c) => ({ ...c, [field]: value }))}
        handleSave={handleSave}
        saving={saving}
      />

      {modalMeta && (
        isMobile ? (
          <Drawer isOpen={Boolean(activeModal)} placement="bottom" onClose={() => setActiveModal(null)}>
            <DrawerOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
            <DrawerContent bg={isDark ? "gray.900" : "white"} color={isDark ? "white" : "gray.900"} borderTopRadius="3xl" maxH="85vh">
              <Box w="40px" h="4px" bg={isDark ? "gray.600" : "gray.300"} borderRadius="full" mx="auto" mt={3} />
              <DrawerCloseButton top={4} right={4} borderRadius="full" />
              <DrawerHeader py={4} borderBottomWidth="1px" borderColor={isDark ? "gray.800" : "gray.100"}>
                <HStack spacing={3}>
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${modalMeta.color}`}>
                    <modalMeta.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <Text fontSize="md" fontWeight="bold">{modalMeta.title}</Text>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{modalMeta.sub}</Text>
                  </div>
                </HStack>
              </DrawerHeader>
              <DrawerBody py={5} overflowY="auto">
                {activeModal === "certificates" && renderCertificatesContent}
                {activeModal === "bookmarks" && renderBookmarksContent}
                {activeModal === "teams" && renderTeamsContent}
                {activeModal === "details" && renderDetailsContent}
                {activeModal === "help" && renderHelpContent}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        ) : (
          <Modal isOpen={Boolean(activeModal)} onClose={() => setActiveModal(null)} size="lg" isCentered motionPreset="slideInBottom">
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
            <ModalContent borderRadius="3xl" overflow="hidden" bg={isDark ? "gray.900" : "white"} color={isDark ? "white" : "gray.900"}>
              <ModalHeader borderBottomWidth="1px" borderColor={isDark ? "gray.800" : "gray.100"} py={4}>
                <HStack spacing={3}>
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${modalMeta.color}`}>
                    <modalMeta.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <Text fontSize="lg" fontWeight="bold">{modalMeta.title}</Text>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{modalMeta.sub}</Text>
                  </div>
                </HStack>
              </ModalHeader>
              <ModalCloseButton top={4} right={4} borderRadius="full" />
              <ModalBody py={5} px={6} maxH="75vh" overflowY="auto">
                {activeModal === "certificates" && renderCertificatesContent}
                {activeModal === "bookmarks" && renderBookmarksContent}
                {activeModal === "teams" && renderTeamsContent}
                {activeModal === "details" && renderDetailsContent}
                {activeModal === "help" && renderHelpContent}
              </ModalBody>
            </ModalContent>
          </Modal>
        )
      )}
    </Box>
  );
});

export default ProfilePage;
