"use client";
import { Box } from '@chakra-ui/react'
import React from 'react'
import { observer } from 'mobx-react-lite'
// import stores from '../../../store/stores';
import SupervisionHeroSection from './SupervisionHeroSection/SupervisionHeroSection';
import SupervisionValuesSection from './SupervisionValuesSection/SupervisionValuesSection';
import SupervisionServicesSection from './SupervisionServicesSection/SupervisionServicesSection';
import SupervisionTestimonialSection from './SupervisionTestimonialSection/SupervisionTestimonialSection';
import SupervisionHowWeWork from './HowWeWork/SupervisionHowWeWork';
import SupervisionSupportSection from './SupervisionSupportSection/SupervisionSupportSection';

const SupervisionPage = observer(() => {

    // const [setContent] = useState<any>({});
    // const {
    //     companyStore: { getPageContent, companyDetails },
    // } = stores;

    // useEffect(() => {
    //     setContent(getPageContent("home") || {});
    // }, [companyDetails, getPageContent]);

    return (
        <Box>
            <Box>
                <SupervisionHeroSection />
            </Box>

            <SupervisionValuesSection />

            <Box mt={{ base: "-2rem", md: "2rem" }}>
                <SupervisionServicesSection />
            </Box>

            <Box mt={{ base: "-2", lg: "2rem" }}>
                <SupervisionTestimonialSection />
            </Box>

            <Box mt={{ base: "2rem", md: "2rem", lg: "-1rem" }} mb={{ base: "20px" }} id="WorkingSteps-section">
                <SupervisionHowWeWork />
            </Box>
            <Box mt={{ base: "-2", lg: "8rem" }}>
                <SupervisionSupportSection />
            </Box>

        </Box>
    )
})

export default SupervisionPage