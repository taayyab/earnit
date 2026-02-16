import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, MapPin, ShieldCheck, Users } from "lucide-react";
import { advocatesApi } from "../lib/api";

const interactionStyles = [
  {
    title: "Supportive & Encouraging",
    subtitle: "I prefer gentle guidance and emotional support",
  },
  {
    title: "Direct & Straightforward",
    subtitle: "I prefer clear, no-nonsense communication",
  },
  {
    title: "Detailed & Thorough",
    subtitle: "I like step-by-step explanations",
  },
  {
    title: "Flexible / No Preference",
    subtitle: "I'm open to any style",
  },
];

const focusAreas = [
  "Military Transition",
  "VA Claims Process",
  "Peer Connection & Friendship",
  "Quality of Life",
  "Employment & Career",
  "Education & Training",
  "Family Support",
  "Financial Wellness",
];

const cadenceOptions = [
  { title: "Weekly", subtitle: "Touch base every week" },
  { title: "Bi-Weekly", subtitle: "Check in every two weeks" },
  { title: "Monthly", subtitle: "Meet once a month" },
  { title: "As Needed", subtitle: "Reach out when I have questions" },
];

const goals = [
  "File my initial VA disability claim",
  "Increase my current disability rating",
  "Appeal a VA decision",
  "Add secondary conditions to my claim",
  "Better understand my VA benefits",
  "Get mental health support",
  "Connect with other veterans",
  "Find employment assistance",
];

const resources = [
  {
    title: "Veteran Advocate Community",
    description:
      "Connect with fellow veterans who understand your journey. Share experiences and get advice.",
    icon: Users,
  },
  {
    title: "Claims Assistance",
    description:
      "Expert help navigating the VA claims process from start to finish.",
    icon: ShieldCheck,
  },
  {
    title: "Benefits Calculator",
    description:
      "Estimate your potential VA disability benefits based on your conditions.",
    icon: Landmark,
  },
  {
    title: "Local Resources",
    description:
      "Find VA facilities, VSOs, and veteran support organizations near you.",
    icon: MapPin,
  },
];

export interface Advocate {
  id: string;
  name: string;
  branch: string;
  era: string;
  yearsExperience: number;
  specialties: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  tier: "community_support" | "claims_guide" | "full_advocate";
  availability: string[];
  interactionStyle: string;
  matchScore?: number;
}

const advocates: Advocate[] = [
  {
    id: "7173bc5e-cdf2-4792-8e7d-2eb630489e80",
    name: "Sarah Mitchell",
    branch: "Army",
    era: "Post 9/11",
    yearsExperience: 8,
    specialties: ["PTSD", "TBI", "VA Claims Process", "Mental Health Support"],
    bio: "Army veteran with 12 years of service. Successfully navigated my own VA claims journey and now help fellow veterans get the benefits they've earned. Specializing in PTSD and TBI claims.",
    rating: 4.9,
    reviewCount: 127,
    tier: "full_advocate",
    availability: ["Weekly", "Bi-Weekly"],
    interactionStyle: "Supportive & Encouraging",
  },
  {
    id: "ab99a4b9-bf87-4cb9-82cc-06874bf666e9",
    name: "James Rodriguez",
    branch: "Marines",
    era: "Post 9/11",
    yearsExperience: 6,
    specialties: ["Military Transition", "Employment & Career", "VA Claims Process"],
    bio: "Former Marine infantryman who understands the challenges of transitioning to civilian life. I focus on helping veterans find their path after service while maximizing their VA benefits.",
    rating: 4.8,
    reviewCount: 89,
    tier: "claims_guide",
    availability: ["Weekly", "Bi-Weekly", "Monthly"],
    interactionStyle: "Direct & Straightforward",
  },
  {
    id: "9e3b6449-9ef7-4067-9dab-43fc85cfb196",
    name: "Maria Santos",
    branch: "Navy",
    era: "Gulf War",
    yearsExperience: 12,
    specialties: ["Family Support", "Financial Wellness", "Education & Training"],
    bio: "Navy veteran and mother of three. I specialize in helping veteran families navigate benefits and build financial stability. Let me guide you through the process step by step.",
    rating: 4.9,
    reviewCount: 156,
    tier: "full_advocate",
    availability: ["Bi-Weekly", "Monthly", "As Needed"],
    interactionStyle: "Detailed & Thorough",
  },
  {
    id: "72ac4bb3-8961-4e41-9a22-3bb855dbb8ff",
    name: "David Thompson",
    branch: "Air Force",
    era: "Post 9/11",
    yearsExperience: 5,
    specialties: ["Quality of Life", "Peer Connection & Friendship", "Mental Health Support"],
    bio: "Air Force veteran passionate about veteran wellness. I believe in the power of peer connection and am here to support you through your claims journey and beyond.",
    rating: 4.7,
    reviewCount: 64,
    tier: "community_support",
    availability: ["Weekly", "As Needed"],
    interactionStyle: "Supportive & Encouraging",
  },
  {
    id: "37807e39-d6d2-44fe-a10a-2cd9e3d8dae1",
    name: "Angela Williams",
    branch: "Army",
    era: "Vietnam",
    yearsExperience: 15,
    specialties: ["VA Claims Process", "Appeals", "Agent Orange Claims"],
    bio: "Retired Army nurse with extensive experience in VA healthcare and claims. I've helped hundreds of veterans navigate complex claims and appeals over the past 15 years.",
    rating: 5.0,
    reviewCount: 203,
    tier: "full_advocate",
    availability: ["Monthly", "As Needed"],
    interactionStyle: "Detailed & Thorough",
  },
  {
    id: "f5f72db1-6b1c-4b6b-b0c7-b46dcf7c040c",
    name: "Michael Chen",
    branch: "Coast Guard",
    era: "Post 9/11",
    yearsExperience: 4,
    specialties: ["Military Transition", "Education & Training", "Employment & Career"],
    bio: "Coast Guard veteran now working in tech. I help veterans leverage their GI Bill benefits and transition into civilian careers. Direct advice, no fluff.",
    rating: 4.6,
    reviewCount: 42,
    tier: "claims_guide",
    availability: ["Weekly", "Bi-Weekly"],
    interactionStyle: "Direct & Straightforward",
  },
];

const useOnboarding = () => {
  const totalSteps = 10;
  const [currentStep, setCurrentStep] = useState(1);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const navigate = useNavigate();

  const [personalInfo, setPersonalInfo] = useState({
    phone: "",
    street: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
  });

  const [serviceInfo, setServiceInfo] = useState({
    branch: "",
    era: "",
    dischargeStatus: "",
  });

  const [familyInfo, setFamilyInfo] = useState({
    hasSpouse: false,
    dependentChildren: "",
    childrenInSchool: "",
    dependentParents: "",
    qualifiesForSmc: false,
    smcType: "",
  });

  const [preferences, setPreferences] = useState({
    sameBranch: false,
    sameEra: false,
    sameConditions: false,
  });

  const [selectedInteractionStyle, setSelectedInteractionStyle] = useState<string | null>(null);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [selectedCadence, setSelectedCadence] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);

  const [scheduling, setScheduling] = useState({
    meetingType: "Video Call",
    preferredDate: "",
    preferredTime: "",
  });

  const matchedAdvocates = useMemo(() => {
    return advocates
      .map((advocate) => {
        let score = 50;

        if (preferences.sameBranch && serviceInfo.branch && advocate.branch === serviceInfo.branch) {
          score += 20;
        }

        if (preferences.sameEra && serviceInfo.era && advocate.era === serviceInfo.era) {
          score += 15;
        }

        if (selectedInteractionStyle && advocate.interactionStyle === selectedInteractionStyle) {
          score += 15;
        }

        if (selectedCadence && advocate.availability.includes(selectedCadence)) {
          score += 10;
        }

        const matchingSpecialties = selectedFocusAreas.filter((area) =>
          advocate.specialties.some((s) => s.toLowerCase().includes(area.toLowerCase()) || area.toLowerCase().includes(s.toLowerCase()))
        );
        score += matchingSpecialties.length * 5;

        score += advocate.rating * 2;

        score = Math.min(score, 99);

        return { ...advocate, matchScore: Math.round(score) };
      })
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 3);
  }, [serviceInfo, preferences, selectedInteractionStyle, selectedCadence, selectedFocusAreas]);

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrimaryAction = async () => {
    if (currentStep === totalSteps) {
      localStorage.setItem("onboardingComplete", "true");

      // Save advocate assignment to both localStorage and database
      if (selectedAdvocate) {
        localStorage.setItem("assignedAdvocate", JSON.stringify(selectedAdvocate));

        // Persist to database
        const userId = localStorage.getItem("userId");
        if (userId) {
          try {
            await advocatesApi.assign({
              veteranId: userId,
              advocateId: selectedAdvocate.id,
              matchScore: selectedAdvocate.matchScore,
            });
          } catch (err) {
            console.error("Failed to persist advocate assignment:", err);
            // Continue anyway - localStorage backup exists
          }
        }
      }

      navigate("/dashboard");
      return;
    }
    handleNext();
  };

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]
    );
  };

  const selectedGoalsDisplay = goals.filter((goal) => selectedGoals.includes(goal));

  return {
    totalSteps,
    currentStep,
    showDemoBanner,
    progressPercent,
    interactionStyles,
    focusAreas,
    cadenceOptions,
    goals,
    resources,
    advocates: matchedAdvocates,

    personalInfo,
    setPersonalInfo,
    serviceInfo,
    setServiceInfo,
    familyInfo,
    setFamilyInfo,
    preferences,
    setPreferences,
    selectedInteractionStyle,
    setSelectedInteractionStyle,
    selectedFocusAreas,
    selectedCadence,
    setSelectedCadence,
    selectedGoals,
    selectedGoalsDisplay,
    selectedAdvocate,
    setSelectedAdvocate,
    scheduling,
    setScheduling,

    setShowDemoBanner,
    handleNext,
    handleBack,
    handlePrimaryAction,
    toggleFocusArea,
    toggleGoal,
    onExitDemo: () => {
      localStorage.removeItem("authenticated");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isDemo");
      navigate("/login");
    },
    onDismissDemo: () => setShowDemoBanner(false),
  };
};

export default useOnboarding;
