"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Heading,
  useToast,
  useColorModeValue,
  Divider,
  SimpleGrid,
  Switch,
  HStack,
  Text,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { FaShieldAlt, FaClock, FaLock, FaCertificate, FaCog } from "react-icons/fa";
import CustomInput from "../../../component/config/component/customInput/CustomInput";

export default function QuizSettingsForm({ initialData = {}, onSaved }: { initialData?: any, onSaved?: (id?: string) => void }) {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Basic Info
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [visibility, setVisibility] = useState(initialData?.visibility || "PRIVATE");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Access & Availability
  const [startDate, setStartDate] = useState(initialData?.settings?.availability?.startDate ? new Date(initialData.settings.availability.startDate).toISOString().slice(0, 16) : "");
  const [endDate, setEndDate] = useState(initialData?.settings?.availability?.endDate ? new Date(initialData.settings.availability.endDate).toISOString().slice(0, 16) : "");
  const [maxAttempts, setMaxAttempts] = useState(initialData?.settings?.maxAttempts || 1);
  const [password, setPassword] = useState(initialData?.settings?.password || "");
  const [allowedDomains, setAllowedDomains] = useState(initialData?.settings?.allowedDomains?.join(", ") || "");

  // Rules & Timing
  const [timerType, setTimerType] = useState(initialData?.settings?.timerType || "NONE");
  const [timeLimit, setTimeLimit] = useState(
    initialData?.settings?.timerType === "OVERALL" ? initialData?.settings?.overallTimeLimitMinutes 
    : initialData?.settings?.timerType === "PER_QUESTION" ? initialData?.settings?.perQuestionTimeLimitSeconds 
    : 0
  );
  const [passingPercentage, setPassingPercentage] = useState(initialData?.settings?.passingPercentage || 70);
  const [shuffleQuestions, setShuffleQuestions] = useState(initialData?.settings?.shuffleQuestions || false);
  const [shuffleOptions, setShuffleOptions] = useState(initialData?.settings?.shuffleOptions || false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(initialData?.settings?.showResultsImmediately ?? true);

  // Security & Proctoring
  const [proctoringLevel, setProctoringLevel] = useState(initialData?.settings?.security?.proctoringLevel || "NONE");
  const [disableCopyPaste, setDisableCopyPaste] = useState(initialData?.settings?.security?.disableCopyPaste || false);
  const [enforceFullScreen, setEnforceFullScreen] = useState(initialData?.settings?.security?.enforceFullScreen || false);
  const [maxTabSwitchesAllowed, setMaxTabSwitchesAllowed] = useState(initialData?.settings?.security?.maxTabSwitchesAllowed || 3);

  // Certification
  const [issueCertificateOnPass, setIssueCertificateOnPass] = useState(initialData?.settings?.certification?.issueCertificateOnPass || false);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.900", "white");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");

  const handleSave = async () => {
    if (!title) {
      toast({ title: "Title is required", status: "warning" });
      return;
    }
    setIsSaving(true);
    
    try {
      const payload = {
        title,
        description,
        visibility,
        status,
        isActive,
        settings: {
          timerType,
          overallTimeLimitMinutes: timerType === "OVERALL" ? timeLimit : 0,
          perQuestionTimeLimitSeconds: timerType === "PER_QUESTION" ? timeLimit : 0,
          passingPercentage,
          shuffleQuestions,
          shuffleOptions,
          showResultsImmediately,
          password,
          allowedDomains: allowedDomains ? allowedDomains.split(",").map((d: string) => d.trim()) : [],
          maxAttempts,
          availability: {
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
          },
          security: {
            proctoringLevel,
            disableCopyPaste,
            enforceFullScreen,
            maxTabSwitchesAllowed,
          },
          certification: {
            issueCertificateOnPass
          }
        }
      };
      
      let res;
      if (initialData?._id) {
        res = await axios.put(`/quiz/${initialData._id}`, payload);
        toast({ title: "Quiz updated successfully", status: "success" });
      } else {
        res = await axios.post("/quiz/create", payload);
        toast({ title: "Quiz created successfully", status: "success" });
      }
      
      if (onSaved) {
        const newId = initialData?._id || res?.data?._id || res?.data?.id || res?.data?.data?._id || "";
        onSaved(newId);
      }

    } catch (error: any) {
      toast({ title: "Error saving quiz", status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={{ base: 4, md: 8 }} shadow="sm">
      <VStack spacing={6} align="stretch">
        
        {/* Basic Info */}
        <Box>
          <HStack mb={4}>
            <Icon as={FaCog} color="#6269FF" boxSize={5} />
            <Heading size="md" color={headingColor}>Basic Information</Heading>
          </HStack>
          <VStack spacing={4}>
            <CustomInput
              type="text"
              name="title"
              label="Quiz Title"
              placeholder="Enter quiz title"
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              required
            />
            <CustomInput
              type="textarea"
              name="description"
              label="Description"
              placeholder="Enter quiz description"
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              rows={3}
            />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
              <CustomInput
                type="select"
                name="visibility"
                label="Visibility"
                options={[
                  { label: "Public", value: "PUBLIC" },
                  { label: "Private", value: "PRIVATE" },
                  { label: "Restricted", value: "RESTRICTED" }
                ]}
                value={[{ label: "Public", value: "PUBLIC" }, { label: "Private", value: "PRIVATE" }, { label: "Restricted", value: "RESTRICTED" }].find(o => o.value === visibility)}
                onChange={(option: any) => setVisibility(option?.value || "PRIVATE")}
              />
              <CustomInput
                type="select"
                name="status"
                label="Status"
                options={[
                  { label: "Draft", value: "DRAFT" },
                  { label: "Published", value: "PUBLISHED" },
                  { label: "Archived", value: "ARCHIVED" }
                ]}
                value={[{ label: "Draft", value: "DRAFT" }, { label: "Published", value: "PUBLISHED" }, { label: "Archived", value: "ARCHIVED" }].find(o => o.value === status)}
                onChange={(option: any) => setStatus(option?.value || "DRAFT")}
              />
            </SimpleGrid>
            <FormControl display="flex" alignItems="center" bg={useColorModeValue("gray.50", "gray.900")} p={4} rounded="xl" borderWidth="1px" borderColor={borderColor}>
              <FormLabel htmlFor="is-active" mb="0" color={secondaryTextColor} flex="1" fontWeight="bold">
                Quiz is Active
              </FormLabel>
              <Switch id="is-active" colorScheme="green" size="lg" isChecked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            </FormControl>
          </VStack>
        </Box>

        <Accordion allowMultiple defaultIndex={[0]}>
          
          {/* Access & Availability */}
          <AccordionItem border="none" bg={useColorModeValue("gray.50", "gray.900")} rounded="xl" mb={4} borderWidth="1px" borderColor={borderColor}>
            <h2>
              <AccordionButton p={4} rounded="xl" _expanded={{ bg: "blue.50", color: "blue.600" }}>
                <Box as="span" flex='1' textAlign='left' fontWeight="bold" display="flex" alignItems="center">
                  <Icon as={FaLock} mr={2} /> Access & Availability
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={6} px={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <CustomInput
                  type="dateAndTime"
                  name="startDate"
                  label="Start Date & Time"
                  value={startDate}
                  onChange={(e: any) => setStartDate(e.target.value)}
                />
                <CustomInput
                  type="dateAndTime"
                  name="endDate"
                  label="End Date & Time"
                  value={endDate}
                  onChange={(e: any) => setEndDate(e.target.value)}
                />
                <CustomInput
                  type="number"
                  name="maxAttempts"
                  label="Max Attempts Allowed"
                  value={maxAttempts}
                  onChange={(e: any) => setMaxAttempts(Number(e.target.value))}
                />
                <CustomInput
                  type="text"
                  name="password"
                  label="Password Protection"
                  placeholder="Leave blank for no password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                />
                <Box gridColumn={{ md: "span 2" }}>
                  <CustomInput
                    type="text"
                    name="allowedDomains"
                    label="Allowed Domains (e.g., @company.com)"
                    placeholder="Separate multiple domains with commas"
                    value={allowedDomains}
                    onChange={(e: any) => setAllowedDomains(e.target.value)}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>Only users with these email domains can take the quiz.</Text>
                </Box>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

          {/* Rules & Timing */}
          <AccordionItem border="none" bg={useColorModeValue("gray.50", "gray.900")} rounded="xl" mb={4} borderWidth="1px" borderColor={borderColor}>
            <h2>
              <AccordionButton p={4} rounded="xl" _expanded={{ bg: "blue.50", color: "blue.600" }}>
                <Box as="span" flex='1' textAlign='left' fontWeight="bold" display="flex" alignItems="center">
                  <Icon as={FaClock} mr={2} /> Rules & Timing
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={6} px={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <CustomInput
                  type="select"
                  name="timerType"
                  label="Timer Mode"
                  options={[
                    { label: "No Timer", value: "NONE" },
                    { label: "Overall Quiz Timer", value: "OVERALL" },
                    { label: "Per-Question Timer", value: "PER_QUESTION" }
                  ]}
                  value={[{ label: "No Timer", value: "NONE" }, { label: "Overall Quiz Timer", value: "OVERALL" }, { label: "Per-Question Timer", value: "PER_QUESTION" }].find(o => o.value === timerType)}
                  onChange={(option: any) => setTimerType(option?.value || "NONE")}
                />
                {timerType !== "NONE" && (
                  <CustomInput
                    type="number"
                    name="timeLimit"
                    label={timerType === "OVERALL" ? "Time Limit (Minutes)" : "Time Limit (Seconds per Question)"}
                    value={timeLimit}
                    onChange={(e: any) => setTimeLimit(Number(e.target.value))}
                  />
                )}
                <CustomInput
                  type="number"
                  name="passingPercentage"
                  label="Passing Percentage (%)"
                  value={passingPercentage}
                  onChange={(e: any) => setPassingPercentage(Number(e.target.value))}
                />
              </SimpleGrid>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <Switch id="shuffle-q" colorScheme="blue" isChecked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} mr={3} />
                  <FormLabel htmlFor="shuffle-q" mb="0" color={secondaryTextColor}>Shuffle Questions</FormLabel>
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <Switch id="shuffle-o" colorScheme="blue" isChecked={shuffleOptions} onChange={(e) => setShuffleOptions(e.target.checked)} mr={3} />
                  <FormLabel htmlFor="shuffle-o" mb="0" color={secondaryTextColor}>Shuffle Options</FormLabel>
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <Switch id="show-res" colorScheme="blue" isChecked={showResultsImmediately} onChange={(e) => setShowResultsImmediately(e.target.checked)} mr={3} />
                  <FormLabel htmlFor="show-res" mb="0" color={secondaryTextColor}>Show Results Instantly</FormLabel>
                </FormControl>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

          {/* Security & Proctoring */}
          <AccordionItem border="none" bg={useColorModeValue("gray.50", "gray.900")} rounded="xl" mb={4} borderWidth="1px" borderColor={borderColor}>
            <h2>
              <AccordionButton p={4} rounded="xl" _expanded={{ bg: "red.50", color: "red.600" }}>
                <Box as="span" flex='1' textAlign='left' fontWeight="bold" display="flex" alignItems="center">
                  <Icon as={FaShieldAlt} mr={2} /> Security & Proctoring
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={6} px={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <CustomInput
                  type="select"
                  name="proctoringLevel"
                  label="Proctoring Level"
                  options={[
                    { label: "None", value: "NONE" },
                    { label: "Basic (Browser Lock)", value: "BASIC" },
                    { label: "Strict (Webcam Monitoring)", value: "STRICT" }
                  ]}
                  value={[{ label: "None", value: "NONE" }, { label: "Basic (Browser Lock)", value: "BASIC" }, { label: "Strict (Webcam Monitoring)", value: "STRICT" }].find(o => o.value === proctoringLevel)}
                  onChange={(option: any) => setProctoringLevel(option?.value || "NONE")}
                />
                <Box>
                  <CustomInput
                    type="number"
                    name="maxTabSwitchesAllowed"
                    label="Max Tab Switches Allowed"
                    value={maxTabSwitchesAllowed}
                    onChange={(e: any) => setMaxTabSwitchesAllowed(Number(e.target.value))}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>Quiz Auto-Submits if user leaves tab too many times.</Text>
                </Box>
              </SimpleGrid>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <Switch id="copy-paste" colorScheme="red" isChecked={disableCopyPaste} onChange={(e) => setDisableCopyPaste(e.target.checked)} mr={3} />
                  <FormLabel htmlFor="copy-paste" mb="0" color={secondaryTextColor}>Disable Copy & Paste</FormLabel>
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <Switch id="fullscreen" colorScheme="red" isChecked={enforceFullScreen} onChange={(e) => setEnforceFullScreen(e.target.checked)} mr={3} />
                  <FormLabel htmlFor="fullscreen" mb="0" color={secondaryTextColor}>Enforce Full Screen</FormLabel>
                </FormControl>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

          {/* Certification */}
          <AccordionItem border="none" bg={useColorModeValue("gray.50", "gray.900")} rounded="xl" borderWidth="1px" borderColor={borderColor}>
            <h2>
              <AccordionButton p={4} rounded="xl" _expanded={{ bg: "yellow.50", color: "yellow.700" }}>
                <Box as="span" flex='1' textAlign='left' fontWeight="bold" display="flex" alignItems="center">
                  <Icon as={FaCertificate} mr={2} /> Certification
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={6} px={6}>
              <FormControl display="flex" alignItems="center">
                <Switch id="cert" colorScheme="yellow" isChecked={issueCertificateOnPass} onChange={(e) => setIssueCertificateOnPass(e.target.checked)} mr={3} />
                <FormLabel htmlFor="cert" mb="0" color={secondaryTextColor}>Automatically Issue Certificate on Pass</FormLabel>
              </FormControl>
            </AccordionPanel>
          </AccordionItem>

        </Accordion>

        <Button 
          w="full" h={{ base: "52px", md: "56px" }}
          borderRadius="xl"
          bgGradient="linear(to-r, #6269FF, #4F46E5)"
          color="white"
          fontSize={{ base: "sm", md: "md" }} fontWeight="900" letterSpacing="0.1em"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 10px 30px rgba(98,105,255,0.5)", bgGradient: "linear(to-r, #4F46E5, #6269FF)" }}
          _active={{ transform: "translateY(0)" }}
          transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          onClick={handleSave} 
          isLoading={isSaving}
          border="1px solid"
          borderColor="rgba(255,255,255,0.1)"
          mt={4}
        >
          SAVE QUIZ SETTINGS
        </Button>
      </VStack>
    </Box>
  );
}
