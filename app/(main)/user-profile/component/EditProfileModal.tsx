import { genderOptions } from '@/app/config/constant';
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  Textarea,
  useBreakpointValue,
  useColorModeValue,
  Badge,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import { FiCheck, FiEdit2, FiArrowLeft } from 'react-icons/fi';

const EditProfileModal = ({
  onClose,
  isOpen,
  form,
  handleChange,
  onAvatarSelect,
  onAvatarChange,
  onAvatarRemove,
  handleSave,
  saving,
}: any) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const modalBg = useColorModeValue('white', 'gray.900');
  const modalBorder = useColorModeValue('gray.200', 'gray.700');
  const modalHeaderBg = useColorModeValue('gray.50', 'gray.800');

  const labelStyle: any = {
    fontSize: '13px',
    fontWeight: '600',
    color: useColorModeValue('gray.600', 'gray.400'),
  };

  const inputStyles: any = {
    fontSize: '13px',
    fontWeight: '400',
    color: useColorModeValue('gray.800', 'gray.100'),
    bg: useColorModeValue('white', 'gray.800'),
    border: '1px solid',
    borderColor: useColorModeValue('gray.200', 'gray.700'),
    borderRadius: '10px',
  };

  const formFields = (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel {...labelStyle}>Profile Picture</FormLabel>
        <Box
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          borderRadius="16px"
          p={4}
          bg={useColorModeValue('gray.50', 'gray.800')}
        >
          <HStack spacing={4} align="center">
            <Avatar
              size="xl"
              name={`${form.firstName || ""} ${form.lastName || ""}`.trim() || "Profile"}
              src={form?.pic?.url || ""}
            />
            <VStack align="flex-start" spacing={2} flex={1}>
              <Text fontSize="13px" color={useColorModeValue('gray.600', 'gray.300')}>
                Upload a clear square photo to update your profile avatar.
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                <Button size="sm" borderRadius="xl" colorScheme="blue" onClick={onAvatarSelect}>
                  {form?.pic?.url ? 'Replace Photo' : 'Upload Photo'}
                </Button>
                {form?.pic?.url ? (
                  <Button size="sm" borderRadius="xl" variant="outline" colorScheme="red" onClick={onAvatarRemove}>
                    Remove
                  </Button>
                ) : null}
              </HStack>
            </VStack>
          </HStack>
        </Box>
      </FormControl>

      {/* Name row */}
      <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={3}>
        <FormControl>
          <FormLabel {...labelStyle}>First Name</FormLabel>
          <Input
            {...inputStyles}
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="First name"
          />
        </FormControl>
        <FormControl>
          <FormLabel {...labelStyle}>Last Name</FormLabel>
          <Input
            {...inputStyles}
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Last name"
          />
        </FormControl>
      </Grid>

      {/* Title */}
      <FormControl>
        <FormLabel {...labelStyle}>Job Title</FormLabel>
        <Input
          {...inputStyles}
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g. Senior Engineer"
        />
      </FormControl>

      {/* Address */}
      <FormControl>
        <FormLabel {...labelStyle}>Address</FormLabel>
        <Input
          {...inputStyles}
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Street address"
        />
      </FormControl>

      {/* City / State / Country */}
      <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={3}>
        <FormControl>
          <FormLabel {...labelStyle}>City</FormLabel>
          <Input
            {...inputStyles}
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Your city"
          />
        </FormControl>
        <FormControl>
          <FormLabel {...labelStyle}>State</FormLabel>
          <Input
            {...inputStyles}
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="Your state"
          />
        </FormControl>
      </Grid>

      <FormControl>
        <FormLabel {...labelStyle}>Country</FormLabel>
        <Input
          {...inputStyles}
          value={form.country}
          onChange={(e) => handleChange('country', e.target.value)}
          placeholder="Your country"
        />
      </FormControl>

      {/* Gender / DOB */}
      <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={3}>
        <FormControl>
          <FormLabel {...labelStyle}>Gender</FormLabel>
          <Select
            {...inputStyles}
            value={form.gender || ''}
            onChange={(e) =>
              handleChange('gender', e.target.value ? Number(e.target.value) : '')
            }
            placeholder="Select gender"
          >
            {genderOptions.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel {...labelStyle}>Date of Birth</FormLabel>
          <Input
            {...inputStyles}
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          />
        </FormControl>
      </Grid>

      {/* Bio */}
      <FormControl>
        <FormLabel {...labelStyle}>Bio</FormLabel>
        <Textarea
          {...inputStyles}
          fontSize="13px"
          borderRadius="10px"
          rows={3}
          resize="vertical"
          value={form.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Tell us about yourself..."
          _placeholder={{ color: useColorModeValue('gray.400', 'gray.600') }}
        />
      </FormControl>
    </VStack>
  );

  const headerContent = (
    <HStack spacing={3}>
      <Box
        w="34px"
        h="34px"
        borderRadius="10px"
        bg={useColorModeValue('blue.50', 'whiteAlpha.100')}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color={useColorModeValue('blue.600', 'blue.300')}
      >
        <FiEdit2 size={15} />
      </Box>
      <Box>
        <Text
          fontSize="16px"
          fontWeight="700"
          color={useColorModeValue('gray.900', 'gray.50')}
          letterSpacing="-0.01em"
        >
          Edit Profile
        </Text>
        <Text fontSize="12px" color={useColorModeValue('gray.500', 'gray.400')} fontWeight="400">
          Update your personal details
        </Text>
      </Box>
    </HStack>
  );

  // Mobile rendering (Bottom Sheet Drawer)
  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="bottom" size="full" onClose={onClose}>
        <DrawerOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <DrawerContent
          bg={modalBg}
          maxW="100%"
          w="100%"
          pt={0}
          overflow="hidden"
        >
          <DrawerBody 
            p={0} 
            overflowY="auto"
            sx={{
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "4px" },
            }}
          >
            <Box w="100%" px={{ base: 5, md: 8 }} pt={{ base: "calc(env(safe-area-inset-top, 24px) + 16px)", md: 5 }} pb="130px">
              {/* HEADER */}
              <HStack mb={{ base: 6, md: 5 }} spacing={4} align="center" justify="space-between">
                <HStack spacing={4}>
                  <IconButton
                    aria-label="Close"
                    icon={<FiArrowLeft size={18} />}
                    onClick={onClose}
                    variant="solid"
                    borderRadius="full"
                    w={{ base: "36px", md: "42px" }} h={{ base: "36px", md: "42px" }}
                    bg={useColorModeValue("gray.100", "gray.800")}
                    color={useColorModeValue("gray.700", "gray.300")}
                    _hover={{ bg: useColorModeValue("gray.200", "gray.700"), transform: "translateX(-2px)" }}
                    transition="all 0.2s"
                  />
                  <Box>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                      <Box as="span" color={useColorModeValue("gray.800", "white")}>EDIT </Box>
                      <Box as="span" bgGradient="linear(to-r, #6269FF, #8A2BE2)" bgClip="text">PROFILE</Box>
                    </Text>
                    <Text fontSize="10px" color={useColorModeValue("gray.500", "gray.400")} fontWeight="700" letterSpacing="0.2em" mt={0.5}>
                      UPDATE YOUR PERSONAL DETAILS
                    </Text>
                  </Box>
                </HStack>
                <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="800">
                  USER
                </Badge>
              </HStack>

              {formFields}
            </Box>
          </DrawerBody>
          
          {/* FOOTER */}
          <Box
            position="absolute" bottom={0} left={0} right={0}
            bg={useColorModeValue("linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 30%)", "linear-gradient(180deg, rgba(23,25,35,0) 0%, rgba(23,25,35,1) 30%)")}
            px={{ base: 5, md: 8 }} 
            pb={{ base: "calc(env(safe-area-inset-bottom, 20px) + 32px)", md: 8 }} 
            pt={8}
            zIndex={10}
          >
            <HStack w="100%" spacing={3}>
              <Button
                variant="outline"
                onClick={onClose}
                h={{ base: "52px", md: "56px" }}
                borderRadius="xl"
                flex={1}
                color={useColorModeValue('gray.600', 'gray.400')}
                fontWeight="800"
              >
                CANCEL
              </Button>
              <Button
                h={{ base: "52px", md: "56px" }}
                onClick={handleSave}
                isLoading={saving}
                loadingText="SAVING…"
                borderRadius="xl"
                flex={1.5}
                bgGradient="linear(to-r, #6269FF, #4F46E5)"
                color="white"
                fontWeight="900"
                letterSpacing="0.05em"
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 10px 30px rgba(98,105,255,0.5)", bgGradient: "linear(to-r, #4F46E5, #6269FF)" }}
                _active={{ transform: "translateY(0)" }}
                border="1px solid"
                borderColor="rgba(255,255,255,0.1)"
              >
                SAVE CHANGES
              </Button>
            </HStack>
          </Box>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop rendering (Centered Modal)
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered motionPreset="slideInBottom">
      <ModalOverlay bg={useColorModeValue('blackAlpha.600', 'blackAlpha.700')} backdropFilter="blur(6px)" />
      <ModalContent bg={modalBg} border="1px solid" borderColor={modalBorder} borderRadius="24px" overflow="hidden">
        <ModalHeader bg={modalHeaderBg} borderBottom="1px solid" borderColor={modalBorder} px={6} py={4}>
          {headerContent}
        </ModalHeader>
        <ModalCloseButton top={4} right={4} borderRadius="full" />
        <ModalBody px={6} py={5} maxH="75vh" overflowY="auto">
          {formFields}
        </ModalBody>
        <ModalFooter px={6} py={4} borderTop="1px solid" borderColor={modalBorder} gap={2}>
          <Button
            variant="ghost"
            onClick={onClose}
            size="sm"
            borderRadius="xl"
            px={4}
            color={useColorModeValue('gray.600', 'gray.400')}
          >
            Cancel
          </Button>
          <Button
            leftIcon={<FiCheck size={14} />}
            onClick={handleSave}
            isLoading={saving}
            loadingText="Saving…"
            size="sm"
            px={6}
            borderRadius="xl"
            fontWeight="600"
            colorScheme="blue"
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;

