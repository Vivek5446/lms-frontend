"use client";

import { Rocket, Pencil, CheckCircle2, FileText, Layers, TrendingUp, IndianRupee, Users, GraduationCap, CircleDashed } from "lucide-react";
import { StepWrapper } from "./component/StepWrapper";
import { Button } from "@/components/ui/button";
import { CourseFormState, formatInr } from "../courseForm";

interface Step8ReviewProps {
  courseForm: CourseFormState;
  onEditStep: (step: number) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export default function Step8Review({ courseForm, onEditStep, onSaveDraft, onPublish }: Step8ReviewProps) {
  const totalSections = courseForm.structure.modules.reduce((count, module) => count + module.sections.length, 0);

  const sections = [
    {
      icon: FileText,
      label: "Basic Info",
      status: courseForm.basicInfo.courseName
        ? `${courseForm.basicInfo.courseName} • ${courseForm.basicInfo.level}`
        : "Course title is still empty",
      colorClass: "text-step-1",
      bgClass: "bg-step-1/15",
      complete: Boolean(courseForm.basicInfo.courseName.trim()),
      stepIndex: 0,
    },
    {
      icon: Layers,
      label: "Course Structure",
      status: `${courseForm.structure.modules.length} module${courseForm.structure.modules.length === 1 ? "" : "s"} • ${totalSections} section${
        totalSections === 1 ? "" : "s"
      } • ${
        courseForm.structure.quizMode === "per-module" ? "Quiz per module" : "Final quiz"
      }`,
      colorClass: "text-step-2",
      bgClass: "bg-step-2/15",
      complete: courseForm.structure.modules.length > 0,
      stepIndex: 1,
    },
    {
      icon: TrendingUp,
      label: "Progress Settings",
      status: courseForm.progress.completionDays.trim()
        ? `${courseForm.progress.completionDays} day completion window`
        : "No completion deadline set",
      colorClass: "text-step-3",
      bgClass: "bg-step-3/15",
      complete: true,
      stepIndex: 2,
    },
    {
      icon: IndianRupee,
      label: "Pricing",
      status: `${courseForm.pricing.isPaid ? formatInr(courseForm.pricing.amount) : "Free"} • ${
        courseForm.pricing.selectedCompanies.length
      } compan${courseForm.pricing.selectedCompanies.length === 1 ? "y" : "ies"}`,
      colorClass: "text-step-4",
      bgClass: "bg-step-4/15",
      complete: true,
      stepIndex: 3,
    },
    {
      icon: Users,
      label: "Batches",
      status: `${courseForm.batches.items.length} batch${courseForm.batches.items.length === 1 ? "" : "es"} configured`,
      colorClass: "text-step-5",
      bgClass: "bg-step-5/15",
      complete: courseForm.batches.items.length > 0,
      stepIndex: 4,
    },
    {
      icon: GraduationCap,
      label: "Learners",
      status: `${courseForm.learners.selectedLearners.length} selected${courseForm.learners.csvFile ? " • CSV attached" : ""}`,
      colorClass: "text-step-6",
      bgClass: "bg-step-6/15",
      complete: courseForm.learners.selectedLearners.length > 0 || Boolean(courseForm.learners.csvFile),
      stepIndex: 5,
    },
  ];

  return (
    <StepWrapper
      stepKey={7}
      title="Review & Publish"
      subtitle="Almost there! Let&apos;s review everything ðŸš€"
      icon={<Rocket className="w-6 h-6" />}
      accentColor="hsl(var(--step-8))"
    >
      <div className="space-y-6">
        <div className="grid gap-3">
          {sections.map(({ icon: Icon, label, status, colorClass, bgClass, complete, stepIndex }) => (
            <div key={label} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{status}</p>
              </div>
              {complete ? (
                <CheckCircle2 className="w-5 h-5 text-step-2" />
              ) : (
                <CircleDashed className="w-5 h-5 text-muted-foreground" />
              )}
              <button className="text-sm text-primary hover:underline flex items-center gap-1" onClick={() => onEditStep(stepIndex)}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            className="flex-1 h-14 rounded-2xl text-base font-semibold"
            style={{ background: "var(--gradient-primary)" }}
            onClick={onPublish}
          >
            <Rocket className="w-5 h-5 mr-2" /> Publish Course
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl text-base" onClick={onSaveDraft}>
            Save as Draft
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}
