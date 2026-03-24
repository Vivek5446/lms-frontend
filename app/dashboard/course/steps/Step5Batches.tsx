"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, Upload, UserPlus } from "lucide-react";
import { StepWrapper } from "./component/StepWrapper";
import { FormField } from "./component/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AVAILABLE_LEARNERS,
  CourseBatchInput,
  CourseBatchesState,
  CourseLearnersState,
  createEmptyBatch,
  createStoredFile,
} from "../courseForm";

interface Step5BatchesProps {
  batches: CourseBatchesState;
  learners: CourseLearnersState;
  onBatchesChange: (value: CourseBatchesState) => void;
  onLearnersChange: (value: CourseLearnersState) => void;
  onProgressChange?: (progress: number) => void;
}

export default function Step5Batches({
  batches,
  learners,
  onBatchesChange,
  onLearnersChange,
  onProgressChange,
}: Step5BatchesProps) {
  useEffect(() => {
    let filled = 0;

    if (batches.items.length > 0) filled++;
    if (learners.selectedLearners.length > 0 || learners.csvFile) filled++;

    onProgressChange?.(Math.round((filled / 2) * 100));
  }, [batches, learners, onProgressChange]);

  const addBatch = () => {
    onBatchesChange({ items: [...batches.items, createEmptyBatch()] });
  };

  const removeBatch = (id: string) => {
    onBatchesChange({ items: batches.items.filter((batch) => batch.id !== id) });
  };

  const updateBatch = (id: string, patch: Partial<CourseBatchInput>) => {
    onBatchesChange({
      items: batches.items.map((batch) => (batch.id === id ? { ...batch, ...patch } : batch)),
    });
  };

  const toggleLearner = (name: string) => {
    onLearnersChange({
      ...learners,
      selectedLearners: learners.selectedLearners.includes(name)
        ? learners.selectedLearners.filter((learnerName) => learnerName !== name)
        : [...learners.selectedLearners, name],
    });
  };

  const handleCsvUpload = (fileList: FileList | null) => {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    onLearnersChange({
      ...learners,
      csvFile: createStoredFile(file, "spreadsheet"),
    });
  };

  return (
    <StepWrapper
      stepKey={4}
      title="Batches"
      subtitle="Organize learners into groups ðŸ‘¥"
      icon={<Users className="w-6 h-6" />}
      accentColor="hsl(var(--step-5))"
    >
      <div className="space-y-6">
        <AnimatePresence>
          {batches.items.map((batch, index) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-2xl border border-border p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-step-5/15 flex items-center justify-center text-sm font-bold text-step-5">
                    {index + 1}
                  </div>
                  <span className="font-medium text-foreground">{batch.name || `Batch ${index + 1}`}</span>
                </div>
                <button onClick={() => removeBatch(batch.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Batch Name" required>
                  <Input
                    value={batch.name}
                    onChange={(event) => updateBatch(batch.id, { name: event.target.value })}
                    placeholder="e.g., January 2025 Cohort"
                    className="bg-background border-border rounded-xl h-11"
                  />
                </FormField>
                <FormField label="Seat Limit" helper="Max learners in this batch">
                  <Input
                    type="number"
                    value={batch.seatLimit}
                    onChange={(event) => updateBatch(batch.id, { seatLimit: event.target.value })}
                    className="bg-background border-border rounded-xl h-11"
                  />
                </FormField>
                <FormField label="Start Date">
                  <Input
                    type="date"
                    value={batch.startDate}
                    onChange={(event) => updateBatch(batch.id, { startDate: event.target.value })}
                    className="bg-background border-border rounded-xl h-11"
                  />
                </FormField>
                <FormField label="End Date">
                  <Input
                    type="date"
                    value={batch.endDate}
                    onChange={(event) => updateBatch(batch.id, { endDate: event.target.value })}
                    className="bg-background border-border rounded-xl h-11"
                  />
                </FormField>
              </div>
              <FormField label="Trainer (Optional)">
                <Input
                  value={batch.trainer}
                  onChange={(event) => updateBatch(batch.id, { trainer: event.target.value })}
                  placeholder="Assign a trainer"
                  className="bg-background border-border rounded-xl h-11"
                />
              </FormField>
            </motion.div>
          ))}
        </AnimatePresence>

        {batches.items.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
            <div className="text-4xl mb-3">ðŸ‘¥</div>
            <p className="font-medium text-foreground mb-1">No batches created yet</p>
            <p className="text-sm text-muted-foreground mb-4">Organize your learners into batches</p>
            <Button onClick={addBatch} className="rounded-xl bg-step-5 hover:bg-step-5/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Create First Batch
            </Button>
          </div>
        ) : (
          <Button onClick={addBatch} variant="outline" className="w-full rounded-xl border-dashed border-2 h-12 hover:border-step-5/30">
            <Plus className="w-4 h-4 mr-2" /> Add Another Batch
          </Button>
        )}

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-5 h-5 text-step-5" />
            <h3 className="font-semibold text-foreground">Add Learners</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LEARNERS.map((name) => (
              <Badge
                key={name}
                variant={learners.selectedLearners.includes(name) ? "default" : "outline"}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition-all ${
                  learners.selectedLearners.includes(name) ? "bg-step-5 text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => toggleLearner(name)}
              >
                {name}
              </Badge>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-step-5 hover:underline cursor-pointer">
            <input type="file" className="hidden" accept=".csv,text/csv" onChange={(event) => handleCsvUpload(event.target.files)} />
            <Upload className="w-4 h-4" /> {learners.csvFile ? learners.csvFile.name : "Upload CSV"}
          </label>
        </div>
      </div>
    </StepWrapper>
  );
}
