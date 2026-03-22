'use client'
import { Box } from "@chakra-ui/react";
import ContactDetails from "../../component/ContactDetails/ContactDetails";
import ContactUsFormSection from "../../component/ContactUsFormSection/ContactUsFormSection";
import FAQ from "../../component/FAQ/FAQ";
import JoinCommunitySection from "../../component/JoinCommunity/JoinCommunitySection";
import MapComponent from "../../component/common/MapComponent/MapComponent";
import { useEffect, useState } from "react";
import stores from "../../store/stores";
import { observer } from "mobx-react-lite";

const ContactContent = observer(() => {
  const [content, setContent] = useState<any>({});
  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  useEffect(() => {
    setContent(getPageContent("home") || {});
  }, [companyDetails, getPageContent]);

  return (
    <Box>
      <ContactUsFormSection links="contact"/>
      <Box my={{ base: "70px", lg: "140px" }}>
        <ContactDetails />
      </Box>
      <JoinCommunitySection />
      <FAQ data={content?.homeFaq || []} />
      <MapComponent />
    </Box>
  );
});

export default ContactContent;
