"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Plus, Trash2, GripVertical, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { StepWrapper } from "./component/StepWrapper";
import { FormField } from "./component/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CourseModuleInput,
  CourseStructureState,
  createEmptyModule,
  createStoredFile,
  getFileKindLabel,
  inferModuleUploadKind,
} from "../courseForm";

interface Step2StructureProps {
  value: CourseStructureState;
  onChange: (value: CourseStructureState) => void;
  onProgressChange?: (progress: number) => void;
}

export default function Step2Structure({ value, onChange, onProgressChange }: Step2StructureProps) {
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (value.modules.length === 0) {
      onProgressChange?.(0);
      return;
    }

    const totalFields = value.modules.length * 3 + 1;
    const completedFields =
      1 +
      value.modules.reduce((count, module) => {
        if (module.name.trim()) count += 1;
        if (module.description.trim()) count += 1;
        if (module.contentFile) count += 1;
        return count;
      }, 0);

    onProgressChange?.(Math.round((completedFields / totalFields) * 100));
  }, [value, onProgressChange]);

  const addModule = () => {
    onChange({
      ...value,
      modules: [...value.modules, createEmptyModule()],
    });
  };

  const removeModule = (id: string) => {
    onChange({
      ...value,
      modules: value.modules.filter((module) => module.id !== id),
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedModuleIds((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const updateModule = (id: string, patch: Partial<CourseModuleInput>) => {
    onChange({
      ...value,
      modules: value.modules.map((module) => (module.id === id ? { ...module, ...patch } : module)),
    });
  };

  const handleFileChange = (moduleId: string, fileList: FileList | null) => {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    updateModule(moduleId, {
      contentFile: createStoredFile(file, inferModuleUploadKind(file)),
    });
  };

  return (
    <StepWrapper
      stepKey={1}
      title="Course Structure"
      subtitle="Build your learning path ðŸ§±"
      icon={<Layers className="w-6 h-6" />}
      accentColor="hsl(var(--step-2))"
    >
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <FormField label="Quiz Strategy" tooltip="Choose how quizzes are structured">
            <div className="grid grid-cols-2 gap-3 mt-1">
              {(["per-module", "final"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onChange({ ...value, quizMode: mode })}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                    value.quizMode === mode
                      ? "border-step-2 bg-step-2/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-step-2/30"
                  }`}
                >
                  {mode === "per-module" ? "ðŸ“ Quiz per Module" : "ðŸ† Final Quiz Only"}
                  <p className="text-xs text-muted-foreground mt-1">
                    {mode === "per-module" ? "Test after each module" : "One quiz at the end"}
                  </p>
                </button>
              ))}
            </div>
          </FormField>
        </div>

        <AnimatePresence>
          {value.modules.map((module, index) => {
            const isExpanded = expandedModuleIds[module.id] ?? true;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => toggleExpand(module.id)}>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div className="w-8 h-8 rounded-xl bg-step-2/15 flex items-center justify-center text-sm font-bold text-step-2">
                    {index + 1}
                  </div>
                  <span className="flex-1 font-medium text-foreground">{module.name || `Module ${index + 1}`}</span>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      removeModule(module.id);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 space-y-4 border-t border-border pt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField label="Module Name" required>
                            <Input
                              value={module.name}
                              onChange={(event) => updateModule(module.id, { name: event.target.value })}
                              placeholder="e.g., Getting Started"
                              className="bg-background border-border rounded-xl h-11"
                            />
                          </FormField>
                          <FormField label="Upload Content" helper="Video, PDF, SCORM package, or ZIP">
                            <label className="border-2 border-dashed border-border rounded-xl p-3 flex items-center gap-3 hover:border-step-2/50 transition-colors cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                accept="video/*,application/pdf,.zip,.scorm,application/zip,application/x-zip-compressed"
                                onChange={(event) => handleFileChange(module.id, event.target.files)}
                              />
                              <Upload className="w-5 h-5 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <span className="block text-sm text-muted-foreground truncate">
                                  {module.contentFile ? module.contentFile.name : "Drop files or click to upload"}
                                </span>
                                {module.contentFile && (
                                  <span className="block text-xs text-step-2 mt-1">
                                    {getFileKindLabel(module.contentFile.kind)} file ready
                                  </span>
                                )}
                              </div>
                              {module.contentFile && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    updateModule(module.id, { contentFile: null });
                                  }}
                                  className="text-xs text-destructive hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </label>
                          </FormField>
                        </div>
                        <FormField label="Description">
                          <Textarea
                            value={module.description}
                            onChange={(event) => updateModule(module.id, { description: event.target.value })}
                            placeholder="What will learners learn in this module?"
                            className="bg-background border-border rounded-xl resize-none min-h-[80px]"
                          />
                        </FormField>
                        {value.quizMode === "per-module" && (
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Switch checked={module.hasQuiz} onCheckedChange={(hasQuiz) => updateModule(module.id, { hasQuiz })} />
                              <span className="text-sm text-foreground">Include Quiz</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch checked={module.hasTest} onCheckedChange={(hasTest) => updateModule(module.id, { hasTest })} />
                              <span className="text-sm text-foreground">Include Test</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {value.modules.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
            <div className="text-4xl mb-3">ðŸš€</div>
            <p className="font-medium text-foreground mb-1">No modules yet</p>
            <p className="text-sm text-muted-foreground mb-4">Let&apos;s create your first learning module!</p>
            <Button onClick={addModule} className="rounded-xl bg-step-2 hover:bg-step-2/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Add First Module
            </Button>
          </div>
        ) : (
          <Button onClick={addModule} variant="outline" className="w-full rounded-xl border-dashed border-2 h-12 hover:bg-step-2/5 hover:border-step-2/30">
            <Plus className="w-4 h-4 mr-2" /> Add Module
          </Button>
        )}
      </div>
    </StepWrapper>
  );
}
