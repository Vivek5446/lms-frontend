import React from 'react'
import { getMetadataForPath } from "../../metadata";
import { Metadata } from 'next';
import SelfAssessment from './(selfAssessment)/SelfAssessment';
export async function generateMetadata(): Promise<Metadata> {
  const data = getMetadataForPath("/self-assessment");

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: "https://www.Dentalhealth.com/about-us",
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

const page = () => {
  return (
    <SelfAssessment />
  )
}

export default page