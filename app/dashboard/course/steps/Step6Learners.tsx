"use client";

import { useEffect, useState } from "react";
import { Filter, GraduationCap, Search } from "lucide-react";
import { StepWrapper } from "./component/StepWrapper";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CourseLearnersState } from "../courseForm";

interface Step6LearnersProps {
  learners: CourseLearnersState;
  selectedCompanies: string[];
  onProgressChange?: (progress: number) => void;
}

export default function Step6Learners({ learners, selectedCompanies, onProgressChange }: Step6LearnersProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const hasLearnerInput = learners.selectedLearners.length > 0 || Boolean(learners.csvFile);
    onProgressChange?.(hasLearnerInput ? 100 : 0);
  }, [learners, onProgressChange]);

  const filtered = learners.selectedLearners.filter((learnerName) =>
    learnerName.toLowerCase().includes(search.toLowerCase()),
  );

  const companyLabel = selectedCompanies.length > 0 ? selectedCompanies.join(", ") : "All companies";

  return (
    <StepWrapper
      stepKey={4}
      title="Learners Overview"
      subtitle={
        <span className="inline-flex items-center gap-1.5">
          See who&apos;s enrolled and their setup
          <GraduationCap className="w-4 h-4" />
        </span>
      }
      icon={<GraduationCap className="w-6 h-6" />}
      accentColor="hsl(var(--step-6))"
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Selected Learners</p>
            <p className="text-2xl font-semibold text-foreground mt-2">{learners.selectedLearners.length}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Company Access</p>
            <p className="text-sm font-semibold text-foreground mt-2">{companyLabel}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">CSV Import</p>
            <p className="text-sm font-semibold text-foreground mt-2">{learners.csvFile?.name ?? "No CSV uploaded"}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search learners..."
              className="bg-card border-border rounded-xl h-11 pl-10"
            />
          </div>
          <button className="flex items-center gap-2 px-4 h-11 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_180px_220px] gap-4 px-5 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Learner</span>
            <span>Enrollment Source</span>
            <span>Company Access</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-8 h-8 text-step-6 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {learners.selectedLearners.length === 0 ? "No learners selected yet" : "No learners found"}
              </p>
            </div>
          ) : (
            filtered.map((learner) => (
              <div key={learner} className="grid md:grid-cols-[1fr_180px_220px] gap-4 px-5 py-4 border-b last:border-b-0 border-border items-center hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-step-6/15 flex items-center justify-center text-xs font-bold text-step-6">
                    {learner.split(" ").map((name) => name[0]).join("")}
                  </div>
                  <span className="font-medium text-foreground text-sm">{learner}</span>
                </div>
                <Badge className="text-xs rounded-full px-2 py-0.5 bg-step-6/15 text-step-6 border-0 w-fit">
                  Manual selection
                </Badge>
                <span className="text-sm text-muted-foreground">{companyLabel}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </StepWrapper>
  );
}
