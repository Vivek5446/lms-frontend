import React from 'react'
import ContactContent from './ContactContent'

import { getMetadataForPath } from "../../metadata";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const data = getMetadataForPath("/contact-us");

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: "https://www.Dentalhealth.com/contact-us",
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
    <ContactContent />
  )
}

export default page