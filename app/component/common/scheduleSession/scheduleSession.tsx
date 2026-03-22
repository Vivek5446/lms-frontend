import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Button,
  Text,
  VStack,
  Spinner
} from "@chakra-ui/react";
import stores from "../../../store/stores";
import CustomButton from "../CustomButton/CustomButton";

interface ScheduleSessionProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
}

const ScheduleSession: React.FC<ScheduleSessionProps> = ({ isOpen, onClose, data }) => {
  const { appointmentStore: { createBookAppointment }, auth: { openNotification } } = stores;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("All required fields must be filled.");
      return;
    }

    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number (with or without +91).");
      return;
    }

    setLoading(true);
    setError("");

    const formData = {
      name,
      phone,
      assignTo: data?.username,
    };

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    try {
      const response = await createBookAppointment(formData);
      openNotification({
        title: "Your details have been saved successfully. You will now be redirected to the next step.",
        message: response?.message,
        type: "success"
      });

      if (data?.link) {
        if (isIOS) {
          // Open in same tab on iOS
          window.location.href = data.link;
        } else {
          // Open in new tab on other devices
          window.open(data.link, "_blank", "noopener,noreferrer");
        }
      }

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      openNotification({
        title: "Booking Failed",
        message: err?.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "md", lg: "lg" }}>
      <ModalOverlay />
      <ModalContent maxW={{ base: "320px", md: "600px", lg: "720px" }} borderRadius="lg" boxShadow="lg" p={5}>
        <ModalHeader textAlign="center" fontSize="xl" fontWeight="bold">
          Book Your Appointment
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={2} align="stretch">
            <FormControl>
              <FormLabel fontWeight="semibold">Full Name*</FormLabel>
              <Input
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                focusBorderColor="blue.500"
                autoComplete="name"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="semibold">Contact Number*</FormLabel>
              <Input
                placeholder="Enter your contact number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                focusBorderColor="blue.500"
                autoComplete="tel"
              />
            </FormControl>

            {error && <Text color="red.500" fontSize="sm" fontWeight="medium" textAlign="center">{error}</Text>}

            <Checkbox
              colorScheme="blue"
              isChecked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            >
              By submitting this form, you consent to take treatment with us and acknowledge that you have read and understood the{" "}
              <a
                href="/policy/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#3182ce", textDecoration: "underline" }}
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="/terms-condition"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#3182ce", textDecoration: "underline" }}
              >
                Terms of Service
              </a>.
            </Checkbox>
          </VStack>
        </ModalBody>

        <ModalFooter display="flex" justifyContent="center" gap={4}>
          <CustomButton
            colorScheme="blue"
            size="lg"
            w="full"
            borderRadius="md"
            onClick={handleSubmit}
            isDisabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Submit"}
          </CustomButton>
          <Button
            variant="outline"
            colorScheme="gray"
            w="full"
            borderRadius="md"
            onClick={onClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScheduleSession;