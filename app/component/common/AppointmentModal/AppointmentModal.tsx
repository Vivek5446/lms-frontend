"use client";
import { useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Spinner,
  VStack,
  Text,
} from "@chakra-ui/react";
import ReCAPTCHA from "react-google-recaptcha";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import CustomButton from "../CustomButton/CustomButton";

const AppointmentModal = observer(({ isOpen, onClose, pageLink }: any) => {
  const {
    bookingStore: { createBooking },
  } = stores;

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false); // new state for fallback

  const recaptchaRef = useRef<ReCAPTCHA>(null); // Ref for invisible reCAPTCHA

  const handleSubmit = () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      setError("Both fields are required.");
      return;
    }

    const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number (with or without +91).");
      return;
    }

    setError("");
    setLoading(true);

    if (recaptchaRef.current) {
      recaptchaRef.current.execute();
    }
  };

  const handleCaptchaVerify = (captchaToken: string | null) => {
    if (!captchaToken) {
      setError("CAPTCHA verification failed. Please try again.");
      setLoading(false);
      return;
    }

    const formData = { name: fullName, phone: phoneNumber, captchaToken, details: { pageLink } };

    createBooking(formData)
      .then(() => {
        const thankYouContent = `
          <html>
          <head>
            <title>Thank You</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .message { max-width: 650px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 0 12px rgba(0, 0, 0, 0.1); }
              h2 { color: green; }
            </style>
          </head>
          <body>
            <div class="message">
              <h2>Thank You for Your Appointment Request!</h2>
              <p>Name: ${fullName}</p>
              <p>Phone: ${phoneNumber}</p>
              <p>We'll follow up within 24 hours to help you book your consultation.</p>
            </div>
          </body>
          </html>
        `;

        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(thankYouContent);
          newWindow.document.close();
          handleClose();
        } else {
          // fallback: show message inside modal
          setIsConfirmed(true);
        }
      })
      .catch((err: any) => {
        setError(err?.message || "Something went wrong. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = () => {
    setFullName("");
    setPhoneNumber("");
    setError("");
    setLoading(false);
    setIsConfirmed(false); // reset confirmation state
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="xl" p={4}>
        <ModalHeader textAlign="center" fontSize="xl" fontWeight="bold">
          Book an Appointment
        </ModalHeader>
        <ModalBody>
          {isConfirmed ? (
            <VStack spacing={4} align="center" textAlign="center">
              <Text fontSize="xl" fontWeight="semibold" color="green.500">
                Thank You for Your Appointment Request!
              </Text>
              <Text>Name: {fullName}</Text>
              <Text>Phone: {phoneNumber}</Text>
              <Text>
                We&apos;ll follow up within 24 hours to help you book your consultation.
              </Text>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                borderRadius="md"
                p={3}
                bg="gray.50"
                _focus={{ borderColor: "brand.500", bg: "white" }}
                isInvalid={!fullName.trim() && error.length > 0}
              />
              <Input
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
                borderRadius="md"
                p={3}
                bg="gray.50"
                _focus={{ borderColor: "brand.500", bg: "white" }}
                isInvalid={!phoneNumber.trim() && error.length > 0}
              />
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                size="invisible"
                onChange={handleCaptchaVerify}
              />
              {error && (
                <Text color="red.500" fontSize="sm" fontWeight="medium" textAlign="center">
                  {error}
                </Text>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter display="flex" justifyContent="center">
          {isConfirmed ? (
            <Button onClick={handleClose} colorScheme="brand" borderRadius="md">
              Close
            </Button>
          ) : (
            <CustomButton
              colorScheme="brand"
              size="lg"
              w="full"
              borderRadius="md"
              onClick={handleSubmit}
              isDisabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Confirm Booking"}
            </CustomButton>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default AppointmentModal;
