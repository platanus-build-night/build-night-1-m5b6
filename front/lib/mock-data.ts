import type { Category, FeaturedHeadline } from "./types";

export const mockFeaturedHeadline: FeaturedHeadline = {
  headline:
    "Global Reforestation Efforts Exceed Targets for Third Consecutive Year",
  digest:
    "Communities worldwide have planted over 2 billion trees, restoring critical ecosystems and demonstrating unprecedented environmental cooperation.",
};

export const mockCategories: Category[] = [
  {
    id: "nature",
    name: "Nature",
    gradient: "linear-gradient(135deg, #BDFCC9, #D4F5E8, #FFFACD)",
    icon: "GlobeAltIcon",
    articles: [
      {
        id: "nature-1",
        title: "Ocean Cleanup Project Removes 100,000 Tons of Plastic",
        summary:
          "Innovative technology successfully clears massive amounts of ocean waste, revitalizing marine ecosystems.",
        content: "",
        date: "Today",
      },
      {
        id: "nature-2",
        title: "Endangered Species Population Rebounds in Protected Areas",
        summary:
          "Conservation efforts show remarkable success as multiple endangered species show population growth.",
        content: "",
        date: "Yesterday",
      },
      {
        id: "nature-3",
        title: "New Coral Reef Restoration Technique Shows 90% Success Rate",
        summary:
          "Scientists develop breakthrough method to rapidly regrow damaged coral reefs.",
        content: "",
        date: "2 days ago",
      },
    ],
  },
  {
    id: "social",
    name: "Social",
    gradient: "linear-gradient(135deg, #FFDAC1, #FFEBC1, #FFF4C1)",
    icon: "UserGroupIcon",
    articles: [
      {
        id: "social-1",
        title: "Community Food Sharing App Reduces Waste by 75%",
        summary:
          "Neighborhood initiative connects surplus food with those in need, dramatically cutting food waste.",
        content: "",
        date: "Today",
      },
      {
        id: "social-2",
        title: "Volunteer Program Helps 10,000 Seniors Combat Loneliness",
        summary:
          "Intergenerational friendship initiative creates meaningful connections across age groups.",
        content: "",
        date: "Yesterday",
      },
      {
        id: "social-3",
        title: "Universal Basic Income Pilot Shows Promising Results",
        summary:
          "Early data indicates improvements in mental health, entrepreneurship, and community engagement.",
        content: "",
        date: "3 days ago",
      },
    ],
  },
  {
    id: "science",
    name: "Science",
    gradient: "linear-gradient(135deg, #CFDFFF, #C1EEFF, #C4F5F5)",
    icon: "BeakerIcon",
    articles: [
      {
        id: "science-1",
        title: "New Cancer Treatment Shows 80% Remission Rate in Trials",
        summary:
          "Breakthrough immunotherapy approach offers hope for previously untreatable cancer types.",
        content: "",
        date: "Today",
      },
      {
        id: "science-2",
        title:
          "Quantum Computing Milestone Achieved Years Ahead of Predictions",
        summary:
          "Researchers demonstrate practical quantum advantage solving previously impossible problems.",
        content: "",
        date: "2 days ago",
      },
      {
        id: "science-3",
        title: "Biodegradable Plastic Alternative Decomposes in Just 3 Weeks",
        summary:
          "New plant-based material offers identical performance to conventional plastics without environmental harm.",
        content: "",
        date: "4 days ago",
      },
    ],
  },
  {
    id: "technology",
    name: "Technology",
    gradient: "linear-gradient(135deg, #E1C4F5, #D5C9F0, #CED3F5)",
    icon: "CpuChipIcon",
    articles: [
      {
        id: "tech-1",
        title: "Solar Panel Efficiency Breakthrough Cuts Costs by 60%",
        summary:
          "New manufacturing technique makes renewable energy more accessible worldwide.",
        content: "",
        date: "Today",
      },
      {
        id: "tech-2",
        title: "AI System Predicts and Prevents Infrastructure Failures",
        summary:
          "Smart monitoring technology saves lives by detecting potential failures before they occur.",
        content: "",
        date: "Yesterday",
      },
      {
        id: "tech-3",
        title: "Open Source Medical Devices Expand Healthcare Access",
        summary:
          "Collaborative design reduces costs of essential medical equipment by 90% in developing regions.",
        content: "",
        date: "3 days ago",
      },
    ],
  },
  {
    id: "health",
    name: "Health",
    gradient: "linear-gradient(135deg, #FCDAE5, #FCE0E0, #FFDBC1)",
    icon: "HeartIcon",
    articles: [
      {
        id: "health-1",
        title: "Meditation App Shows Measurable Brain Health Improvements",
        summary:
          "Regular users demonstrate enhanced cognitive function and stress resilience in clinical study.",
        content: "",
        date: "Today",
      },
      {
        id: "health-2",
        title: "Plant-Based Diet Reduces Heart Disease Risk by 40%",
        summary:
          "Large-scale study confirms significant health benefits from simple dietary changes.",
        content: "",
        date: "2 days ago",
      },
      {
        id: "health-3",
        title:
          "Virtual Reality Therapy Reduces Chronic Pain Without Medication",
        summary:
          "Non-pharmaceutical approach offers new hope for long-term pain management.",
        content: "",
        date: "4 days ago",
      },
    ],
  },
  {
    id: "arts",
    name: "Arts",
    gradient: "linear-gradient(135deg, #C4E7E1, #D0F0D0, #E5F5E0)",
    icon: "PaintBrushIcon",
    articles: [
      {
        id: "arts-1",
        title: "Community Mural Project Transforms Urban Neighborhood",
        summary:
          "Collaborative art initiative reduces crime rates and increases community pride.",
        content: "",
        date: "Today",
      },
      {
        id: "arts-2",
        title: "Music Therapy Program Helps Children with Autism Communicate",
        summary:
          "Innovative approach shows remarkable results in developing social and language skills.",
        content: "",
        date: "Yesterday",
      },
      {
        id: "arts-3",
        title: "Digital Museum Makes Art Accessible to Remote Communities",
        summary:
          "Virtual reality exhibits bring world-class art to people without access to museums.",
        content: "",
        date: "3 days ago",
      },
    ],
  },
];
