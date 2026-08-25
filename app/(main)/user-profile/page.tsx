"use client";
import Link from "next/link";

import { formatDateForInput } from "@/app/component/config/utils/dateUtils";
import { genderOptions } from "@/app/config/constant";
import { readFileAsBase64 } from "@/app/config/utils/utils";
import stores from "@/app/store/stores";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Switch,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Award,
  Bell,
  Bookmark,
  BookOpen,
  Building,
  Building2,
  Cake,
  Calendar,
  CalendarCheck,
  Camera,
  ChevronRight,
  Download,
  Edit2,
  FileText,
  Globe,
  Globe2,
  HelpCircle,
  Home,
  IdCard,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Phone,
  Play,
  Quote,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  UserCircle,
  User as UserIcon,
  Users,
  Volume2
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { MdOutlineVerified } from "react-icons/md";
import EditProfileModal from "./component/EditProfileModal";

function s(v: any): string {
  if (v == null || typeof v === "object") return "";
  return String(v);
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

function fmtDate(iso?: string) {
  if (!iso) return "N/A";
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
  pic: { file: null as File | null, url: "", isDeleted: 0, isAdd: 0 },
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
    pic: {
      file: null,
      url: s(user?.pic?.url),
      isDeleted: 0,
      isAdd: 0,
    },
  };
}

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
  const { isOpen: isSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const [activeModal, setActiveModal] = useState<"certificates" | "bookmarks" | "teams" | "help" | "details" | null>(null);

  const user = stores.auth.user;
  const courseStore = stores.courseStore;
  const personalInfo = user?.profile_details?.personalInfo || {};

  const [tempForm, setTempForm] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [certificateDownloadError, setCertificateDownloadError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const modalAvatarInputRef = useRef<HTMLInputElement | null>(null);

  const resolvedPhone = s(user?.mobileNumber || personalInfo?.mobileNumber || personalInfo?.phoneNumber);
  const roleName = s(user?.role).toLowerCase().replace(/_/g, " ");

  useEffect(() => {
    if (!user) return;
    setForm(buildFormFromUser(user, personalInfo));
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;
    void courseStore.fetchMyCertificates().catch(() => undefined);
    void courseStore.fetchBookmarks().catch(() => undefined);
  }, [courseStore, user?._id]);

  useEffect(() => {
    if (activeModal !== "certificates" || !user?._id) return;
    setCertificateDownloadError(null);
    void courseStore.fetchMyCertificates().catch(() => undefined);
  }, [activeModal, courseStore, user?._id]);

  useEffect(() => {
    if (activeModal !== "bookmarks" || !user?._id) return;
    void courseStore.fetchBookmarks().catch((error) => {
      toast({
        title: "Unable to load bookmarks",
        description: error?.message || error?.error || "Please try again.",
        status: "error",
        duration: 4000,
      });
    });
  }, [activeModal, courseStore, toast, user?._id]);

  const fullName = `${form.firstName} ${form.lastName}`.trim() || s(user?.name) || "Learner";
  const location = [form.city, form.state, form.country].filter(Boolean).join(", ");
  const profileImageUrl = form.pic?.url || s(user?.pic?.url);

  const handleOpenEdit = () => {
    setTempForm({
      ...form,
      pic: { ...form.pic },
    });
    onEditOpen();
  };

  const buildProfilePayload = async (sourceForm: typeof emptyForm) => {
    const name = `${sourceForm.firstName} ${sourceForm.lastName}`.trim();
    const payload: any = {
      _id: user?._id,
      name: s(name || user?.name),
      title: s(sourceForm.title),
      address: s(sourceForm.address),
      city: s(sourceForm.city),
      state: s(sourceForm.state),
      country: s(sourceForm.country),
      gender: sourceForm.gender ? Number(sourceForm.gender) : undefined,
      dateOfBirth: sourceForm.dateOfBirth || undefined,
      bio: s(sourceForm.bio),
      username: s(user?.username),
      mobileNumber: s(resolvedPhone),
      role: s(user?.role),
      code: s(user?.code || personalInfo?.code),
      company: s(user?.company || user?.companyId || personalInfo?.company),
    };

    if (sourceForm.pic?.isDeleted) {
      payload.pic = {
        isDeleted: 1,
        isAdd: 0,
      };
    }

    if (sourceForm.pic?.file instanceof File) {
      const buffer = await readFileAsBase64(sourceForm.pic.file);
      payload.pic = {
        buffer,
        filename: sourceForm.pic.file.name,
        type: sourceForm.pic.file.type,
        isAdd: 1,
        isDeleted: sourceForm.pic?.isDeleted || 0,
      };
    }

    return payload;
  };

  const syncProfileState = async (nextForm?: typeof emptyForm) => {
    if (nextForm) {
      setForm(nextForm);
      setTempForm(nextForm);
    }
    await stores.auth.fetchUser();
  };

  const handleSave = async () => {
    if (!user?._id) return;
    setSaving(true);

    try {
      const payload = await buildProfilePayload(tempForm);
      await stores.userStore.updateUser(payload);
      const savedForm = {
        ...tempForm,
        pic: tempForm.pic?.file
          ? {
              file: null,
              url: tempForm.pic.url,
              isDeleted: 0,
              isAdd: 0,
            }
          : { ...tempForm.pic, file: null, isDeleted: 0, isAdd: 0 },
      };
      await syncProfileState(savedForm);
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

  const handleAvatarSelection = async (file?: File | null, saveImmediately = false) => {
    if (!file || !user?._id) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please choose an image file for your profile picture.",
        status: "warning",
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (!saveImmediately) {
      setTempForm((current) => ({
        ...current,
        pic: {
          file,
          url: previewUrl,
          isDeleted: 0,
          isAdd: 1,
        },
      }));
      return;
    }

    const nextForm = {
      ...form,
      pic: {
        file,
        url: previewUrl,
        isDeleted: 0,
        isAdd: 1,
      },
    };

    setAvatarUploading(true);
    setForm(nextForm);

    try {
      const payload = await buildProfilePayload(nextForm);
      await stores.userStore.updateUser(payload);
      await syncProfileState({
        ...nextForm,
        pic: {
          file: null,
          url: previewUrl,
          isDeleted: 0,
          isAdd: 0,
        },
      });
      toast({
        title: "Profile picture updated",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err: any) {
      setForm(buildFormFromUser(user, personalInfo));
      toast({
        title: "Image update failed",
        description: typeof err?.message === "string" ? err.message : "Please try again.",
        status: "error",
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleTempAvatarRemove = () => {
    setTempForm((current) => ({
      ...current,
      pic: {
        file: null,
        url: "",
        isDeleted: current.pic?.url || current.pic?.file ? 1 : 0,
        isAdd: 0,
      },
    }));
  };

  const handleLogout = () => {
    stores.auth.logout();
    router.push("/login");
  };

  const pageBg = useColorModeValue("white", "gray.950");
  const pageHeadingColor = useColorModeValue("gray.900", "gray.50");
  const pageSubColor = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.85)", "rgba(26, 32, 44, 0.85)");
  const accentGradient = useColorModeValue("linear(to-br, blue.500, blue.300)", "linear(to-br, blue.400, blue.600)");
  const themedAccent = isDark ? "var(--chakra-colors-brand-300)" : "var(--chakra-colors-brand-600)";
  const themedAccentStrong = isDark ? "var(--chakra-colors-brand-400)" : "var(--chakra-colors-brand-500)";
  const themedAccentSoftBg = isDark
    ? "color-mix(in srgb, var(--chakra-colors-brand-400) 16%, transparent)"
    : "color-mix(in srgb, var(--chakra-colors-brand-500) 10%, transparent)";
  const themedAccentGradient = isDark
    ? "linear-gradient(135deg, var(--chakra-colors-brand-400) 0%, var(--chakra-colors-purple-400) 100%)"
    : "linear-gradient(135deg, var(--chakra-colors-brand-500) 0%, var(--chakra-colors-purple-500) 100%)";
  const certificateCountLabel = courseStore.isMyCertificatesLoading ? "..." : `${courseStore.myCertificates.length}`;

  const handleDownloadCertificate = async (courseId: string, courseName: string) => {
    setCertificateDownloadError(null);

    try {
      await courseStore.downloadMyCertificate(courseId);
      toast({
        title: "Certificate downloaded",
        description: courseName ? `${courseName} PDF saved successfully.` : undefined,
        status: "success",
        duration: 3000,
        position: "top-right",
      });
    } catch (error: any) {
      const message = error?.message || "Please try again.";
      setCertificateDownloadError(message);
      toast({
        title: "Unable to download certificate",
        description: message,
        status: "error",
        duration: 4000,
        position: "top-right",
      });
    }
  };

  const menuItems = [
    {
      key: "certificates",
      icon: Award,
      label: "Certificates",
      badge: certificateCountLabel,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      desc: "View & download earned certificates",
      onClick: () => setActiveModal("certificates"),
    },
    {
      key: "bookmarks",
      icon: Bookmark,
      label: "Bookmarks",
      badge: courseStore.isBookmarksLoading ? "..." : String(courseStore.bookmarkedCourses?.length || 0),
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
      key: "my-learning",
      icon: BookOpen,
      label: "My Learning",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      desc: "Open your enrolled courses and continue learning",
      onClick: () => router.push("/my-learning"),
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

  //               borderRadius="xl"
  //               fontSize="xs"
  //               isLoading={isDownloading}
  //               loadingText="Downloading"
  //               onClick={() => void handleDownloadCertificate(cert.courseId, cert.courseName)}
  //             >
  //               Download PDF
  //             </Button>
  //           </div>
  //         );
  //       })
  //     )}
  //     {([] as any[]).map((cert) => (
  //       <div
  //         key={cert.id}
  //         className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
  //           isDark ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200/80"
  //         }`}
  //       >
  //         <div className="min-w-0 flex-1 pr-3">
  //           <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
  //             {cert.id}
  //           </span>
  //           <h4 className="mt-1 text-sm font-bold truncate">{cert.title}</h4>
  //           <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
  //             {cert.issuer} Ã¢â‚¬Â¢ Issued {cert.issueDate}
  //           </p>
  //         </div>
  //         <Button
  //           size="sm"
  //           leftIcon={<Download className="h-3.5 w-3.5" />}
  //           colorScheme="amber"
  //           borderRadius="xl"
  //           fontSize="xs"
  //           onClick={() =>
  //             toast({
  //               title: "Certificate Downloaded",
  //               description: `Downloaded ${cert.title} (${cert.id})`,
  //               status: "success",
  //               duration: 3000,
  //             })
  //           }
  //         >
  //           PDF
  //         </Button>
  //       </div>
  //     ))}
  //   </VStack>
  // );


  const renderCertificatesContent = (
  <VStack spacing={3} align="stretch">
    {certificateDownloadError ? (
      <Box
        borderRadius="xl"
        border="1px solid"
        borderColor={isDark ? "red.900" : "red.100"}
        bg={isDark ? "red.950" : "red.50"}
        px={3.5}
        py={3}
      >
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={isDark ? "red.200" : "red.600"}
        >
          Failed to download PDF
        </Text>

        <Text
          mt={1}
          fontSize="xs"
          color={isDark ? "red.100" : "red.500"}
        >
          {certificateDownloadError}
        </Text>
      </Box>
    ) : null}

    {courseStore.isMyCertificatesLoading ? (
      <Flex
        minH="160px"
        direction="column"
        align="center"
        justify="center"
        gap={3}
        className={`rounded-2xl border ${
          isDark
            ? "border-slate-700/80 bg-slate-800/50"
            : "border-slate-200/80 bg-white"
        }`}
      >
        <Spinner size="sm" color="orange.400" />

        <Text fontSize="xs" fontWeight="semibold">
          Loading your certificates...
        </Text>
      </Flex>
    ) : courseStore.myCertificatesError ? (
      <Box
        className={`rounded-2xl border p-4 ${
          isDark
            ? "border-slate-700/80 bg-slate-800/50"
            : "border-slate-200/80 bg-white"
        }`}
      >
        <Text fontSize="sm" fontWeight="bold">
          Failed to load certificates
        </Text>

        <Text
          mt={1}
          fontSize="xs"
          color={isDark ? "gray.400" : "gray.500"}
        >
          {courseStore.myCertificatesError}
        </Text>

        <Button
          mt={3}
          size="sm"
          borderRadius="lg"
          colorScheme="orange"
          onClick={() =>
            void courseStore.fetchMyCertificates().catch(() => undefined)
          }
        >
          Retry
        </Button>
      </Box>
    ) : courseStore.myCertificates.length === 0 ? (
      <Box
        className={`rounded-2xl border px-5 py-7 text-center ${
          isDark
            ? "border-slate-700/80 bg-slate-800/50"
            : "border-slate-200/80 bg-white"
        }`}
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
          <Award className="h-6 w-6" />
        </div>

        <Text mt={3} fontSize="sm" fontWeight="bold">
          No certificates earned yet
        </Text>

        <Text
          mt={1.5}
          fontSize="xs"
          lineHeight="1.6"
          color={isDark ? "gray.400" : "gray.500"}
        >
          Your earned certificates will appear here after completing eligible
          courses.
        </Text>
      </Box>
    ) : (
      <VStack spacing={2.5} align="stretch">
        {courseStore.myCertificates.map((cert) => {
          const isDownloading =
            courseStore.certificateDownloadCourseId === cert.courseId;

          const statusLabel = String(cert.status || "issued").replace(
            /_/g,
            " ",
          );

          return (
            <div
              key={cert._id || cert.courseId}
              className={`grid grid-cols-[44px_minmax(0,1fr)_36px] items-start gap-3 rounded-2xl border p-3 transition-all duration-200 sm:grid-cols-[48px_minmax(0,1fr)_40px] sm:items-center sm:p-3.5 ${
                isDark
                  ? "border-slate-700/80 bg-slate-800/50 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:border-slate-600"
                  : "border-slate-200/80 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:border-slate-300"
              }`}
            >
              {/* Certificate icon */}
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-500 sm:h-12 sm:w-12 sm:rounded-2xl">
                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              {/* Certificate information */}
              <div className="min-w-0">
                <h4
                  className={`line-clamp-2 break-words text-[13px] font-bold leading-5 sm:text-sm ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  title={cert.certificateName}
                >
                  {cert.certificateName}
                </h4>

                <p
                  className={`mt-0.5 line-clamp-1 text-[11px] font-medium sm:text-xs ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                  title={cert.courseName}
                >
                  {cert.courseName}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    {statusLabel}
                  </span>

                  <span
                    className={`text-[10px] ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Issued {fmtDate(cert.issuedAt || undefined)}
                  </span>
                </div>

                {cert.certificateNo ? (
                  <p
                    className={`mt-1 truncate text-[10px] ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                    title={cert.certificateNo}
                  >
                    Certificate ID: {cert.certificateNo}
                  </p>
                ) : null}
              </div>

              {/* Icon-only download button */}
              <button
                type="button"
                aria-label={`Download ${cert.certificateName} certificate`}
                title="Download certificate PDF"
                disabled={isDownloading}
                onClick={() =>
                  void handleDownloadCertificate(
                    cert.courseId,
                    cert.courseName,
                  )
                }
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:w-10 ${
                  isDark
                    ? "bg-orange-400/10 text-orange-300 hover:bg-orange-400/20"
                    : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                }`}
              >
                {isDownloading ? (
                  <Spinner size="xs" color="currentColor" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            </div>
          );
        })}
      </VStack>
    )}
  </VStack>
);
  const bookmarkedCourses = courseStore.bookmarkedCourses || [];
  const openBookmarkedCourse = (course: any) => {
    const courseId = String(course?._id || course?.courseId || "").trim();
    if (!courseId) return;
    setActiveModal(null);
    router.push(`/course?courseId=${courseId}`);
  };
  const removeBookmarkedCourse = async (course: any) => {
    const courseId = String(course?._id || course?.courseId || "").trim();
    if (!courseId) return;

    try {
      await courseStore.unbookmarkCourse(courseId);
      toast({
        title: "Bookmark removed",
        status: "success",
        duration: 2200,
      });
    } catch (error: any) {
      toast({
        title: "Unable to remove bookmark",
        description: error?.message || error?.error || "Please try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const renderBookmarksContent = (
    <VStack spacing={3} align="stretch">
      {courseStore.isBookmarksLoading ? (
        <HStack justify="center" py={8}>
          <Spinner size="sm" />
          <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
            Loading saved courses...
          </Text>
        </HStack>
      ) : bookmarkedCourses.length === 0 ? (
        <div
          className={`rounded-2xl border p-5 text-center ${
            isDark ? "border-slate-700/80" : "border-slate-200/80"
          }`}
          style={{ background: cardBg }}
        >
          <div
            className="mx-auto grid h-12 w-12 place-items-center rounded-xl"
            style={{ background: themedAccentSoftBg, color: themedAccent }}
          >
            <Bookmark className="h-6 w-6" />
          </div>
          <h4 className="mt-3 text-sm font-extrabold">No bookmarked courses yet</h4>
          <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Save courses from the catalog and they will appear here for quick access.
          </p>
          <Button
            size="sm"
            colorScheme="brand"
            borderRadius="xl"
            mt={4}
            leftIcon={<BookOpen className="h-4 w-4" />}
            onClick={() => {
              setActiveModal(null);
              router.push("/course");
            }}
          >
            Explore courses
          </Button>
        </div>
      ) : (
        bookmarkedCourses.map((course) => {
          const courseId = String(course?._id || course?.courseId || "").trim();
          const category = course?.taxonomy?.categories?.[0] || "General";
          const progress = Math.max(0, Math.min(100, Math.round(Number(course?.progress || 0))));
          const isRemoving = courseStore.bookmarkActionCourseIds.includes(courseId);

          return (
            <div
              key={courseId || course.bookmarkId}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 ${
                isDark ? "border-slate-700/80" : "border-slate-200/80"
              }`}
              style={{ background: cardBg }}
            >
              {course?.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white"
                  style={{ background: themedAccentGradient }}
                >
                  <BookOpen className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                  style={{ background: themedAccentSoftBg, color: themedAccent }}
                >
                  {category}
                </span>
                <h4 className="mt-1 truncate text-xs font-bold">{course.title}</h4>
                <p className={`truncate text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {course?.instructor?.name || "Instructor"} {progress > 0 ? `- ${progress}% complete` : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => void removeBookmarkedCourse(course)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: themedAccentSoftBg, color: themedAccent }}
              >
                {isRemoving ? <Spinner size="xs" color="currentColor" /> : <Bookmark className="h-4 w-4 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => openBookmarkedCourse(course)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white transition active:scale-95"
                style={{ background: themedAccentStrong }}
              >
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </button>
            </div>
          );
        })
      )}
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
      case "bookmarks": return {
        title: "Saved Bookmarks",
        sub: "Courses saved for later review",
        icon: Bookmark,
        color: "",
        style: { background: themedAccentSoftBg, color: themedAccent },
      };
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
      {/* Reference-inspired layout; existing stores, handlers and dialogs stay intact. */}
      <Box maxW="1180px" mx="auto" pb={{ base: 10, md: 16 }}>
        <Flex
          position={{ base: "sticky", md: "static" }} top={0} zIndex={20}
          align="center" justify="space-between" py={{ base: 3, md: 1 }} mb={{ base: 3, md: 7 }}
          // bg={glassBg} backdropFilter="blur(16px)"
          borderBottom={{ base: "1px solid", md: "none" }} borderColor={isDark ? "whiteAlpha.100" : "gray.100"}
        >
          <Link href="/">
            <Flex as="span" align="center" justify="center" w={10} h={10} borderRadius="full" border="1px solid" borderColor={isDark ? "whiteAlpha.200" : "gray.200"} bg={cardBg}>
              <ChevronRight size={18} style={{ transform: "rotate(180deg)" }} />
            </Flex>
          </Link>
          <Text position={{ base: "absolute", md: "static" }} left={{ base: "50%", md: "auto" }} transform={{ base: "translateX(-50%)", md: "none" }} fontSize={{ base: "md", md: "2xl" }} fontWeight="900" color={pageHeadingColor}>Profile</Text>
          <Flex gap={2}>
            <Button display={{ base: "none", sm: "inline-flex" }} leftIcon={<Edit2 size={15} />} onClick={handleOpenEdit} variant="outline" size="sm" borderRadius="full">Edit profile</Button>
            <Flex as="button" type="button" aria-label="Open settings" onClick={() => router.push("/settings")} align="center" justify="center" w={10} h={10} borderRadius="full" border="1px solid" borderColor={isDark ? "whiteAlpha.200" : "gray.200"} bg={cardBg}>
              <Settings size={18} />
            </Flex>
          </Flex>
        </Flex>

        <Grid templateColumns={{ base: "1fr", lg: "minmax(0,1.65fr) minmax(300px,1fr)" }} gap={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
            <Box position="relative" overflow="hidden" borderRadius={{ base: "2xl", md: "3xl" }} p={{ base: 5, sm: 7, md: 8 }} boxShadow={isDark ? "none" : "0 16px 38px rgba(15,23,42,.12)"}>
              <Sparkles size={170} style={{ position: "absolute", right: -40, top: -45, opacity: .08, pointerEvents: "none" }} />
              <Grid position="relative" templateColumns="auto minmax(0,1fr)" gap={{ base: 4, md: 6 }} alignItems="center">
                <Box position="relative">
                  <Box p="3px" borderRadius="full" bg="whiteAlpha.500" boxShadow="lg">
                    <Avatar name={fullName} src={profileImageUrl} w={{ base: "72px", md: "96px" }} h={{ base: "72px", md: "96px" }} border="2px solid white" bg="gray.300" color="gray.700" />
                  </Box>
                  <Flex as="button" type="button" aria-label="Change profile photo" onClick={() => avatarInputRef.current?.click()} position="absolute" right={-1} bottom={-1} w={8} h={8} align="center" justify="center" borderRadius="full" bg={cardBg} color={pageHeadingColor} border="1px solid" borderColor={isDark ? "gray.600" : "gray.200"} boxShadow="md">
                    {avatarUploading ? <Spinner size="xs" /> : <Camera size={14} />}
                  </Flex>
                </Box>
                <Box minW={0}>
                  <Flex align="center" gap={2} minW={0}>
                    <Text noOfLines={1} fontSize={{ base: "lg", md: "2xl" }} fontWeight="900">{form.title ? `${form.title} ${fullName}` : fullName}</Text>
                    <MdOutlineVerified size={18} style={{ flexShrink: 0 }} />
                  </Flex>
                  <Text noOfLines={1} mt={1} fontSize={{ base: "xs", md: "sm" }} fontWeight="600" opacity={0.78}>{roleName || "Learner"}</Text>
                  <Text noOfLines={1} mt={1} fontSize="xs" opacity={0.68}>{location || s(user?.username)}</Text>
                  <Flex mt={3} display="inline-flex" align="center" gap={1.5} px={2.5} py={1} borderRadius="full" bg="whiteAlpha.200" fontSize="10px" fontWeight="800" textTransform="uppercase"><Award size={12} /> Verified learner</Flex>
                </Box>
              </Grid>
              {/* <Grid position="relative" mt={{ base: 5, md: 7 }} templateColumns="repeat(3, 1fr)" gap={2.5}>
                {[
                  { label: "Certificates", value: certificateCountLabel, icon: Award },
                  { label: "Bookmarks", value: courseStore.isBookmarksLoading ? "..." : String(bookmarkedCourses.length), icon: Bookmark },
                  { label: "Quizzes", value: String(stores.quizStore.myAttempts.length), icon: Edit2 },
                ].map((stat) => (
                  <Box key={stat.label} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.200" bg="whiteAlpha.100" px={{ base: 3, md: 4 }} py={3} backdropFilter="blur(8px)">
                    <stat.icon size={16} /><Text mt={1.5} fontSize={{ base: "lg", md: "xl" }} fontWeight="900" lineHeight={1}>{stat.value}</Text>
                    <Text mt={1} noOfLines={1} fontSize="10px" fontWeight="800" opacity={0.68} textTransform="uppercase">{stat.label}</Text>
                  </Box>
                ))}
              </Grid> */}
              <Button display={{ base: "flex", sm: "none" }} mt={4} variant={'outline'} w="full" onClick={handleOpenEdit} leftIcon={<Edit2 size={15} />} borderRadius="2xl" color={themedAccentGradient} >Edit profile</Button>
            </Box>

          </VStack>

          <VStack align="stretch" spacing={3}>
            <Box borderRadius="2xl" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "gray.200"} bg={cardBg} p={4} boxShadow={isDark ? "none" : "0 8px 24px rgba(15,23,42,.05)"}>
              <Grid templateColumns="auto minmax(0,1fr) auto" alignItems="center" gap={3}>
                <Flex w={11} h={11} align="center" justify="center" borderRadius="xl" color="white" style={{ background: themedAccentGradient }}><Award size={20} /></Flex>
                <Box minW={0}><Text fontSize="sm" fontWeight="900" color={pageHeadingColor}>Premium member</Text><Text noOfLines={1} fontSize="11px" color={pageSubColor}>Exclusive courses and verified certificates</Text></Box>
                <Button size="xs" borderRadius="full" color="white" style={{ background: themedAccentStrong }} onClick={() => toast({ title: "Premium access", description: "Your current plan details will appear here soon.", status: "info", duration: 2500 })}>View</Button>
              </Grid>
            </Box>
            <Text px={1} pt={2} fontSize="10px" fontWeight="800" color={pageSubColor} textTransform="uppercase">Settings & more</Text>
            {menuItems.map((item) => (
              <Flex as="button" type="button" key={item.key} onClick={item.onClick} w="full" align="center" textAlign="left" gap={3.5} p={4} borderRadius="2xl" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "gray.200"} bg={cardBg} boxShadow={isDark ? "none" : "0 5px 18px rgba(15,23,42,.04)"} transition="all .2s" _hover={{ transform: "translateY(-2px)", borderColor: themedAccent }} _active={{ transform: "scale(.99)" }}>
                <Flex flexShrink={0} w={11} h={11} align="center" justify="center" borderRadius="xl" style={{ background: themedAccentSoftBg, color: themedAccent }}><item.icon size={19} /></Flex>
                <Box minW={0} flex={1}><Text noOfLines={1} fontSize="sm" fontWeight="800" color={pageHeadingColor}>{item.label}</Text><Text noOfLines={1} fontSize="11px" color={pageSubColor}>{item.desc}</Text></Box>
                {item.badge ? <Text flexShrink={0} px={2} py={0.5} borderRadius="full" fontSize="9px" fontWeight="800" style={{ background: themedAccentSoftBg, color: themedAccent }}>{item.badge}</Text> : null}
                <ChevronRight size={15} color={isDark ? "#718096" : "#A0AEC0"} />
              </Flex>
            ))}
            <Button mt={2} onClick={handleLogout} w="full" size="lg" borderRadius="xl" colorScheme="red" variant="outline" leftIcon={<LogOut size={17} />}>Sign out</Button>
          </VStack>
        </Grid>
      </Box>

      {/* ═══ DESKTOP — Premium Professional Layout ═══ */}
      <Box display="none" pb={16} fontFamily="'Inter', sans-serif">
        {/* Cover & Profile Header */}
        <Box mb={10} bg={cardBg} borderRadius="3xl" p={8} px={10} border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.50"} boxShadow={isDark ? "none" : "0 10px 40px rgba(0,0,0,0.04)"} position="relative" overflow="hidden">
           {/* Premium Aurora/Mesh Background Decoration */}
           <Box position="absolute" top="-50%" left="-10%" w="50%" h="200%" bg="radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)" filter="blur(40px)" pointerEvents="none" />
           <Box position="absolute" bottom="-50%" right="-10%" w="60%" h="200%" bg="radial-gradient(ellipse at center, rgba(16,185,129,0.1) 0%, transparent 70%)" filter="blur(50px)" pointerEvents="none" />
           <Box position="absolute" top="0" right="0" w="100%" h="100%" bg={isDark ? "url('data:image/svg+xml;utf8,<svg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"2\" cy=\"2\" r=\"1\" fill=\"rgba(255,255,255,0.03)\"/></svg>')" : "url('data:image/svg+xml;utf8,<svg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"2\" cy=\"2\" r=\"1\" fill=\"rgba(0,0,0,0.03)\"/></svg>')"} pointerEvents="none" />
           
           <Flex justify="space-between" align="center" position="relative" zIndex={1}>
             <Flex align="center" gap={10}>
                {/* Glowing Avatar */}
                <Box position="relative">
                  <Box position="absolute" inset="-4px" bgGradient="linear(to-br, blue.400, purple.500)" borderRadius="full" filter="blur(10px)" opacity={0.5} />
                  <Avatar name={fullName} src={profileImageUrl} w="130px" h="130px" bg="#E5E7EB" color="gray.500" border="4px solid" borderColor={cardBg} boxShadow="xl" position="relative" zIndex={1} />
                  <button type="button" onClick={() => avatarInputRef.current?.click()}
                    style={{ position: "absolute", bottom: 4, right: 4, width: 40, height: 40, borderRadius: "50%", background: isDark ? "#1F2937" : "white", border: "1px solid", borderColor: isDark ? "#374151" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 16px rgba(0,0,0,0.15)", transition: "all 0.2s", zIndex: 2 }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {avatarUploading ? <Spinner size="sm" color="#6B7280" /> : <Camera size={18} color={isDark ? "white" : "#4B5563"} />}
                  </button>
                </Box>
                
                <Box>
                  <Flex align="center" gap={3} mb={3}>
                    <Text fontSize="36px" fontWeight="900" color={pageHeadingColor} letterSpacing="-0.03em" lineHeight="1.1">
                      {form.title ? `${form.title} ${fullName}` : fullName}
                    </Text>
                    <Flex align="center" justify="center" w={7} h={7} bg="linear-gradient(135deg, #10B981 0%, #059669 100%)" color="white" borderRadius="full" title="Verified User" boxShadow="0 4px 10px rgba(16,185,129,0.3)">
                      <MdOutlineVerified size={16} />
                    </Flex>
                  </Flex>
                  <Flex align="center" gap={4} flexWrap="wrap">
                    <Flex align="center" gap={2} bg={isDark ? "whiteAlpha.100" : "gray.50"} px={3} py={1.5} borderRadius="lg" border="1px solid" borderColor={isDark ? "whiteAlpha.200" : "blackAlpha.100"} transition="all 0.2s" _hover={{ bg: isDark ? "whiteAlpha.200" : "gray.100" }}>
                      <Mail size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                      <Text fontSize="14px" fontWeight="600" color={pageSubColor}>{s(user?.username)}</Text>
                    </Flex>
                    {resolvedPhone && (
                      <Flex align="center" gap={2} bg={isDark ? "whiteAlpha.100" : "gray.50"} px={3} py={1.5} borderRadius="lg" border="1px solid" borderColor={isDark ? "whiteAlpha.200" : "blackAlpha.100"} transition="all 0.2s" _hover={{ bg: isDark ? "whiteAlpha.200" : "gray.100" }}>
                        <Phone size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text fontSize="14px" fontWeight="600" color={pageSubColor}>{resolvedPhone}</Text>
                      </Flex>
                    )}
                  </Flex>
                </Box>
             </Flex>
             
             <VStack align="flex-end" spacing={4}>
               {/* Unified Actions Pill */}
               <Flex align="center" bg={isDark ? "rgba(255,255,255,0.03)" : "gray.50"} border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.50"} p={1} borderRadius="2xl" boxShadow={isDark ? "none" : "0 2px 10px rgba(0,0,0,0.02)"}>
                 <Button leftIcon={<Edit2 size={14} />} onClick={handleOpenEdit} variant="ghost" size="sm" borderRadius="xl" px={4} fontWeight="700" color={isDark ? "white" : "gray.900"} _hover={{ bg: isDark ? "whiteAlpha.100" : "white", shadow: isDark ? "none" : "sm" }} transition="all 0.2s">
                   Edit Profile
                 </Button>
                 <Box w="1px" h="16px" bg={isDark ? "whiteAlpha.200" : "blackAlpha.100"} mx={1} />
                 <Button onClick={() => router.push("/settings")} variant="ghost" size="sm" borderRadius="xl" px={3} color={pageSubColor} _hover={{ bg: isDark ? "whiteAlpha.100" : "white", color: pageHeadingColor, shadow: isDark ? "none" : "sm" }} transition="all 0.2s" display="flex" alignItems="center" justifyContent="center">
                   <Settings size={16} />
                 </Button>
               </Flex>
             </VStack>
           </Flex>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={10} mt={8}>
          {/* Main Content Column */}
          <VStack spacing={10} align="stretch">
            {/* Stats row */}
            <Grid templateColumns="repeat(4, 1fr)" gap={5}>
              {[
                { label: "Certificates", value: courseStore.isMyCertificatesLoading ? "—" : courseStore.myCertificates.length, icon: Award, bgDark: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.05) 100%)", bgLight: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", iconBg: "rgba(59,130,246,0.2)", iconColor: "#2563EB" },
                { label: "Quizzes", value: stores.quizStore.myAttempts.length, icon: Edit2, bgDark: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)", bgLight: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)", iconBg: "rgba(16,185,129,0.2)", iconColor: "#059669" },
                { label: "Bookmarks", value: courseStore.isBookmarksLoading ? "—" : bookmarkedCourses.length, icon: Bookmark, bgDark: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(147,51,234,0.05) 100%)", bgLight: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)", iconBg: "rgba(168,85,247,0.2)", iconColor: "#9333EA" },
                { label: "Avg Rating", value: "4.8", icon: Star, bgDark: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.05) 100%)", bgLight: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)", iconBg: "rgba(245,158,11,0.2)", iconColor: "#D97706" }
              ].map((stat, i) => (
                <Box key={i} bg={isDark ? stat.bgDark : stat.bgLight} p={6} borderRadius="3xl" position="relative" overflow="hidden" boxShadow={isDark ? "none" : "0 4px 15px rgba(0,0,0,0.02)"} transition="all 0.3s" _hover={{ transform: "translateY(-4px)", shadow: isDark ? "0 10px 30px rgba(0,0,0,0.2)" : "0 10px 30px rgba(0,0,0,0.08)" }}>
                  <Box position="absolute" top="-10px" right="-10px" opacity={isDark ? 0.05 : 0.04} transform="rotate(-15deg)" pointerEvents="none">
                    <stat.icon size={110} color={stat.iconColor} />
                  </Box>
                  <Flex justify="space-between" align="flex-start" position="relative" zIndex={1}>
                    <Box mt={8}>
                      <Text fontSize="34px" fontWeight="900" color={isDark ? "white" : "gray.900"} lineHeight="1" letterSpacing="-0.02em">{stat.value}</Text>
                      <Text mt={2} fontSize="12px" fontWeight="700" color={isDark ? "whiteAlpha.700" : "gray.600"} textTransform="uppercase" letterSpacing="0.05em">{stat.label}</Text>
                    </Box>
                    <Flex align="center" justify="center" w={12} h={12} borderRadius="xl" bg={stat.iconBg}>
                      <stat.icon size={22} color={stat.iconColor} />
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Grid>

            {/* Profile Details */}
            <Box bg={cardBg} borderRadius="3xl" p={8} border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.50"} boxShadow={isDark ? "none" : "0 10px 30px rgba(0,0,0,0.03)"}>
              <Flex align="center" justify="space-between" mb={8} pb={6} borderBottom="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.50"}>
                <Flex align="center" gap={4}>
                  <Flex align="center" justify="center" w={12} h={12} borderRadius="xl" bg={isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)"} color={isDark ? "#60A5FA" : "#3B82F6"}>
                    <UserIcon size={24} strokeWidth={2.5} />
                  </Flex>
                  <Box>
                    <Text fontSize="22px" fontWeight="900" color={pageHeadingColor} letterSpacing="-0.02em" lineHeight="1.2">Personal Information</Text>
                    <Text fontSize="13px" fontWeight="600" color={pageSubColor} mt={0.5}>Manage your basic profile details</Text>
                  </Box>
                </Flex>
                <Button size="sm" variant="outline" color={isDark ? "gray.300" : "gray.600"} borderColor={isDark ? "whiteAlpha.200" : "gray.200"} _hover={{ bg: isDark ? "whiteAlpha.100" : "gray.50", color: isDark ? "white" : "black", transform: "translateY(-1px)", shadow: "sm" }} transition="all 0.2s" borderRadius="lg" leftIcon={<Edit2 size={14} />} onClick={handleOpenEdit} px={5} fontWeight="600">
                  Edit
                </Button>
              </Flex>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                {[
                  { icon: Building2, label: "Department", value: s(user?.department), color: "blue" },
                  { icon: IdCard, label: "Employee Code", value: s(user?.code), color: "purple" },
                  { icon: CalendarCheck, label: "Joined Date", value: fmtDate(user?.joiningDate), color: "green" },
                  { icon: Cake, label: "Date of Birth", value: fmtDate(form.dateOfBirth || user?.dateOfBirth), color: "pink" },
                  { icon: UserCircle, label: "Gender", value: genderLabel(form.gender || user?.gender), color: "orange" },
                  { icon: Home, label: "Address", value: form.address, color: "cyan" },
                  { icon: Building, label: "City", value: form.city, color: "red" },
                  { icon: Globe2, label: "Country", value: form.country, color: "teal" },
                ].map((item, idx) => (
                  <Flex
                    key={idx}
                    align="center"
                    gap={5}
                    p={5}
                    borderRadius="2xl"
                    bg={isDark ? "whiteAlpha.50" : "white"}
                    border="1px solid"
                    borderColor={isDark ? "whiteAlpha.100" : `${item.color}.100`}
                    boxShadow={isDark ? "none" : `0 4px 20px var(--chakra-colors-${item.color}-50)`}
                    transition="all 0.3s"
                    _hover={{ transform: "translateY(-4px)", shadow: isDark ? "0 10px 30px rgba(0,0,0,0.5)" : `0 10px 25px var(--chakra-colors-${item.color}-100)`, borderColor: isDark ? "whiteAlpha.300" : `${item.color}.200` }}
                  >
                    <Flex align="center" justify="center" w={14} h={14} borderRadius="xl" bg={isDark ? "whiteAlpha.100" : `${item.color}.50`} color={`var(--chakra-colors-${item.color}-500)`}>
                      <item.icon size={24} />
                    </Flex>
                    <Box>
                      <Text fontSize="11px" fontWeight="800" color={isDark ? "whiteAlpha.600" : `${item.color}.600`} textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                        {item.label}
                      </Text>
                      <Text fontSize="16px" fontWeight="900" color={isDark ? "white" : "gray.900"}>
                        {item.value || "N/A"}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </Grid>
              {form.bio && (
                <Box mt={8} bg={isDark ? "whiteAlpha.50" : "rgba(99, 102, 241, 0.04)"} borderRadius="2xl" p={6} px={8} border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "rgba(99, 102, 241, 0.1)"} position="relative" overflow="hidden">
                  <Box position="absolute" top={4} right={6} opacity={isDark ? 0.05 : 0.03} transform="rotate(10deg)">
                    <Quote size={80} fill="currentColor" />
                  </Box>
                  <Flex gap={3} align="center" mb={4} position="relative" zIndex={1}>
                    <Flex align="center" justify="center" w={8} h={8} borderRadius="full" bg={isDark ? "whiteAlpha.200" : "rgba(99, 102, 241, 0.1)"} color={isDark ? "white" : "#4F46E5"}>
                       <Quote size={14} strokeWidth={3} />
                    </Flex>
                    <Text fontSize="12px" fontWeight="800" color={isDark ? "whiteAlpha.600" : "#4F46E5"} textTransform="uppercase" letterSpacing="0.05em">
                      About Me
                    </Text>
                  </Flex>
                  <Text fontSize="16px" fontWeight="500" lineHeight="1.8" color={isDark ? "whiteAlpha.900" : "gray.800"} position="relative" zIndex={1} fontStyle="italic">
                    "{form.bio}"
                  </Text>
                </Box>
              )}
            </Box>
          </VStack>

          {/* Sidebar Column */}
          <VStack spacing={6} align="stretch">
             {/* Premium Banner */}
             <Box bg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" borderRadius="3xl" p={8} color="white" position="relative" overflow="hidden" boxShadow={isDark ? "0 10px 30px rgba(0,0,0,0.5)" : "0 15px 35px rgba(245, 158, 11, 0.3)"}>
                <Box position="absolute" top="-20px" right="-20px" opacity={0.15}><Sparkles size={120} /></Box>
                <Flex align="center" gap={4} mb={4}>
                  <Flex align="center" justify="center" bg="whiteAlpha.300" w={12} h={12} borderRadius="xl" backdropFilter="blur(10px)">
                    <Award size={24} color="white" />
                  </Flex>
                  <Text fontSize="20px" fontWeight="900" letterSpacing="-0.02em">Premium Member</Text>
                </Flex>
                <Text fontSize="14px" fontWeight="500" color="whiteAlpha.900" mb={6} lineHeight="1.5">
                  Unlock exclusive courses, priority support, and verified premium certificates.
                </Text>
                <Button size="lg" w="full" bg="white" color="orange.600" _hover={{ bg: "gray.50", transform: "translateY(-2px)", shadow: "lg" }} borderRadius="2xl" fontWeight="800" transition="all 0.2s">
                  Upgrade Now
                </Button>
             </Box>

             {/* Action Cards */}
             <VStack spacing={4} align="stretch">
               {[
                 { id: "certificates", title: "Certificates", sub: "View and download PDF", icon: Award, color: "#3B82F6", bg: "rgba(59,130,246,0.15)", bgLight: "rgba(59,130,246,0.03)" },
                 { id: "bookmarks", title: "Bookmarks", sub: "Saved learning materials", icon: Bookmark, color: "#F43F5E", bg: "rgba(244,63,94,0.15)", bgLight: "rgba(244,63,94,0.03)" },
                 { id: "teams", title: "Teams & Dept", sub: "Colleagues and team leads", icon: Users, color: "#10B981", bg: "rgba(16,185,129,0.15)", bgLight: "rgba(16,185,129,0.03)" },
                 { id: "help", title: "Help & Support", sub: "FAQs and contact support", icon: HelpCircle, color: "#F59E0B", bg: "rgba(245,158,11,0.15)", bgLight: "rgba(245,158,11,0.03)" },
               ].map((action, i) => (
                  <Box as={motion.button} key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveModal(action.id as any)} textAlign="left" w="100%" bg={isDark ? "whiteAlpha.50" : action.bgLight} border="1px solid" borderColor={isDark ? "whiteAlpha.100" : action.bg} borderRadius="2xl" p={5} boxShadow="none" transition="all 0.3s" _hover={{ bg: action.bg, borderColor: action.color, boxShadow: isDark ? `0 0 20px ${action.bg}` : `0 10px 25px ${action.bg}` }}>
                    <Flex align="center" justify="space-between">
                      <Flex align="center" gap={4}>
                        <Flex align="center" justify="center" w={12} h={12} borderRadius="xl" bg={action.bg} boxShadow={isDark ? "none" : "inset 0 0 0 1px rgba(0,0,0,0.02)"}>
                          <action.icon size={22} color={action.color} strokeWidth={2.5} />
                        </Flex>
                        <Box>
                          <Text fontSize="16px" fontWeight="800" color={pageHeadingColor}>{action.title}</Text>
                          <Text fontSize="13px" fontWeight="600" color={pageSubColor} mt={0.5}>{action.sub}</Text>
                        </Box>
                      </Flex>
                      <Flex align="center" justify="center" w={8} h={8} borderRadius="full" bg={isDark ? "whiteAlpha.100" : "white"} border="1px solid" borderColor={isDark ? "whiteAlpha.200" : "gray.200"}>
                         <ChevronRight size={16} color={isDark ? "white" : action.color} strokeWidth={3} />
                      </Flex>
                    </Flex>
                  </Box>
               ))}
             </VStack>
          </VStack>
        </Grid>
      </Box>

      {/* ═══ MOBILE — Exact RideX App Theme ═══ */}
      <Box display="none" minH="100vh" bg={isDark ? "transparent" : "#F9FAFB"} px={0} pb={12} fontFamily="'Inter', sans-serif">
        {/* ── Header ── */}
        <Box px={4} pt={6} pb={4}>
          <Flex align="center" justify="space-between" position="relative">
            <Link href="/">
              <Flex as="button" align="center" justify="center" w={10} h={10} bg="transparent" borderRadius="full" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "#E5E7EB"} _active={{ scale: 0.95, bg: isDark ? "whiteAlpha.50" : "gray.50" }} transition="all 0.2s">
                <ChevronRight size={20} style={{ transform: "rotate(180deg)" }} color={isDark ? "white" : "black"} />
              </Flex>
            </Link>
            
            <Text position="absolute" left="50%" transform="translateX(-50%)" fontSize="18px" fontWeight="800" color={isDark ? "white" : "black"} letterSpacing="-0.01em">
              Profile
            </Text>
            
            <Flex as="button" onClick={() => router.push("/settings")} align="center" justify="center" w={10} h={10} bg="transparent" borderRadius="full" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "#E5E7EB"} _active={{ scale: 0.95, bg: isDark ? "whiteAlpha.50" : "gray.50" }} transition="all 0.2s">
              <Settings size={20} color={isDark ? "white" : "#111827"} />
            </Flex>
          </Flex>
        </Box>

        {/* ── Profile Card ── */}
        <Box mx={2} mb={3} borderRadius="2xl" bg={isDark ? "#1E2028" : "white"} boxShadow={isDark ? "none" : "0 2px 10px rgba(0,0,0,0.03)"} border="1px solid" borderColor={isDark ? "#2D3040" : "#F3F4F6"}>
          <Flex align="center" justify="space-between" p={4}>
            <Flex align="center" gap={4}>
              <Box position="relative">
                <Box p="3px" borderRadius="full" bg="#F5C518" boxShadow="0 2px 10px rgba(245, 197, 24, 0.3)">
                  <Avatar name={fullName} src={profileImageUrl} w="64px" h="64px" border="2px solid white" bg="#D1D5DB" color="white" fontWeight="bold" />
                </Box>
                <button type="button" onClick={() => avatarInputRef.current?.click()} aria-label="Change photo"
                  style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: "white", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                  {avatarUploading ? <Spinner size="xs" color="#6B7280" /> : <Camera size={10} color="#6B7280" />}
                </button>
              </Box>

              <Box>
                <Text fontWeight="800" fontSize="16px" color={isDark ? "white" : "black"} letterSpacing="-0.01em">
                  {form.title ? `${form.title} ${fullName}` : fullName}
                </Text>
                {resolvedPhone && <Text fontSize="12px" color={isDark ? "#9CA3AF" : "#6B7280"} mt="1px">{resolvedPhone}</Text>}
                <Text fontSize="11px" color={isDark ? "#9CA3AF" : "#9CA3AF"}>{s(user?.username)}</Text>
                
                <Flex align="center" gap={1} mt={1}>
                  <MdOutlineVerified size={12} color="#10B981" />
                  <Text fontSize="11px" fontWeight="700" color="#10B981">Verified User</Text>
                </Flex>
              </Box>
            </Flex>
            <ChevronRight size={18} color={isDark ? "#6B7280" : "#D1D5DB"} />
          </Flex>
        </Box>

        {/* ── Premium Banner ── */}
        <Box mx={2} mb={6} borderRadius="2xl" p="2px" bgGradient="linear(to-br, #F5C518, #F5A623, #FF6B6B)" boxShadow="0 4px 20px rgba(245, 197, 24, 0.25)">
          <Flex bg={isDark ? "gray.900" : "white"} borderRadius="xl" p={3.5} align="center" justify="space-between">
             <Flex align="center" gap={4}>
               <Flex align="center" justify="center" w={11} h={11} borderRadius="xl" bgGradient="linear(to-br, #F5C518, #F5A623)" color="white" boxShadow="0 4px 10px rgba(245,197,24,0.4)">
                 <Award size={22} strokeWidth={2.5} />
               </Flex>
               <Box>
                 <Text fontSize="16px" fontWeight="900" bgGradient="linear(to-r, #F5A623, #F5C518)" bgClip="text" textTransform="uppercase" letterSpacing="0.02em">Pro Member</Text>
                 <Text fontSize="11px" fontWeight="700" color={isDark ? "gray.400" : "gray.500"} mt={0.5}>Unlock premium features</Text>
               </Box>
             </Flex>
             <button onClick={() => setActiveModal("certificates")} style={{ background: "linear-gradient(135deg, #F5C518, #F5A623)", color: "white", padding: "8px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: "800", border: "none", cursor: "pointer", boxShadow: "0 4px 10px rgba(245,197,24,0.4)" }}>
               Upgrade
             </button>
          </Flex>
        </Box>

        {/* ── Account Overview ── */}
        <Text px={3} mb={4} fontSize="12px" fontWeight="800" color={isDark ? "#9CA3AF" : "#4B5563"} textTransform="uppercase" letterSpacing="0.05em">
          Account Overview
        </Text>
        
        <Grid templateColumns="repeat(2, 1fr)" gap={3} mx={2} mb={6}>
          {/* Certs */}
          <Flex direction="column" align="center" justify="center" bg={isDark ? "whiteAlpha.50" : "blue.50"} p={4} borderRadius="2xl" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blue.100"} boxShadow={isDark ? "none" : "0 4px 15px rgba(59, 130, 246, 0.1)"}>
            <Flex align="center" justify="center" w={12} h={12} borderRadius="2xl" bgGradient="linear(to-br, blue.400, blue.600)" color="white" boxShadow={isDark ? "none" : "0 4px 12px rgba(59,130,246,0.3)"} mb={3}>
              <Award size={24} strokeWidth={2.5} />
            </Flex>
            <Text fontSize="24px" fontWeight="900" color={isDark ? "white" : "blue.900"} lineHeight="1.1">{courseStore.isMyCertificatesLoading ? "—" : courseStore.myCertificates.length}</Text>
            <Text fontSize="11px" fontWeight="800" color={isDark ? "#9CA3AF" : "blue.600"} textTransform="uppercase" letterSpacing="0.02em" mt={1}>Total Certs</Text>
          </Flex>
          
          {/* Quizzes */}
          <Flex direction="column" align="center" justify="center" bg={isDark ? "whiteAlpha.50" : "green.50"} p={4} borderRadius="2xl" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "green.100"} boxShadow={isDark ? "none" : "0 4px 15px rgba(16, 185, 129, 0.1)"}>
            <Flex align="center" justify="center" w={12} h={12} borderRadius="2xl" bgGradient="linear(to-br, green.400, teal.500)" color="white" boxShadow={isDark ? "none" : "0 4px 12px rgba(16,185,129,0.3)"} mb={3}>
              <Edit2 size={24} strokeWidth={2.5} />
            </Flex>
            <Text fontSize="24px" fontWeight="900" color={isDark ? "white" : "green.900"} lineHeight="1.1">{stores.quizStore.myAttempts.length}</Text>
            <Text fontSize="11px" fontWeight="800" color={isDark ? "#9CA3AF" : "green.600"} textTransform="uppercase" letterSpacing="0.02em" mt={1}>Quizzes</Text>
          </Flex>
          
          {/* Saved */}
          <Flex direction="column" align="center" justify="center" bg={isDark ? "whiteAlpha.50" : "purple.50"} p={4} borderRadius="2xl" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "purple.100"} boxShadow={isDark ? "none" : "0 4px 15px rgba(168, 85, 247, 0.1)"}>
            <Flex align="center" justify="center" w={12} h={12} borderRadius="2xl" bgGradient="linear(to-br, purple.400, purple.600)" color="white" boxShadow={isDark ? "none" : "0 4px 12px rgba(168,85,247,0.3)"} mb={3}>
              <Bookmark size={24} strokeWidth={2.5} />
            </Flex>
            <Text fontSize="24px" fontWeight="900" color={isDark ? "white" : "purple.900"} lineHeight="1.1">3</Text>
            <Text fontSize="11px" fontWeight="800" color={isDark ? "#9CA3AF" : "purple.600"} textTransform="uppercase" letterSpacing="0.02em" mt={1}>Saved</Text>
          </Flex>
          
          {/* Rating */}
          <Flex direction="column" align="center" justify="center" bg={isDark ? "whiteAlpha.50" : "orange.50"} p={4} borderRadius="2xl" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "orange.100"} boxShadow={isDark ? "none" : "0 4px 15px rgba(245, 158, 11, 0.1)"}>
            <Flex align="center" justify="center" w={12} h={12} borderRadius="2xl" bgGradient="linear(to-br, orange.400, red.500)" color="white" boxShadow={isDark ? "none" : "0 4px 12px rgba(245,158,11,0.3)"} mb={3}>
              <Star size={24} strokeWidth={2.5} />
            </Flex>
            <Text fontSize="24px" fontWeight="900" color={isDark ? "white" : "orange.900"} lineHeight="1.1">4.8</Text>
            <Text fontSize="11px" fontWeight="800" color={isDark ? "#9CA3AF" : "orange.600"} textTransform="uppercase" letterSpacing="0.02em" mt={1}>Rating</Text>
          </Flex>
        </Grid>

        {/* ── Menu List ── */}
        <Box px={3} mb={2}>
          <Text fontSize="12px" fontWeight="800" color={isDark ? "gray.400" : "gray.500"} textTransform="uppercase" letterSpacing="0.05em">
            Settings & More
          </Text>
        </Box>
        <Box mx={2} bg={isDark ? "whiteAlpha.50" : "white"} borderRadius="2xl" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.50"} overflow="hidden" boxShadow={isDark ? "none" : "0 4px 20px rgba(0,0,0,0.02)"}>
          {menuItems.map((m, i) => (
            <Flex key={m.key} onClick={m.onClick} _active={{ scale: 0.98, opacity: 0.8 }} transition="all 0.1s" w="100%" align="center" justify="space-between" py={3.5} px={4} cursor="pointer" borderBottom={i !== menuItems.length - 1 ? (isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #F3F4F6") : "none"}>
                <Flex align="center" gap={4}>
                  <Flex align="center" justify="center" w={10} h={10} borderRadius="xl" bg={[
                      isDark ? "rgba(59,130,246,0.15)" : "blue.50",
                      isDark ? "rgba(239,68,68,0.15)" : "red.50",
                      isDark ? "rgba(16,185,129,0.15)" : "green.50",
                      isDark ? "rgba(245,158,11,0.15)" : "orange.50",
                      isDark ? "rgba(168,85,247,0.15)" : "purple.50",
                      isDark ? "rgba(20,184,166,0.15)" : "teal.50"
                    ][i % 6]} color={[
                      isDark ? "#60A5FA" : "blue.600",
                      isDark ? "#F87171" : "red.600",
                      isDark ? "#34D399" : "green.600",
                      isDark ? "#FBBF24" : "orange.600",
                      isDark ? "#C084FC" : "purple.600",
                      isDark ? "#2DD4BF" : "teal.600"
                    ][i % 6]}>
                    <m.icon size={20} strokeWidth={2.5} />
                  </Flex>
                  <Box>
                    <Text fontSize="15px" fontWeight="700" color={isDark ? "white" : "gray.900"} letterSpacing="-0.01em">{m.label}</Text>
                    {m.desc && <Text fontSize="12px" fontWeight="500" color={isDark ? "whiteAlpha.600" : "gray.500"} mt={0.5}>{m.desc}</Text>}
                  </Box>
                </Flex>
                
                <Flex align="center" gap={2} ml="auto" flexShrink={0}>
                  {m.badge && (
                     <span style={{ background: isDark ? "rgba(16,185,129,0.2)" : "#D1FAE5", color: isDark ? "#34D399" : "#10B981", borderRadius: 4, padding: "2px 8px", fontSize: "10px", fontWeight: "700" }}>
                       {m.badge}
                     </span>
                  )}
                  <ChevronRight size={16} color={isDark ? "gray.500" : "gray.400"} />
                </Flex>
            </Flex>
          ))}
          
          <Flex onClick={toggleColorMode} _active={{ scale: 0.98, opacity: 0.8 }} transition="all 0.1s" w="100%" align="center" justify="space-between" py={3.5} px={4} cursor="pointer" borderTop={isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #F3F4F6"}>
                <Flex align="center" gap={4}>
                  <Flex align="center" justify="center" w={9} h={9} borderRadius="lg" bgGradient="linear(to-br, gray.600, gray.800)" color="white" boxShadow={isDark ? "none" : "0 3px 10px rgba(0,0,0,0.15)"}>
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </Flex>
                  <Text fontSize="15px" fontWeight="700" color={isDark ? "white" : "gray.900"}>Theme Mode</Text>
                </Flex>
                
                <Flex align="center" gap={2} ml="auto" flexShrink={0}>
                  <Text fontSize="11px" fontWeight="600" color={isDark ? "gray.400" : "gray.500"}>{isDark ? "Dark" : "Light"}</Text>
                  <ChevronRight size={16} color={isDark ? "gray.500" : "gray.400"} />
                </Flex>
          </Flex>
        </Box>

        {/* ── Logout ── */}
        <Box mx={2} mt={6}>
          <Button onClick={handleLogout} w="100%" size="lg" borderRadius="xl" bg={isDark ? "rgba(239,68,68,0.1)" : "red.50"} color={isDark ? "red.400" : "red.600"} border="1px solid" borderColor={isDark ? "rgba(239,68,68,0.2)" : "red.100"} _hover={{ bg: isDark ? "rgba(239,68,68,0.2)" : "red.100" }} leftIcon={<LogOut size={18} />} fontWeight="700">
            Sign Out
          </Button>
        </Box>
      </Box>


      {/* ── Settings Drawer (Responsive 55vw Desktop) ── */}
      <Drawer isOpen={isSettingsOpen} placement="right" onClose={onSettingsClose} size="full">
        <DrawerOverlay bg="blackAlpha.400" backdropFilter="blur(5px)" />
        <DrawerContent bg={isDark ? "gray.900" : "#F9FAFB"} maxW={{ base: "100vw", md: "55vw" }} borderLeftRadius={{ base: "none", md: "2xl" }} overflow="hidden" borderLeft="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.50"}>
          <DrawerBody p={0} m={0}>
            <Box minH="100vh" fontFamily="'Inter', sans-serif" pb={12} overflowY="auto">
              {/* Header */}
              <Box px={6} pt={8} pb={6} bg={isDark ? "transparent" : "white"} borderBottom="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.50"} position="relative" zIndex={1} boxShadow={isDark ? "none" : "0 4px 20px rgba(0,0,0,0.02)"}>
                <Flex align="center" gap={4} mb={2}>
                  <button onClick={onSettingsClose} style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", borderRadius: "50%", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}>
                    <ChevronRight size={18} style={{ transform: "rotate(180deg)" }} color={isDark ? "white" : "black"} />
                  </button>
                  <Text fontSize="26px" fontWeight="900" letterSpacing="-0.02em" color={pageHeadingColor}>
                    Settings
                  </Text>
                </Flex>
                <Text fontSize="13px" color={pageSubColor} mt={2} fontWeight="500">
                  Manage your preferences and account settings.
                </Text>
              </Box>

              {/* Preferences Section */}
              <Box px={6} mt={6}>
                <Text mb={3} fontSize="12px" fontWeight="800" color={isDark ? "gray.400" : "gray.500"} textTransform="uppercase" letterSpacing="0.05em">
                  Preferences
                </Text>
                <Box bg={isDark ? "whiteAlpha.50" : "white"} borderRadius="2xl" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.50"} overflow="hidden">
                  <Flex align="center" gap={4} py={3.5} px={4} borderBottom="1px solid" borderColor={isDark ? "whiteAlpha.100" : "gray.100"} _hover={{ bg: isDark ? "whiteAlpha.100" : "gray.50" }} transition="all 0.2s">
                    <Flex align="center" justify="center" w={8} h={8} borderRadius="lg" bgGradient="linear(to-br, red.400, pink.500)" color="white"><Bell size={16} /></Flex>
                    <Box flex={1}><Text fontSize="14px" fontWeight="700" color={isDark ? "white" : "gray.900"}>Notifications</Text></Box>
                    <Switch colorScheme="red" defaultChecked />
                  </Flex>
                  <Flex align="center" gap={4} py={3.5} px={4} borderBottom="1px solid" borderColor={isDark ? "whiteAlpha.100" : "gray.100"} _hover={{ bg: isDark ? "whiteAlpha.100" : "gray.50" }} transition="all 0.2s">
                    <Flex align="center" justify="center" w={8} h={8} borderRadius="lg" bgGradient="linear(to-br, green.400, teal.500)" color="white"><Volume2 size={16} /></Flex>
                    <Box flex={1}><Text fontSize="14px" fontWeight="700" color={isDark ? "white" : "gray.900"}>Sound</Text></Box>
                    <Switch colorScheme="green" defaultChecked />
                  </Flex>
                  <Flex align="center" gap={4} py={3.5} px={4} borderBottom="1px solid" borderColor={isDark ? "whiteAlpha.100" : "gray.100"} _hover={{ bg: isDark ? "whiteAlpha.100" : "gray.50" }} transition="all 0.2s">
                    <Flex align="center" justify="center" w={8} h={8} borderRadius="lg" bgGradient="linear(to-br, purple.500, indigo.600)" color="white"><Moon size={16} /></Flex>
                    <Box flex={1}><Text fontSize="14px" fontWeight="700" color={isDark ? "white" : "gray.900"}>Dark Mode</Text></Box>
                    <Switch colorScheme="purple" isChecked={isDark} onChange={toggleColorMode} />
                  </Flex>
                  <Flex align="center" gap={4} py={3.5} px={4} borderBottom="1px solid" borderColor={isDark ? "whiteAlpha.100" : "gray.100"} _hover={{ bg: isDark ? "whiteAlpha.100" : "gray.50" }} transition="all 0.2s" cursor="pointer">
                    <Flex align="center" justify="center" w={8} h={8} borderRadius="lg" bgGradient="linear(to-br, orange.400, orange.600)" color="white"><Globe size={16} /></Flex>
                    <Box flex={1}><Text fontSize="14px" fontWeight="700" color={isDark ? "white" : "gray.900"}>Language</Text></Box>
                    <Text fontSize="13px" fontWeight="600" color={isDark ? "gray.400" : "gray.500"}>English</Text>
                    <ChevronRight size={16} color={isDark ? "gray.500" : "gray.400"} />
                  </Flex>
                </Box>
              </Box>

              {/* Account Section */}
              <Box px={6} mt={8}>
                <Text mb={3} fontSize="12px" fontWeight="800" color={isDark ? "gray.400" : "gray.500"} textTransform="uppercase" letterSpacing="0.05em">
                  Account Details
                </Text>
                <Box bg={isDark ? "whiteAlpha.50" : "white"} borderRadius="2xl" border="1px solid" borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.50"} overflow="hidden">
                  <Flex as="button" w="100%" onClick={onSettingsClose} align="center" gap={4} py={3.5} px={4} borderBottom="1px solid" borderColor={isDark ? "whiteAlpha.100" : "gray.100"} _hover={{ bg: isDark ? "whiteAlpha.100" : "gray.50" }} transition="all 0.2s">
                    <Flex align="center" justify="center" w={8} h={8} borderRadius="lg" bgGradient="linear(to-br, blue.400, blue.600)" color="white"><UserIcon size={16} /></Flex>
                    <Box flex={1} textAlign="left"><Text fontSize="14px" fontWeight="700" color={isDark ? "white" : "gray.900"}>Personal Information</Text></Box>
                    <ChevronRight size={16} color={isDark ? "gray.500" : "gray.400"} />
                  </Flex>
                  <Flex as="button" w="100%" align="center" gap={4} py={3.5} px={4} borderBottom="1px solid" borderColor={isDark ? "whiteAlpha.100" : "gray.100"} _hover={{ bg: isDark ? "whiteAlpha.100" : "gray.50" }} transition="all 0.2s">
                    <Flex align="center" justify="center" w={8} h={8} borderRadius="lg" bgGradient="linear(to-br, teal.400, teal.600)" color="white"><Shield size={16} /></Flex>
                    <Box flex={1} textAlign="left"><Text fontSize="14px" fontWeight="700" color={isDark ? "white" : "gray.900"}>Privacy & Security</Text></Box>
                    <ChevronRight size={16} color={isDark ? "gray.500" : "gray.400"} />
                  </Flex>
                  <Flex as="button" w="100%" align="center" gap={4} py={3.5} px={4} _hover={{ bg: isDark ? "whiteAlpha.100" : "gray.50" }} transition="all 0.2s">
                    <Flex align="center" justify="center" w={8} h={8} borderRadius="lg" bgGradient="linear(to-br, gray.400, gray.600)" color="white"><HelpCircle size={16} /></Flex>
                    <Box flex={1} textAlign="left"><Text fontSize="14px" fontWeight="700" color={isDark ? "white" : "gray.900"}>Help & Support</Text></Box>
                    <ChevronRight size={16} color={isDark ? "gray.500" : "gray.400"} />
                  </Flex>
                </Box>
              </Box>

              {/* Logout Button */}
              <Box px={6} mt={8}>
                <Button onClick={handleLogout} w="100%" size="lg" borderRadius="xl" bg={isDark ? "rgba(239,68,68,0.1)" : "red.50"} color={isDark ? "red.400" : "red.600"} border="1px solid" borderColor={isDark ? "rgba(239,68,68,0.2)" : "red.100"} _hover={{ bg: isDark ? "rgba(239,68,68,0.2)" : "red.100" }} leftIcon={<LogOut size={18} />}>
                  Sign Out
                </Button>
              </Box>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={handleModalClose}
        form={tempForm}
        handleChange={(field: string, value: any) =>
          setTempForm((c) => ({ ...c, [field]: value }))
        }
        onAvatarSelect={() => modalAvatarInputRef.current?.click()}
        onAvatarChange={(file: File | null) =>
          handleAvatarSelection(file, false)
        }
        onAvatarRemove={handleTempAvatarRemove}
        handleSave={handleSave}
        saving={saving}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          void handleAvatarSelection(file, true);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={modalAvatarInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          void handleAvatarSelection(file, false);
          e.currentTarget.value = "";
        }}
      />

      {modalMeta &&
        (isMobile ? (
          <Drawer
            isOpen={Boolean(activeModal)}
            placement="bottom"
            onClose={() => setActiveModal(null)}
          >
            <DrawerOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
            <DrawerContent
              bg={isDark ? "gray.900" : "white"}
              color={isDark ? "white" : "gray.900"}
              borderTopRadius="3xl"
              maxH="85vh"
            >
              <Box
                w="40px"
                h="4px"
                bg={isDark ? "gray.600" : "gray.300"}
                borderRadius="full"
                mx="auto"
                mt={3}
              />
              <DrawerCloseButton top={4} right={4} borderRadius="full" />
              <DrawerHeader
                py={4}
                borderBottomWidth="1px"
                borderColor={isDark ? "gray.800" : "gray.100"}
              >
                <HStack spacing={3}>
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-xl ${modalMeta.color}`}
                    style={"style" in modalMeta ? modalMeta.style : undefined}
                  >
                    <modalMeta.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <Text fontSize="md" fontWeight="bold">
                      {modalMeta.title}
                    </Text>
                    <Text
                      fontSize="xs"
                      color={isDark ? "gray.400" : "gray.500"}
                    >
                      {modalMeta.sub}
                    </Text>
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
          <Modal
            isOpen={Boolean(activeModal)}
            onClose={() => setActiveModal(null)}
            size="lg"
            isCentered
            motionPreset="slideInBottom"
          >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
            <ModalContent
              borderRadius="3xl"
              overflow="hidden"
              bg={isDark ? "gray.900" : "white"}
              color={isDark ? "white" : "gray.900"}
            >
              <ModalHeader
                borderBottomWidth="1px"
                borderColor={isDark ? "gray.800" : "gray.100"}
                py={4}
              >
                <HStack spacing={3}>
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-xl ${modalMeta.color}`}
                    style={"style" in modalMeta ? modalMeta.style : undefined}
                  >
                    <modalMeta.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <Text fontSize="lg" fontWeight="bold">
                      {modalMeta.title}
                    </Text>
                    <Text
                      fontSize="xs"
                      color={isDark ? "gray.400" : "gray.500"}
                    >
                      {modalMeta.sub}
                    </Text>
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
        ))}
    </Box>
  );
});

export default ProfilePage;
