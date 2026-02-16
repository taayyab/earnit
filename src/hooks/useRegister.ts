import { useMemo, useState, type ChangeEvent } from "react";
import {
  Briefcase,
  ClipboardCheck,
  Scale,
  Shield,
  User,
  Users,
} from "lucide-react";

type RoleView = "choice" | "veteran" | "agent";
type Representation = "earnedit" | "vso" | "accredited" | "diy" | null;
type AgentType = "attorney" | "claims-agent" | "vso-rep" | null;

const ROLE_OPTIONS = [
  {
    id: "veteran",
    title: "I'm a Veteran",
    description: "Get help with your VA disability claim",
    icon: User,
    descriptionClassName: "text-slate-400",
  },
  {
    id: "agent",
    title: "I'm a Claims Agent",
    description: "Provide professional representation services to veterans",
    icon: Briefcase,
    descriptionClassName: "text-slate-500",
  },
] as const;

const REPRESENTATION_OPTIONS = [
  {
    id: "earnedit",
    title: "EarnedIT Claims Assistance",
    badge: "Pending VA Accreditation",
    description: "AI-powered claims preparation with professional oversight",
    details: [
      "AI-assisted document analysis",
      "Condition extraction & evidence mapping",
      "Pre-submission quality review",
      "Supervised by accredited partners",
    ],
    icon: Shield,
  },
  {
    id: "vso",
    title: "Veterans Service Organization (VSO)",
    badge: undefined,
    description: "Work with an established VSO for your claim",
    details: [
      "Free representation services",
      "Local VSO office support",
      "Accredited VSO representatives",
      "In-person assistance available",
    ],
    icon: Users,
  },
  {
    id: "accredited",
    title: "Accredited Claims Agent",
    badge: undefined,
    description: "Hire a VA-accredited claims agent",
    details: [
      "Professional legal representation",
      "VA-accredited agent/attorney",
      "May charge contingency fees",
      "Appeals expertise",
    ],
    icon: Scale,
  },
  {
    id: "diy",
    title: "Self-Managed (DIY)",
    badge: undefined,
    description: "File your claim independently",
    details: [
      "Full platform access",
      "Document organization tools",
      "Condition tracking",
      "Educational resources",
    ],
    icon: ClipboardCheck,
  },
] as const;

const AGENT_TYPE_OPTIONS = [
  {
    id: "attorney",
    title: "VA Attorney",
    description:
      "Licensed attorney accredited by the VA Office of General Counsel",
    icon: Scale,
  },
  {
    id: "claims-agent",
    title: "VA Claims Agent",
    description:
      "Non-attorney claims agent accredited by the VA Office of General Counsel",
    icon: ClipboardCheck,
  },
  {
    id: "vso-rep",
    title: "VSO Representative",
    description:
      "Representative authorized by a Veterans Service Organization",
    icon: Users,
  },
] as const;

const BAR_STATE_OPTIONS = [
  { value: "", label: "Select state..." },
  { value: "AL", label: "Alabama" },
  { value: "CA", label: "California" },
  { value: "FL", label: "Florida" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
] as const;

const useRegister = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [roleView, setRoleView] = useState<RoleView>("choice");
  const [representation, setRepresentation] = useState<Representation>(null);
  const [earneditConfirmed, setEarneditConfirmed] = useState(false);
  const [agentType, setAgentType] = useState<AgentType>(null);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isStrongPassword = (value: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(value);

  const isFormComplete = useMemo(() => {
    const firstNameValid = formValues.firstName.trim().length > 0;
    const lastNameValid = formValues.lastName.trim().length > 0;
    const emailValid = isValidEmail(formValues.email.trim());
    const passwordValid = isStrongPassword(formValues.password);
    const confirmValid =
      formValues.confirmPassword.trim().length > 0 &&
      formValues.confirmPassword === formValues.password;

    return (
      firstNameValid &&
      lastNameValid &&
      emailValid &&
      passwordValid &&
      confirmValid
    );
  }, [formValues]);

  const handleInputChange =
    (field: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleContinue = () => {
    if (!isFormComplete) return;
    setStep(2);
  };

  const handleRepresentationSelect = (value: NonNullable<Representation>) => {
    setRepresentation(value);
    if (value !== "earnedit") {
      setEarneditConfirmed(false);
    }
  };

  const handleAgentTypeSelect = (
    value: NonNullable<AgentType>,
    moveToCredentials = false,
  ) => {
    setAgentType(value);
    if (moveToCredentials) {
      setStep(3);
    }
  };

  const selectRole = (role: Exclude<RoleView, "choice">) => {
    setRoleView(role);
    if (role === "veteran") {
      setRepresentation(null);
    }
    if (role === "agent") {
      setAgentType(null);
    }
    setStep(2);
  };

  const backToAccount = () => {
    setRoleView("choice");
    setStep(1);
  };

  const backToChoice = () => {
    setRoleView("choice");
  };

  const backToStepTwo = () => {
    setStep(2);
  };

  const goToCredentials = () => {
    if (agentType) {
      setStep(3);
    }
  };

  const proceedFromRepresentation = () => {
    if (
      !representation ||
      (representation === "earnedit" && !earneditConfirmed)
    ) {
      return;
    }

    if (representation === "vso") {
      setAgentType("vso-rep");
      setStep(3);
      return;
    }
    if (representation === "accredited") {
      setAgentType("claims-agent");
      setStep(3);
    }
  };

  const steps =
    roleView === "agent"
      ? ["Account Info", "Agent Type", "Credentials"]
      : roleView === "veteran" &&
          (representation === "vso" || representation === "accredited")
        ? ["Account Info", "Representation", "Credentials"]
        : ["Account Info", "Representation"];
  const currentStepIndex = Math.min(step, steps.length) - 1;
  const isRepresentationActionDisabled =
    !representation || (representation === "earnedit" && !earneditConfirmed);
  const representationActionLabel =
    representation === "earnedit" || representation === "diy"
      ? "Create Account"
      : "Continue";

  return {
    step,
    roleView,
    representation,
    earneditConfirmed,
    agentType,
    formValues,
    isFormComplete,
    steps,
    currentStepIndex,
    isRepresentationActionDisabled,
    representationActionLabel,
    roleOptions: ROLE_OPTIONS,
    representationOptions: REPRESENTATION_OPTIONS,
    agentTypeOptions: AGENT_TYPE_OPTIONS,
    barStateOptions: BAR_STATE_OPTIONS,
    handleInputChange,
    handleContinue,
    handleRepresentationSelect,
    handleAgentTypeSelect,
    selectRole,
    backToAccount,
    backToChoice,
    backToStepTwo,
    goToCredentials,
    proceedFromRepresentation,
    setEarneditConfirmed,
  };
};

export default useRegister;
