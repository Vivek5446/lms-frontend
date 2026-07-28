// metadata.tsx
export interface PageMetadata {
  title: string;
  description: string;
}

interface MetadataMap {
  [key: string]: PageMetadata;
}

export const METADATA_MAP: MetadataMap = {
  '/': {
    title: 'SkillShift | Modern Learning Management System',
    description: 'Empower your team with SkillShift LMS. Create, manage, and track online courses effortlessly.'
  },
  '/contact-us': {
    title: 'Contact Us | SkillShift',
    description: 'Get in touch with the SkillShift team for enterprise LMS support and sales inquiries.'
  },
  '/about-us': {
    title: 'About Us | SkillShift',
    description: 'SkillShift is dedicated to providing an expert modern learning platform. Learn more about our mission and values.'
  },
  '/blogs': {
    title: 'SkillShift Blog | E-learning Insights',
    description: 'Explore expert insights on e-learning, instructional design, and modern corporate training.'
  },
  '/service': {
    title: 'Services We Offer | SkillShift',
    description: 'Explore the wide range of e-learning solutions and custom course development services offered by SkillShift.'
  },
  '/terms-condition': {
    title: 'Terms & Conditions | SkillShift',
    description: 'Read the Terms & Conditions of SkillShift for a clear understanding of our services, policies, and user agreements.'
  },
  '/dashboard': {
    title: 'Dashboard | SkillShift',
    description: 'SkillShift learner dashboard. Track your courses and progress.'
  }
};

export const getMetadataForPath = (path: string): PageMetadata => {
  if (METADATA_MAP[path]) {
    return METADATA_MAP[path];
  }

  for (const key in METADATA_MAP) {
    if (path.startsWith(key) && key !== '/') {
      return METADATA_MAP[key];
    }
  }

  return METADATA_MAP['/'];
};
