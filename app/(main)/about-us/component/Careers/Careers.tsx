'use client'
import {
    Box, Grid, Text, Divider, VStack, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel,
    Input, Textarea, useDisclosure
} from "@chakra-ui/react";
import { useState } from "react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomButton from "../../../../component/common/CustomButton/CustomButton";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";
import { useRouter } from 'next/navigation';
import { observer } from "mobx-react-lite";
import { readFileAsBase64 } from "../../../../config/utils/utils";
import stores from "../../../../store/stores";
import Link from 'next/link';

const CareersSection = observer(() => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();
    const {
        contactStore: { sendResume },
        auth: { openNotification },
    } = stores;

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        description: "",
        resume: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, resume: e.target.files[0] }));
    };

    const validateForm = () => {
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.description && formData.resume;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            openNotification({
                title: "Error",
                message: "Please fill in all required fields.",
                type: "error",
            });
            return;
        }
        setIsSubmitting(true);
        try {
            const base64 = await readFileAsBase64(formData.resume);
            const data = await sendResume({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                description: formData.description,
                attachmentBase64String: base64,
            });
            openNotification({
                title: "Application Submitted",
                message: data?.message,
                type: "success",
            });
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                description: "",
                resume: null,
            });
            onClose();
        } catch (err) {
            openNotification({
                title: "Submission Failed",
                message: err?.message,
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box my={{ base: "2rem", lg: "6rem" }} maxW={{ md: "90%", xl: "85%" }} mx="auto">
            <Grid
                templateColumns={{ base: "1fr", md: "1fr auto 1fr" }}
                gap={{ base: 6, lg: 10 }}
                alignItems={{ base: "stretch", md: "center" }}
                py={6}
            >
                {/* Careers Section */}
                <VStack
                    align="start"
                    spacing={3}
                    p={6}
                    bg="white"
                    borderRadius="10px"
                    w="100%"
                >
                    <CustomSmallTitle>Careers</CustomSmallTitle>
                    <CustomSubHeading textAlign={"start"} highlightText="Hiring">We are</CustomSubHeading>
                    <Text mt={1} color="gray.600">
                        We may have open roles, and we&apos;d like to hear from you.
                    </Text>
                    <Box mt={3}>
                        <CustomButton
                            onClick={onOpen}
                            width="180px"
                            size="md"
                        >
                            Join Our Team
                        </CustomButton>
                    </Box>
                </VStack>

                {/* Divider */}
                <Divider
                    orientation="vertical"
                    display={{ base: "none", md: "block" }}
                    height="80%"
                    borderWidth="1px"
                    borderColor="gray.300"
                    opacity="0.5"
                />

                {/* Contact Section */}
                <VStack
                    align="start"
                    spacing={3}
                    p={6}
                    bg="white"
                    borderRadius="10px"
                    w="100%"
                >
                    <CustomSmallTitle>Contact Us</CustomSmallTitle>
                    <CustomSubHeading textAlign={"start"} highlightText="Touch">Get in</CustomSubHeading>
                    <Text mt={1} color="gray.600">
                        Start the journey towards better mental health.
                    </Text>
                    <Box mt={3}>
                        <Link href="/contact-us" passHref legacyBehavior>
                            <a target="_blank" rel="noopener noreferrer">
                                <CustomButton
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.push("/contact-us");
                                    }}
                                    width="180px"
                                    size="md"
                                >
                                    Contact
                                </CustomButton>
                            </a>
                        </Link>
                    </Box>
                </VStack>
            </Grid>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg="white" borderRadius="12px">
                    <ModalHeader color="teal.500">Apply for a Position</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form onSubmit={handleSubmit}>
                            <FormControl mb={4} isRequired>
                                <FormLabel>First Name</FormLabel>
                                <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
                            </FormControl>
                            <FormControl mb={4} isRequired>
                                <FormLabel>Last Name</FormLabel>
                                <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
                            </FormControl>
                            <FormControl mb={4} isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                            </FormControl>
                            <FormControl mb={4} isRequired>
                                <FormLabel>Phone</FormLabel>
                                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                            </FormControl>
                            <FormControl mb={4} isRequired>
                                <FormLabel>Tell Us About Yourself</FormLabel>
                                <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Your Message" />
                            </FormControl>
                            <FormControl mb={4} isRequired>
                                <FormLabel>Upload your Resume</FormLabel>
                                <Input type="file" onChange={handleFileChange} />
                            </FormControl>
                            <CustomButton type="submit" width="100%" isLoading={isSubmitting}>
                                Submit
                            </CustomButton>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
});

export default CareersSection;