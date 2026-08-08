"use client";

import { CourseListItem, courseStore } from "@/app/store/courseStore/courseStore";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Progress,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClipboard,
  FiFileText,
  FiInfo,
  FiLayers,
  FiLoader,
  FiLock,
  FiPackage,
  FiPlayCircle,
  FiPlus,
  FiTrash2,
  FiUnlock,
  FiUploadCloud,
  FiVideo,
  FiX
} from "react-icons/fi";
import CourseQuizBuilder from "../components/CourseQuizBuilder";
import {
  CourseModuleSectionInput,
  CourseQuizInput,
  StoredFile,
  createEmptyModuleSection,
  createEmptyQuiz,
  createStoredFile,
  createStudyMaterialFiles,
  getFileKindLabel,
  inferModuleUploadKind,
  mapExistingQuiz,
  summarizeQuiz,
} from "../courseForm";

interface ModuleManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseListItem;
  onModulesUpdated?: () => void;
}

interface FullModuleFormState {
  name: string;
  description: string;
  isFreePreview: boolean;
  hasQuiz: boolean;
  hasTest: boolean;
  quiz: CourseQuizInput;
  studyMaterials: StoredFile[];
  sections: CourseModuleSectionInput[];
}

export default function ModuleManagementDrawer({
  isOpen,
  onClose,
  course,
  onModulesUpdated,
}: ModuleManagementDrawerProps) {
  const [modules, setModules] = useState<any[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [savingModuleId, setSavingModuleId] = useState<string | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [saveProgress, setSaveProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  // Draft new module form
  const [isNewModuleFormOpen, setIsNewModuleFormOpen] = useState(false);

  const isCourseFree = course.commerce?.pricingModel === "free";

  // Per-module editable forms state dictionary
  const [moduleForms, setModuleForms] = useState<Record<string, FullModuleFormState>>({});

  const courseId = course._id;
  const toast = useToast();

  // Color Mode Theme Hooks
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headerBg = useColorModeValue("gray.900", "gray.950");
  const bannerBg = useColorModeValue("blue.50", "blue.950");
  const bannerBorder = useColorModeValue("blue.200", "blue.800");
  const bannerTextColor = useColorModeValue("blue.900", "blue.200");
  const formBg = useColorModeValue("white", "gray.800");
  const formBorderColor = useColorModeValue("blue.500", "blue.400");
  const sectionBg = useColorModeValue("gray.50", "gray.900");

  const buildInitialForm = (mod?: any): FullModuleFormState => {
    if (!mod) {
      return {
        name: "",
        description: "",
        isFreePreview: isCourseFree,
        hasQuiz: false,
        hasTest: false,
        quiz: createEmptyQuiz("Module quiz"),
        studyMaterials: [],
        sections: [createEmptyModuleSection()],
      };
    }

    const mappedSections: CourseModuleSectionInput[] = Array.isArray(mod.sections) && mod.sections.length > 0
      ? mod.sections.map((sec: any, sIdx: number) => ({
          id: sec._id || `sec-${sIdx + 1}`,
          title: sec.title || "",
          description: sec.description || "",
          contentFile: sec.content?.previewUrl
            ? {
                name: sec.content.fileName || "Existing Lesson Content",
                file: null,
                kind: sec.content.kind === "scorm" ? "scorm" : sec.content.kind === "video" ? "video" : "scorm",
                previewUrl: sec.content.previewUrl,
              }
            : null,
          studyMaterials: Array.isArray(sec.studyMaterial)
            ? sec.studyMaterial.map((m: any, mIdx: number) => ({
                id: m._id || `s-mat-${mIdx}`,
                name: m.name || "PDF Document",
                file: null,
                kind: m.kind || "document",
                previewUrl: m.previewUrl,
              }))
            : [],
        }))
      : [createEmptyModuleSection()];

    const mappedModuleStudyMaterials: StoredFile[] = Array.isArray(mod.studyMaterial)
      ? mod.studyMaterial.map((m: any, mIdx: number) => ({
          id: m._id || `m-mat-${mIdx}`,
          name: m.name || "PDF Document",
          file: null,
          kind: m.kind || "document",
          previewUrl: m.previewUrl,
        }))
      : [];

    const moduleTitle = mod.title || "";
    const mappedQuiz = mapExistingQuiz(
      mod.assessments?.quiz,
      `${moduleTitle || "Module"} quiz`,
    );

    return {
      name: mod.title || "",
      description: mod.summary || "",
      isFreePreview: Boolean(mod.isFreePreview),
      hasQuiz: Boolean(mod.assessments?.quizEnabled || mappedQuiz.questions.length > 0),
      hasTest: Boolean(mod.assessments?.testEnabled),
      quiz: mappedQuiz,
      studyMaterials: mappedModuleStudyMaterials,
      sections: mappedSections,
    };
  };

  const loadModules = async () => {
    if (!courseId) return;
    setIsLoadingModules(true);
    setErrorMessage(null);
    try {
      const data = await courseStore.fetchCourseModules(courseId, { reset: true, limit: 100 });
      const loaded = Array.isArray(data) ? data : courseStore.modules || [];
      setModules(loaded);

      // Initialize form state for each module
      const initialForms: Record<string, FullModuleFormState> = {};
      loaded.forEach((mod: any) => {
        initialForms[mod._id] = buildInitialForm(mod);
      });
      setModuleForms(initialForms);

      if (loaded.length > 0 && !expandedModuleId) {
        setExpandedModuleId(loaded[0]._id);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load course modules");
    } finally {
      setIsLoadingModules(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadModules();
      setIsNewModuleFormOpen(false);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, courseId]);

  const handleOpenAddForm = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setModuleForms((prev) => ({
      ...prev,
      new: buildInitialForm(),
    }));
    setIsNewModuleFormOpen(true);
    setExpandedModuleId("new");
  };

  const handleCancelNewForm = () => {
    if (savingModuleId) return;
    setIsNewModuleFormOpen(false);
  };

  // Helper to update module form state for a given moduleId
  const updateModuleForm = (moduleId: string, patch: Partial<FullModuleFormState>) => {
    setModuleForms((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || buildInitialForm()),
        ...patch,
      },
    }));
  };

  // Section helper handlers for a module
  const addSection = (moduleId: string) => {
    const currentForm = moduleForms[moduleId] || buildInitialForm();
    updateModuleForm(moduleId, {
      sections: [...currentForm.sections, createEmptyModuleSection()],
    });
  };

  const removeSection = (moduleId: string, sectionId: string) => {
    const currentForm = moduleForms[moduleId] || buildInitialForm();
    if (currentForm.sections.length <= 1) return;
    updateModuleForm(moduleId, {
      sections: currentForm.sections.filter((s) => s.id !== sectionId),
    });
  };

  const updateSection = (moduleId: string, sectionId: string, patch: Partial<CourseModuleSectionInput>) => {
    const currentForm = moduleForms[moduleId] || buildInitialForm();
    updateModuleForm(moduleId, {
      sections: currentForm.sections.map((sec) => (sec.id === sectionId ? { ...sec, ...patch } : sec)),
    });
  };

  const handleSectionFileChange = (moduleId: string, sectionId: string, fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    updateSection(moduleId, sectionId, {
      contentFile: createStoredFile(file, inferModuleUploadKind(file)),
    });
  };

  const handleModuleStudyMaterialChange = (moduleId: string, fileList: FileList | null) => {
    if (!fileList?.length) return;
    const currentForm = moduleForms[moduleId] || buildInitialForm();
    updateModuleForm(moduleId, {
      studyMaterials: [...currentForm.studyMaterials, ...createStudyMaterialFiles(fileList)],
    });
  };

  const handleSectionStudyMaterialChange = (moduleId: string, sectionId: string, fileList: FileList | null) => {
    if (!fileList?.length) return;
    const currentForm = moduleForms[moduleId] || buildInitialForm();
    const targetSection = currentForm.sections.find((s) => s.id === sectionId);
    if (!targetSection) return;
    updateSection(moduleId, sectionId, {
      studyMaterials: [...targetSection.studyMaterials, ...createStudyMaterialFiles(fileList)],
    });
  };

  const removeModuleStudyMaterial = (moduleId: string, materialId: string) => {
    const currentForm = moduleForms[moduleId] || buildInitialForm();
    updateModuleForm(moduleId, {
      studyMaterials: currentForm.studyMaterials.filter((mat) => mat.id !== materialId),
    });
  };

  const removeSectionStudyMaterial = (moduleId: string, sectionId: string, materialId: string) => {
    const currentForm = moduleForms[moduleId] || buildInitialForm();
    const targetSection = currentForm.sections.find((s) => s.id === sectionId);
    if (!targetSection) return;
    updateSection(moduleId, sectionId, {
      studyMaterials: targetSection.studyMaterials.filter((mat) => mat.id !== materialId),
    });
  };

  const handleSaveModule = async (targetModuleId?: string) => {
    const isNew = !targetModuleId || targetModuleId === "new";
    const key = isNew ? "new" : targetModuleId;
    const formState = moduleForms[key];

    if (!formState || !formState.name.trim()) {
      setErrorMessage("Module title is required.");
      return;
    }

    if (formState.sections.length === 0 || !formState.sections[0].title.trim()) {
      setErrorMessage("At least one section with a title is required.");
      return;
    }

    setSavingModuleId(key);
    setSaveProgress(10);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();

      const sectionsPayload: any[] = [];
      formState.sections.forEach((sec, idx) => {
        let contentFileName = "";
        if (sec.contentFile?.file) {
          contentFileName = sec.contentFile.file.name;
          const ext = sec.contentFile.file.name.split(".").pop()?.toLowerCase() || "";
          const isScorm = ext === "zip";
          const fieldName = isScorm ? "scormZip" : "contentMedia";
          formData.append(fieldName, sec.contentFile.file);
        }

        const sectionStudyMaterials: any[] = [];
        sec.studyMaterials.forEach((mat) => {
          if (mat.file) {
            formData.append("studyMaterial", mat.file);
            sectionStudyMaterials.push({ name: mat.name, fileName: mat.file.name, kind: mat.kind });
          } else if (mat.previewUrl) {
            sectionStudyMaterials.push({ name: mat.name, previewUrl: mat.previewUrl, kind: mat.kind });
          }
        });

        sectionsPayload.push({
          title: sec.title || `Section ${idx + 1}`,
          description: sec.description || "",
          order: idx + 1,
          contentFileName,
          previewUrl: sec.contentFile?.previewUrl || null,
          studyMaterials: sectionStudyMaterials,
        });
      });

      const moduleStudyMaterialsPayload: any[] = [];
      formState.studyMaterials.forEach((mat) => {
        if (mat.file) {
          formData.append("studyMaterial", mat.file);
          moduleStudyMaterialsPayload.push({ name: mat.name, fileName: mat.file.name, kind: mat.kind });
        } else if (mat.previewUrl) {
          moduleStudyMaterialsPayload.push({ name: mat.name, previewUrl: mat.previewUrl, kind: mat.kind });
        }
      });

      const payload = {
        moduleId: isNew ? undefined : targetModuleId,
        name: formState.name,
        description: formState.description,
        isFreePreview: formState.isFreePreview,
        hasQuiz: formState.hasQuiz,
        hasTest: formState.hasTest,
        quiz: formState.hasQuiz ? summarizeQuiz(formState.quiz, `${formState.name || "Module"} quiz`) : null,
        studyMaterials: moduleStudyMaterialsPayload,
        sections: sectionsPayload,
      };

      formData.append("payload", JSON.stringify(payload));

      await courseStore.addSingleModule(courseId, formData, (progress) => {
        setSaveProgress(progress);
      });

      const actionText = isNew ? "uploaded & saved" : "updated";
      setSuccessMessage(`Module "${formState.name}" ${actionText} successfully!`);
      toast({
        title: "Module updated",
        description: `Module "${formState.name}" ${actionText} successfully.`,
        status: "success",
        duration: 3500,
        isClosable: true,
        position: "top-right",
      });
      if (isNew) {
        setIsNewModuleFormOpen(false);
      }

      await loadModules();
      onModulesUpdated?.();
    } catch (err: any) {
      const message = err?.message || "Failed to save module";
      setErrorMessage(message);
      toast({
        title: "Unable to save module",
        description: message,
        status: "error",
        duration: 4500,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setSavingModuleId(null);
      setSaveProgress(0);
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (!confirm(`Are you sure you want to delete module "${moduleTitle}"?`)) return;
    setDeletingModuleId(moduleId);
    setErrorMessage(null);
    try {
      await courseStore.deleteCourseModule(courseId, moduleId);
      setSuccessMessage(`Module "${moduleTitle}" deleted successfully.`);
      await loadModules();
      onModulesUpdated?.();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to delete module");
    } finally {
      setDeletingModuleId(null);
    }
  };

  // Render a full editable module form card (used for both existing modules & new module draft)
 const renderModuleCardForm = (
  key: string,
  isNew: boolean,
  modTitle?: string,
  modIndex?: number,
) => {
  const formState = moduleForms[key] || buildInitialForm();
  const isSaving = savingModuleId === key;

  const PanelHeader = ({
    icon,
    eyebrow,
    title,
    description,
    action,
  }: {
    icon: React.ReactNode;
    eyebrow: string;
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <Flex
      align={{ base: "flex-start", sm: "center" }}
      justify="space-between"
      gap={4}
      mb={5}
      direction={{ base: "column", sm: "row" }}
    >
      <HStack align="flex-start" spacing={3.5}>
        <Flex
          w={10}
          h={10}
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="xl"
          bg="blue.50"
          color="blue.600"
          border="1px solid"
          borderColor="blue.100"
        >
          {icon}
        </Flex>

        <Box>
          <Text
            fontSize="10px"
            fontWeight="bold"
            color="blue.500"
            textTransform="uppercase"
            letterSpacing="0.12em"
            mb={0.5}
          >
            {eyebrow}
          </Text>
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            {title}
          </Text>
          <Text fontSize="xs" color={mutedText} mt={0.5} lineHeight="tall">
            {description}
          </Text>
        </Box>
      </HStack>

      {action}
    </Flex>
  );

  const UploadBox = ({
    children,
    compact = false,
  }: {
    children: React.ReactNode;
    compact?: boolean;
  }) => (
    <Box
      as="label"
      display="flex"
      alignItems="center"
      gap={3}
      p={compact ? 3 : 4}
      minH={compact ? "64px" : "80px"}
      borderRadius="xl"
      border="1.5px dashed"
      borderColor={borderColor}
      bg={cardBg}
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        borderColor: "blue.300",
        bg: sectionBg,
        transform: "translateY(-1px)",
        boxShadow: "sm",
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box borderTopWidth="1px" borderColor={borderColor} bg={bg}>
      <Box px={{ base: 4, md: 6, xl: 8 }} py={{ base: 5, md: 7 }}>
        <Stack spacing={5}>
          {/* Basic information */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            boxShadow="sm"
          >
            <PanelHeader
              icon={<FiBookOpen size={18} />}
              eyebrow="Step 1"
              title="Module information"
              description="Add the module identity, learner access, and a short overview."
            />

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
              <Box>
                <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                  Module Name <Text as="span" color="red.500">*</Text>
                </Text>
                <Input
                  placeholder="e.g., Foundations & Core Concepts"
                  value={formState.name}
                  onChange={(e) => updateModuleForm(key, { name: e.target.value })}
                  borderRadius="xl"
                  h="46px"
                  bg={bg}
                  focusBorderColor="blue.400"
                />
              </Box>


<Box>
  <Flex
    align="center"
    justify="space-between"
    gap={4}
    minH="58px"
    px={4}
    py={3}
    borderRadius="xl"
    border="1px solid"
    borderColor={borderColor}
    bg={sectionBg}
  >
    <HStack spacing={3}>
      <Flex
        w="34px"
        h="34px"
        align="center"
        justify="center"
        flexShrink={0}
        borderRadius="lg"
        bg={formState.isFreePreview ? "green.50" : "yellow.50"}
        color={formState.isFreePreview ? "green.600" : "yellow.600"}
      >
        {formState.isFreePreview ? <FiUnlock /> : <FiLock />}
      </Flex>

      <Box>
        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
          {formState.isFreePreview
            ? "Available as a free preview"
            : "Available after purchase"}
        </Text>

        <Text fontSize="10px" color={mutedText} mt={0.5}>
          {formState.isFreePreview
            ? "Learners can open this module without purchasing the course."
            : "Learners must purchase the course to access this module."}
        </Text>
      </Box>
    </HStack>

    <Switch
      size="lg"
      colorScheme="green"
      isChecked={formState.isFreePreview}
      isDisabled={isCourseFree}
      onChange={(event) =>
        updateModuleForm(key, {
          isFreePreview: event.target.checked,
        })
      }
      aria-label="Enable free module preview"
      flexShrink={0}
    />
  </Flex>

  {isCourseFree && (
    <HStack
      spacing={2}
      mt={2}
      px={3}
      py={2}
      borderRadius="lg"
      bg="green.50"
      color="green.700"
    >
      <FiUnlock size={13} />

      <Text fontSize="10px" fontWeight="medium">
        This is a free course, so every module is accessible to learners.
      </Text>
    </HStack>
  )}
</Box>
              
            </SimpleGrid>

            <Box mt={5}>
              <Text fontSize="xs" fontWeight="semibold" color={textColor} mb={1.5}>
                Module Overview
              </Text>
              <Textarea
                rows={3}
                placeholder="Summarize what this module covers and what learners will gain."
                value={formState.description}
                onChange={(e) => updateModuleForm(key, { description: e.target.value })}
                borderRadius="xl"
                bg={bg}
                resize="vertical"
                focusBorderColor="blue.400"
              />
            </Box>
          </Box>

          {/* Module resources */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            boxShadow="sm"
          >
            <PanelHeader
              icon={<FiFileText size={18} />}
              eyebrow="Step 2"
              title="Module study materials"
              description="Attach module-level PDF notes, handouts, guides, or worksheets."
            />

            <UploadBox>
              <input
                type="file"
                multiple
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  handleModuleStudyMaterialChange(key, e.target.files);
                  e.target.value = "";
                }}
                style={{ display: "none" }}
              />

              <Flex
                w={11}
                h={11}
                align="center"
                justify="center"
                borderRadius="xl"
                bg="blue.50"
                color="blue.600"
                flexShrink={0}
              >
                <FiUploadCloud size={20} />
              </Flex>

              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  Upload PDF study materials
                </Text>
                <Text fontSize="xs" color={mutedText} mt={0.5}>
                  Click to select one or more PDF files.
                </Text>
              </Box>

              <Badge
                colorScheme={formState.studyMaterials.length > 0 ? "blue" : "gray"}
                variant="subtle"
                borderRadius="full"
                px={3}
                py={1}
                flexShrink={0}
              >
                {formState.studyMaterials.length} attached
              </Badge>
            </UploadBox>

            {formState.studyMaterials.length > 0 && (
              <VStack align="stretch" spacing={2} mt={3}>
                {formState.studyMaterials.map((mat) => (
                  <Flex
                    key={mat.id}
                    align="center"
                    justify="space-between"
                    gap={3}
                    p={3}
                    bg={sectionBg}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <HStack spacing={3} minW={0}>
                      <Flex
                        w={8}
                        h={8}
                        align="center"
                        justify="center"
                        borderRadius="lg"
                        bg="blue.50"
                        color="blue.600"
                        flexShrink={0}
                      >
                        <FiFileText size={15} />
                      </Flex>
                      <Text fontSize="xs" fontWeight="semibold" color={textColor} isTruncated>
                        {mat.name}
                      </Text>
                    </HStack>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeModuleStudyMaterial(key, mat.id)}
                      flexShrink={0}
                    >
                      Remove
                    </Button>
                  </Flex>
                ))}
              </VStack>
            )}
          </Box>

          {/* Sections */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            boxShadow="sm"
          >
            <PanelHeader
              icon={<FiLayers size={18} />}
              eyebrow="Step 3"
              title={`Module sections (${formState.sections.length})`}
              description="Build the module lesson by lesson using SCORM packages or MP4 videos."
              action={
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<FiPlus />}
                  onClick={() => addSection(key)}
                  borderRadius="xl"
                  w={{ base: "full", sm: "auto" }}
                >
                  Add Section
                </Button>
              }
            />

            <VStack align="stretch" spacing={4}>
              {formState.sections.map((section, sIdx) => (
                <Box
                  key={section.id}
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={sectionBg}
                  overflow="hidden"
                >
                  {/* Section header */}
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={3}
                    px={{ base: 4, md: 5 }}
                    py={3.5}
                    bg={cardBg}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                  >
                    <HStack spacing={3} minW={0}>
                      <Flex
                        w={9}
                        h={9}
                        align="center"
                        justify="center"
                        borderRadius="xl"
                        bg="blue.500"
                        color="white"
                        fontSize="xs"
                        fontWeight="bold"
                        flexShrink={0}
                      >
                        {String(sIdx + 1).padStart(2, "0")}
                      </Flex>
                      <Box minW={0}>
                        <Text fontSize="xs" fontWeight="bold" color={textColor}>
                          Section {sIdx + 1}
                        </Text>
                        <Text fontSize="xs" color={mutedText} isTruncated mt={0.5}>
                          {section.title || "Untitled section"}
                        </Text>
                      </Box>
                    </HStack>

                    {formState.sections.length > 1 && (
                      <IconButton
                        aria-label="Remove section"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeSection(key, section.id)}
                        borderRadius="lg"
                      />
                    )}
                  </Flex>

                  <Box p={{ base: 4, md: 5 }}>
                    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
                      <Box>
                        <Text fontSize="xs" fontWeight="semibold" color={textColor} mb={1.5}>
                          Section Title <Text as="span" color="red.500">*</Text>
                        </Text>
                        <Input
                          placeholder="e.g., Lesson 1: Introduction"
                          value={section.title}
                          onChange={(e) =>
                            updateSection(key, section.id, { title: e.target.value })
                          }
                          borderRadius="xl"
                          h="44px"
                          bg={cardBg}
                          focusBorderColor="blue.400"
                        />
                      </Box>

                      <Box>
                        <Text fontSize="xs" fontWeight="semibold" color={textColor} mb={1.5}>
                          Primary Lesson Content
                        </Text>
                        <UploadBox compact>
                          <input
                            type="file"
                            accept="video/mp4,video/*,.zip,.scorm,application/zip"
                            onChange={(e) =>
                              handleSectionFileChange(key, section.id, e.target.files)
                            }
                            style={{ display: "none" }}
                          />

                          <Flex
                            w={9}
                            h={9}
                            align="center"
                            justify="center"
                            borderRadius="lg"
                            bg="blue.50"
                            color="blue.600"
                            flexShrink={0}
                          >
                            {section.contentFile?.kind === "video" ? (
                              <FiVideo size={17} />
                            ) : (
                              <FiUploadCloud size={17} />
                            )}
                          </Flex>

                          <Box flex={1} minW={0}>
                            <Text
                              fontSize="xs"
                              fontWeight={section.contentFile ? "semibold" : "normal"}
                              color={section.contentFile ? textColor : mutedText}
                              isTruncated
                            >
                              {section.contentFile
                                ? section.contentFile.name
                                : "Upload a SCORM ZIP or MP4 video"}
                            </Text>
                            <Text fontSize="10px" color={section.contentFile ? "blue.500" : mutedText} mt={0.5}>
                              {section.contentFile
                                ? `${getFileKindLabel(section.contentFile.kind)} lesson ready`
                                : "One primary lesson file per section"}
                            </Text>
                          </Box>

                          {section.contentFile && (
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateSection(key, section.id, { contentFile: null });
                              }}
                              flexShrink={0}
                            >
                              Remove
                            </Button>
                          )}
                        </UploadBox>
                      </Box>
                    </SimpleGrid>

                    <Box mt={5}>
                      <Text fontSize="xs" fontWeight="semibold" color={textColor} mb={1.5}>
                        Section Description
                      </Text>
                      <Textarea
                        rows={3}
                        placeholder="Explain what learners will cover in this section."
                        value={section.description}
                        onChange={(e) =>
                          updateSection(key, section.id, { description: e.target.value })
                        }
                        borderRadius="xl"
                        bg={cardBg}
                        resize="vertical"
                        focusBorderColor="blue.400"
                      />
                    </Box>

                    <Box mt={5}>
                      <Flex align="center" justify="space-between" gap={3} mb={2}>
                        <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                          Section Study Materials
                        </Text>
                        <Text fontSize="10px" color={mutedText}>
                          PDF files only
                        </Text>
                      </Flex>

                      <UploadBox compact>
                        <input
                          type="file"
                          multiple
                          accept="application/pdf,.pdf"
                          onChange={(e) => {
                            handleSectionStudyMaterialChange(key, section.id, e.target.files);
                            e.target.value = "";
                          }}
                          style={{ display: "none" }}
                        />

                        <Flex
                          w={9}
                          h={9}
                          align="center"
                          justify="center"
                          borderRadius="lg"
                          bg="blue.50"
                          color="blue.600"
                          flexShrink={0}
                        >
                          <FiFileText size={16} />
                        </Flex>

                        <Box flex={1} minW={0}>
                          <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                            Add PDF resources
                          </Text>
                          <Text fontSize="10px" color={mutedText} mt={0.5}>
                            {section.studyMaterials.length > 0
                              ? `${section.studyMaterials.length} file(s) attached`
                              : "Notes, worksheets, or reference documents"}
                          </Text>
                        </Box>
                      </UploadBox>

                      {section.studyMaterials.length > 0 && (
                        <VStack align="stretch" spacing={2} mt={2.5}>
                          {section.studyMaterials.map((mat) => (
                            <Flex
                              key={mat.id}
                              align="center"
                              justify="space-between"
                              gap={3}
                              p={2.5}
                              px={3}
                              bg={cardBg}
                              borderRadius="lg"
                              border="1px solid"
                              borderColor={borderColor}
                            >
                              <HStack spacing={2.5} minW={0}>
                                <FiFileText color="#2563EB" />
                                <Text fontSize="xs" fontWeight="semibold" color={textColor} isTruncated>
                                  {mat.name}
                                </Text>
                              </HStack>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() =>
                                  removeSectionStudyMaterial(key, section.id, mat.id)
                                }
                                flexShrink={0}
                              >
                                Remove
                              </Button>
                            </Flex>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Quiz */}
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            boxShadow="sm"
          >
            <Flex
              align={{ base: "flex-start", sm: "center" }}
              justify="space-between"
              direction={{ base: "column", sm: "row" }}
              gap={4}
            >
              <HStack align="flex-start" spacing={3.5}>
                <Flex
                  w={10}
                  h={10}
                  align="center"
                  justify="center"
                  borderRadius="xl"
                  bg="blue.50"
                  color="blue.600"
                  border="1px solid"
                  borderColor="blue.100"
                  flexShrink={0}
                >
                  <FiClipboard size={18} />
                </Flex>
                <Box>
                  <Text
                    fontSize="10px"
                    fontWeight="bold"
                    color="blue.500"
                    textTransform="uppercase"
                    letterSpacing="0.12em"
                    mb={0.5}
                  >
                    Step 4
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>
                    Checkpoint quiz
                  </Text>
                  <Text fontSize="xs" color={mutedText} mt={0.5} lineHeight="tall">
                    Optionally assess learners at the end of this module.
                  </Text>
                </Box>
              </HStack>

              <HStack
                spacing={3}
                px={3.5}
                py={2.5}
                borderRadius="xl"
                bg={sectionBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                  {formState.hasQuiz ? "Quiz enabled" : "Quiz disabled"}
                </Text>
                <Switch
                  id={`hasQuizToggle-${key}`}
                  colorScheme="blue"
                  isChecked={formState.hasQuiz}
                  onChange={(e) =>
                    updateModuleForm(key, { hasQuiz: e.target.checked })
                  }
                />
              </HStack>
            </Flex>

            {formState.hasQuiz && (
              <Box mt={5} pt={5} borderTop="1px solid" borderColor={borderColor}>
                <CourseQuizBuilder
                  quiz={formState.quiz}
                  onChange={(quiz) =>
                    updateModuleForm(key, {
                      quiz,
                      hasQuiz: quiz.questions.length > 0 || formState.hasQuiz,
                    })
                  }
                  title={`${formState.name || "Module"} Checkpoint Quiz`}
                  helper="Add multiple-choice questions or import from Excel for this module."
                />
              </Box>
            )}
          </Box>
        </Stack>

        {/* Upload progress */}
        {isSaving && (
          <Box
            mt={5}
            p={4}
            borderRadius="xl"
            border="1px solid"
            borderColor="blue.100"
            bg="blue.50"
          >
            <Flex
              justify="space-between"
              align="center"
              fontSize="xs"
              fontWeight="semibold"
              color="blue.600"
              mb={2}
            >
              <HStack spacing={2}>
                <FiUploadCloud />
                <Text>Uploading and processing module content</Text>
              </HStack>
              <Text>{saveProgress}%</Text>
            </Flex>
            <Progress
              value={saveProgress}
              size="sm"
              colorScheme="blue"
              borderRadius="full"
              hasStripe
              isAnimated
            />
          </Box>
        )}
      </Box>

      {/* Sticky form actions */}
      <Flex
        position="sticky"
        bottom="0"
        zIndex={3}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        direction={{ base: "column", sm: "row" }}
        gap={3}
        px={{ base: 4, md: 6, xl: 8 }}
        py={4}
        bg={cardBg}
        borderTop="1px solid"
        borderColor={borderColor}
        boxShadow="0 -12px 30px rgba(15, 23, 42, 0.06)"
      >
        <HStack spacing={2} color={mutedText}>
          <FiPlayCircle size={15} />
          <Text fontSize="xs">
            Save this module before creating another one.
          </Text>
        </HStack>

        <HStack spacing={3} w={{ base: "full", sm: "auto" }}>
          {isNew && (
            <Button
              variant="ghost"
              isDisabled={isSaving}
              onClick={handleCancelNewForm}
              borderRadius="xl"
              flex={{ base: 1, sm: "initial" }}
            >
              Cancel
            </Button>
          )}
          <Button
            colorScheme="blue"
            isLoading={isSaving}
            loadingText="Saving..."
            leftIcon={<FiCheckCircle />}
            onClick={() => handleSaveModule(isNew ? undefined : key)}
            borderRadius="xl"
            px={6}
            flex={{ base: 1, sm: "initial" }}
            boxShadow="sm"
          >
            {isNew ? "Save Module" : "Save Changes"}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

const savingModuleTitle = savingModuleId
  ? moduleForms[savingModuleId]?.name || "Module"
  : "";
const visibleSaveProgress = savingModuleId ? Math.max(saveProgress, 10) : 0;

/* Replace your current Drawer JSX with this block. */

return (
  <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
    <DrawerOverlay bg="blackAlpha.500" backdropFilter="blur(3px)" />
    <DrawerContent bg={bg} maxW="90vw">
      {/* Header */}
      <DrawerHeader
        position="sticky"
        top={0}
        zIndex={20}
        bg={headerBg}
        color="white"
        py={{ base: 4, md: 4 }}
        px={{ base: 4, md: 7, xl: 10 }}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.200"
        boxShadow="sm"
      >
        <Flex align="center" justify="space-between" gap={4}>
          <HStack spacing={{ base: 3, md: 4 }} minW={0}>
            <Flex
              w={{ base: 10, md: 12 }}
              h={{ base: 10, md: 12 }}
              align="center"
              justify="center"
              borderRadius="2xl"
              bg="whiteAlpha.200"
              color="blue.300"
              border="1px solid"
              borderColor="whiteAlpha.200"
              flexShrink={0}
            >
              <FiPackage size={22} />
            </Flex>

            <Box minW={0}>
              <HStack spacing={2.5} flexWrap="wrap">
                <Heading
                  size={'sm'}
                  fontWeight="bold"
                  letterSpacing="tight"
                >
                  Course Module Builder
                </Heading>
                <Badge
                  colorScheme={isCourseFree ? "green" : "yellow"}
                  variant="solid"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="10px"
                >
                  {isCourseFree ? "Free Course" : "Paid Course"}
                </Badge>
              </HStack>

              <Text
                fontSize={"xs"}
                color="gray.400"
                mt={1}
                isTruncated
              >
                <Text as="span" fontWeight="semibold" color="white">
                  {course.title}
                </Text>{" "}
                · {course.courseCode}
              </Text>
            </Box>
          </HStack>

          <DrawerCloseButton
            position="relative"
            top={0}
            right={0}
            color="white"
            borderRadius="xl"
            _hover={{ bg: "whiteAlpha.200" }}
          />
        </Flex>
      </DrawerHeader>

      {savingModuleId && (
        <Box
          position="fixed"
          top={{ base: "76px", md: "84px" }}
          right={{ base: 4, md: 8 }}
          zIndex={40}
          w={{ base: "calc(100vw - 32px)", sm: "380px" }}
          maxW="calc(90vw - 32px)"
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor="blue.200"
          bg={cardBg}
          boxShadow="0 18px 45px rgba(15, 23, 42, 0.22)"
        >
          <Flex justify="space-between" align="flex-start" gap={4} mb={3}>
            <HStack spacing={3} minW={0}>
              <Flex
                w={9}
                h={9}
                align="center"
                justify="center"
                borderRadius="lg"
                bg="blue.50"
                color="blue.600"
                flexShrink={0}
              >
                <FiUploadCloud />
              </Flex>
              <Box minW={0}>
                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                  Saving module changes
                </Text>
                <Text fontSize="xs" color={mutedText} mt={0.5} isTruncated>
                  {savingModuleTitle}
                </Text>
              </Box>
            </HStack>
            <Text fontSize="xs" fontWeight="bold" color="blue.600">
              {visibleSaveProgress}%
            </Text>
          </Flex>
          <Progress
            value={visibleSaveProgress}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
            hasStripe
            isAnimated
          />
          <Text fontSize="11px" color={mutedText} mt={2}>
            Uploading content and updating quiz data. You can stay on this drawer.
          </Text>
        </Box>
      )}

      {/* One-module-at-a-time guidance */}
    

      <DrawerBody p={0}>
        <Box
          // maxW="1440px"
          // mx="auto"
          px={{ base: 4, md: 6, xl: 8 }}
          py={{ base: 5, md: 7 }}
        >
          {errorMessage && (
            <Alert
              status="error"
              borderRadius="xl"
              mb={5}
              alignItems="flex-start"
              boxShadow="sm"
            >
              <AlertIcon mt={0.5} />
              <Box>
                <AlertTitle fontSize="sm">Unable to continue</AlertTitle>
                <AlertDescription fontSize="xs">{errorMessage}</AlertDescription>
              </Box>
            </Alert>
          )}

          {successMessage && (
            <Alert
              status="success"
              borderRadius="xl"
              mb={5}
              alignItems="flex-start"
              boxShadow="sm"
            >
              <AlertIcon mt={0.5} />
              <Box>
                <AlertTitle fontSize="sm">Module updated</AlertTitle>
                <AlertDescription fontSize="xs">{successMessage}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Overview/control card */}
          <Flex
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
            direction={{ base: "column", md: "row" }}
            gap={4}
            mb={6}
            p={{ base: 4, md: 5 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            boxShadow="sm"
          >
            <HStack spacing={4} align="flex-start">
              <Flex
                w={10}
                h={10}
                align="center"
                justify="center"
                borderRadius="2xl"
                bg="blue.50"
                color="blue.600"
                flexShrink={0}
              >
                <FiLayers size={20} />
              </Flex>
              <Box>
                <HStack spacing={2.5} flexWrap="wrap">
                  <Heading size="sm" fontWeight="bold" color={textColor}>
                    Course Modules
                  </Heading>
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    borderRadius="full"
                    px={2.5}
                  >
                    {modules.length}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={mutedText} mt={1} lineHeight="tall">
                  Expand a saved module to edit it, or create a new module when no other
                  module is being added or saved.
                </Text>
              </Box>
            </HStack>

            <Button
              colorScheme="blue"
              leftIcon={<FiPlus />}
              isDisabled={isNewModuleFormOpen || Boolean(savingModuleId)}
              onClick={handleOpenAddForm}
              size="md"
              borderRadius="xl"
              px={5}
              boxShadow="sm"
              w={{ base: "full", md: "auto" }}
            >
              {isNewModuleFormOpen ? "Finish Current Module" : "Add Module"}
            </Button>
          </Flex>

          {/* New module */}
          {isNewModuleFormOpen && (
            <Box
              mb={7}
              borderRadius="2xl"
              borderWidth="2px"
              borderColor={formBorderColor}
              bg={formBg}
              overflow="hidden"
              boxShadow="lg"
            >
              <Flex
                px={{ base: 4, md: 5 }}
                py={4}
                align="center"
                justify="space-between"
                gap={3}
                bg="blue.50"
                borderBottom="1px solid"
                borderColor="blue.100"
              >
                <HStack spacing={3} minW={0}>
                  <Flex
                    w={9}
                    h={9}
                    borderRadius="xl"
                    bg="blue.500"
                    color="white"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <FiPlus />
                  </Flex>
                  <Box minW={0}>
                    <Heading size="xs" color="blue.900" fontWeight="bold">
                      New Module
                    </Heading>
                    <Text fontSize="xs" color="blue.600" mt={0.5} isTruncated>
                      Add the details, lessons, resources, and quiz, then save this module.
                    </Text>
                  </Box>
                </HStack>

                <IconButton
                  aria-label="Close new module form"
                  icon={<FiX />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  isDisabled={Boolean(savingModuleId)}
                  onClick={handleCancelNewForm}
                  borderRadius="lg"
                />
              </Flex>

              {renderModuleCardForm("new", true)}
            </Box>
          )}

          {/* Existing module list */}
          {isLoadingModules ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              minH="260px"
              py={12}
              color={mutedText}
              bg={cardBg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={borderColor}
            >
              <Flex
                w={12}
                h={12}
                align="center"
                justify="center"
                borderRadius="2xl"
                bg="blue.50"
                color="blue.600"
              >
                <FiLoader size={23} className="animate-spin" />
              </Flex>
              <Text mt={3} fontSize="sm" fontWeight="semibold">
                Loading course modules...
              </Text>
              <Text mt={1} fontSize="xs">
                Preparing your saved module content.
              </Text>
            </Flex>
          ) : modules.length === 0 && !isNewModuleFormOpen ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              minH="280px"
              py={12}
              px={6}
              bg={cardBg}
              borderRadius="2xl"
              border="1.5px dashed"
              borderColor={borderColor}
              textAlign="center"
            >
              <Flex
                w={14}
                h={14}
                align="center"
                justify="center"
                borderRadius="2xl"
                bg="blue.50"
                color="blue.500"
                mb={4}
              >
                <FiPackage size={27} />
              </Flex>
              <Heading size="sm" color={textColor} fontWeight="bold">
                Start with your first module
              </Heading>
              <Text fontSize="xs" color={mutedText} mt={2} maxW="420px" lineHeight="tall">
                A module can contain multiple sections, SCORM or video lessons, PDF study
                material, and an optional checkpoint quiz.
              </Text>
              <Button
                mt={5}
                colorScheme="blue"
                leftIcon={<FiPlus />}
                onClick={handleOpenAddForm}
                borderRadius="xl"
              >
                Add First Module
              </Button>
            </Flex>
          ) : (
            <VStack align="stretch" spacing={3.5}>
              {modules.map((mod, idx) => {
                const isExpanded = expandedModuleId === mod._id;
                const isDeleting = deletingModuleId === mod._id;
                const formState = moduleForms[mod._id];
                const sectionCount =
                  formState?.sections?.length || mod.sectionCount || 0;

                return (
                  <Box
                    key={mod._id || idx}
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor={isExpanded ? formBorderColor : borderColor}
                    bg={cardBg}
                    overflow="hidden"
                    boxShadow={isExpanded ? "md" : "sm"}
                    transition="all 0.2s ease"
                    _hover={!isExpanded ? { boxShadow: "md", transform: "translateY(-1px)" } : undefined}
                  >
                    <Flex
                      px={{ base: 4, md: 5 }}
                      py={4}
                      align="center"
                      justify="space-between"
                      gap={4}
                      bg={isExpanded ? sectionBg : cardBg}
                      cursor="pointer"
                      onClick={() =>
                        setExpandedModuleId(isExpanded ? null : mod._id)
                      }
                    >
                      <HStack spacing={{ base: 3, md: 4 }} minW={0}>
                        <Flex
                          w={10}
                          h={10}
                          borderRadius="xl"
                          bg={isExpanded ? "blue.500" : "blue.50"}
                          color={isExpanded ? "white" : "blue.600"}
                          align="center"
                          justify="center"
                          fontSize="xs"
                          fontWeight="bold"
                          flexShrink={0}
                          transition="all 0.2s ease"
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </Flex>

                        <Box minW={0}>
                          <HStack spacing={2.5} flexWrap="wrap">
                            <Text
                              fontSize={{ base: "sm", md: "md" }}
                              fontWeight="bold"
                              color={textColor}
                              isTruncated
                            >
                              {formState?.name || mod.title}
                            </Text>

                            <Badge
                              colorScheme={formState?.isFreePreview ? "green" : "yellow"}
                              variant="subtle"
                              borderRadius="full"
                              px={2.5}
                              py={0.5}
                              fontSize="9px"
                            >
                              {formState?.isFreePreview ? "Free Preview" : "Paid Access"}
                            </Badge>
                          </HStack>

                          <HStack spacing={2} mt={1} color={mutedText}>
                            <FiLayers size={12} />
                            <Text fontSize="xs">
                              {sectionCount} {sectionCount === 1 ? "section" : "sections"}
                            </Text>
                            <Text fontSize="xs">•</Text>
                            <Text fontSize="xs">
                              {isExpanded ? "Editing open" : "Click to edit"}
                            </Text>
                          </HStack>
                        </Box>
                      </HStack>

                      <HStack spacing={1.5} onClick={(e) => e.stopPropagation()} flexShrink={0}>
                        <IconButton
                          aria-label="Delete module"
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          isLoading={isDeleting}
                          onClick={() =>
                            handleDeleteModule(
                              mod._id,
                              formState?.name || mod.title,
                            )
                          }
                          borderRadius="lg"
                        />

                        <IconButton
                          aria-label={isExpanded ? "Collapse module" : "Expand module"}
                          icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() =>
                            setExpandedModuleId(isExpanded ? null : mod._id)
                          }
                          borderRadius="lg"
                        />
                      </HStack>
                    </Flex>

                    {isExpanded &&
                      renderModuleCardForm(mod._id, false, mod.title, idx)}
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
        <Box
        bg={bannerBg}
        borderBottomWidth="1px"
        borderColor={bannerBorder}
        px={{ base: 4, md: 7, xl: 10 }}
        py={2}
      >
        <Flex
          // maxW="1440px"
          // mx="auto"
          align={{ base: "flex-start", md: "center" }}
          gap={3}
        >
          <Flex
            w={8}
            h={8}
            align="center"
            justify="center"
            borderRadius="lg"
            bg="blue.100"
            color="blue.600"
            flexShrink={0}
          >
            <FiInfo size={16} />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="bold" color={bannerTextColor}>
              Add and save one module at a time
            </Text>
            <Text fontSize="xs" color={bannerTextColor} mt={0.5} lineHeight="tall">
              Complete the active module and save it under this course. After it is saved,
              the Add Module button becomes available for the next module.
            </Text>
          </Box>
        </Flex>
      </Box>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);
}
