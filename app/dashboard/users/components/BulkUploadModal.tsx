"use client";

import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import ReactSelect from "react-select";
import { FiDownload, FiUploadCloud, FiFileText } from "react-icons/fi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bulkForm: any;
  setBulkForm: any;
  isSuperadmin: boolean;
  managedCompanies: any[];
  filteredCompanies: any[];
  borderColor: string;
  tableHeadBg: string;
  muted: string;
  selectedBulkManagerLevels: number;
  uploadRoleOptions: Array<{
    value: string;
    label: string;
    description: string;
  }>;

  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;

  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;

  preview: any[];
  loading: boolean;

  onDownloadTemplate: () => void;
  onUpload: () => void;
};

const BulkUploadModal = ({
  isOpen,
  onClose,
  bulkForm,
  setBulkForm,
  isSuperadmin,
  filteredCompanies,
  borderColor,
  tableHeadBg,
  muted,
  selectedBulkManagerLevels,
  uploadRoleOptions,
  getRootProps,
  getInputProps,
  isDragActive,
  selectedFile,
  setSelectedFile,
  preview,
  loading,
  onDownloadTemplate,
  onUpload,
}: Props) => {
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderRadius: "12px",
      borderColor: "inherit",
      "&:hover": {
        borderColor: "inherit",
      },
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: "12px",
      zIndex: 9999,
    }),
  };

  const companyOptions = filteredCompanies.map((c: any) => ({
    label: c.company_name,
    value: c._id,
  }));

  const selectedOption = companyOptions.find(
    (opt) => opt.value === bulkForm.companyId
  );
  const selectedUploadOption = uploadRoleOptions.find(
    (opt) => opt.value === bulkForm.uploadRole
  );
  const parseManagerLevel = (role: string) => {
    const match = String(role || "").trim().toLowerCase().match(/^l(\d+)-manager$/);
    return match ? Number(match[1]) : null;
  };
  const managerLevel = parseManagerLevel(bulkForm.uploadRole);
  const expectedManagerLevels =
    bulkForm.uploadRole === "user"
      ? Array.from({ length: selectedBulkManagerLevels }, (_, index) => index + 1)
      : managerLevel
        ? Array.from(
            { length: Math.max(0, selectedBulkManagerLevels - managerLevel) },
            (_, index) => managerLevel + index + 1
          )
        : [];
  const expectedColumns = [
    "Employee Code",
    "Employee Name",
    "Phone Number",
    "Email ID (Optional)",
    bulkForm.uploadRole === "user" ? "Branch (Optional)" : "Branch",
    "City",
    "State",
    ...(bulkForm.uploadRole === "user" ? ["Designation", "Joining Date"] : []),
    ...expectedManagerLevels.map((level) => `L${level} Manager Phone Number (Name)`),
  ];
  const companyReady = Boolean(bulkForm.companyId);
  const showManagerColumns = selectedBulkManagerLevels > 0;
  const previewColumnCount = showManagerColumns ? 12 : 11;
  const getUniqueManagers = (managers: any[] = []) => {
    const seen = new Set<string>();
    return managers.filter((manager) => {
      const key = `${manager?.level || ""}:${String(manager?.managerEmail || "").trim().toLowerCase()}`;
      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay backdropFilter="blur(6px)" />

      <ModalContent borderRadius="2xl">
        <ModalHeader>Bulk Upload Users</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack align="stretch" spacing={5}>
            {/* ================= COMPANY SELECTION ================= */}
            {isSuperadmin && (
              <Box
                borderWidth="1px"
                borderColor={borderColor}
                p={4}
                borderRadius="xl"
              >
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Select Company</FormLabel>
                  <ReactSelect
                    placeholder="Search and choose company..."
                    options={companyOptions}
                    value={selectedOption}
                    onChange={(opt: any) =>
                      setBulkForm((p: any) => ({
                        ...p,
                        companyId: opt?.value || "",
                        createCompany: false,
                      }))
                    }
                    styles={selectStyles}
                  />
                </FormControl>
              </Box>
            )}

            <Box
              borderWidth="1px"
              borderColor={useColorModeValue("blue.100", "blue.800")}
              bg={useColorModeValue("blue.50", "blue.900")}
              p={5}
              borderRadius="xl"
            >
              <HStack spacing={4} align="center" justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="md" fontWeight="bold" color={useColorModeValue("blue.800", "blue.200")}>
                    Bulk Upload Template
                  </Text>
                  <Text fontSize="sm" color={useColorModeValue("blue.600", "blue.300")}>
                    Start by downloading our standardized template. Fill in the user details and upload it below.
                  </Text>
                </VStack>
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={FiDownload} />}
                  onClick={onDownloadTemplate}
                  isDisabled={isSuperadmin && !companyReady}
                  shadow="sm"
                >
                  Download Template
                </Button>
              </HStack>
            </Box>

            {/* ================= DROPZONE ================= */}            
            {(!isSuperadmin || companyReady) ? (
              <Box
                {...getRootProps()}
                borderWidth="2px"
                borderStyle="dashed"
                borderColor={isDragActive ? "blue.400" : useColorModeValue("gray.300", "gray.600")}
                borderRadius="xl"
                p={10}
                textAlign="center"
                cursor="pointer"
                bg={isDragActive ? useColorModeValue("blue.50", "blue.900") : useColorModeValue("gray.50", "gray.800")}
                _hover={{ bg: useColorModeValue("gray.100", "gray.700"), borderColor: "blue.300" }}
                transition="all 0.2s"
              >
                <input {...getInputProps()} />
                <VStack spacing={3}>
                  <Icon 
                    as={selectedFile ? FiFileText : FiUploadCloud} 
                    w={10} 
                    h={10} 
                    color={selectedFile ? "blue.500" : "gray.400"} 
                  />
                  <Text fontWeight="bold" fontSize="lg">
                    {selectedFile ? "File ready to upload" : "Drag & drop your Excel file here"}
                  </Text>
                  <Text fontSize="sm" color={muted}>
                    {selectedFile ? "Click or drag a different file to replace it." : "Supports .xlsx and .xls formats"}
                  </Text>
                  
                  {selectedFile && (
                    <Badge colorScheme="blue" p={2} borderRadius="md" mt={2}>
                      {selectedFile.name}
                    </Badge>
                  )}
                </VStack>
              </Box>
            ) : (
              <Box
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                p={10}
                textAlign="center"
                bg={useColorModeValue("gray.50", "gray.900")}
              >
                <Text color={muted} fontSize="md">
                  Please select a company above to unlock the upload area.
                </Text>
              </Box>
            )}


          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              setSelectedFile(null);
            }}
          >
            Cancel
          </Button>

          <Button
            colorScheme="blue"
            onClick={onUpload}
            isDisabled={!selectedFile || (isSuperadmin && !companyReady)}
            isLoading={loading}
            loadingText="Uploading..."
            ml={3}
          >
            Upload Users
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkUploadModal;
