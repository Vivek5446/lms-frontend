import { Box, VStack, Input, Textarea, Text, useToast, useBreakpointValue } from '@chakra-ui/react'
import React, { useState } from 'react'
import { LuArrowUpRight } from 'react-icons/lu'
import CustomButton from '../../../../component/common/CustomButton/CustomButton'
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle'

const ContactSmallForm = () => {
      const [formData, setFormData] = useState({
        name: "",
        email: "",
        companyName: "",
        needs: "",
      });
    
      const toast = useToast();
    
      // Responsive font sizes
      const titleFontSize = useBreakpointValue({ base: "1.6rem", md: "2.6rem" });
      const titleLineHeight = useBreakpointValue({ base: "2.2rem", md: "3.4rem" });
      const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };
    
      const handleSubmit = () => {
        // Check if any field is empty
        if (!formData.name || !formData.email || !formData.companyName || !formData.needs) {
          toast({
            title: "All fields are required",
            description: "Please fill out every field before submitting.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
    
        // Submission logic
        toast({
          title: "Form submitted successfully!",
          description: "We will get back to you soon.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
    
        // Reset form after successful submission
        setFormData({
          name: "",
          email: "",
          companyName: "",
          needs: "",
        });
      };
  return (
    <Box 
    w="100%" 
    maxW={{ base: "100%", lg: "90%" }} 
    zIndex={10} 
    p={{ base: 2, md: 8 }}
    mx="auto"
  >
    {/* White text content above the form */}
    <Box 
      display={{ base: "block", md: "block" }} 
      color="white" 
      textAlign={{ base: "center", lg: "left" }}
      mb={{ base: 4, md: 6 }}
    >
      <CustomSmallTitle
        color="white"
        display="inline-flex"
        alignItems="center"
        justifyContent={{ base: "center", lg: "start" }}
        w="100%"
      >
        Contact us
      </CustomSmallTitle>
      <Text
        fontSize={titleFontSize}
        fontWeight={400}
        lineHeight={titleLineHeight}
        mt={{ base: 2, md: 3 }}
      >
        Support for you or a loved one?{" "}
        <Text as="span" fontWeight={600}>
          Let&apos;s connect
        </Text>
      </Text>
    </Box>

    {/* Form Box with Responsive Padding */}
    <Box
      p={{ base: 4, md: 8 }}
      border="1px solid #065F68"
      rounded="16px"
      bg="white"
      boxShadow="md"
      maxW={{ base: "100%", md: "600px" }}
      mx="auto"
    >
      <Text
        fontSize={{ base: "xl", md: "2xl" }}
        pb={3}
        textAlign="center"
      >
        Enter Your Details
      </Text>
      <VStack spacing={{ base: 3, md: 5 }} align="stretch" mt={4}>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="filled"
          placeholder="Name *"
          bg="#CBCBCB1A"
          size={{ base: "md", md: "lg" }}
          isRequired
        />
        <Input
          name="email"
          value={formData.email}
          onChange={handleChange}
          variant="filled"
          placeholder="Email *"
          bg="#CBCBCB1A"
          size={{ base: "md", md: "lg" }}
          isRequired
        />
        <Input
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          variant="filled"
          placeholder="Phone Number *"
          bg="#CBCBCB1A"
          size={{ base: "md", md: "lg" }}
          isRequired
        />
        <Textarea
          name="needs"
          value={formData.needs}
          onChange={handleChange}
          variant="filled"
          placeholder="Tell Us About Your Needs *"
          h={{ base: "4rem", md: "5rem" }}
          noOfLines={8}
          bg="#CBCBCB1A"
          size={{ base: "md", md: "lg" }}
          isRequired
        />
        <CustomButton
          size="lg"
          width="100%"
          icon={LuArrowUpRight}
          onClick={handleSubmit}
          // mt={{ base: 4, md: 6 }}
        >
          <Text fontSize={{ base: "1rem", md: "1.5rem" }}>Submit</Text>
        </CustomButton>
      </VStack>
    </Box>
  </Box>
  )
}

export default ContactSmallForm