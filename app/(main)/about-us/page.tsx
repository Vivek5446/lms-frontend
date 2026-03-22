// app/about-us/page.tsx
import { Box } from "@chakra-ui/react";
import AboutUsPage from "./component/AboutUsPage";
import type { Metadata } from "next";
import { getMetadataForPath } from "../../metadata";
export async function generateMetadata(): Promise<Metadata> {
  const data = getMetadataForPath("/about-us");

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
export default function Page() {
  return (
    <Box>
      <AboutUsPage />
    </Box>
  );
}
