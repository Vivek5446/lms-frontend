import { Box, Center } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import FAQ from '../../../component/FAQ/FAQ';
import AboutMe from './AboutMe/AboutMe';
import AffiliationSection from './AffiliationSection/AffiliationSection';
import AvailibilitySection from './AvailibilitySection/AvailibilitySection';
import ProfileTopSection from './ProfileTopSection/ProfileTopSection';
import ReviewSection from './ReviewSection/ReviewSection';
import ServiceOffered from './ServiceOffered/ServiceOffered';
import TabsButton from './TabsButton/TabsButton';
import stores from '../../../store/stores';
import { observer } from 'mobx-react-lite';
import CustomButton from '../../../component/common/CustomButton/CustomButton';
import ScheduleSession from '../../../component/common/scheduleSession/scheduleSession';
import { useDisclosure } from '@chakra-ui/react';

const ProfilePage = observer(({ userData }: any) => {
  const aboutMeRef = useRef(null);
  const serviceRef = useRef(null);
  const affiliationRef = useRef(null);
  const availabilityRef = useRef(null);
  const reviewsRef = useRef(null);
  const faqRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const sectionRefs = [aboutMeRef, serviceRef, affiliationRef, availabilityRef, reviewsRef, faqRef];

  const handleTabClick = (index) => {
    sectionRefs[index].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const [content, setContent] = useState<any>({});
  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  useEffect(() => {
    setContent(getPageContent("profile") || {});
  }, [companyDetails, getPageContent]);

  const personalInfo = userData?.profile_details?.personalInfo || {}

  return (
    <Box>
      <ProfileTopSection data={{ ...personalInfo, ...userData }} />
      <TabsButton handleTabClick={handleTabClick} />

      <Box ref={aboutMeRef} scrollMarginTop="12rem" mb={{ base: "40px", lg: "80px" }}>
        <AboutMe title={personalInfo?.aboutMe?.title} paragraphs={personalInfo?.aboutMe?.paragraphs} />
      </Box>
      <Box ref={serviceRef} scrollMarginTop="12rem" mb={{ base: "40px", lg: "80px" }}>
        <ServiceOffered services={personalInfo.services || []} conditions={personalInfo.conditions || []} />
      </Box>
      <Box ref={affiliationRef} scrollMarginTop="12rem" mb={{ base: "40px", lg: "80px" }}>
        <AffiliationSection data={personalInfo.affiliations || []} />
      </Box>
      <Box ref={availabilityRef} scrollMarginTop="12rem" mb={{ base: "40px", lg: "80px" }}>
        <AvailibilitySection data={personalInfo} />
      </Box>
      <Box ref={reviewsRef} scrollMarginTop="12rem" mb={{ base: "40px", lg: "80px" }}>
        <ReviewSection data={personalInfo.reviews || []} />
      </Box>

      {/* Schedule Session Button added here, just above the FAQ section */}
      <Center mb={{ base: "30px", lg: "50px" }}>
        <CustomButton onClick={onOpen}>
          Schedule a Session
        </CustomButton>
        <ScheduleSession
          isOpen={isOpen}
          onClose={onClose}
          data={{ ...personalInfo, ...userData }}
        />
      </Center>

      <Box ref={faqRef} scrollMarginTop="12rem" mx={'auto'} mb={{ base: "40px", lg: "80px" }}>
        <FAQ data={content?.profileFaq || []} />
      </Box>
    </Box>
  );
});

export default ProfilePage;