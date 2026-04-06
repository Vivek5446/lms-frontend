"use client";

export type ScormTrackingContext = {
  userId?: string | null;
  courseId?: string | null;
  moduleId?: string | null;
  sectionId?: string | null;
  learnerName?: string | null;
};

export type ScormProgressSnapshot = {
  lessonStatus?: string;
  score?: number | null;
  lessonLocation?: string;
  suspendData?: string;
  sessionTime?: string;
  totalTime?: string;
};

export type ScormInteractionPayload = {
  index: number;
  id: string;
  type: string;
  result: string;
  studentResponse: string;
  learnerResponse: string;
  correctResponses: string[];
  weighting: number | null;
  rawData: Record<string, string>;
};

export type ScormTrackingPayload = {
  userId: string;
  courseId: string;
  moduleId: string;
  sectionId: string;
  lesson_status: string;
  score: number | null;
  lesson_location: string;
  suspend_data: string;
  session_time: string;
  total_time: string;
  interactions: ScormInteractionPayload[];
};

type CreateScorm12ApiOptions = {
  context: ScormTrackingContext;
  initialState?: Record<string, string>;
  onCommit?: (payload: ScormTrackingPayload) => void | Promise<void>;
  onFinish?: (payload: ScormTrackingPayload) => void | Promise<void>;
};

const DEFAULT_SCORM_TIME = "00:00:00";

const ERROR_MESSAGES: Record<string, string> = {
  "0": "No error",
  "101": "General exception",
  "301": "Not initialized",
  "401": "Not implemented",
};

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeScore(value: string) {
  const normalizedValue = normalizeString(value);
  if (!normalizedValue) {
    return null;
  }

  const numericValue = Number(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function extractScormInteractions(state: Record<string, string>) {
  const interactionMap = new Map<number, ScormInteractionPayload>();

  Object.entries(state).forEach(([key, value]) => {
    const match = key.match(/^cmi\.interactions\.(\d+)\.(.+)$/);
    if (!match) {
      return;
    }

    const interactionIndex = Number(match[1]);
    const propertyPath = match[2];
    const currentInteraction = interactionMap.get(interactionIndex) || {
      index: interactionIndex,
      id: "",
      type: "",
      result: "",
      studentResponse: "",
      learnerResponse: "",
      correctResponses: [],
      weighting: null,
      rawData: {},
    };

    currentInteraction.rawData[propertyPath] = String(value ?? "");

    if (propertyPath === "id") {
      currentInteraction.id = normalizeString(value);
    } else if (propertyPath === "type") {
      currentInteraction.type = normalizeString(value);
    } else if (propertyPath === "result") {
      currentInteraction.result = normalizeString(value);
    } else if (propertyPath === "student_response") {
      currentInteraction.studentResponse = normalizeString(value);
    } else if (propertyPath === "learner_response") {
      currentInteraction.learnerResponse = normalizeString(value);
    } else if (propertyPath === "weighting") {
      currentInteraction.weighting = normalizeScore(String(value ?? ""));
    } else {
      const correctResponseMatch = propertyPath.match(/^correct_responses\.(\d+)\.pattern$/);
      if (correctResponseMatch) {
        const patternIndex = Number(correctResponseMatch[1]);
        currentInteraction.correctResponses[patternIndex] = normalizeString(value);
      }
    }

    interactionMap.set(interactionIndex, currentInteraction);
  });

  return Array.from(interactionMap.values())
    .sort((left, right) => left.index - right.index)
    .map((interaction) => ({
      ...interaction,
      correctResponses: interaction.correctResponses.filter(Boolean),
    }));
}

export function buildScorm12InitialState(options: {
  context: ScormTrackingContext;
  progress?: ScormProgressSnapshot | null;
}) {
  const progress = options.progress || null;

  return {
    "cmi.core.student_id": normalizeString(options.context.userId),
    "cmi.core.student_name": normalizeString(options.context.learnerName),
    "cmi.core.lesson_status": normalizeString(progress?.lessonStatus) || "not_attempted",
    "cmi.core.score.raw": progress?.score === null || progress?.score === undefined ? "" : String(progress.score),
    "cmi.core.lesson_location": normalizeString(progress?.lessonLocation),
    "cmi.suspend_data": normalizeString(progress?.suspendData),
    "cmi.core.session_time": DEFAULT_SCORM_TIME,
    "cmi.core.total_time": normalizeString(progress?.totalTime) || DEFAULT_SCORM_TIME,
  };
}

export function createScorm12Api(options: CreateScorm12ApiOptions) {
  const state: Record<string, string> = {
    ...options.initialState,
  };

  let initialized = false;
  let lastError = "0";

  const buildTrackingPayload = (): ScormTrackingPayload | null => {
    const userId = normalizeString(options.context.userId);
    const courseId = normalizeString(options.context.courseId);

    if (!userId || !courseId) {
      return null;
    }

    return {
      userId,
      courseId,
      moduleId: normalizeString(options.context.moduleId),
      sectionId: normalizeString(options.context.sectionId),
      lesson_status: normalizeString(state["cmi.core.lesson_status"]) || "not_attempted",
      score: normalizeScore(state["cmi.core.score.raw"]),
      lesson_location: normalizeString(state["cmi.core.lesson_location"]),
      suspend_data: normalizeString(state["cmi.suspend_data"]),
      session_time: normalizeString(state["cmi.core.session_time"]) || DEFAULT_SCORM_TIME,
      total_time: normalizeString(state["cmi.core.total_time"]) || DEFAULT_SCORM_TIME,
      interactions: extractScormInteractions(state),
    };
  };

  const fireAndForget = (handler?: (payload: ScormTrackingPayload) => void | Promise<void>) => {
    const payload = buildTrackingPayload();
    if (!payload || !handler) {
      return;
    }

    Promise.resolve(handler(payload)).catch(() => undefined);
  };

  const api = {
    LMSInitialize: () => {
      initialized = true;
      lastError = "0";
      return "true";
    },
    LMSFinish: () => {
      if (!initialized) {
        lastError = "301";
        return "false";
      }

      initialized = false;
      lastError = "0";
      fireAndForget(options.onFinish);
      return "true";
    },
    LMSGetValue: (key: string) => {
      if (!initialized) {
        lastError = "301";
        return "";
      }

      lastError = "0";
      return state[key] ?? "";
    },
    LMSSetValue: (key: string, value: string) => {
      if (!initialized) {
        lastError = "301";
        return "false";
      }

      state[key] = String(value ?? "");
      lastError = "0";
      return "true";
    },
    LMSCommit: () => {
      if (!initialized) {
        lastError = "301";
        return "false";
      }

      lastError = "0";
      fireAndForget(options.onCommit);
      return "true";
    },
    LMSGetLastError: () => lastError,
    LMSGetErrorString: (errorCode: string) => ERROR_MESSAGES[String(errorCode)] || "Unknown error",
    LMSGetDiagnostic: (errorCode?: string) => ERROR_MESSAGES[String(errorCode || lastError)] || "Unknown error",
  };

  return {
    api,
    context: options.context,
    isInitialized: () => initialized,
    getValue: (key: string) => state[key] ?? "",
    mergeState: (values: Record<string, string>) => {
      Object.entries(values).forEach(([key, value]) => {
        state[key] = String(value ?? "");
      });
    },
    buildTrackingPayload,
  };
}
