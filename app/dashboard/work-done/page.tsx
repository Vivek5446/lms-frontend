"use client";

import {
  Box,
  Button,
  SimpleGrid,
  Text,
  Flex,
  Divider,
  HStack,
  VStack,
  Tag,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  RiUser3Line,
  RiStethoscopeLine,
  RiCalendarTodoLine,
  RiNotification4Line,
  RiDownload2Line,
  RiCalendar2Line,
  RiTeamLine,
} from "react-icons/ri";

import CustomInput from "../../component/config/component/customInput/CustomInput";
import { observer } from "mobx-react-lite";
import stores from "../../store/stores";

type ReportTab = "patient" | "doctor" | "appointment" | "recall" | "staff";

const REPORT_TABS: {
  label: string;
  value: ReportTab;
  colorScheme: string;
  icon: React.ElementType;
}[] = [
    { label: "Patient", value: "patient", colorScheme: "teal", icon: RiUser3Line },
    { label: "Doctor", value: "doctor", colorScheme: "blue", icon: RiStethoscopeLine },
    { label: "Staff", value: "staff", colorScheme: "green", icon: RiTeamLine },
    { label: "Appointment", value: "appointment", colorScheme: "purple", icon: RiCalendarTodoLine },
    { label: "Recall", value: "recall", colorScheme: "orange", icon: RiNotification4Line },
  ];

const ReportsPage = observer(() => {
  const { reportStore: { getReportDownload } } = stores;
  const [activeTab, setActiveTab] = useState<ReportTab>("patient");

  // Searchable entities
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const [filters, setFilters] = useState<any>({
    patient: { category: "all" },
    doctor: { mode: "list" },
    appointment: { status: "" },
    recall: { status: "" },
    staff: { role: "all" },
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const toast = useToast();

  // Persist active tab
  useEffect(() => {
    const saved = localStorage.getItem("activeReportTab");
    if (saved && ["patient", "doctor", "appointment", "recall", "staff"].includes(saved)) {
      setActiveTab(saved as ReportTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeReportTab", activeTab);
  }, [activeTab]);

  // Reset filters and selections when tab changes
  const handleTabChange = (tab: ReportTab) => {
    setActiveTab(tab);
    setSelectedPatient(null);
    setSelectedDoctor(null);
    // Optional: reset tab-specific filters if needed
  };

  const handleChange = (section: ReportTab, name: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [name]: value },
    }));
  };

  const applyQuickDate = (type: "today" | "month") => {
    const today = new Date();
    let fromDate = today;
    let toDate = today;

    if (type === "month") {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const format = (d: Date) => d.toISOString().split("T")[0];
    handleChange(activeTab, "fromDate", format(fromDate));
    handleChange(activeTab, "toDate", format(toDate));
  };

  const isDownloadDisabled = () => {
    const f = filters[activeTab];
    if (!f) return true;
    if (f.fromDate && f.toDate && f.fromDate > f.toDate) return true;
    return false;
  };

  const handleDownload = async () => {
    if (isDownloadDisabled()) return;

    setIsDownloading(true);

    try {
      const payloadFilters = {
        ...filters[activeTab],
        ...(selectedPatient ? { patientId: selectedPatient.id || selectedPatient.value } : {}),
        ...(selectedDoctor ? { doctorId: selectedDoctor.id || selectedDoctor.value } : {}),
      };

      const response = await getReportDownload({
        reportType: activeTab,
        filters: payloadFilters,
      });

      if (response?.status === "success" && response.data) {
        const { fileName, fileData } = response.data;

        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || `${activeTab}-report-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Report downloaded successfully!",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      } else {
        throw new Error(response?.message || "Failed to generate report");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to download report. Please try again.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const activeTabConfig = REPORT_TABS.find((t) => t.value === activeTab)!;
  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box bg={bgPage} minH="100vh">
      <Box maxW="1400px" mx="auto" p={5}>
        {/* Header */}
        <VStack align="start" spacing={4} mb={8}>
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="extrabold"
            bgGradient="linear(to-r, gray.700, gray.900)"
            bgClip="text"
            _dark={{ bgGradient: "linear(to-r, gray.100, gray.300)" }}
          >
            Reports Dashboard
          </Text>
        </VStack>

        {/* Report Type Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={8} mb={16}>
          {REPORT_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const IconComponent = tab.icon;

            return (
              <Box
                key={tab.value}
                position="relative"
                bg={bgCard}
                borderRadius="3xl"
                p={10}
                textAlign="center"
                cursor="pointer"
                border={`3px solid ${isActive ? `var(--chakra-colors-${tab.colorScheme}-400)` : "transparent"}`}
                boxShadow={isActive ? "0 20px 40px rgba(0,0,0,0.08)" : "0 8px 24px rgba(0,0,0,0.05)"}
                transition="all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1)"
                _hover={{
                  transform: "translateY(-16px) scale(1.02)",
                  boxShadow: "0 32px 64px rgba(0,0,0,0.12)",
                }}
                onClick={() => handleTabChange(tab.value)}
                overflow="hidden"
              >
                {isActive && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="8px"
                    bgGradient={`linear(to-r, ${tab.colorScheme}.400, ${tab.colorScheme}.600)`}
                    borderTopRadius="3xl"
                  />
                )}

                <Box
                  position="relative"
                  w={24}
                  h={24}
                  mx="auto"
                  mb={6}
                  borderRadius="full"
                  bgGradient={`linear(to-br, ${tab.colorScheme}.50, ${tab.colorScheme}.100)`}
                  _dark={{ bgGradient: `linear(to-br, ${tab.colorScheme}.900, ${tab.colorScheme}.800)` }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transform={isActive ? "scale(1.2)" : "scale(1)"}
                  transition="transform 0.4s ease"
                >
                  {isActive && (
                    <Box
                      position="absolute"
                      inset={-2}
                      borderRadius="full"
                      border={`4px solid var(--chakra-colors-${tab.colorScheme}-300)`}
                      opacity={0.4}
                      animation="pulse 2s infinite"
                    />
                  )}
                  <IconComponent size={48} color={`var(--chakra-colors-${tab.colorScheme}-600)`} />
                </Box>

                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={isActive ? `${tab.colorScheme}.600` : "gray.700"}
                  _dark={{ color: isActive ? `${tab.colorScheme}.300` : "gray.200" }}
                  mt={4}
                >
                  {tab.label} Report
                </Text>

                {isActive && (
                  <Tag size="lg" colorScheme={tab.colorScheme} mt={4} fontWeight="extrabold" borderRadius="full" px={6}>
                    ACTIVE
                  </Tag>
                )}
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Main Report Card */}
        <Box bg={bgCard} borderRadius="3xl" overflow="hidden" boxShadow="xl" border={`1px solid ${borderColor}`}>
          {/* Header */}
          <Box
            bgGradient={`linear(to-r, ${activeTabConfig.colorScheme}.500, ${activeTabConfig.colorScheme}.700)`}
            px={{ base: 8, md: 12 }}
            py={10}
          >
            <Flex align="center" gap={6} color="white">
              <Box bg="whiteAlpha.200" p={5} borderRadius="2xl">
                <activeTabConfig.icon size={56} />
              </Box>
              <Box>
                <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="extrabold">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report
                </Text>
                <Text fontSize="lg" opacity={0.95} mt={2}>
                  Customize filters to generate detailed reports
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Stats Placeholder */}
          <Box px={{ base: 8, md: 12 }} py={8} bg={useColorModeValue("gray.50", "gray.700")}>
            <StatGroup gap={8} justifyContent="center">
              <Stat textAlign="center">
                <StatLabel fontSize="lg" color={textSecondary}>Total Records</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color={`${activeTabConfig.colorScheme}.600`}>
                  —
                </StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel fontSize="lg" color={textSecondary}>This Month</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color={`${activeTabConfig.colorScheme}.600`}>
                  —
                </StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel fontSize="lg" color={textSecondary}>Daily Average</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color={`${activeTabConfig.colorScheme}.600`}>
                  —
                </StatNumber>
              </Stat>
            </StatGroup>
          </Box>

          <Divider />

          {/* Filters Section */}
          <Box p={{ base: 8, md: 12 }} pb={10}>
            {/* Quick Date Buttons */}
            <HStack mb={10} spacing={5} flexWrap="wrap" gap={4}>
              <Button
                leftIcon={<RiCalendar2Line size={20} />}
                size="lg"
                variant="solid"
                colorScheme={activeTabConfig.colorScheme}
                bg={`${activeTabConfig.colorScheme}.100`}
                color={`${activeTabConfig.colorScheme}.700`}
                _hover={{ bg: `${activeTabConfig.colorScheme}.200` }}
                borderRadius="full"
                onClick={() => applyQuickDate("today")}
              >
                Today
              </Button>
              <Button
                leftIcon={<RiCalendar2Line size={20} />}
                size="lg"
                variant="solid"
                colorScheme={activeTabConfig.colorScheme}
                bg={`${activeTabConfig.colorScheme}.100`}
                color={`${activeTabConfig.colorScheme}.700`}
                _hover={{ bg: `${activeTabConfig.colorScheme}.200` }}
                borderRadius="full"
                onClick={() => applyQuickDate("month")}
              >
                This Month
              </Button>
            </HStack>

            {/* Filter Panel */}
            <Box
              bg="whiteAlpha.900"
              _dark={{ bg: "blackAlpha.400" }}
              backdropFilter="blur(20px)"
              borderRadius="3xl"
              p={10}
              border={`1px solid ${useColorModeValue("whiteAlpha.600", "whiteAlpha.300")}`}
              boxShadow="lg"
            >
              <Text fontSize="2xl" fontWeight="bold" mb={8}>
                Filter Configuration
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                {/* Common Date Filters */}
                <CustomInput
                  name="fromDate"
                  type="date"
                  label="From Date"
                  value={filters[activeTab].fromDate || ""}
                  onChange={(e: any) => handleChange(activeTab, "fromDate", e.target.value)}
                />

                <CustomInput
                  name="toDate"
                  type="date"
                  label="To Date"
                  value={filters[activeTab].toDate || ""}
                  onChange={(e: any) => handleChange(activeTab, "toDate", e.target.value)}
                />

                {/* Tab-Specific Filters */}
                {activeTab === "patient" && (
                  <CustomInput
                    name="category"
                    type="select"
                    label="Patient Category"
                    placeholder="All patients"
                    options={[
                      { label: "All Patients", value: "all" },
                      { label: "With Appointments", value: "withAppointments" },
                      { label: "With Recalls", value: "withRecalls" },
                    ]}
                    value={filters.patient.category || "all"}
                    onChange={(val: any) => handleChange("patient", "category", val?.value || "all")}
                  />
                )}

                {activeTab === "doctor" && (
                  <>
                    <CustomInput
                      name="mode"
                      type="select"
                      label="Report Type"
                      placeholder="Select type"
                      options={[
                        { label: "Doctor List", value: "list" },
                        { label: "Appointments", value: "appointments" },
                        { label: "Patients Treated", value: "patients" },
                      ]}
                      value={filters.doctor.mode || "list"}
                      onChange={(val: any) => handleChange("doctor", "mode", val?.value || "list")}
                    />

                    <CustomInput
                      name="patient"
                      placeholder="Search Patient"
                      type="real-time-user-search"
                      label="Filter by Patient"
                      value={selectedPatient}
                      onChange={(val: any) => setSelectedPatient(val)}
                      query={{ type: "patient" }}
                    />
                  </>
                )}

                {activeTab === "appointment" && (
                  <>
                    <CustomInput
                      name="patient"
                      placeholder="Search Patient"
                      type="real-time-user-search"
                      label="Patient"
                      value={selectedPatient}
                      onChange={(val: any) => setSelectedPatient(val)}
                      query={{ type: "patient" }}
                    />

                    <CustomInput
                      name="doctor"
                      placeholder="Search Doctor"
                      type="real-time-user-search"
                      label="Doctor"
                      value={selectedDoctor}
                      onChange={(val: any) => setSelectedDoctor(val)}
                      query={{ type: "doctor" }}
                    />

                    <CustomInput
                      name="status"
                      type="select"
                      label="Appointment Status"
                      placeholder="All appointments"
                      options={[
                        { label: "All", value: "" },
                        { label: "Upcoming", value: "upcoming" },
                        { label: "Completed", value: "completed" },
                        { label: "Cancelled", value: "cancelled" },
                        { label: "No-Show", value: "no-show" },
                        { label: "Arrived", value: "arrived" },
                      ]}
                      value={filters.appointment.status || ""}
                      onChange={(val: any) => handleChange("appointment", "status", val?.value || "")}
                    />
                  </>
                )}

                {activeTab === "recall" && (
                  <>
                    <CustomInput
                      name="status"
                      type="select"
                      label="Recall Status"
                      placeholder="All recalls"
                      options={[
                        { label: "All", value: "" },
                        { label: "Pending", value: "pending" },
                        { label: "Scheduled", value: "scheduled" },
                        { label: "Completed", value: "completed" },
                        { label: "Cancelled", value: "cancelled" },
                      ]}
                      value={filters.recall.status || ""}
                      onChange={(val: any) => handleChange("recall", "status", val?.value || "")}
                    />

                    <CustomInput
                      name="patient"
                      placeholder="Search Patient"
                      type="real-time-user-search"
                      label="Patient"
                      value={selectedPatient}
                      onChange={(val: any) => setSelectedPatient(val)}
                      query={{ type: "patient" }}
                    />
                  </>
                )}

                {activeTab === "staff" && (
                  <CustomInput
                    name="role"
                    type="select"
                    label="Staff Role"
                    placeholder="All staff"
                    options={[
                      { label: "All Staff", value: "all" },
                      { label: "Nurse", value: "nurse" },
                      { label: "Receptionist", value: "receptionist" },
                      { label: "Admin", value: "admin" },
                      { label: "Technician", value: "technician" },
                    ]}
                    value={filters.staff.role || "all"}
                    onChange={(val: any) => handleChange("staff", "role", val?.value || "all")}
                  />
                )}
              </SimpleGrid>
            </Box>
          </Box>

          {/* Download Button */}
          <Box px={{ base: 8, md: 12 }} py={8} bg={useColorModeValue("gray.50", "gray.800")} borderTop={`1px solid ${borderColor}`}>
            <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap={6}>
              <Text fontSize="lg" color={textSecondary} textAlign={{ base: "center", md: "left" }}>
                Your <Text as="span" fontWeight="bold" color={`${activeTabConfig.colorScheme}.600`}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </Text> report is ready
              </Text>

              <Button
                size="xl"
                colorScheme={activeTabConfig.colorScheme}
                rightIcon={<RiDownload2Line size={28} />}
                px={12}
                py={8}
                fontSize="xl"
                fontWeight="extrabold"
                borderRadius="full"
                boxShadow="0 20px 40px rgba(0,0,0,0.15)"
                _hover={{ transform: "translateY(-6px)", boxShadow: "0 30px 60px rgba(0,0,0,0.2)" }}
                isDisabled={isDownloadDisabled()}
                isLoading={isDownloading}
                loadingText="Generating..."
                onClick={handleDownload}
              >
                Download Excel Report
              </Button>
            </Flex>
          </Box>
        </Box>

        {/* Pulse Animation */}
        <style jsx global>{`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.1); }
            70% { box-shadow: 0 0 0 20px rgba(0,0,0,0); }
            100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
          }
        `}</style>
      </Box>
    </Box>
  );
});

export default ReportsPage;