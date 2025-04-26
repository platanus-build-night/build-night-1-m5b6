import { Topic } from "./types"; // Import the Topic enum

// --- Topic Metadata Mappings ---
export const topicNames: Record<Topic, string> = {
  "social": "Social",
  "science": "Ciencia",
  "tech": "Tecnología",
  "arts": "Artes",
  "sports": "Deportes",
  "business": "Negocios",
};

export const getTopicGradient = (topic: Topic): string => {
  switch (topic) {
    case "social":
      return "linear-gradient(135deg, #FFDAC1, #FFEBC1, #FFF4C1)";
    case "science":
      return "linear-gradient(135deg, #CFDFFF, #C1EEFF, #C4F5F5)";
    case "tech":
      return "linear-gradient(135deg, #E1C4F5, #D5C9F0, #CED3F5)";
    case "arts":
      return "linear-gradient(135deg, #C4E7E1, #D0F0D0, #E5F5E0)";
    case "sports":
      return "linear-gradient(135deg, #D0EFFF, #C8E6FF, #D7F9FF)";
    case "business":
       return "linear-gradient(135deg, #F5F5F5, #E8E8E8, #DCDCDC)";
    default:
       // Optional: Return a default gradient or handle unexpected topics
       return "linear-gradient(135deg, #CCCCCC, #AAAAAA)";
  }
};

export const getTopicIcon = (topic: Topic): string => {
  switch (topic) {
    case "social":
      return "UserGroupIcon";
    case "science":
      return "BeakerIcon";
    case "tech":
      return "CpuChipIcon";
    case "arts":
      return "PaintBrushIcon";
    case "sports":
      return "TrophyIcon";
    case "business":
      return "BriefcaseIcon";
    default:
      // Return a default icon name for unhandled topics
      return "QuestionMarkCircleIcon";
  }
}; 