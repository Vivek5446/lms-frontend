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
import CustomSmallTitle from "../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../../../component/common/CustomSubHeading/CustomSubHeading";
import { policyData } from './utils/contants';

const PolicyPage = () => {
    const params = useParams();
    const policyType = params.slug as string;
    const content = policyData[policyType];

    const headingSize = useBreakpointValue({
        base: "sm",  // Reduced heading size
        md: "md",   
    });

    if (!content) {
        return null;
    }

    return (
        <Box>
            {/* Hero Section */}
            <Box bg={"#E1F0EE"} py={5}> {/* Reduced py value */}
                <Box maxW={"90%"} mx={"auto"} px={{ base: 2, lg: 3 }}>
                    <VStack spacing={1} align={{ base: "center", lg: "center" }}> {/* Reduced spacing */}
                        <CustomSmallTitle textAlign={"center"}>
                            {content.heroTitle}
                        </CustomSmallTitle>
                        <CustomSubHeading
                            highlightText={content.highlightText}
                            textAlign={"center"}
                        >
                            {content.mainTitle}
                        </CustomSubHeading>
                    </VStack>
                </Box>
            </Box>

            {/* Content Sections */}
            <Box maxW={"90%"} mx={"auto"} p={{ base: 3, lg: 3 }} py={2}> {/* Reduced py and p values */}
                <VStack spacing={4} align="stretch"> {/* Reduced spacing */}
                    {content.sections.map((section, index) => (
                        <Box key={index} bg="white" p={4} borderRadius="sm"> {/* Reduced p value */}
                            <Heading as="h3" size={headingSize} color="#2b7e7b" mb={2}> {/* Reduced mb value */}
                                {section.title}
                            </Heading>

                            {/* Paragraphs */}
                            {section.paragraphs && section.paragraphs.map((paragraph, pIndex) => (
                                <Text key={pIndex} color="#4A4A4A" mt={pIndex > 0 ? 2 : 0} mb={1}> {/* Reduced mt and mb values */}
                                    {paragraph}
                                </Text>
                            ))}

                            {/* Content */}
                            {section.content && (
                                <Text color="#4A4A4A" mb={2}> {/* Reduced mb value */}
                                    {section.content}
                                </Text>
                            )}

                            {/* List Items */}
                            {section.listItems && (
                                <UnorderedList ml={5} spacing={1} color="#4A4A4A" mb={2} style={{ listStyleType: 'disc' }}> {/* Reduced spacing and mb value */}
                                    {section.listItems.map((item, idx) => (
                                        <ListItem key={idx} fontSize="sm">{item}</ListItem> 
                                    ))}
                                </UnorderedList>
                            )}

                            {/* Conclusion */}
                            {section.conclusion && (
                                <Text color="#4A4A4A" fontWeight="medium" mt={1}>
                                    {section.conclusion}
                                </Text> 
                            )}
                        </Box>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
};

export default PolicyPage;
