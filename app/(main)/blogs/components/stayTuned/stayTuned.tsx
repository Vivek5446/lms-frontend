import {
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Input,
  Text,
  useBreakpointValue,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import CustomButton from "../../../../component/common/CustomButton/CustomButton";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";

const StayTuned = observer(() => {
  const {contactStore : {createContact}} = stores
  const buttonHeight = useBreakpointValue({ base: "40px", lg: "50px" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const toast = useToast();

  const handleSubscribeClick = () => {
    onOpen();
  };

  const validateEmail = (email: string) => {
    if (!email || email.trim() === "") return false;

    const atpos = email.indexOf('@');
    const dotpos = email.lastIndexOf('.');

    if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= email.length) {
      return false;
    }

    return true;
  };


  const handleSubmit = async (email: any) => {
    try {
      await createContact({
        email: email,
        type : 'subscriber'
      });
    } catch ({}) {
    } finally {
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || email.trim() === "") {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    handleSubmit(email)
    try {
      const formData = new FormData();
      formData.append('xnQsjsdp', '27916ddcc525490f9591ae765b718c38756825c4e220e2ff1cb452e682f6b837');
      formData.append('zc_gad', '');
      formData.append('xmIwtLD', 'b03313e026ca9365a86813b8947e4050ee74edd4abbb2a0d0a1b187d302505d348d7c1800edd85b43bca41829df56aa0');
      formData.append('actionType', 'Q29udGFjdHM=');
      formData.append('returnURL', 'null');
      formData.append('Last Name', name);
      formData.append('Email', email);

      const response = await fetch('https://crm.zoho.in/crm/WebToContactForm', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to submit to Zoho CRM: ${response.status} ${response.statusText}`);
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);

      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our updates.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
        setEmail("");
        setName("");
      }, 3000);

    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: "Subscription failed",
        description: `Error: ${errorMessage}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Box p={{ base: 4, md: 8 }}>
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          alignItems="center"
          gap={{ base: 8, md: 6 }}
        >
          <VStack align="flex-start" spacing={3} w="100%">
            <CustomSmallTitle>Stay Inspired</CustomSmallTitle>

            <Heading
              as="h2"
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              fontWeight="600"
              color="#000"
              lineHeight="1.3"
            >
              Subscribe for Expert Guidance
            </Heading>

            <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
              Explore helpful articles, upcoming events, and resources{" "}
              <Box as="br" display={{ base: "none", md: "block" }} />
              to support your mental health journey.
            </Text>

            <HStack
              spacing={3}
              w="100%"
              mt={{ base: 2, lg: 6 }}
              flexWrap="wrap"
              justify={{ base: "flex-start", md: "flex-start" }}
            >
              <CustomButton
                height={buttonHeight}
                borderRadius="8px"
                onClick={handleSubscribeClick}
                px={{ base: 4, md: 6 }}
              >
                Subscribe Us
              </CustomButton>
            </HStack>
          </VStack>

          <Flex
            justify={{ base: "center", md: "flex-end" }}
            mt={{ base: -8, md: -8, lg: "2rem" }}
          >
            <Image
              src="https://res.cloudinary.com/dekfm4tfh/image/upload/v1746127290/image_262_1_v8edie.png"
              alt="best child psychologist in noida"
              h={{ base: "280px", md: "300px", lg: "360px" }}
              maxH="100%"
              objectFit="cover"
              blendMode="multiply"
            />
          </Flex>
        </Grid>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="md" mx={4}>
          <ModalHeader
            borderBottom="1px solid"
            borderColor="gray.100"
            color="black"
            fontFamily="Arial"
            fontSize="18px"
          >
            Subscribe to Dental Health
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {submitSuccess ? (
              <Box textAlign="center" py={6}>
                <Box
                  width="50px"
                  height="50px"
                  borderRadius="full"
                  bg="#12AA67"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  margin="0 auto 16px"
                >
                  <Box
                    transform="rotate(45deg)"
                    height="20px"
                    width="10px"
                    borderBottom="3px solid white"
                    borderRight="3px solid white"
                  />
                </Box>
                <Text fontSize="md" fontWeight="medium">Subscription successful!</Text>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  Thank you for subscribing to Dental Health. You&apos;ll receive our updates soon.
                </Text>
              </Box>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <FormControl mb={4}>
                  <FormLabel htmlFor="name" fontSize="14px" fontFamily="Arial">Name</FormLabel>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    size="md"
                    border="1px solid #c0c6cc"
                    borderRadius="2px"
                  />
                </FormControl>
                <FormControl isRequired mb={6}>
                  <FormLabel htmlFor="email" fontSize="14px" fontFamily="Arial">
                    Email <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    size="md"
                    border="1px solid #c0c6cc"
                    borderRadius="2px"
                    required
                  />
                </FormControl>
                <Flex justify="flex-start" gap={3}>
                  <Button
                    type="submit"
                    bg="transparent linear-gradient(0deg, #0279FF 0%, #00A3F3 100%)"
                    color="white"
                    _hover={{ bg: "linear-gradient(#02acff 0,#006be4 100%)" }}
                    isLoading={isSubmitting}
                    loadingText="Submitting"
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Back
                  </Button>
                </Flex>
              </form>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

export default StayTuned;