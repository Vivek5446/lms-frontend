"use client";  // Ensure this is a Client Component

import { Suspense, useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import BookCallComponent from "../../../component/common/BookCallComponent/BookCallComponent";
import FAQ from "../../../component/FAQ/FAQ";
import PsychologistSection from "../../../component/PsychologistSection/PsychologistSection";
import TherapistHeroSection from "../../../component/TherapistHeroSection/TherapistHeroSection";
import WhyChooseUs from "../../../component/WhyChooseUs/WhyChooseUs";
import stores from "../../../store/stores";
import { observer } from "mobx-react-lite";
import WorkingSteps from "../../services/component/WorkingSteps/WorkingSteps";
import AssessmentTestimonialSection from "../../assessment/component/TestimonialSection/TestimonialSection";


const TherapistPageContent = observer(() => {
  const psychologistRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<any>({});
  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  useEffect(() => {
    setContent(getPageContent("therapist") || {});
  }, [companyDetails, getPageContent]);


  const scrollToPsychologist = () => {
    if (psychologistRef.current) {
      psychologistRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box>
        <TherapistHeroSection onButtonClick={scrollToPsychologist} />
        <Box my={{ base: "70px", md: "4rem", lg: "80px" }}>
          <WhyChooseUs />
        </Box>
        <Box ref={psychologistRef}>
          <PsychologistSection visibleTabs={["Adult", "Couple & family", "Teen", "Specialities"]} />
        </Box>
        <BookCallComponent showText={false} />
        <Box mt={{ base: "70px", md: "4rem", lg: "80px" }}>
          <WorkingSteps />
        </Box>
        <AssessmentTestimonialSection />
        <FAQ data={content?.therepists || []} />
      </Box>
    </Suspense>
  );
});

export default TherapistPageContent;
