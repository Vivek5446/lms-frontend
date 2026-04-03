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
import Step6Learners from "./steps/Step6Learners";
import Step7Preview from "./steps/Step7Preview";
import Step8Review from "./steps/Step8Review";
import { CourseFormState, buildCoursePayload, initialCourseFormState } from "./courseForm";
import { courseStore } from "@/app/store/courseStore/courseStore";

const TOTAL_STEPS = 7;

interface CourseListProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

function CourseList({ onSuccess, onCancel }: CourseListProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepProgress, setStepProgress] = useState<Record<number, number>>({});
  const [courseForm, setCourseForm] = useState<CourseFormState>(initialCourseFormState);
  const [finalAction, setFinalAction] = useState<"draft" | "publish">("publish");
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
    let wasSuccessful = false;
    const scormFiles = courseForm.structure.modules.flatMap((mod) =>
      mod.sections.flatMap((section) =>
        section.contentFile &&
        (section.contentFile.kind === "scorm" || section.contentFile.kind === "zip")
          ? [section.contentFile.file]
          : []
      )
    );

    const scormFileCount = courseForm.structure.modules.reduce((count, mod) => {
      return (
        count +
        mod.sections.filter(
          (section) =>
            section.contentFile &&
            (section.contentFile.kind === "scorm" || section.contentFile.kind === "zip")
        ).length
      );
    }, 0);

    const payload = buildCoursePayload(courseForm, action);

    try {
      await courseStore.createCourse({
        payload,
        thumbnailFile: courseForm.basicInfo.thumbnail?.file ?? null,
        scormFiles,
      }, {
        action,
        fileCount:
          scormFileCount + (courseForm.basicInfo.thumbnail?.file ? 1 : 0),
      });
      wasSuccessful = true;
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/course");
      }
    } catch (err) {
      console.error("Failed to save course:", err);
    } finally {
      if (wasSuccessful) {
        setTimeout(() => {
          courseStore.resetSubmissionState();
        }, 250);
      }
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
          <Step6Learners
            learners={courseForm.learners}
            selectedCompanies={courseForm.pricing.selectedCompanies}
            onProgressChange={(progress) => updateStepProgress(4, progress)}
          />
        );
      case 5:
        return (
          <Step7Preview
            courseForm={courseForm}
            onProgressChange={(progress) => updateStepProgress(5, progress)}
          />
        );
      case 6:
        return (
          <Step8Review
            courseForm={courseForm}
            onEditStep={setCurrentStep}
            submitAction={finalAction}
            onSubmitActionChange={setFinalAction}
            onSubmit={() => handleSave(finalAction)}
            isSubmitting={courseStore.isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {courseStore.isSubmitting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(17, 24, 39, 0.48)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: "min(520px, 100%)",
              borderRadius: 28,
              background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
              boxShadow: "0 28px 90px rgba(15, 23, 42, 0.22)",
              padding: 28,
              border: "1px solid rgba(226, 232, 240, 0.9)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  background: "linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 12px 30px rgba(79, 70, 229, 0.28)",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "2.5px solid rgba(255,255,255,0.35)",
                    borderTopColor: "#FFFFFF",
                    animation: "course-submit-spin 0.9s linear infinite",
                  }}
                />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0F172A" }}>
                  {courseStore.submissionStage || "Submitting course"}
                </h3>
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
                  {courseStore.submissionDetail || "Please keep this tab open while we finish preparing the course."}
                </p>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: 12,
                borderRadius: 999,
                background: "#E2E8F0",
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: `${Math.max(courseStore.submissionProgress, 8)}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #4F46E5 0%, #0EA5E9 100%)",
                  transition: "width 220ms ease",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13, color: "#64748B" }}>
              <span>{Math.max(courseStore.submissionProgress, 8)}% complete</span>
              <span>SCORM uploads can take a little longer while the package is extracted and stored.</span>
            </div>
          </div>
          <style>{`@keyframes course-submit-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
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
            <span style={{ fontSize: 13, color: "#64748B" }}>
              {currentStep === TOTAL_STEPS - 1
                ? "Choose draft or publish once and submit from the final review."
                : "Complete the course setup to unlock the final submit action."}
            </span>
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

        {courseStore.error && !courseStore.isSubmitting && (
          <div
            style={{
              marginTop: 20,
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 16,
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              color: "#991B1B",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {courseStore.error}
          </div>
        )}

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
              disabled={currentStep === 0 || courseStore.isSubmitting}
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
                color: currentStep === 0 || courseStore.isSubmitting ? "#D1D5DB" : "#374151",
                cursor: currentStep === 0 || courseStore.isSubmitting ? "not-allowed" : "pointer",
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
              disabled={courseStore.isSubmitting}
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
                cursor: courseStore.isSubmitting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: courseStore.isSubmitting ? 0.6 : 1,
              }}
              onMouseEnter={(event) => {
                if (!courseStore.isSubmitting) {
                  event.currentTarget.style.background = "#4338CA";
                }
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "#4F46E5";
              }}
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
