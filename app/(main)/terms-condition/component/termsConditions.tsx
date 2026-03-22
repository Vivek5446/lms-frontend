"use client";
import {
    Box,
    Heading,
    Text,
    VStack,
    UnorderedList,
    ListItem,
    useBreakpointValue
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import CustomSmallTitle from "../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../../../component/common/CustomSubHeading/CustomSubHeading";
import stores from "../../../store/stores";

// Updated type for section content
interface Section {
    title: string;
    content?: string[]; // displayed as bullet points
    intro?: string;
    listItems?: string[];
    conclusion?: string;
    paragraphs?: string[];
}

// Type for full terms content
interface TermsContent {
    heroTitle?: string;
    mainTitle?: string;
    highlightText?: string;
    sections?: Section[];
}

const TermsConditions = observer(() => {
    const [content, setContent] = useState<TermsContent>({});
    const {
        companyStore: { getPageContent, companyDetails },
    } = stores;

    useEffect(() => {
        const termsContent = getPageContent("terms");
        setContent(termsContent || {});
    }, [companyDetails, getPageContent]);

    const headingSize = useBreakpointValue({
        base: "sm",  // Further reduced heading size
        md: "md",  
    });

    if (!content || Object.keys(content).length === 0) {
        return null;
    }

    return (
        <Box>
            {/* Hero Section */}
            <Box bg={"#E1F0EE"} py={3}> {/* Further reduced py value */}
                <Box maxW={"90%"} mx={"auto"} px={{ base: 2, lg: 3 }}>
                    <VStack spacing={0.5} align={{ base: "center", lg: "center" }}> {/* Further reduced spacing */}
                        <CustomSmallTitle as="h1" textAlign={"center"}>
                            {content.heroTitle || ""}
                        </CustomSmallTitle>
                        <CustomSubHeading
                            highlightText={content.highlightText || ""}
                            textAlign={"center"}
                        >
                            {content.mainTitle || ""}
                        </CustomSubHeading>
                    </VStack>
                </Box>
            </Box>

            {/* Content Sections */}
            <Box maxW={"90%"} mx={"auto"} p={{ base: "", lg: "12" }} py={4}> {/* Further reduced py and p values */}
                <VStack spacing={4} align="stretch"> {/* Further reduced spacing */}
                    {content.sections?.map((section, index) => (
                        <Box key={index} bg="white" p={4} borderRadius="sm"> {/* Further reduced p value */}
                            <Heading as="h3" size={headingSize} color="#2b7e7b" mb={2}> {/* Reduced mb value */}
                                {section.title}
                            </Heading>

                            {/* Render content as bullet points */}
                            {section.content && section.content.length > 0 && (
                                <UnorderedList ml={7} spacing={0.5} color="#4A4A4A"> {/* Reduced spacing */}
                                    {section.content.map((point, idx) => (
                                        <ListItem key={idx}>{point}</ListItem>
                                    ))}
                                </UnorderedList>
                            )}

                            {/* Optional content: intro, listItems, conclusion */}
                            {section.intro && (
                                <Text color="#4A4A4A" mb={2}> {/* Reduced mb value */}
                                    {section.intro}
                                </Text>
                            )}

                            {section.listItems && section.listItems.length > 0 && (
                                <UnorderedList ml={7} spacing={0.5} color="#4A4A4A"> {/* Reduced spacing */}
                                    {section.listItems.map((item, itemIndex) => (
                                        <ListItem key={itemIndex}>{item}</ListItem>
                                    ))}
                                </UnorderedList>
                            )}

                            {section.conclusion && (
                                <Text color="#4A4A4A" mt={2}> {/* Reduced mt value */}
                                    {section.conclusion}
                                </Text>
                            )}

                            {/* Optional additional paragraphs */}
                            {section.paragraphs?.map((paragraph, pIndex) => (
                                <Text key={pIndex} color="#4A4A4A" mt={pIndex > 0 ? 2 : 0}> {/* Reduced mt value */}
                                    {paragraph}
                                </Text>
                            ))}
                        </Box>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
});

export default TermsConditions;
