'use client';

import { useParams } from 'next/navigation';
import {
    Box,
    Heading,
    Text,
    VStack,
    UnorderedList,
    ListItem,
    useBreakpointValue
} from "@chakra-ui/react";
import CustomSubHeading from '../../../component/common/CustomSubHeading/CustomSubHeading';
import CustomSmallTitle from '../../../component/common/CustomSmallTitle/CustomSmallTitle';
import { policyData } from '../component/utils/contants';

export default function PolicyPage() {
    const params = useParams();
    const policyType = params.slug as keyof typeof policyData;
    const content = policyData[policyType];

    const headingSize = useBreakpointValue({
        base: "sm",
        md: "md",
    });

    if (!content) {
        return (
            <Box textAlign="center" py={10} px={6}>
                <Heading as="h2" size="xl" mt={6} mb={2}>
                    Policy Not Found
                </Heading>
                <Text color="gray.500">
                    The requested policy page does not exist.
                </Text>
            </Box>
        );
    }

    return (
        <Box>
            {/* Hero Section */}
            <Box bg="#E1F0EE" py={3}>
                <Box maxW="90%" mx="auto" px={{ base: 2, lg: 3 }}>
                    <VStack spacing={0.5} align="center">
                        <CustomSmallTitle textAlign="center">
                            {content.heroTitle}
                        </CustomSmallTitle>
                        <CustomSubHeading highlightText={content?.highlightText} textAlign="center">
                            {''}
                        </CustomSubHeading>
                    </VStack>
                </Box>
            </Box>

            {/* Effective Date - now dynamic */}
            <Box maxW="90%" mx="auto" px={{ base: 6, lg: 6 }} py={4}>
                <Text color="black" fontWeight="medium" fontSize="md">
                    Effective Date: {content.effectiveDate}
                </Text>
            </Box>

            {/* Content Sections */}
            <Box maxW="90%" mx="auto" p={{ base: "", lg: 2 }} py={4}>
                <VStack spacing={4} align="stretch">
                    {content.sections.map((section, index) => (
                        <Box key={index} bg="white" p={4} borderRadius="sm">
                            <Heading as="h3" size={headingSize} color="#2b7e7b" mb={2}>
                                {section.title}
                            </Heading>

                            {section.paragraphs?.map((para, i) => (
                                <Text key={i} color="#4A4A4A" mt={i > 0 ? 2 : 0}>
                                    {para}
                                </Text>
                            ))}

                            {section.content && (
                                <Text color="#4A4A4A" mt={2}>
                                    {section.content}
                                </Text>
                            )}

                            {section.listItems && (
                                <UnorderedList ml={6} spacing={1} color="#4A4A4A" mt={2}>
                                    {section.listItems.map((item, i) => (
                                        <ListItem key={i}>{item}</ListItem>
                                    ))}
                                </UnorderedList>
                            )}

                            {section.conclusion && (
                                <Text color="#4A4A4A" mt={2}>
                                    {section.conclusion}
                                </Text>
                            )}
                        </Box>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
}
