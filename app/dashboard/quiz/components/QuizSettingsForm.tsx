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

export default function QuizSettingsForm({ initialData = {}, onSaved }: { initialData?: any, onSaved?: () => void }) {
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
        res = await axios.post("/quiz", payload);
        toast({ title: "Quiz created successfully", status: "success" });
      }
      
      if (onSaved) onSaved();

    } catch (error: any) {
      toast({ title: "Error saving quiz", status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={8} shadow="sm">
      <VStack spacing={8} align="stretch">
        
        {/* Basic Info */}
        <Box>
          <HStack mb={4}>
            <Icon as={FaCog} color="blue.500" boxSize={5} />
            <Heading size="md" color={headingColor}>Basic Information</Heading>
          </HStack>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel color={secondaryTextColor}>Quiz Title</FormLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} size="lg" focusBorderColor="blue.400" />
            </FormControl>
            <FormControl>
              <FormLabel color={secondaryTextColor}>Description</FormLabel>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} focusBorderColor="blue.400" />
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
              <FormControl>
                <FormLabel color={secondaryTextColor}>Visibility</FormLabel>
                <Select value={visibility} onChange={(e) => setVisibility(e.target.value)} focusBorderColor="blue.400">
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                  <option value="RESTRICTED">Restricted</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color={secondaryTextColor}>Status</FormLabel>
                <Select value={status} onChange={(e) => setStatus(e.target.value)} focusBorderColor="blue.400">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </FormControl>
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
                <FormControl>
                  <FormLabel color={secondaryTextColor}>Start Date & Time</FormLabel>
                  <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} bg={cardBg} />
                </FormControl>
                <FormControl>
                  <FormLabel color={secondaryTextColor}>End Date & Time</FormLabel>
                  <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} bg={cardBg} />
                </FormControl>
                <FormControl>
                  <FormLabel color={secondaryTextColor}>Max Attempts Allowed</FormLabel>
                  <Input type="number" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} bg={cardBg} />
                </FormControl>
                <FormControl>
                  <FormLabel color={secondaryTextColor}>Password Protection</FormLabel>
                  <Input type="text" placeholder="Leave blank for no password" value={password} onChange={(e) => setPassword(e.target.value)} bg={cardBg} />
                </FormControl>
                <FormControl gridColumn={{ md: "span 2" }}>
                  <FormLabel color={secondaryTextColor}>Allowed Domains (e.g., @company.com)</FormLabel>
                  <Input type="text" placeholder="Separate multiple domains with commas" value={allowedDomains} onChange={(e) => setAllowedDomains(e.target.value)} bg={cardBg} />
                  <Text fontSize="xs" color="gray.500" mt={1}>Only users with these email domains can take the quiz.</Text>
                </FormControl>
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
                <FormControl>
                  <FormLabel color={secondaryTextColor}>Timer Mode</FormLabel>
                  <Select value={timerType} onChange={(e) => setTimerType(e.target.value)} bg={cardBg}>
                    <option value="NONE">No Timer</option>
                    <option value="OVERALL">Overall Quiz Timer</option>
                    <option value="PER_QUESTION">Per-Question Timer</option>
                  </Select>
                </FormControl>
                {timerType !== "NONE" && (
                  <FormControl>
                    <FormLabel color={secondaryTextColor}>
                      {timerType === "OVERALL" ? "Time Limit (Minutes)" : "Time Limit (Seconds per Question)"}
                    </FormLabel>
                    <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} bg={cardBg} />
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel color={secondaryTextColor}>Passing Percentage (%)</FormLabel>
                  <Input type="number" min={0} max={100} value={passingPercentage} onChange={(e) => setPassingPercentage(Number(e.target.value))} bg={cardBg} />
                </FormControl>
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
                <FormControl>
                  <FormLabel color={secondaryTextColor}>Proctoring Level</FormLabel>
                  <Select value={proctoringLevel} onChange={(e) => setProctoringLevel(e.target.value)} bg={cardBg}>
                    <option value="NONE">None</option>
                    <option value="BASIC">Basic (Browser Lock)</option>
                    <option value="STRICT">Strict (Webcam Monitoring)</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel color={secondaryTextColor}>Max Tab Switches Allowed</FormLabel>
                  <Input type="number" min={0} value={maxTabSwitchesAllowed} onChange={(e) => setMaxTabSwitchesAllowed(Number(e.target.value))} bg={cardBg} />
                  <Text fontSize="xs" color="gray.500" mt={1}>Quiz Auto-Submits if user leaves tab too many times.</Text>
                </FormControl>
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
          colorScheme="blue" 
          size="lg" 
          onClick={handleSave} 
          isLoading={isSaving}
          mt={4}
          shadow="md"
        >
          Save All Quiz Settings
        </Button>
      </VStack>
    </Box>
  );
}
