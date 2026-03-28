"use client";
import { Box } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import IndServiceHeroSection from './IndServiceHeroSection/IndServiceHeroSection'
import MakesUniqueSection from './MakesUniqueSection/MakesUniqueSection'
import IndServicesSection from './IndServicesSection/IndServicesSection'
import PsychologistSection from '../../../component/PsychologistSection/PsychologistSection'
import WorkingSteps from '../../services/component/WorkingSteps/WorkingSteps'
import FAQ from '../../../component/FAQ/FAQ'
import SupportSection from './SupportSection/SupportSection'
import { observer } from 'mobx-react-lite'
import stores from '../../../store/stores'
import ProvidersSectionWithImage from '../../../component/ProvidersSectionWithImage/ProvidersSection'
import TestimonialSection from '../../../component/TestimonialSection/TestimonialSection'
import { useParams } from 'next/navigation'
import serviceData from './utils/constant'

type TherapyType = "Adult" | "Couple & family" | "Teen" | "Specialities" | "Couple" | "Family" | "Psychodynamic Psychotherapy";

// Map from service URL param to therapy type for PsychologistSection
const serviceToTherapyType: Record<string, TherapyType> = {
  'individual-therapy': 'Adult',
  'couple-therapy': 'Couple',
  'teen-therapy': 'Teen',
  'family-therapy': 'Family',
  'psychodynamic-therapy': 'Psychodynamic Psychotherapy'
};

const ServicePage = observer(() => {
  const params = useParams();
  const serviceKey = params.services as string;
  const pageData = serviceData[serviceKey];

  // Get the therapy type for PsychologistSection
  const therapyType = serviceToTherapyType[serviceKey] || 'Adult';

  const [content, setContent] = useState<any>({});
  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  useEffect(() => {
    setContent(getPageContent("individual-therapy") || {});
  }, [companyDetails, getPageContent]);

  return (
    <Box>
      <IndServiceHeroSection data={pageData?.hero} />
      <MakesUniqueSection />

      {/* Psychologist Section with Proper Filters */}
      <Box
        mt={{ base: "-78px", lg: "-150px" }}
        py={2}
        sx={{
          "& > div": {
            bg: "white !important",
          }
        }}
        id="psychologist-section"
      >
        <PsychologistSection
          visibleTabs={[therapyType]}
          defaultTab={therapyType}
          title="FIND YOUR THERAPIST"
          subtitle="Specialized in "
        />
      </Box>

      <Box mt={{ base: "-2rem", md: "2rem" }}>
        <IndServicesSection data={pageData?.service} />
      </Box>

      <Box
        mt={{ base: "4rem", md: "3rem", lg: "4rem" }}
        maxW="90%"
        mx="auto"
      >
        <ProvidersSectionWithImage data={pageData?.providerimage} />
      </Box>

      <Box my={{ lg: "70px" }} mt={{ base: "4rem", md: "2rem", lg: "5px" }} mb={{ base: "20px" }} id="WorkingSteps-section">
        <WorkingSteps />
      </Box>

      <Box mt={{ base: "-2" }}>
        <TestimonialSection />
      </Box>

      <SupportSection />
      <FAQ data={content?.individualFaq || []} />
    </Box>
  )
})

export default ServicePage