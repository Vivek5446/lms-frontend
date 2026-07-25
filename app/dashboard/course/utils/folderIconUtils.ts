import { IconType } from "react-icons";
import {
  FiBriefcase,
  FiCloud,
  FiCode,
  FiCpu,
  FiDollarSign,
  FiFolder,
  FiPenTool,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";

export interface CategoryIconMapping {
  keywords: string[];
  icon: IconType;
  gradient: string;
  color: string;
  badgeBg: string;
}

export const CATEGORY_ICON_MAPPINGS: CategoryIconMapping[] = [
  {
    keywords: ["sales", "crm", "marketing", "leads", "revenue", "conversion"],
    icon: FiTrendingUp,
    gradient: "linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)",
    color: "#EA580C",
    badgeBg: "#FFF7ED",
  },
  {
    keywords: ["ai", "ml", "machine learning", "genai", "llm", "deep learning", "neural", "data science"],
    icon: FiCpu,
    gradient: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)",
    color: "#9333EA",
    badgeBg: "#FAF5FF",
  },
  {
    keywords: [
      "full stack",
      "frontend",
      "backend",
      "react",
      "node",
      "javascript",
      "typescript",
      "code",
      "dev",
      "development",
      "software",
      "programming",
      "web",
    ],
    icon: FiCode,
    gradient: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
    color: "#2563EB",
    badgeBg: "#EFF6FF",
  },
  {
    keywords: ["business", "ba", "analysis", "analytics", "management", "strategy", "executive"],
    icon: FiBriefcase,
    gradient: "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)",
    color: "#4F46E5",
    badgeBg: "#EEF2FF",
  },
  {
    keywords: ["finance", "accounting", "banking", "tax", "investing", "money"],
    icon: FiDollarSign,
    gradient: "linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)",
    color: "#16A34A",
    badgeBg: "#F0FDF4",
  },
  {
    keywords: ["design", "ui", "ux", "graphic", "figma", "creative", "media"],
    icon: FiPenTool,
    gradient: "linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)",
    color: "#DB2777",
    badgeBg: "#FDF2F8",
  },
  {
    keywords: [
      "cloud",
      "aws",
      "azure",
      "gcp",
      "devops",
      "kubernetes",
      "docker",
      "infrastructure",
      "server",
    ],
    icon: FiCloud,
    gradient: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
    color: "#0284C7",
    badgeBg: "#F0F9FF",
  },
  {
    keywords: ["security", "cyber", "network", "infosec", "compliance", "privacy", "protection"],
    icon: FiShield,
    gradient: "linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)",
    color: "#DC2626",
    badgeBg: "#FEF2F2",
  },
];

export const DEFAULT_FOLDER_ICON: CategoryIconMapping = {
  keywords: [],
  icon: FiFolder,
  gradient: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
  color: "#D97706",
  badgeBg: "#FFFBEB",
};

export function getCategoryIconMeta(categoryName: string): CategoryIconMapping {
  if (!categoryName) return DEFAULT_FOLDER_ICON;

  const normalized = categoryName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "");

  let bestMatch: CategoryIconMapping | null = null;
  let maxKeywordLength = 0;

  for (const mapping of CATEGORY_ICON_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      const normKeyword = keyword.toLowerCase();

      // Check fuzzy word match or substring inclusion
      if (normalized.includes(normKeyword)) {
        if (normKeyword.length > maxKeywordLength) {
          maxKeywordLength = normKeyword.length;
          bestMatch = mapping;
        }
      }
    }
  }

  return bestMatch || DEFAULT_FOLDER_ICON;
}
