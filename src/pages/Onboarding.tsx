import {
  Calendar,
  CheckCircle2,
  Heart,
  Map,
  MapPin,
  Phone,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import DemoBanner from "../components/onboarding/DemoBanner";
import FooterNav from "../components/onboarding/FooterNav";
import GradientIcon from "../components/onboarding/GradientIcon";
import InfoCard from "../components/onboarding/InfoCard";
import OnboardingHeader from "../components/onboarding/OnboardingHeader";
import ProgressBar from "../components/onboarding/ProgressBar";
import SelectField from "../components/onboarding/SelectField";
import StepTitle from "../components/onboarding/StepTitle";
import TextField from "../components/onboarding/TextField";
import useOnboarding from "../hooks/useOnboarding";

const getTierLabel = (tier: string) => {
  switch (tier) {
    case "full_advocate":
      return "Full Advocate";
    case "claims_guide":
      return "Claims Guide";
    case "community_support":
      return "Community Support";
    default:
      return tier;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "full_advocate":
      return "bg-emerald-100 text-emerald-700";
    case "claims_guide":
      return "bg-blue-100 text-blue-700";
    case "community_support":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const Onboarding = () => {
  const {
    totalSteps,
    currentStep,
    showDemoBanner,
    progressPercent,
    interactionStyles,
    focusAreas,
    cadenceOptions,
    goals,
    resources,
    advocates,
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
    handleBack,
    handlePrimaryAction,
    toggleFocusArea,
    toggleGoal,
    onExitDemo,
    onDismissDemo,
  } = useOnboarding();

  const userName = localStorage.getItem("userName") || "Marcus";

  return (
    <div className="min-h-screen bg-white">
      <DemoBanner
        show={showDemoBanner}
        onExit={onExitDemo}
        onDismiss={onDismissDemo}
      />

      <OnboardingHeader />

      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        progressPercent={progressPercent}
      />

      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        {currentStep === 1 ? (
          <>
            <GradientIcon icon={Heart} />
            <StepTitle
              title="Welcome to EarnedIT"
              subtitle="You've earned every benefit. We're here to help you get them."
            />

            <div className="relative mt-12 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A574] to-[#C97B63]">
              <Heart className="h-10 w-10 text-white" />
              <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
            </div>

            <h2 className="mt-8 text-4xl font-bold">Welcome Home, {userName.split(" ")[0]}</h2>
            <p className="mt-4 text-lg text-[#65758b] leading-relaxed">
              Thank you for your service. EarnedIT is here to help you navigate
              the VA disability claims process. In the next few steps,
              we&apos;ll gather some information to match you with the perfect
              peer advocate.
            </p>
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <GradientIcon icon={User} />
            <StepTitle
              title="Personal Information"
              subtitle="Help us reach you and connect you with local resources"
            />

            <InfoCard className="mt-6">
              <p className="text-center text-lg text-[#65758b]">
                This information helps us connect you with local resources and
                reach you when needed.
              </p>
            </InfoCard>

            <div className="mt-8 w-full text-left">
              <TextField
                label="Phone Number"
                placeholder="(555) 123-4567"
                icon={Phone}
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              />
              <hr className="mt-4 text-slate-200" />
              <div className="mt-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-slate-500" />
                Mailing Address
              </div>
              <div className="mt-4 space-y-4">
                <TextField
                  label="Street Address"
                  placeholder="123 Main Street"
                  value={personalInfo.street}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, street: e.target.value })}
                />
                <TextField
                  label="Apt, Suite, Unit (optional)"
                  placeholder="Apt 4B"
                  value={personalInfo.apt}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, apt: e.target.value })}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <TextField
                    label="City"
                    placeholder="City"
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                  />
                  <TextField
                    label="State"
                    placeholder="TX"
                    value={personalInfo.state}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                  />
                  <TextField
                    label="ZIP Code"
                    placeholder="78701"
                    value={personalInfo.zip}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, zip: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </>
        ) : null}

        {currentStep === 3 ? (
          <>
            <GradientIcon icon={Shield} />
            <StepTitle
              title="Your Service"
              subtitle="Tell us about your military service"
            />

            <InfoCard className="mt-6">
              <p className="text-center text-[#65758b] text-lg">
                Your service information helps us match you with advocates who
                share similar experiences.
              </p>
            </InfoCard>

            <div className="mt-8 w-full text-left space-y-5">
              <SelectField
                label="Branch of Service"
                value={serviceInfo.branch}
                onChange={(e) => setServiceInfo({ ...serviceInfo, branch: e.target.value })}
                options={[
                  "Select branch",
                  "Army",
                  "Navy",
                  "Air Force",
                  "Marine Corps",
                  "Coast Guard",
                  "Space Force",
                ]}
              />
              <SelectField
                label="Service Era"
                value={serviceInfo.era}
                onChange={(e) => setServiceInfo({ ...serviceInfo, era: e.target.value })}
                options={[
                  "Select era",
                  "Post 9/11",
                  "Gulf War",
                  "Vietnam",
                  "Korea",
                  "World War II",
                ]}
              />
              <SelectField
                label="Discharge Status"
                value={serviceInfo.dischargeStatus}
                onChange={(e) => setServiceInfo({ ...serviceInfo, dischargeStatus: e.target.value })}
                options={[
                  "Select discharge status",
                  "Honorable",
                  "General (Under Honorable Conditions)",
                  "Other Than Honorable",
                  "Bad Conduct",
                  "Dishonorable",
                ]}
                helper="This helps us understand your eligibility for VA benefits."
              />
            </div>
          </>
        ) : null}

        {currentStep === 4 ? (
          <>
            <GradientIcon icon={UserPlus} />
            <StepTitle
              title="Your Family Information"
              subtitle="This helps us calculate your potential benefits"
            />

            <InfoCard className="mt-6">
              <p className="text-center text-[#65758b]">
                VA benefits are calculated based on your dependents. This
                information helps us estimate your potential benefits
                accurately.
              </p>
            </InfoCard>

            <div className="mt-8 w-full text-left space-y-6">
              <label className="flex items-center gap-3 text-slate-700 font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-base">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300"
                  checked={familyInfo.hasSpouse}
                  onChange={(e) => setFamilyInfo({ ...familyInfo, hasSpouse: e.target.checked })}
                />
                I have a spouse
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Number of Dependent Children"
                  placeholder="0"
                  helper="Children under 18 or in school"
                  value={familyInfo.dependentChildren}
                  onChange={(e) => setFamilyInfo({ ...familyInfo, dependentChildren: e.target.value })}
                />
                <TextField
                  label="Children Over 18 in School"
                  placeholder="0"
                  helper="Ages 18-23 attending school full-time"
                  value={familyInfo.childrenInSchool}
                  onChange={(e) => setFamilyInfo({ ...familyInfo, childrenInSchool: e.target.value })}
                />
              </div>

              <TextField
                label="Number of Dependent Parents"
                placeholder="0"
                helper="Parents who depend on you for financial support"
                value={familyInfo.dependentParents}
                onChange={(e) => setFamilyInfo({ ...familyInfo, dependentParents: e.target.value })}
              />

              <div className="rounded-lg border-2 border-[#D4A574]/30 px-6 py-4 text-sm text-slate-700">
                <label className="flex items-start gap-3 font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-base">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                    checked={familyInfo.qualifiesForSmc}
                    onChange={(e) => setFamilyInfo({ ...familyInfo, qualifiesForSmc: e.target.checked })}
                  />
                  <span>
                    I may qualify for Special Monthly Compensation (SMC)
                    <span className="block text-xs text-[#65758b]">
                      For loss of use of limb, blindness, need for aid and
                      attendance, or housebound status
                    </span>
                  </span>
                </label>
                {familyInfo.qualifiesForSmc ? (
                  <div className="mt-4 pl-7">
                    <SelectField
                      label="SMC Type"
                      value={familyInfo.smcType}
                      onChange={(e) => setFamilyInfo({ ...familyInfo, smcType: e.target.value })}
                      options={[
                        "Select type",
                        "SMC-K (Loss of use)",
                        "SMC-L (Aid and Attendance)",
                        "SMC-S (Housebound)",
                        "SMC-R (Higher level A&A)",
                      ]}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        {currentStep === 5 ? (
          <>
            <GradientIcon icon={SlidersHorizontal} />
            <StepTitle
              title="Matching Preferences"
              subtitle="Help us find the right peer advocate for you"
            />

            <InfoCard className="mt-6">
              <p className="text-center text-[#65758b] text-lg">
                These preferences help us find an advocate whose style matches
                your needs.
              </p>
            </InfoCard>

            <div className="mt-8 w-full text-left space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h4 className="font-semibold mb-4">
                  Advocate Matching Preferences
                </h4>
                <div className="mt-4 space-y-4 text-sm text-slate-700">
                  <label className="flex items-center gap-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300"
                      checked={preferences.sameBranch}
                      onChange={(e) => setPreferences({ ...preferences, sameBranch: e.target.checked })}
                    />
                    Prefer advocate from same service branch
                    {serviceInfo.branch && serviceInfo.branch !== "Select branch" && (
                      <span className="text-[#D4A574]">({serviceInfo.branch})</span>
                    )}
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300"
                      checked={preferences.sameEra}
                      onChange={(e) => setPreferences({ ...preferences, sameEra: e.target.checked })}
                    />
                    Prefer advocate from same service era
                    {serviceInfo.era && serviceInfo.era !== "Select era" && (
                      <span className="text-[#D4A574]">({serviceInfo.era})</span>
                    )}
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300"
                      checked={preferences.sameConditions}
                      onChange={(e) => setPreferences({ ...preferences, sameConditions: e.target.checked })}
                    />
                    Prefer advocate with experience in my specific conditions
                  </label>
                </div>
              </div>

              <div>
                <p className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base font-semibold mb-3 block">
                  Interaction Style
                </p>
                <p className="text-sm text-[#65758b] mb-3">
                  How do you prefer to receive guidance?
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {interactionStyles.map((item) => {
                    const isSelected = selectedInteractionStyle === item.title;
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setSelectedInteractionStyle(item.title)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? "border-[#D4A574] bg-[#D4A574]/10"
                            : "border-[#e5e7eb] hover:border-[#D4A574]/50"
                        }`}
                      >
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-[#65758b] mt-1">
                          {item.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base font-semibold mb-3 block">
                  Area of Focus
                </p>
                <p className="text-sm text-[#65758b] mb-3">
                  What type of support do you need? (Select all that apply)
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {focusAreas.map((chip) => {
                    const isSelected = selectedFocusAreas.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleFocusArea(chip)}
                        className={`px-4 py-2 border-2 rounded-full text-sm transition-all ${
                          isSelected
                            ? "bg-[#D4A574] border-[#D4A574] text-white"
                            : "border-[#e5e7eb] hover:border-[#D4A574]/50 text-[#21252b]"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base font-semibold mb-3 block">
                  Preferred Cadence
                </p>
                <p className="text-sm text-[#65758b] mb-3">
                  How often would you like to connect with your advocate?
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {cadenceOptions.map((item) => {
                    const isSelected = selectedCadence === item.title;
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setSelectedCadence(item.title)}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          isSelected
                            ? "border-[#D4A574] bg-[#D4A574]/10"
                            : "border-[#e5e7eb] hover:border-[#D4A574]/50"
                        }`}
                      >
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-[#65758b] mt-1">
                          {item.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {currentStep === 6 ? (
          <>
            <GradientIcon icon={Users} iconClassName="text-[#21252b]" />
            <StepTitle
              title="Choose Your Advocate"
              subtitle="Select a peer advocate to guide your journey"
            />

            <p className="text-[#65758b] mt-2">
              Based on your preferences, here are the top matches for you.
            </p>

            <div className="mt-8 w-full space-y-4">
              {advocates.map((advocate) => {
                const isSelected = selectedAdvocate?.id === advocate.id;
                return (
                  <button
                    key={advocate.id}
                    type="button"
                    onClick={() => setSelectedAdvocate(advocate)}
                    className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? "border-[#D4A574] bg-[#D4A574]/5"
                        : "border-slate-200 hover:border-[#D4A574]/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B9D83] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {advocate.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-slate-900 text-lg">{advocate.name}</h3>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                            {advocate.matchScore}% Match
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span>{advocate.branch}</span>
                          <span>•</span>
                          <span>{advocate.era}</span>
                          <span>•</span>
                          <span>{advocate.yearsExperience} years exp.</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getTierColor(advocate.tier)}`}>
                            {getTierLabel(advocate.tier)}
                          </span>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="font-medium">{advocate.rating}</span>
                            <span className="text-slate-400">({advocate.reviewCount} reviews)</span>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600 line-clamp-2">{advocate.bio}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {advocate.specialties.slice(0, 3).map((specialty) => (
                            <span
                              key={specialty}
                              className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                            >
                              {specialty}
                            </span>
                          ))}
                          {advocate.specialties.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                              +{advocate.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-[#D4A574]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {currentStep === 7 ? (
          <>
            <GradientIcon icon={Calendar} />
            <StepTitle
              title="Schedule Your First Touchpoint"
              subtitle={selectedAdvocate ? `Connect with ${selectedAdvocate.name}` : "Pick a time for your first conversation"}
            />

            <InfoCard className="mt-6">
              <p className="text-center text-[#65758b]">
                {selectedAdvocate
                  ? `Schedule your first conversation with ${selectedAdvocate.name}. This is a great opportunity to get to know each other and discuss your goals.`
                  : "Schedule your first conversation with your peer advocate. This is a great opportunity to get to know each other and discuss your goals."}
              </p>
            </InfoCard>

            {selectedAdvocate && (
              <div className="mt-6 w-full p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B9D83] flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedAdvocate.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedAdvocate.name}</p>
                    <p className="text-sm text-slate-500">
                      Available: {selectedAdvocate.availability.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 w-full text-left space-y-5">
              <SelectField
                label="Meeting Type"
                value={scheduling.meetingType}
                onChange={(e) => setScheduling({ ...scheduling, meetingType: e.target.value })}
                options={["Video Call", "Phone Call", "In Person"]}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Preferred Date"
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={scheduling.preferredDate}
                  onChange={(e) => setScheduling({ ...scheduling, preferredDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
                <TextField
                  label="Preferred Time"
                  type="time"
                  placeholder="--:--"
                  value={scheduling.preferredTime}
                  onChange={(e) => setScheduling({ ...scheduling, preferredTime: e.target.value })}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Don&apos;t worry if the time doesn&apos;t work - your advocate
                will reach out to confirm a time that works for both of you.
              </p>
            </div>
          </>
        ) : null}

        {currentStep === 8 ? (
          <>
            <GradientIcon icon={Target} />
            <StepTitle
              title="Set Your Goals"
              subtitle="What do you hope to achieve?"
            />

            <InfoCard className="mt-6">
              <p className="text-center text-[#65758b] text-lg">
                What would you like to accomplish? Select all that apply - this
                helps us personalize your experience.
              </p>
            </InfoCard>

            <div className="mt-8 w-full space-y-3 text-left">
              {goals.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all flex items-center gap-3 font-medium ${
                      isSelected
                        ? "border-[#D4A574] bg-[#D4A574]/10"
                        : "border-[#e5e7eb] hover:border-[#D4A574]/50"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-[#D4A574] bg-[#D4A574] text-white"
                          : "border-slate-400"
                      }`}
                    >
                      {isSelected ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      ) : null}
                    </span>
                    {goal}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {currentStep === 9 ? (
          <>
            <GradientIcon icon={Map} />
            <StepTitle
              title="Community Resources"
              subtitle="See what support is available"
            />

            <InfoCard className="mt-6">
              <p className="text-center text-[#65758b] text-lg">
                Here are some resources available to you as part of the EarnedIT
                community.
              </p>
            </InfoCard>

            <div className="mt-8 w-full grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
              {resources.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border bg-white text-card-foreground shadow border-[#D4A574]/30"
                  >
                    <div className="p-6 pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-[#D4A574]" />
                        </div>
                        <h2 className="font-semibold">{item.title}</h2>
                      </div>
                      <p className="text-sm text-[#65758b]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {currentStep === 10 ? (
          <>
            <GradientIcon icon={CheckCircle2} />
            <StepTitle
              title="You're All Set!"
              subtitle="Let's start your journey"
            />

            <div className="mt-10 flex h-24 w-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#8B9D83] items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>

            <h2 className="mt-8 text-4xl font-bold">You&apos;re All Set!</h2>
            <p className="mt-4 text-lg text-[#65758b]">
              {selectedAdvocate
                ? `${selectedAdvocate.name} will be reaching out to you soon to schedule your first meeting.`
                : "We're matching you with the perfect peer advocate. You'll receive a notification once we find your match."}
            </p>

            {selectedAdvocate && (
              <div className="mt-8 w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-sm text-left">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Your Advocate</h3>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B9D83] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {selectedAdvocate.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{selectedAdvocate.name}</p>
                      <p className="text-sm text-slate-500">{selectedAdvocate.branch} • {selectedAdvocate.era}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium">{selectedAdvocate.rating}</span>
                        <span className="text-sm text-slate-400">({selectedAdvocate.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedGoalsDisplay.length > 0 ? (
              <div className="mt-6 w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-sm text-left">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Your Goals
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    {selectedGoalsDisplay.map((goal) => (
                      <li key={goal} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {scheduling.preferredDate && (
              <div className="mt-6 w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-sm text-left">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Scheduled Meeting</h3>
                  <div className="mt-4 flex items-center gap-3 text-slate-700">
                    <Calendar className="h-5 w-5 text-[#D4A574]" />
                    <span>{scheduling.meetingType} on {scheduling.preferredDate} {scheduling.preferredTime && `at ${scheduling.preferredTime}`}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}

        <FooterNav
          onBack={handleBack}
          onPrimary={handlePrimaryAction}
          primaryLabel={
            currentStep === totalSteps ? "Go to Dashboard" : "Continue"
          }
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      </main>
    </div>
  );
};

export default Onboarding;
