import React from "react";
import {
  Box,
  Text,
  Image,
  Heading,
  Stack,
  Badge,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { PhoneIcon, EmailIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { MdSecurity, MdHealthAndSafety } from "react-icons/md";
import { useColorModeValue } from "@chakra-ui/react";

// --- Info Item Component ---
const InfoItem = ({ label, value, isActive, subItems, activeColor, bg, activeHoverBg }: any) => {
  return (
    <Box
      p={3}
      borderRadius="lg"
      bg={isActive ? "teal.50" : bg}
      _hover={{
        bg: isActive ? activeHoverBg : "gray.200",
        transform: "scale(1.02)",
        transition: "all 0.3s ease",
      }}
      transition="all 0.3s ease"
    >
      <SimpleGrid columns={2} spacing={4} alignItems="center">
        <Text fontWeight="medium" fontSize="sm" color="gray.600">
          {label}
        </Text>
        <HStack spacing={2}>
          {isActive && <CheckCircleIcon color={activeColor} boxSize={4} />}
          <Badge
            colorScheme={isActive ? "teal" : "gray"}
            fontWeight={isActive ? "bold" : "normal"}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
          >
            {value || "N/A"}
          </Badge>
        </HStack>
      </SimpleGrid>
      {subItems?.length > 0 && (
        <VStack align="start" spacing={2} pl={6} mt={2}>
          {subItems.map((subItem: any, idx: number) => (
            <SimpleGrid key={idx} columns={2} spacing={4} w="full">
              <Text fontSize="sm" color="gray.600">
                {subItem.label}
              </Text>
              <Badge
                colorScheme={subItem.isActive ? "teal" : "gray"}
                fontWeight={subItem.isActive ? "bold" : "normal"}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                {subItem.value || "N/A"}
              </Badge>
            </SimpleGrid>
          ))}
        </VStack>
      )}
    </Box>
  );
};

// --- Section Card Component ---
const SectionCard = ({ icon, title, children, bg }: any) => {
  return (
    <Card bg={bg} borderWidth="1px" borderRadius="lg" shadow="md" mb={6}>
      <CardHeader pb={2}>
        <HStack spacing={3}>
          {icon && <Icon as={icon} boxSize={6} color="teal.500" />}
          <Heading size="md" color="gray.700">
            {title}
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody pt={2}>{children}</CardBody>
    </Card>
  );
};

// --- Render Medical History Component ---
const RenderMedicalHistory = ({
  history = {},
  activeBg,
  inactiveBg,
  activeBorder,
  inactiveBorder,
  activeGroupBg,
  inactiveGroupBg,
  headingColor,
  activeColor,
  bg,
  activeHoverBg,
  textColor,
}: any) => {
  // Default to empty object to prevent undefined errors
  const safeHistory: any = history || {};

  // Define all fields
  const allFields = [
    // Conditions
    { key: "allergies", label: "Allergies", type: "condition" },
    { key: "bloodPressure", label: "Blood Pressure", type: "condition" },
    { key: "heartDisease", label: "Heart Disease", type: "condition" },
    { key: "pacemaker", label: "Pacemaker", type: "condition" },
    { key: "diabetes", label: "Diabetes", type: "condition" },
    { key: "thyroid", label: "Thyroid", type: "condition" }, // Added thyroid field
    { key: "asthma", label: "Asthma", type: "condition" },
    { key: "artificialJointOrValve", label: "Artificial Joint or Valve", type: "condition" },
    { key: "kidneyDisease", label: "Kidney Disease", type: "condition" },
    { key: "tuberculosis", label: "Tuberculosis", type: "condition" },
    { key: "hepatitis", label: "Hepatitis", type: "condition" },
    { key: "bloodTransfusion", label: "Blood Transfusion", type: "condition" },
    { key: "cancer", label: "Cancer", type: "condition" },
    { key: "neurologicCondition", label: "Neurologic Condition", type: "condition" },
    { key: "epilepsy", label: "Epilepsy", type: "condition" },
    { key: "aids", label: "AIDS", type: "condition" },
    { key: "hiv", label: "HIV", type: "condition" },
    { key: "anaemia", label: "Anaemia", type: "condition" },
    { key: "otherMedicalIssue", label: "Other Medical Issue", type: "condition" },
    { key: "smoking", label: "Smoking", type: "condition" },
    { key: "chewingTobacco", label: "Chewing Tobacco", type: "condition" },
    { key: "alcohol", label: "Alcohol", type: "condition" },
    // Pacemaker Medications
    { key: "pacemakerMeds.aspirin", label: "Aspirin", type: "pacemakerMed" },
    { key: "pacemakerMeds.anticoagulants", label: "Anticoagulants", type: "pacemakerMed" },
    { key: "pacemakerMeds.bloodPressureMeds", label: "Blood Pressure Medications", type: "pacemakerMed" },
    { key: "pacemakerMeds.nitroglycerin", label: "Nitroglycerin", type: "pacemakerMed" },
    // Other Medications
    { key: "medications.antibiotics", label: "Antibiotics", type: "medication" },
    { key: "medications.antidepressants", label: "Antidepressants / Tranquilizers", type: "medication" },
    { key: "medications.steroids", label: "Cortisone / Steroids", type: "medication" },
    { key: "medications.osteoporosisMeds", label: "Osteoporosis Medicine", type: "medication" },
    { key: "medications.other1", label: "Other Medication (First)", type: "medication" },
    { key: "medications.other2", label: "Other Medication (Second)", type: "medication" },
    // Women-Specific
    { key: "women.pregnant", label: "Pregnant", type: "women" },
    { key: "women.dueDate", label: "Due Date", type: "women" },
    { key: "women.breastFeeding", label: "Breast Feeding", type: "women" },
    { key: "women.hormones", label: "Hormones", type: "women" },
    { key: "women.pcodPcos", label: "PCOD/PCOS", type: "women" },
  ];

  // Process all fields with defensive checks
  const items = allFields.map(({ key, label, type }) => {
    let value, isActive, subItems;

    if (type === "condition" || (type === "women" && key === "women.pcodPcos")) {
      const data = key.includes(".") ? safeHistory[key.split(".")[0]]?.[key.split(".")[1]] || {} : safeHistory[key] || {};
      isActive = data.checked === true || ["yes", "high", "low", "occasional"].includes(data.option) || !!data.text;
      value = data.option ? data.option.charAt(0).toUpperCase() + data.option.slice(1) : (data.checked === true ? "Yes" : "No");
      subItems = [];
      if (data.text) {
        subItems.push({ label: "Details", value: data.text, isActive: !!data.text });
      }
      if (key === "diabetes" && data.insulin != null) {
        subItems.push({ label: "Insulin", value: data.insulin === true ? "Yes" : "No", isActive: data.insulin === true });
      }
      if (key === "thyroid" && data.type) {
        subItems.push({ label: "Type", value: data.type === "hyper" ? "Hyperthyroidism" : "Hypothyroidism", isActive: !!data.type });
      }
    } else if (type === "pacemakerMed" || type === "medication") {
      const [parent, child] = key.split(".");
      const data = safeHistory[parent]?.[child] ?? (type === "medication" ? "" : false);
      isActive = data === true || (typeof data === "string" && data);
      value = typeof data === "boolean" ? (data ? "Yes" : "No") : data || "N/A";
    } else if (type === "women") {
      const data = safeHistory.women?.[key.split(".")[1]] ?? (key === "women.dueDate" ? "" : false);
      isActive = data === true || (typeof data === "string" && data);
      value = typeof data === "boolean" ? (data ? "Yes" : "No") : data || "N/A";
    }

    return { label, value, isActive, subItems };
  }).filter(item => item.isActive); // Filter out inactive items

  // Group related fields
  const groups = [
    {
      label: "Conditions",
      icon: MdHealthAndSafety,
      subItems: items.filter((item) =>
        [
          "Allergies",
          "Blood Pressure",
          "Heart Disease",
          "Pacemaker",
          "Diabetes",
          "Thyroid",
          "Asthma",
          "Artificial Joint or Valve",
          "Kidney Disease",
          "Tuberculosis",
          "Hepatitis",
          "Blood Transfusion",
          "Cancer",
          "Neurologic Condition",
          "Epilepsy",
          "AIDS",
          "HIV",
          "Anaemia",
          "Other Medical Issue",
          "Smoking",
          "Chewing Tobacco",
          "Alcohol",
        ].includes(item.label)
      ),
      isActive: items
        .filter((item) =>
          [
            "Allergies",
            "Blood Pressure",
            "Heart Disease",
            "Pacemaker",
            "Diabetes",
            "Thyroid",
            "Asthma",
            "Artificial Joint or Valve",
            "Kidney Disease",
            "Tuberculosis",
            "Hepatitis",
            "Blood Transfusion",
            "Cancer",
            "Neurologic Condition",
            "Epilepsy",
            "AIDS",
            "HIV",
            "Anaemia",
            "Other Medical Issue",
            "Smoking",
            "Chewing Tobacco",
            "Alcohol",
          ].includes(item.label)
        )
        .some((item) => item.isActive),
    },
    {
      label: "Pacemaker Medications",
      icon: MdHealthAndSafety,
      subItems: items.filter((item) =>
        ["Aspirin", "Anticoagulants", "Blood Pressure Medications", "Nitroglycerin"].includes(item.label)
      ),
      isActive:
        safeHistory.pacemaker?.checked === true &&
        items
          .filter((item) =>
            ["Aspirin", "Anticoagulants", "Blood Pressure Medications", "Nitroglycerin"].includes(item.label)
          )
          .some((item) => item.isActive),
    },
    {
      label: "Other Medications",
      icon: MdHealthAndSafety,
      subItems: items.filter((item) =>
        [
          "Antibiotics",
          "Antidepressants / Tranquilizers",
          "Cortisone / Steroids",
          "Osteoporosis Medicine",
          "Other Medication (First)",
          "Other Medication (Second)",
        ].includes(item.label)
      ),
      isActive:
        safeHistory.otherMedicalIssue?.option === "yes" &&
        items
          .filter((item) =>
            [
              "Antibiotics",
              "Antidepressants / Tranquilizers",
              "Cortisone / Steroids",
              "Osteoporosis Medicine",
              "Other Medication (First)",
              "Other Medication (Second)",
            ].includes(item.label)
          )
          .some((item) => item.isActive),
    },
    {
      label: "Women-Specific",
      icon: MdHealthAndSafety,
      subItems: items.filter((item) =>
        ["Pregnant", "Due Date", "Breast Feeding", "Hormones", "PCOD/PCOS"].includes(item.label)
      ),
      isActive: items
        .filter((item) => ["Pregnant", "Due Date", "Breast Feeding", "Hormones", "PCOD/PCOS"].includes(item.label))
        .some((item) => item.isActive),
    },
  ].filter((group) => group.subItems.length > 0); // Only show groups with active sub-items

  if (groups.length === 0) {
    return <Text>No relevant medical history to display</Text>;
  }

  return (
    <Box
      p={5}
      borderWidth={1}
      borderRadius="xl"
      bg={groups.some((group) => group.isActive) ? activeBg : inactiveBg}
      borderColor={groups.some((group) => group.isActive) ? activeBorder : inactiveBorder}
      shadow="lg"
      _hover={{ shadow: "xl", transition: "box-shadow 0.3s ease" }}
      transition="box-shadow 0.3s ease"
      aria-label="Medical History"
    >
      <Heading size="lg" mb={5} color={headingColor} fontWeight="bold">
        Medical History
      </Heading>
      <Accordion allowMultiple defaultIndex={groups.map((_, idx) => idx)}>
        {groups.map((group, idx) => (
          <AccordionItem key={idx} border="none" mb={2}>
            <AccordionButton
              bg={group.isActive ? activeGroupBg : inactiveGroupBg}
              borderRadius="lg"
              _hover={{
                bg: group.isActive ? "teal.200" : "gray.200",
                transform: "scale(1.01)",
                transition: "all 0.3s ease",
              }}
              px={4}
              py={3}
              transition="all 0.3s ease"
            >
              <HStack flex="1" textAlign="left" spacing={3}>
                <Icon as={group.icon} boxSize={6} color="teal.500" />
                <Text fontWeight="bold" fontSize="md" color={textColor}>
                  {group.label}
                </Text>
                {group.isActive && (
                  <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="sm">
                    Active
                  </Badge>
                )}
              </HStack>
              <AccordionIcon boxSize={6} />
            </AccordionButton>
            <AccordionPanel pb={4} pt={3}>
              <VStack align="stretch" spacing={3}>
                {group.subItems.map((item, subIdx) => (
                  <InfoItem
                    key={subIdx}
                    label={item.label}
                    value={item.value}
                    isActive={item.isActive}
                    subItems={item.subItems}
                    activeColor={activeColor}
                    bg={bg}
                    activeHoverBg={activeHoverBg}
                  />
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

// --- Insurance Item Component ---
const InsuranceItem = ({ insurance, bg, activeColor, activeHoverBg }: any) => {
  return (
    <Box
      p={3}
      borderWidth={1}
      borderRadius="lg"
      mb={2}
      bg={bg}
      shadow="sm"
      _hover={{ shadow: "md", transition: "box-shadow 0.3s ease" }}
    >
      <InfoItem
        label="Type"
        value={insurance?.type}
        isActive={!!insurance?.type}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Start Date"
        value={insurance?.startDate}
        isActive={!!insurance?.startDate}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Renewal Date"
        value={insurance?.renewalDate}
        isActive={!!insurance?.renewalDate}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Amount Insured"
        value={insurance?.amountInsured}
        isActive={!!insurance?.amountInsured}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Amount Paid"
        value={insurance?.amountPaid}
        isActive={!!insurance?.amountPaid}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
      <InfoItem
        label="Remarks"
        value={insurance?.remarks || "N/A"}
        isActive={!!insurance?.remarks}
        activeColor={activeColor}
        bg={bg}
        activeHoverBg={activeHoverBg}
      />
    </Box>
  );
};

// --- Main ViewPatient Component ---
const ViewPatient = ({ user }: any) => {
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const sectionCardBg = useColorModeValue("white", "gray.800");
  const activeBg = useColorModeValue("linear-gradient(to bottom, teal.50, teal.100)", "linear-gradient(to bottom, teal.900, teal.800)");
  const inactiveBg = useColorModeValue("gray.50", "gray.700");
  const activeBorder = useColorModeValue("teal.300", "teal.600");
  const inactiveBorder = useColorModeValue("gray.200", "gray.600");
  const activeGroupBg = useColorModeValue("teal.100", "teal.800");
  const inactiveGroupBg = useColorModeValue("gray.100", "gray.600");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const insuranceBg = useColorModeValue("gray.50", "gray.700");
  const activeColor = useColorModeValue("teal.600", "teal.300");
  const bg = useColorModeValue("gray.100", "gray.700");
  const activeHoverBg = useColorModeValue("linear-gradient(to right, teal.100, teal.200)", "linear-gradient(to right, teal.800, teal.900)");

  if (!user) return <Text>No user data available</Text>;

  const personalInfo = user;

  return (
    <Box p={4} bg={pageBg}>
      {/* Profile Header */}
      <Card mb={6} shadow="md" borderRadius="lg" bg={sectionCardBg}>
        <CardBody>
          <Stack direction={["column", "row"]} spacing={4} align="center">
            {personalInfo?.pic?.url && (
              <Image
                src={personalInfo.pic.url}
                alt={personalInfo.name}
                boxSize="80px"
                borderRadius="full"
                shadow="md"
              />
            )}
            <Box>
              <Heading size="md">{personalInfo.name || "N/A"}</Heading>
              <Text fontSize="sm" color="gray.500">
                {personalInfo.type || "N/A"}
              </Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      {/* Basic Info */}
      <SectionCard title="Basic Information" bg={sectionCardBg}>
        <VStack align="stretch" spacing={3}>
          <InfoItem
            label="Username"
            value={personalInfo.username}
            isActive={!!personalInfo.username}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <InfoItem
            label="Bio"
            value={personalInfo.bio}
            isActive={!!personalInfo.bio}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <InfoItem
            label="DOB"
            value={personalInfo.dob}
            isActive={!!personalInfo.dob}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <InfoItem
            label="Gender"
            value={personalInfo.gender === 1 ? "Male" : personalInfo.gender === 2 ? "Female" : "Other"}
            isActive={personalInfo.gender != null}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <InfoItem
            label="Languages"
            value={personalInfo.languages?.join(", ")}
            isActive={personalInfo.languages?.length > 0}
            activeColor={activeColor}
            bg={bg}
            activeHoverBg={activeHoverBg}
          />
          <Box>
            <Text fontWeight="semibold" mb={3} color="gray.600" fontSize="lg">
              Medical History:
            </Text>
            <RenderMedicalHistory
              history={personalInfo.medicalHistory}
              activeBg={activeBg}
              inactiveBg={inactiveBg}
              activeBorder={activeBorder}
              inactiveBorder={inactiveBorder}
              activeGroupBg={activeGroupBg}
              inactiveGroupBg={inactiveGroupBg}
              headingColor={headingColor}
              activeColor={activeColor}
              bg={bg}
              activeHoverBg={activeHoverBg}
              textColor={textColor}
            />
          </Box>
        </VStack>
      </SectionCard>

      {/* Contact Info */}
      <SectionCard title="Contact Information" bg={sectionCardBg}>
        <VStack align="stretch" spacing={3}>
          {personalInfo.phones?.filter((p: any) => p?.number).map((p: any, idx: number) => (
            <HStack key={idx}>
              <PhoneIcon color="teal.500" />
              <Text>
                {p.number}{" "}
                {p.primary && (
                  <Badge ml={1} colorScheme="green" borderRadius="full" px={2}>
                    Primary
                  </Badge>
                )}
              </Text>
            </HStack>
          ))}

          {personalInfo.emails?.filter((e: any) => e?.email).map((e: any, idx: number) => (
            <HStack key={idx}>
              <EmailIcon color="teal.500" />
              <Text>
                {e.email}{" "}
                {e.primary && (
                  <Badge ml={1} colorScheme="green" borderRadius="full" px={2}>
                    Primary
                  </Badge>
                )}
              </Text>
            </HStack>
          ))}

          {personalInfo.addresses && (
            <>
              <InfoItem
                label="Residential"
                value={personalInfo.addresses.residential}
                isActive={!!personalInfo.addresses.residential}
                activeColor={activeColor}
                bg={bg}
                activeHoverBg={activeHoverBg}
              />
              <InfoItem
                label="Office"
                value={personalInfo.addresses.office}
                isActive={!!personalInfo.addresses.office}
                activeColor={activeColor}
                bg={bg}
                activeHoverBg={activeHoverBg}
              />
              <InfoItem
                label="Other"
                value={personalInfo.addresses.other}
                isActive={!!personalInfo.addresses.other}
                activeColor={activeColor}
                bg={bg}
                activeHoverBg={activeHoverBg}
              />
            </>
          )}
        </VStack>
      </SectionCard>

      {/* Insurances */}
      <SectionCard icon={MdSecurity} title="Insurances" bg={sectionCardBg}>
        {personalInfo.insurances?.length > 0 ? (
          personalInfo.insurances.map((i: any, idx: number) => (
            <InsuranceItem
              key={idx}
              insurance={i}
              bg={insuranceBg}
              activeColor={activeColor}
              activeHoverBg={activeHoverBg}
            />
          ))
        ) : (
          <Text>N/A</Text>
        )}
      </SectionCard>
    </Box>
  );
};

export default ViewPatient;