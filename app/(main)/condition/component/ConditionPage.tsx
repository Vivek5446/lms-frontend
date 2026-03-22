'use client';

import { useParams } from 'next/navigation';
import { Box } from "@chakra-ui/react";
import ConditionHeroSection from "./ConditionHeroSection/ConditionHeroSection";
import TailoredTherapy from "./TailoredTherapy/TailoredTherapy";
import AssessmentTestimonialSection from "../../assessment/component/TestimonialSection/TestimonialSection";
import WorkingSteps from "../../services/component/WorkingSteps/WorkingSteps";
import HowWeWorkSection2 from "../../about-us/component/HowWeWorkSection2/HowWeWorkSection2";
import SupportSection from "../../individualService/component/SupportSection/SupportSection";
import AboutTheCondition from "./AboutTheCondition/AboutTheCondition";
import { conditionData } from './utils/constant';

const ConditionPage = () => {
  const params = useParams();
  const condition = params.slug as string; // Assuming your folder is /condition/[slug]/page.tsx
  const pageData = conditionData[condition];

  return (
    <Box>
      <ConditionHeroSection data={pageData?.hero} />
      <TailoredTherapy data={pageData?.offering} />
      <Box mt={{ base: "2rem" }}>
        <AboutTheCondition data={pageData?.about} id={pageData?.hero} />
      </Box>
      <AssessmentTestimonialSection />
      <Box mt={{ base: "2rem", md: "4rem", lg: "2" }}>
        <WorkingSteps />
      </Box>
      <Box
        mt={{ base: "-24px", lg: "20px" }}
        py={{ base: "20px", lg: "60px" }}
        sx={{
          "& > div": {
            backgroundColor: "#FFF3F2 !important",
          }
        }}
      >
        <Box mt={{ base: "2rem" }}>
          <HowWeWorkSection2 data={pageData?.blogs} />
        </Box>
      </Box>
      <Box mt={12}>
        <SupportSection />
      </Box>
    </Box>
  );
}

export default ConditionPage;
