'use client'

import { Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import FAQ from '../../../component/FAQ/FAQ'
import TestimonialSection from '../../../component/TestimonialSection/TestimonialSection'
import stores from '../../../store/stores'
import CareCardSection from './CareCardSection/CareCardSection'
import FoundersNote from './FoundersNote/FoundersNote'
import ServiceHeroSection from './ServiceHeroSection/ServiceHeroSection'
import ServiceOfferingSection from './ServiceOfferingSection/ServiceOfferingSection'
import ServiceValues from './ServiceValues/ServiceValues'
import WorkingSteps from './WorkingSteps/WorkingSteps'
import ServiceProvidersSection from './ServiceProvidersSection/ServiceProvidersSection'
import { observer } from 'mobx-react-lite'
import SupportSection from '../../individualService/component/SupportSection/SupportSection'

const ServicePage = observer(() => {

  const [content, setContent] = useState<any>({});
  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  useEffect(() => {
    setContent(getPageContent("home") || {});
  }, [companyDetails, getPageContent]);
  return (
    <Box>
      <ServiceHeroSection />
      <Box my={{ base: "70px", md: "4rem", lg: "80px" }}>

        <CareCardSection />
      </Box>
      <Box mb={{ base: "70px", md: "4rem", lg: "80px" }} id="psychologist-section">

        <ServiceOfferingSection />
      </Box>

      <ServiceValues />

      <Box mt={{ base: "40px", lg: "100px" }}>
        <FoundersNote />
      </Box>

      <TestimonialSection bg="#FFF3F2" />

      <Box
        my={{ base: "40px", md: "3rem", lg: "30px" }} // Reduced from 70px/4rem/20px
        maxW={"90%"}
        mx={"auto"}
      >
        <ServiceProvidersSection />
      </Box>

      <Box my={{ lg: "70px" }} mt={{ base: "0", md: "2rem", lg: "12px" }} mb={{ base: "20px" }}>
        <WorkingSteps />
      </Box>

      <Box mt={12}>
        <SupportSection />
      </Box>

      <Box id="faq">
        <FAQ data={content?.homeFaq || []} />
      </Box>
    </Box >
  )
})

export default ServicePage