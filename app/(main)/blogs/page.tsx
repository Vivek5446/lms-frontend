import { Box } from '@chakra-ui/react'
import BlogsPage from './components/BlogsPage'

import type { Metadata } from "next";
import { getMetadataForPath } from "../../metadata";
export async function generateMetadata(): Promise<Metadata> {
  const data = getMetadataForPath("/blogs");

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: "https://www.Dentalhealth.com/blogs",
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
    <Box>
        <BlogsPage/>
    </Box>
  )
}

export default page