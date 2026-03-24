"use client";

import { useEffect } from "react";
import { Eye, BookOpen, Award, Clock, Users, Layers, IndianRupee } from "lucide-react";
import { StepWrapper } from "./component/StepWrapper";
import { Badge } from "@/components/ui/badge";
import { CourseFormState, formatInr, getFileKindLabel } from "../courseForm";

interface Step7PreviewProps {
  courseForm: CourseFormState;
  onProgressChange?: (progress: number) => void;
}

export default function Step7Preview({ courseForm, onProgressChange }: Step7PreviewProps) {
  const modules = courseForm.structure.modules;
  const learnerCount = courseForm.learners.selectedLearners.length;
  const pricingLabel = courseForm.pricing.isPaid ? formatInr(courseForm.pricing.amount) : "Free";
  const accessLabel = courseForm.pricing.accessDurationDays.trim()
    ? `${courseForm.pricing.accessDurationDays} days`
    : "Open access";

  useEffect(() => {
    onProgressChange?.(100);
  }, [onProgressChange]);

  return (
    <StepWrapper
      stepKey={6}
      title="Course Preview"
      subtitle="See how your course will look ðŸ‘€"
      icon={<Eye className="w-6 h-6" />}
      accentColor="hsl(var(--step-7))"
    >
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {courseForm.basicInfo.thumbnail?.previewUrl ? (
            <img
              src={courseForm.basicInfo.thumbnail.previewUrl}
              alt={courseForm.basicInfo.courseName || "Course thumbnail"}
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="h-48 bg-gradient-to-br from-primary/20 via-step-7/20 to-step-2/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">ðŸ“š</div>
                <p className="text-sm text-muted-foreground">Course Thumbnail</p>
              </div>
            </div>
          )}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">{courseForm.basicInfo.courseName || "Untitled Course"}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {courseForm.basicInfo.descriptionText || "Your course description will appear here once you enter it."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {courseForm.basicInfo.categories.map((category) => (
                <Badge key={category} className="bg-primary/10 text-primary border-0 rounded-full">
                  {category}
                </Badge>
              ))}
              <Badge className="bg-step-2/10 text-step-2 border-0 rounded-full">{courseForm.basicInfo.level}</Badge>
              {courseForm.basicInfo.languages.map((language) => (
                <Badge key={language} className="bg-step-3/10 text-step-3 border-0 rounded-full">
                  {language}
                </Badge>
              ))}
              <Badge className="bg-step-4/10 text-step-4 border-0 rounded-full flex items-center gap-1">
                <IndianRupee className="w-3 h-3" /> {pricingLabel}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              {[
                { icon: Layers, label: "Modules", value: String(modules.length) },
                { icon: Clock, label: "Access", value: accessLabel },
                { icon: Users, label: "Learners", value: String(learnerCount) },
                { icon: Award, label: "Certificate", value: courseForm.progress.certificateEnabled ? "Yes" : "No" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-step-7" /> Course Modules
          </h4>
          {modules.length === 0 ? (
            <div className="p-4 bg-background rounded-xl text-sm text-muted-foreground">
              Add modules in the Structure step to preview the curriculum here.
            </div>
          ) : (
            modules.map((module, index) => (
              <div key={module.id} className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-step-7/15 flex items-center justify-center text-sm font-bold text-step-7">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{module.name || `Module ${index + 1}`}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {module.description || "Module description will appear here."}
                  </p>
                </div>
                {module.contentFile && (
                  <Badge className="bg-step-4/10 text-step-4 border-0 text-xs">
                    {getFileKindLabel(module.contentFile.kind)}
                  </Badge>
                )}
                {courseForm.structure.quizMode === "per-module" && module.hasQuiz && (
                  <Badge className="bg-step-2/10 text-step-2 border-0 text-xs">Quiz</Badge>
                )}
                {courseForm.structure.quizMode === "per-module" && module.hasTest && (
                  <Badge className="bg-step-3/10 text-step-3 border-0 text-xs">Test</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </StepWrapper>
  );
}
