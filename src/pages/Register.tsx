import { Link } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import BackButton from "../components/register/BackButton";
import SelectedCheck from "../components/register/SelectedCheck";
import Stepper from "../components/register/Stepper";
import UploadField from "../components/register/UploadField";
import useRegister from "../hooks/useRegister";

const Register = () => {
  const {
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
    roleOptions,
    representationOptions,
    agentTypeOptions,
    barStateOptions,
    handleInputChange,
    handleContinue,
    handleRepresentationSelect,
    handleAgentTypeSelect,
    selectRole,
    backToAccount,
    backToChoice,
    backToStepTwo,
    proceedFromRepresentation,
    goToCredentials,
    setEarneditConfirmed,
  } = useRegister();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stepper */}
        <Stepper steps={steps} currentIndex={currentStepIndex} />

        <div className="mt-10 flex justify-center">
          {step === 1 ? (
            <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-sm p-8">
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  Create Your Account
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Join EarnedIT to start your VA disability claim
                </p>
              </div>

              <form className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      value={formValues.firstName}
                      onChange={handleInputChange("firstName")}
                      className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={formValues.lastName}
                      onChange={handleInputChange("lastName")}
                      className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="veteran@example.com"
                    value={formValues.email}
                    onChange={handleInputChange("email")}
                    className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={formValues.password}
                    onChange={handleInputChange("password")}
                    className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={formValues.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <button
                  type="button"
                  disabled={!isFormComplete}
                  onClick={handleContinue}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation text-primary-foreground shadow min-h-14 px-5 py-3 text-base w-full text-white hover:bg-[#8F1B29] ${isFormComplete ? "bg-[#b2242e]" : "bg-[#8F1B29]"}`}
                >
                  Continue
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
                    className="lucide lucide-chevron-right ml-2 h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-slate-700 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          ) : roleView === "choice" ? (
            <div className="w-full max-w-2xl">
              <div className="text-center">
                <h1 className="text-xl font-semibold text-slate-900">
                  Tell Us About Yourself
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Select the option that best describes you
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectRole(option.id)}
                      className="rounded-xl border border-slate-200 bg-white px-8 py-4 text-left shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg ">
                          <Icon className="h-8 w-8 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {option.title}
                          </h3>
                          <p
                            className={`mt-1 text-sm ${option.descriptionClassName}`}
                          >
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <BackButton onClick={backToAccount} />
              </div>
            </div>
          ) : roleView === "veteran" && step === 2 ? (
            <div className="w-full max-w-4xl">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[#1B3A5F]">
                  Choose Your Representation
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Select how you&apos;d like to manage your VA disability claim
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {representationOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = representation === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleRepresentationSelect(option.id)}
                      className={`rounded-xl border-3 bg-white p-6 text-left shadow-sm transition-all ${
                        isSelected
                          ? "border-[#b2242e] ring-1 ring-rose-100"
                          : "border-white hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg  ${isSelected ? "bg-[#b2242e1a]" : "bg-slate-200"}`}
                          >
                            <Icon
                              className={`h-6 w-6  ${isSelected ? "text-[#b2242e]" : "text-slate-600"}`}
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {option.title}
                            </h3>
                            {option.badge ? (
                              <span className="mt-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                {option.badge}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-1">
                          {isSelected ? (
                            <SelectedCheck />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-[#65758b]">
                        {option.description}
                      </p>

                      <ul className="mt-4 space-y-2 text-xs text-slate-600">
                        {option.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              {representation === "earnedit" ? (
                <label className="mt-6 mx-auto flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900 max-w-xl">
                  <Clock className="h-4 w-4 shrink-0 text-slate-600" />
                  <input
                    type="checkbox"
                    checked={earneditConfirmed}
                    onChange={(event) =>
                      setEarneditConfirmed(event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 accent-amber-500"
                  />
                  <span>
                    I understand that EarnedIT is pending VA accreditation and
                    my claim preparation services will be supervised by
                    accredited partners.
                  </span>
                </label>
              ) : null}

              <div className="mt-8 flex items-center justify-between">
                <BackButton onClick={backToChoice} />
                <button
                  type="button"
                  disabled={isRepresentationActionDisabled}
                  onClick={proceedFromRepresentation}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation text-white shadow min-h-14 px-5 py-3 text-base  hover: ${
                    !isRepresentationActionDisabled
                      ? "bg-[#b2242e]  hover:bg-[#8F1B29]"
                      : "bg-rose-200 cursor-not-allowed "
                  }`}
                >
                  {representationActionLabel}
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
                    className="lucide lucide-chevron-right ml-2 h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] text-slate-500">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy. Your information is protected under HIPAA
                compliance.
              </p>
            </div>
          ) : roleView === "agent" && step === 2 ? (
            <div className="w-full max-w-4xl">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-700">
                  Select Your Agent Type
                </h1>
                <p className="mt-3 text-md text-slate-500">
                  Choose the type of accreditation you hold
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {agentTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = agentType === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleAgentTypeSelect(option.id)}
                      className={`relative rounded-xl border bg-white p-6 text-left shadow-sm transition-all ${
                        isSelected
                          ? "border-[#b2242e] ring-2 ring-[#b2242e] shadow-md"
                          : "border-slate-200 hover:shadow-md"
                      }`}
                    >
                      <div className="absolute right-6 top-6">
                        {isSelected ? (
                          <SelectedCheck />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                      <div className="flex items-start">
                        <div>
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              isSelected ? "bg-rose-50" : "bg-slate-50"
                            }`}
                          >
                            <Icon
                              className={`h-6 w-6  ${isSelected ? "text-[#b2242e]" : "text-slate-600"}`}
                            />
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-slate-900">
                            {option.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500 mr-4">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex items-center justify-between">
                <BackButton onClick={backToChoice} />
                <button
                  type="button"
                  disabled={!agentType}
                  onClick={goToCredentials}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation text-primary-foreground shadow min-h-14 px-5 py-3 text-white ${
                    agentType
                      ? "bg-[#b2242e] hover:bg-[#8F1B29]"
                      : "bg-rose-200 cursor-not-allowed"
                  }`}
                >
                  Continue
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
                    className="lucide lucide-chevron-right ml-2 h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>{" "}
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] text-slate-500">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy. Your information is protected under HIPAA
                compliance.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-700">
                  Professional Credentials
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Enter your VA accreditation information for verification
                </p>
              </div>

              <div className="mt-8 flex justify-center">
                <div className="w-full max-w-127.5 rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Select Your Accreditation Type
                  </h3>
                  <p className="mt-1 text-sm  text-[#65758b]">
                    Choose the type of VA accreditation you hold
                  </p>

                  <div className="mt-4 space-y-3">
                    {agentTypeOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = agentType === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleAgentTypeSelect(option.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-all ${
                            isSelected
                              ? "border-[#b2242e] ring-2 ring-[#b2242e] bg-rose-50/40"
                              : "border-slate-200 bg-white hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex p-2 items-center justify-center rounded-lg ${
                                isSelected ? "bg-rose-100" : ""
                              }`}
                            >
                              <Icon
                                className={`h-5 w-5  ${isSelected ? "text-[#b2242e]" : "text-slate-600"}`}
                              />
                            </div>
                            <div>
                              <p className=" font-medium text-slate-900">
                                {option.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          <div>
                            {isSelected ? (
                              <SelectedCheck />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-5 space-y-4">
                    {agentType === "vso-rep" ? (
                      <>
                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            VSO Organization Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. American Legion, DAV, VFW"
                            className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            VSO Representative ID *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your VSO representative ID"
                            className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                        <UploadField
                          label="Authorization Letter (Optional)"
                          buttonLabel="Upload Authorization Letter"
                          helper="Accepted formats: PDF, JPG, PNG"
                        />
                      </>
                    ) : null}

                    {agentType === "claims-agent" ? (
                      <>
                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            OGC Accreditation Number *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your OGC accreditation number"
                            className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                        <UploadField
                          label="OGC Certificate (Optional)"
                          buttonLabel="Upload Certificate"
                          helper="Accepted formats: PDF, JPG, PNG"
                        />
                      </>
                    ) : null}

                    {agentType === "attorney" ? (
                      <>
                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            OGC Accreditation Number *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your OGC accreditation number"
                            className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Bar Number *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your bar number"
                            className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Bar State *
                          </label>
                          <select className="mt-2 w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200">
                            {barStateOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <UploadField
                          label="Bar License / Accreditation Certificate (Optional)"
                          buttonLabel="Upload Document"
                          helper="Accepted formats: PDF, JPG, PNG"
                        />
                      </>
                    ) : null}

                    <div
                      role="alert"
                      className=" w-full rounded-lg border px-4 py-3 text-sm  [&>svg]:text-foreground [&>svg~*]:pl-7 text-foreground border-blue-200 bg-blue-50"
                    >
                      <div className="text-sm [&_p]:leading-relaxed text-blue-800">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className="text-sm   [&>svg]:text-foreground [&>svg~*]:pl-7 text-foreground">
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
                              className="lucide lucide-shield h-4 w-4 text-blue-600"
                              aria-hidden="true"
                            >
                              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                            </svg>
                          </div>
                          <input
                            className="mt-1 h-4 w-4 rounded border-blue-300 text-[#93c5fd] focus:ring-[hsl(var(--accent))]"
                            data-testid="credential-attestation-checkbox"
                            type="checkbox"
                          />
                          <span className="text-sm">
                            I attest that the information provided is accurate
                            and I am authorized to represent veterans before the
                            VA.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <BackButton onClick={backToStepTwo} />
                <button
                  type="button"
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation text-primary-foreground shadow min-h-14 px-5 py-3 text-white ${
                    agentType
                      ? "bg-[#b2242e] hover:bg-[#8F1B29]"
                      : "bg-rose-200 cursor-not-allowed"
                  }`}
                >
                  Create Account & Submit Credentials
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] text-slate-500">
                Your credentials will be verified by our team. You'll receive an
                email notification once your accreditation is approved.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Register;
