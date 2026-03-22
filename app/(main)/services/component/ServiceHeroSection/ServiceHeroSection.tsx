import { Box, Flex, Image, Text } from '@chakra-ui/react';
import CustomButton from '../../../../component/common/CustomButton/CustomButton';
import CustomSmallTitle from '../../../../component/common/CustomSmallTitle/CustomSmallTitle';
import CustomSubHeading from '../../../../component/common/CustomSubHeading/CustomSubHeading';

const ServiceHeroSection = () => {
    return (
        <Box bg={'#FDFFDD'} py={10} px={{ base: 6, md: 8, lg: 14 }}>
            <Flex
                direction={{ base: 'column', lg: 'row' }}
                align={{ base: 'center', lg: 'center' }}
                justify={'space-between'}
                gap={6}
            >
                <Box textAlign={{ base: 'center', lg: 'start' }} maxW={{ lg: '50%' }}>
                    <CustomSmallTitle as="h1" textAlign={{ base: "center", lg: "start" }}>
                        OUR SERVICES
                    </CustomSmallTitle>

                    <CustomSubHeading textAlign={{ base: "center", lg: "start" }} >
                        Feel Better, with expert
                        <br />
                        <Text as="span" fontWeight={600} position="relative" display="inline-block">
                            one-on-one care
                            <Box
                                as="span"
                                position="absolute"
                                top="-0.1rem"
                                right="-1.5rem"
                                w={{ base: "1.5rem", lg: "2rem" }}
                                h={{ base: "1.5rem", lg: "2rem" }}
                            >
                                <Image src="/images/herosectionIcon.svg" alt="Mental Health Doctor In Noida" w="100%" h="100%" />
                            </Box>
                        </Text>
                    </CustomSubHeading>

                    <Text
                        as="h2"
                        fontSize={{ base: "16px", md: "18px" }}
                        fontWeight={400}
                        mt={4}
                        color="#4A4A4A"
                        textAlign={{ base: "center", lg: "start" }}
                    >
                        Specialized support for every stage of life, from licensed providers.
                    </Text>

                    <Box maxW={{ base: '100%', lg: '50%' }} my={{ md: 4, lg: 0 }} display={{ base: "block", lg: "none" }}>
                        <Image
                            alt="best counseling psychologist in Noida"
                            w={'100%'}
                            h={{ base: '300px', md: '350px', lg: '400px' }}
                            objectFit={'contain'}
                            src='https://res.cloudinary.com/dekfm4tfh/image/upload/v1746128051/Group_1000003363_msvumf.png'
                        />
                    </Box>
                    {/* Keep web version as is, only adjust mobile */}
                    {/* Mobile Version - Vertical Layout */}
                    <Flex
                        direction="column"
                        gap={1}
                        justify="flex-start"
                        align="flex-start"
                        mt={{ base: 2, lg: 4 }}
                        ml={{ base: "3.4rem" }}
                        fontSize={{ base: "16px", md: "18px" }}
                        display={{ base: 'flex', md: 'none' }}
                    >
                        <Flex align="center">
                            <Box
                                mr={2}
                                w="16px"
                                h="16px"
                                borderRadius="full"
                                bg="#86C6F4"
                                color="white"
                                justifyContent="center"
                                alignItems="center"
                                fontSize="16px"
                                display="flex"
                            >
                                ✓
                            </Box>
                            <Text whiteSpace={'nowrap'} fontWeight={500} fontSize={'16px'}>Completely Confidential</Text>
                        </Flex>

                        <Flex align="center">
                            <Box
                                mr={2}
                                w="16px"
                                h="16px"
                                borderRadius="full"
                                bg="#86C6F4"
                                color="white"
                                justifyContent="center"
                                alignItems="center"
                                fontSize="16px"
                                display="flex"
                            >
                                ✓
                            </Box>
                            <Text whiteSpace={'nowrap'} fontWeight={500} fontSize={'16px'}>Outcome-focused</Text>
                        </Flex>

                        <Flex align="center">
                            <Box
                                mr={2}
                                w="16px"
                                h="16px"
                                borderRadius="full"
                                bg="#86C6F4"
                                color="white"
                                justifyContent="center"
                                alignItems="center"
                                fontSize="16px"
                                display="flex"
                            >
                                ✓
                            </Box>
                            <Text whiteSpace={'nowrap'} fontWeight={500} fontSize={'16px'}>Qualified therapists</Text>
                        </Flex>
                    </Flex>

                    {/* Desktop Version - Horizontal Layout (Keep as is) */}
                    <Flex
                        direction="row"
                        gap={{ base: 1, lg: 3 }}
                        justify="flex-start"
                        align="center"
                        mt={{ base: 2, lg: 4 }}
                        display={{ base: 'none', md: 'flex' }}
                    >
                        <Text whiteSpace={'nowrap'} fontWeight={500} fontSize={'xl'}>Completely Confidential</Text>

                        <Box>
                            <Image alt="Who is the best counseling psychologist in Noida" objectFit={'contain'} src='/images/service/blueDot.png' />
                        </Box>

                        <Text whiteSpace={'nowrap'} fontWeight={500} fontSize={'xl'}>Outcome-focused</Text>

                        <Box>
                            <Image alt="Counselling psychologist in Noida" objectFit={'contain'} src='/images/service/blueDot.png' />
                        </Box>

                        <Text whiteSpace={'nowrap'} fontWeight={500} fontSize={'xl'}>Qualified therapists</Text>
                    </Flex>

                    <CustomButton
                        mt={6}
                        onClick={() => {
                            const section = document.getElementById("psychologist-section");
                            if (section) {
                                section.scrollIntoView({ behavior: "smooth" });
                            }
                        }}
                    >
                        Get Started
                    </CustomButton>
                </Box>
                <Box maxW={{ base: '100%', lg: '50%' }} display={{ base: "none", lg: "block" }}>
                    <Image
                        alt="Dental"
                        w={'100%'}
                        h={{ base: '300px', md: '350px', lg: '400px' }}
                        objectFit={'contain'}
                        src='https://res.cloudinary.com/dekfm4tfh/image/upload/v1746128051/Group_1000003363_msvumf.png'
                    />
                </Box>
            </Flex>
        </Box>
    );
};

export default ServiceHeroSection;