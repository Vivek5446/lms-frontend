import { Box, Center, Grid, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import CustomSmallTitle from "../../../../component/common/CustomSmallTitle/CustomSmallTitle";
import CustomSubHeading from "../../../../component/common/CustomSubHeading/CustomSubHeading";
import ServiceOfferingCard from "./ServiceOfferingCard";

// Updated service data with route properties for navigation
const serviceData = {
    basic: [
        { id: 1, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1745780028/Mask_group_2_gv3yow.png', imageUrl: '/images/service/offering1.png', tag: 'AGES 18+', title: 'Individual Therapy', description: 'One-on-one sessions to help you feel better and handle life’s challenges.', buttonText: 'EXPLORE', bg: "#9DEAB2", route: '/services/individual-therapy' },
        { id: 2, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1745780010/Mask_group_4_yv86a9.png', imageUrl: '/images/service/offering2.png', tag: 'AGES 13+', title: 'Teen Therapy', description: 'Safe, understanding support for teens navigating life’s ups and downs.', buttonText: 'EXPLORE', bg: "#EAF475", route: '/services/teen-therapy' },
        { id: 3, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746203003/iStock-2167121054_cx0ybf.png', imageUrl: '/images/service/offering3.png', tag: '', title: 'Family Therapy', description: 'Guided conversations to improve relationships and resolve conflicts together.', buttonText: 'EXPLORE', bg: "#86C6F4", route: '/services/family-therapy' },
        { id: 4, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1745780029/Mask_group_3_v0etho.png', imageUrl: '/images/service/offering4.png', tag: '', title: 'Couples Therapy', description: 'Support for stronger connections and healthier relationships.', buttonText: 'EXPLORE', bg: "#FFB8B2", route: '/services/couple-therapy' }
    ],
    special: [
        { id: 5, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746694181/smiley-man-holding-camera-front-view_23-2149915895_ozx2bt.avif', imageUrl: '/images/service/offering5.png', tag: '', title: 'Eating Disorder', description: 'Specialized care for those struggling with eating-related concerns', buttonText: 'UPCOMING', bg: "#9DEAB2" },
        { id: 6, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746613963/8_20250507_155037_0007_zv4yiv.png', imageUrl: '/images/service/offering6.png', tag: '', title: 'Dental Anxiety Traumatic Stress Unit', description: 'A Dedicated outpatient care for adolescents and adults (13+), offering focused support for anxiety and trauma.', buttonText: 'UPCOMING', bg: "#EAF475"},
        { id: 7, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746377894/Mask_group_1_zn3iqg.png', imageUrl: '/images/service/offering7.png', tag: 'AGES 18+', title: 'Psychodynamic Psychotherapy', description: 'An in-depth explorative approach to help you gain a deeper understanding of self.', buttonText: 'EXPLORE', bg: "#86C6F4", route: '/services/psychodynamic-therapy' },
        { id: 8, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746377369/iStock-1391105380_2_ag1sky.png', imageUrl: '/images/service/offering8.png', tag: 'FOR THERAPISTS', title: 'Supervision', description: '1-on-1 supervision for emerging clinical psychologists & psychiatrists to receive guidance, feedback, & mentorship.', buttonText: 'EXPLORE', bg: "#FFB8B2", route: '/supervision' }
    ],
    assessment: [
        { id: 9, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746377911/Group_1000003362_amhbve.png', imageUrl: '/images/service/offering9.png', tag: 'MOST COMMON', title: 'Personality Assessment', description: 'Clear insights into emotional, behavioral, and cognitive well-being.', buttonText: 'EXPLORE', bg: "#9DEAB2", route: '/assessment' },
        { id: 10, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746377911/Group_1000003362_amhbve.png', imageUrl: '/images/service/offering10.png', tag: '', title: 'Detailed-Diagnostic Assessment', description: 'Comprehensive and intensive examination for an accurate diagnosis and treatment recommendations.', buttonText: 'EXPLORE', bg: "#EAF475", route: '/assessment' },
        { id: 11, coverImage: 'https://res.cloudinary.com/dekfm4tfh/image/upload/v1746377911/Group_1000003362_amhbve.png', imageUrl: '/images/service/offering11.png', tag: '', title: 'Neuropsychological Assessment', description: 'Expert consultation and testing for concerns like ADHD, autism, dementia, or brain injuries, with personalized recommendations.', buttonText: 'EXPLORE', bg: "#86C6F4", route: '/assessment' }
    ]
};

const ServiceOfferingSection = () => {

    return (
        <Box>
            <CustomSmallTitle>OUR OFFERINGS</CustomSmallTitle>
            <CustomSubHeading highlightText="built for You">Expert care,</CustomSubHeading>
            <Text
                mt={4}
                textAlign={{ base: "center", md: "center" }}
                color="#4D4D4D"
                px={{ base: 3, md: 1 }}
                fontSize={{ base: "14px", md: "16px" }}
                whiteSpace="pre-line"
            >
                We offer a variety of treatment options to ensure you receive the best care for your needs. <br />
                Our providers focus on evidence-based treatments so that you get better, faster.
            </Text>

            <Box mt={8}>
                <Tabs variant="solid-rounded">
                    <Center>
                        <TabList
                            justifyContent="center"
                            bg="#F3F7F7"
                            rounded="full"
                            p={1}
                            w={{ base: '100%', md: 'fit-content' }}
                            overflowX="auto"
                        >
                            {['Therapy', 'Speciality services', 'Assessment'].map((tab, index) => (
                                <Tab fontSize={'xs'} key={index} color="brand.100" _selected={{ color: "white", bg: "brand.100" }} fontWeight={500}>
                                    {tab}
                                </Tab>
                            ))}
                        </TabList>
                    </Center>
                    <TabPanels>
                        {[serviceData.basic, serviceData.special, serviceData.assessment].map((data, index) => (
                            <TabPanel key={index}>
                                <Grid
                                    templateColumns={{ base: '1fr', sm: '1fr 1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }}
                                    maxW={{ base: '90%', md: '85%' }}
                                    mx="auto"
                                    gap={6}
                                    mt={4}
                                >
                                    {data.map(service => (
                                        <ServiceOfferingCard key={service.id} service={service} />
                                    ))}
                                </Grid>
                            </TabPanel>
                        ))}
                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
};

export default ServiceOfferingSection;