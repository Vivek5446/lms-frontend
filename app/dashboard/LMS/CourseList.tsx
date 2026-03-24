"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { CourseStepper } from "./CourseStepper";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Structure from "./steps/Step2Structure";
import Step3Progress from "./steps/Step3Progress";
import Step4Pricing from "./steps/Step4Pricing";
import Step5Batches from "./steps/Step5Batches";
import Step6Learners from "./steps/Step6Learners";
import Step7Preview from "./steps/Step7Preview";
import Step8Review from "./steps/Step8Review";

const TOTAL_STEPS = 8;

const STEPS = [
  Step1BasicInfo,
  Step2Structure,
  Step3Progress,
  Step4Pricing,
  Step5Batches,
  Step6Learners,
  Step7Preview,
  Step8Review,
];

export default function CourseList() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepProgress, setStepProgress] = useState<Record<number, number>>({});
  const router = useRouter();

  const updateStepProgress = (step: number, progress: number) => {
    setStepProgress((prev) => ({ ...prev, [step]: progress }));
  };

  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const CurrentStepComponent = STEPS[currentStep];

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>

      {/* ── Header ── */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div
          style={{
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: back arrow + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
            >
              {/* Arrow left SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                Create New Course
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                Step {currentStep + 1} of {TOTAL_STEPS}
              </p>
            </div>
          </div>

          {/* Right: Save Draft button */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              borderRadius: 10,
              border: "1.5px solid #D1D5DB",
              background: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
          >
            {/* Save icon SVG */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Draft
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          padding: "32px 24px",
          boxSizing: "border-box",
        }}
      >
        {/* Stepper */}
        <CourseStepper
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          completedSteps={completedSteps}
          stepProgress={stepProgress[currentStep] ?? 0}
        />

        {/* Active step */}
        <CurrentStepComponent onProgressChange={(p: number) => updateStepProgress(currentStep, p)} />

        {/* Back / Next navigation */}
        {currentStep < TOTAL_STEPS - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid #E5E7EB",
            }}
          >
            {/* Back */}
            <button
              onClick={goBack}
              disabled={currentStep === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 10,
                border: "1.5px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                color: currentStep === 0 ? "#D1D5DB" : "#374151",
                cursor: currentStep === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            {/* Next */}
            <button
              onClick={goNext}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: "#4F46E5",
                fontSize: 14,
                fontWeight: 600,
                color: "#FFFFFF",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4338CA")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#4F46E5")}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}