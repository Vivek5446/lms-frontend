import React from 'react'
import TherapistPageContent from './component/TherepistContent'
import type { Metadata } from "next";
import { getMetadataForPath } from "../../metadata";
export async function generateMetadata(): Promise<Metadata> {
  const data = getMetadataForPath("/therapist");

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: "https://www.Dentalhealth.com/therapist",
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
    <TherapistPageContent />
  )
}

export default page