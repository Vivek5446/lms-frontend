import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  Textarea,
  Checkbox,
  VStack,
  Link,
  Image,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CustomButton from "../../common/CustomButton/CustomButton";
import CustomSmallTitle from "../../common/CustomSmallTitle/CustomSmallTitle";
import { observer } from "mobx-react-lite";
import stores from "../../../store/stores";
import NextLink from "next/link";

const ContactDetailedForm = observer(({ isHome, links, showHeader, isEquiry,handleFormSubmit, bg="#86C6F459" }: any) => {
  const {
    contactStore: { createContact },
    auth: { openNotification },
  } = stores;
  const [content, setContent] = useState<any>({});
  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  useEffect(() => {
    setContent(getPageContent("home") || {});
  }, [companyDetails, getPageContent]);

  const [formData, setFormData] = useState({
    inquiryType: "",
    fullName: "",
    email: "",
    contact: "",
    source: "",
    message: "",
  });

  const [isAgreed, setIsAgreed] = useState(false); // Checkbox state for agreement
  const [isSubmitting, setIsSubmitting] = useState(false); // Submitting state

  // Form Validation check
  const validateForm = () => {
    return (
      formData.fullName &&
      formData.email &&
      formData.contact &&
      isAgreed
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Check if the form is valid
    if (!validateForm()) {
      openNotification({
        title: "Error",
        message: "Please fill in all required fields and agree to the terms.",
        type: "error",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { fullName } = formData;
      const nameParts = fullName?.split(" ");
      const firstName = nameParts?.[0] || "";
      const lastName = nameParts?.slice(1)?.join(" ") || "";

      const data = await createContact({
        phone: formData.contact,
        email: formData.email,
        hearFrom: formData.source,
        description: formData.message,
        inquiryType: formData.inquiryType,
        firstName: firstName,
        lastName: lastName,
        otherDetails: {
          pageLink: links
        }
      });
      openNotification({
        title: "Submitted Successfully",
        message: data?.message,
        type: "success",
      });
      setFormData({
        inquiryType: "",
        fullName: "",
        email: "",
        contact: "",
        source: "",
        message: "",
      });
      if(handleFormSubmit){
        handleFormSubmit()
      }
    } catch (err: any) {
      openNotification({
        title: "Create Failed",
        message: err?.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box
      py={{ base: 2, md: 12 }}
      mt={{ lg: 6 }}
      pr={{ base: 0, md: 8 }}
      p={{ base: 4, lg: 0 }}
      bg={{ base: bg, md: "transparent" }}
      rounded={{ base: "24px", lg: "none" }}
    >
      <Box display={showHeader === false ? 'none' : undefined}>
        {isHome ? (
          <>
            <Box display={{ base: "none", lg: "block" }}>
              <Text
                textTransform="uppercase"
                color="#DF837C"
                textAlign={{ base: "center", lg: "left" }}
              >

              </Text>
              <CustomSmallTitle textAlign={{ base: "center", lg: "start" }} ml={{ lg: "0.2rem" }} display="inline-flex" alignItems="center">
                Contact us
                <Image
                  src="/images/happy.svg"
                  alt="Best Dental in greater noida"
                  w="20%" h="20%"
                  position="relative"
                  ml="-0.3rem"  // Fine-tune spacing
                />
              </CustomSmallTitle>
              <Text
                fontSize={{ base: "1.6rem", md: "2.6rem" }}
                fontWeight={400}
                lineHeight={{ base: "2.2rem", md: "3.4rem" }}
                w="100%"
                px={{ base: 2, md: 4, lg: 0 }}
                textAlign={{ base: "center", lg: "left" }}
                mt={{ base: 1, md: 0 }}
              >
                Support for you or a loved one?{" "}
                <Text as="span" fontWeight={600}>
                  Let&apos;s connect
                </Text>
              </Text>
            </Box>
          </>
        ) : (
          <>
            <CustomSmallTitle as="h1" textAlign="start" color="#294A62">
              CONTACT US
            </CustomSmallTitle>

            <Heading
              as="h2"
              fontWeight={400}
              fontSize={{ base: "28px", md: "40px" }}
            >
              Get in touch with <Text fontWeight={700}>Dental Health</Text>
            </Heading>

            <Text my={3} color="#434343">
              Start the Journey towards better Mental Health
            </Text>
          </>
        )}
        {!isHome && <Text
          w={{ base: "100%", md: "90%" }}
          color="#434343"
          mb={6}
          fontSize="sm"
        >
          We are available to offer our support and respond to any inquiries you
          may have. We are eager to connect with you!
        </Text>}
      </Box>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} pr={{ lg: 5 }} mt={5}>
          {/* Inquiry Type */}
          {!isEquiry && <FormControl isRequired>
            <FormLabel>
              Please select the primary reason for your inquiry
            </FormLabel>
            <Select
             bg="#FFFFFF"
              name="inquiryType"
              placeholder="Select an option"
              onChange={handleChange}
              value={formData.inquiryType}
            >
              {Array.isArray(content?.inquiryDropdownOptions) ?
                content.inquiryDropdownOptions.map((option, idx) => {
                  // Handle both string options and object options with value/label
                  // const optionValue = typeof option === 'object' ? option.value : option;
                  const optionLabel = typeof option === 'object' ? option.label : option;

                  return (
                    <option key={idx}>
                      {optionLabel}
                    </option>
                  );
                })
              : null}
            </Select>
          </FormControl>}

          {/* First Name and Last Name */}
          <Flex direction={{ base: "column", md: "row" }} gap={4} w="full">
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="fullName"
                placeholder="Enter Your Full Name"
                onChange={handleChange}
                value={formData.fullName}
                bg="#FFFFFF"
                color="#8A8A8A"
                fontSize="sm"
              />
            </FormControl>
          </Flex>

          {/* Email and Contact Number */}
          <Flex direction={{ base: "column", md: "row" }} gap={4} w="full">
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                placeholder="Enter Your Email"
                onChange={handleChange}
                value={formData.email}
                bg="#FFFFFF"
                color="#8A8A8A"
                fontSize="sm"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Contact Number</FormLabel>
              <Input
                name="contact"
                type="tel"
                placeholder="Enter Your Contact Number"
                onChange={handleChange}
                value={formData.contact}
                bg="#FFFFFF"
                color="#8A8A8A"
                fontSize="sm"
              />
            </FormControl>
          </Flex>

          {/* Source */}
          <FormControl display={isEquiry ? 'none' : undefined}>
            <FormLabel>How did you hear about us?</FormLabel>
            <Select
              name="source"
              placeholder="Select option"
              onChange={handleChange}
              value={formData.source}
              bg="#FFFFFF"
              color="#8A8A8A"
              fontSize="sm"
            >
              <option value="self">Self</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="practo">Practo</option>
              <option value="google">Google</option>
            </Select>
          </FormControl>

          {/* Message */}
          <FormControl display={isEquiry ? 'none' : undefined}>
            <FormLabel>Tell Us About Your Needs</FormLabel>
            <Textarea
              name="message"
              placeholder="Your Message"
              onChange={handleChange}
              value={formData.message}
              bg="#FFFFFF"
              color="#8A8A8A"
              fontSize="sm"
            />
          </FormControl>

          {/* Agreement Checkbox */}
          <FormControl>
            <Checkbox
              isChecked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              borderColor="teal.500"
              colorScheme="teal"
              sx={{
                "span.chakra-checkbox__control": {
                  position: "relative",
                  top: "-10px",
                },
              }}
            >
              By clicking &quot;Submit,&quot; you agree to the processing of
              your personal information to address your inquiry. For more
              information, please review our{" "}
              <NextLink href="/terms-condition" passHref legacyBehavior>
                <Link
                  color="teal.600"
                  textDecoration="underline"
                  _hover={{ color: "teal.800" }}
                >
                  Terms of service
                </Link>
              </NextLink>
              .
            </Checkbox>
          </FormControl>

          {/* Submit Button */}
          <Box mt={6} width="100%">
            <CustomButton
              size={'100%'}
              w={'100%'}
              type="submit"
              isLoading={isSubmitting}
            >
              Submit
            </CustomButton>
          </Box>
        </VStack>
      </form>
    </Box>
  );
});

export default ContactDetailedForm;