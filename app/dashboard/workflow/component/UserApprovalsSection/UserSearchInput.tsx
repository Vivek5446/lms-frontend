"use client";
import {
  Box,
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
  Avatar,
  Badge,
  Input,
  Spinner,
  useDisclosure,
  useToast,
  useColorModeValue,
  Divider,
  FormLabel,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiPlus, FiSearch, FiUser, FiX } from "react-icons/fi";
import CustomInput from "../../../../component/config/component/customInput/CustomInput";
import { userStore } from "../../../../store/userStore/userStore";

interface UserSearchInputProps {
  value: { email: string; name: string; userId?: string } | null;
  onChange: (user: { email: string; name: string; designation?: string; userId?: string } | null) => void;
  placeholder?: string;
  label?: string;
  company?: string;
}

interface NewUserForm {
  name: string;
  username: string; // email
  code: string;
  password: string;
  bio: string;
}

const defaultNewUser: NewUserForm = {
  name: "",
  username: "",
  code: "",
  password: "",
  bio: "",
};

export const UserSearchInput = ({
  value,
  onChange,
  placeholder = "Search by name or email...",
  label,
}: UserSearchInputProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>(defaultNewUser);
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<Partial<NewUserForm>>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const toast = useToast();

  const inputBg = useColorModeValue("white", "gray.800");
  const dropdownBg = useColorModeValue("white", "gray.800");
  const resultHover = useColorModeValue("brand.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsSearching(true);
    try {
      const res: any = await userStore.getAllUsers({ search: q, limit: 8, page: 1 });
      const users = res?.data?.data?.data || userStore.user.data || [];
      setResults(users);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 350);
  };

  const handleSelect = (user: any) => {
    onChange({
      email: user.username || user.label?.split("(")[0],
      name: user.name || user.label?.split("(")[0],
      designation: user.profile_details?.designation || "",
      userId: user._id || user.value,
    });
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setResults([]);
  };

  // --- Create User Modal ---
  const validateNew = (): boolean => {
    const errs: Partial<NewUserForm> = {};
    if (!newUser.name.trim()) errs.name = "Name is required";
    if (!newUser.username.trim()) errs.username = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(newUser.username)) errs.username = "Invalid email";
    if (!newUser.password || newUser.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!newUser.code.trim()) errs.code = "Code is required";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateNew()) return;
    setCreating(true);
    try {
      const res: any = await userStore.createUser({
        name: newUser.name,
        username: newUser.username,
        code: newUser.code,
        password: newUser.password,
        userType: "user",
        role: "user",
        bio: newUser.bio,
      });
      const created = res?.data?.data;
      toast({ title: "User created!", status: "success", duration: 3000, isClosable: true });
      onChange({
        email: created?.username || newUser.username,
        name: created?.name || newUser.name,
        userId: created?._id,
      });
      setNewUser(defaultNewUser);
      closeModal();
    } catch (err: any) {
      toast({
        title: "Failed to create user",
        description: err?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box ref={wrapperRef} position="relative" w="100%">
      {label && (
        <Text fontSize="sm" fontWeight="500" mb={1} color="gray.600">
          {label}
        </Text>
      )}

      {/* Show selected user pill */}
      {value ? (
        <Flex
          align="center"
          gap={3}
          px={3}
          py={2}
          border="1px solid"
          borderColor="brand.300"
          rounded="lg"
          bg={useColorModeValue("brand.50", "brand.900")}
          transition="all 0.2s"
        >
          <Avatar size="xs" name={value.name} bg="brand.400" color="white" />
          <Box flex="1" overflow="hidden">
            <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
              {value.name}
            </Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {value.email}
            </Text>
          </Box>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="red"
            rounded="full"
            onClick={handleClear}
            _hover={{ bg: "red.50" }}
          >
            <FiX />
          </Button>
        </Flex>
      ) : (
        <>
          {/* Search input */}
          <Flex 
            gap={3} 
            direction={{ base: "column", md: "row" }} 
            align={{ base: "flex-end", md: "center" }}
            w="100%"
          >
            <Box position="relative" w="100%">
              <CustomInput
                name="user-search"
                type="real-time-user-search"
                placeholder={placeholder}
                query={{ userType: "user" }}
                onChange={(selected: any) => {
                  if (selected) {
                    handleSelect(selected);
                  }
                }}
              />
            </Box>

            <Button
              size="sm"
              leftIcon={<FiPlus />}
              colorScheme="brand"
              variant="outline"
              rounded="full"
              onClick={openModal}
              whiteSpace="nowrap"
              flexShrink={0}
              w={{ base: "auto", md: "initial" }} 
            >
              New User
            </Button>
          </Flex>

          {/* Dropdown results */}
          {isOpen && (
            <Box
              position="absolute"
              top="calc(100% + 6px)"
              left={0}
              right={0}
              zIndex={9999}
              bg={dropdownBg}
              border="1px solid"
              borderColor={borderColor}
              rounded="xl"
              shadow="lg"
              overflow="hidden"
              maxH="280px"
              overflowY="auto"
            >
              {results.length === 0 ? (
                <Flex direction="column" align="center" py={6} gap={3}>
                  <FiUser size={20} color="gray" />
                  <Text fontSize="sm" color="gray.400">
                    No users found for "{query}"
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="brand"
                    variant="ghost"
                    leftIcon={<FiPlus />}
                    onClick={() => {
                      setNewUser({ ...defaultNewUser, username: query, name: query });
                      openModal();
                      setIsOpen(false);
                    }}
                  >
                    Create "{query}"
                  </Button>
                </Flex>
              ) : (
                results.map((u: any) => (
                  <Flex
                    key={u._id}
                    px={4}
                    py={3}
                    gap={3}
                    align="center"
                    cursor="pointer"
                    transition="0.15s"
                    _hover={{ bg: resultHover }}
                    onClick={() => handleSelect(u)}
                  >
                    <Avatar size="sm" name={u.name} src={u.pic?.url} bg="brand.400" color="white" />
                    <Box flex="1" overflow="hidden">
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{u.name}</Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>{u.username}</Text>
                    </Box>
                    <Badge colorScheme="brand" fontSize="2xs" rounded="full" px={2}>
                      {u.role || u.userType}
                    </Badge>
                  </Flex>
                ))
              )}
            </Box>
          )}
        </>
      )}

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="lg" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent rounded="2xl" mx={4}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            <HStack gap={3}>
              <Box p={2} bg="brand.50" color="brand.500" rounded="lg">
                <FiUser size={18} />
              </Box>
              <Box>
                <Text fontSize="md" fontWeight="bold">Create New User</Text>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                  Fill in the details to create an account for this approver
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={{base:4,md:6}}>
            <VStack spacing={4} align="stretch">
              <HStack gap={4}>
                <CustomInput
                  label="Full Name *"
                  name="new-user-name"
                  type="text"
                  placeholder="John Doe"
                  value={newUser.name}
                  onChange={(e: any) => setNewUser({ ...newUser, name: e.target.value })}
                  error={createErrors.name}
                  showError={!!createErrors.name}
                />
                <CustomInput
                  label="Employee Code *"
                  name="new-user-code"
                  type="text"
                  placeholder="E01"
                  value={newUser.code}
                  onChange={(e: any) => setNewUser({ ...newUser, code: e.target.value })}
                  error={createErrors.code}
                  showError={!!createErrors.code}
                />
              </HStack>

              <CustomInput
                label="Email (Username) *"
                name="new-user-email"
                type="text"
                placeholder="user@company.com"
                value={newUser.username}
                onChange={(e: any) => setNewUser({ ...newUser, username: e.target.value })}
                error={createErrors.username}
                showError={!!createErrors.username}
              />

              <CustomInput
                label="Password *"
                name="new-user-password"
                type="text"
                placeholder="Min 6 characters"
                value={newUser.password}
                onChange={(e: any) => setNewUser({ ...newUser, password: e.target.value })}
                error={createErrors.password}
                showError={!!createErrors.password}
              />

              <Divider />

              <Box>
                <FormLabel fontSize="sm" fontWeight="500" color="gray.600" mb={1}>
                  Bio (optional)
                </FormLabel>
                <Textarea
                  rows={2}
                  placeholder="Brief description..."
                  value={newUser.bio}
                  onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
                  fontSize="sm"
                  borderColor={borderColor}
                  rounded="lg"
                  _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)" }}
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor={borderColor} gap={3}>
            <Button variant="ghost" onClick={closeModal} rounded="full">
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              rounded="full"
              px={8}
              isLoading={creating}
              loadingText="Creating..."
              onClick={handleCreateUser}
              shadow="sm"
            >
              Create User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserSearchInput;
