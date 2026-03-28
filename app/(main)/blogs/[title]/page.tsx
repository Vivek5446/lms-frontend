import { Metadata } from 'next';
import BlogTitle from './BlogTitle';
import { stripHtmlTags } from '../../../config/utils/utils';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { title } = await params;

  // Map specific blog titles to your predefined canonical URLs
  const canonicalMappings: { [key: string]: string } = {
    'how-to-choose-the-right-therapist-for-your-mental-health':
      'https://www.Dentalhealth.com/blogs/how-to-choose-the-right-therapist-for-your-mental-health',
    'cost-of-mental-health-care-in-noida':
      'https://www.Dentalhealth.com/blogs/cost-of-mental-health-care-in-noida',
    'difference-between-psychologist-and-psychiatrist':
      'https://www.Dentalhealth.com/blogs/difference-between-psychologist-and-psychiatrist',
    'benefits-of-psychotherapy-for-anxiety-and-stress':
      'https://www.Dentalhealth.com/blogs/benefits-of-psychotherapy-for-anxiety-and-stress'
  };

  let fetchedTitle = title;
  let fetchedDesc = null;
  // Use predefined canonical URL if exists, otherwise use dynamic URL
  const canonicalUrl = canonicalMappings[title] || `https://www.Dentalhealth.com/blogs/${title}`;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/blog/?title=${title}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const datas = await res.json();
      if (datas?.data?.title) {
        fetchedTitle = datas.data.title;
        fetchedDesc = stripHtmlTags(datas.data.subTitle);
      }
    }
  } catch ({}) {}

  return {
    title: fetchedTitle,
    description: fetchedDesc,
    // 🔥 CANONICAL TAG ADDED HERE
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fetchedTitle,
      description: fetchedDesc,
      url: canonicalUrl,
      siteName: "Dental Health",
      images: [
        {
          url: "https://www.Dentalhealth.com/images/logo.png",
          width: 1200,
          height: 630,
          alt: fetchedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fetchedTitle,
      description: fetchedDesc,
      images: ["https://www.Dentalhealth.com/images/logo.png"],
    },
  };
}

const page = () => {
  return <BlogTitle />;
};

export default page;