import { Box } from "@chakra-ui/react";
import React from "react";
import TermsConditions from "./component/termsConditions"; // adjust path as needed

import { getMetadataForPath } from "../../metadata";
import { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const data = getMetadataForPath("/terms-condition");

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: "https://www.Dentalhealth.com/terms-condition",
      siteName: "Dental Health",
      images: [
        {
          url: "https://www.Dentalhealth.com/images/logo.png",
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: ["https://www.Dentalhealth.com/images/logo.png"],
    },
  };
}

const Page = () => {
  return (
    <Box>
      <TermsConditions />
    </Box>
  );
};

export default Page;
