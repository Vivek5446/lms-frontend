import { Box } from '@chakra-ui/react'
import React from 'react'
import ConditionPage from '../component/ConditionPage'
import { conditionData } from '../component/utils/constant';

export async function generateMetadata({ params }: any) {
  const { slug } = await params;

  const {metaData} = conditionData[slug];

  if (!metaData) {
    return {
      title: 'Condition Not Found',
      description: 'The condition you are looking for does not exist.',
    };
  }

  return {
    title: metaData.title,
    description: metaData.description,
    openGraph: {
      title: metaData.title,
      description: metaData.description,
      url: `https://www.Dentalhealth.com/condition/${slug}`,
      siteName: 'Dental Health',
      images: [
        {
          url: 'https://www.Dentalhealth.com/images/logo.png',
          width: 1200,
          height: 630,
          alt: metaData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaData.title,
      description: metaData.description,
      images: ['https://www.Dentalhealth.com/images/logo.png'],
    },
  };
}

const page = () => {
  return (
    <Box>
      <ConditionPage />
    </Box>
  )
}

export default page