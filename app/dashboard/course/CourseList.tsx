"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import { CourseStepper } from "./CourseStepper";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Structure from "./steps/Step2Structure";
import Step3Progress from "./steps/Step3Progress";
import Step4Pricing from "./steps/Step4Pricing";
import Step5Batches from "./steps/Step5Batches";
import Step6Learners from "./steps/Step6Learners";
import Step7Preview from "./steps/Step7Preview";
import Step8Review from "./steps/Step8Review";
import { CourseFormState, buildCoursePayload, initialCourseFormState } from "./courseForm";
import { courseStore } from "@/app/store/courseStore/courseStore";

const TOTAL_STEPS = 8;

interface CourseListProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

function CourseList({ onSuccess, onCancel }: CourseListProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepProgress, setStepProgress] = useState<Record<number, number>>({});
  const [courseForm, setCourseForm] = useState<CourseFormState>(initialCourseFormState);
  const router = useRouter();

  const updateStepProgress = useCallback((step: number, progress: number) => {
    setStepProgress((prev) => {
      if (prev[step] === progress) {
        return prev;
      }

      return { ...prev, [step]: progress };
    });
  }, []);

  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async (action: "draft" | "publish") => {
    const payload = buildCoursePayload(courseForm, action);

    // Build FormData to send files + JSON payload
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));

    // Append thumbnail file if present
    if (courseForm.basicInfo.thumbnail?.file) {
      formData.append("thumbnail", courseForm.basicInfo.thumbnail.file);
    }

    // Append section-level SCORM/ZIP uploads in curriculum order so the backend
    // can map extracted launch files back to the matching sections.
    for (const mod of courseForm.structure.modules) {
      for (const section of mod.sections) {
        if (
          section.contentFile &&
          (section.contentFile.kind === "scorm" || section.contentFile.kind === "zip")
        ) {
          formData.append("scormZip", section.contentFile.file);
        }
      }
    }

    try {
      await courseStore.createCourse(formData);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/course");
      }
    } catch (err) {
      console.error("Failed to save course:", err);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1BasicInfo
            value={courseForm.basicInfo}
            onChange={(basicInfo) => setCourseForm((prev) => ({ ...prev, basicInfo }))}
            onProgressChange={(progress) => updateStepProgress(0, progress)}
          />
        );
      case 1:
        return (
          <Step2Structure
            value={courseForm.structure}
            onChange={(structure) => setCourseForm((prev) => ({ ...prev, structure }))}
            onProgressChange={(progress) => updateStepProgress(1, progress)}
          />
        );
      case 2:
        return (
          <Step3Progress
            value={courseForm.progress}
            onChange={(progress) => setCourseForm((prev) => ({ ...prev, progress }))}
            moduleNames={courseForm.structure.modules.map((module) => module.name)}
            onProgressChange={(progressValue) => updateStepProgress(2, progressValue)}
          />
        );
      case 3:
        return (
          <Step4Pricing
            value={courseForm.pricing}
            onChange={(pricing) => setCourseForm((prev) => ({ ...prev, pricing }))}
            onProgressChange={(progress) => updateStepProgress(3, progress)}
          />
        );
      case 4:
        return (
          <Step5Batches
            batches={courseForm.batches}
            learners={courseForm.learners}
            onBatchesChange={(batches) => setCourseForm((prev) => ({ ...prev, batches }))}
            onLearnersChange={(learners) => setCourseForm((prev) => ({ ...prev, learners }))}
            onProgressChange={(progress) => updateStepProgress(4, progress)}
          />
        );
      case 5:
        return (
          <Step6Learners
            learners={courseForm.learners}
            batches={courseForm.batches.items}
            selectedCompanies={courseForm.pricing.selectedCompanies}
            onProgressChange={(progress) => updateStepProgress(5, progress)}
          />
        );
      case 6:
        return (
          <Step7Preview
            courseForm={courseForm}
            onProgressChange={(progress) => updateStepProgress(6, progress)}
          />
        );
      case 7:
        return (
          <Step8Review
            courseForm={courseForm}
            onEditStep={setCurrentStep}
            onSaveDraft={() => handleSave("draft")}
            onPublish={() => handleSave("publish")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => (onCancel ? onCancel() : router.push("/dashboard"))}
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
              onMouseEnter={(event) => (event.currentTarget.style.background = "#F3F4F6")}
              onMouseLeave={(event) => (event.currentTarget.style.background = "#FFFFFF")}
            >
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

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {courseStore.isSubmitting && (
              <span style={{ fontSize: 13, color: "#6B7280" }}>Saving...</span>
            )}
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
                cursor: courseStore.isSubmitting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: courseStore.isSubmitting ? 0.6 : 1,
              }}
              onMouseEnter={(event) => (event.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={(event) => (event.currentTarget.style.background = "#FFFFFF")}
              onClick={() => handleSave("draft")}
              disabled={courseStore.isSubmitting}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Draft
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "32px 24px",
          boxSizing: "border-box",
        }}
      >
        <CourseStepper
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          completedSteps={completedSteps}
          stepProgress={stepProgress[currentStep] ?? 0}
        />

        {renderCurrentStep()}

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
              onMouseEnter={(event) => (event.currentTarget.style.background = "#4338CA")}
              onMouseLeave={(event) => (event.currentTarget.style.background = "#4F46E5")}
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

export default observer(CourseList);
