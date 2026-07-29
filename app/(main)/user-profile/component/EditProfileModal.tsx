import { genderOptions } from '@/app/config/constant';
import {
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
  VStack,
} from '@chakra-ui/react';
import { FiCheck, FiEdit2 } from 'react-icons/fi';

const EditProfileModal = ({
  onClose,
  isOpen,
  form,
  handleChange,
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
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <DrawerContent
          bg={modalBg}
          borderTopRadius="3xl"
          maxH="90vh"
          borderTop="1px solid"
          borderColor={modalBorder}
        >
          <Box w="40px" h="4px" bg={useColorModeValue('gray.300', 'gray.600')} borderRadius="full" mx="auto" mt={3} />
          <DrawerCloseButton top={4} right={4} borderRadius="full" />
          <DrawerHeader py={4} borderBottom="1px solid" borderColor={modalBorder}>
            {headerContent}
          </DrawerHeader>
          <DrawerBody py={5} overflowY="auto">
            {formFields}
          </DrawerBody>
          <DrawerFooter borderTop="1px solid" borderColor={modalBorder} gap={2} py={4}>
            <Button
              variant="ghost"
              onClick={onClose}
              size="md"
              borderRadius="xl"
              flex={1}
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
              borderRadius="xl"
              flex={1}
              colorScheme="blue"
            >
              Save Changes
            </Button>
          </DrawerFooter>
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

