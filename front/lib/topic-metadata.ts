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
      // Warm Pink to Light Orange
      return "linear-gradient(135deg, #ff9a9e, #fad0c4)";
    case "science":
      // Deep Blue to Purple
      return "linear-gradient(135deg, #2b5876, #4e4376)";
    case "tech":
      // Electric Pink/Purple to Vibrant Blue
      return "linear-gradient(135deg, #f953c6, #b91d73)";
    case "arts":
      // Light Green to Soft Aqua/Blue
      return "linear-gradient(135deg, #a8ff78, #78ffd6)";
    case "sports":
      // Fiery Orange to Bold Red
      return "linear-gradient(135deg, #f12711, #f5af19)";
    case "business":
       // Slate Blue to Steel Gray
       return "linear-gradient(135deg, #2c3e50, #bdc3c7)";
    default:
       // Medium Gray
       return "linear-gradient(135deg, #888888, #AAAAAA)";
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