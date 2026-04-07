"use client";

import LZString from "lz-string";

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
  id?: string;
  type?: string;
  question?: string;
  learnerResponse?: string;
  correctResponses?: string[];
  result?: string;
  latency?: string;
  time?: string;
  maxMarks?: number | null;
  source?: "cmi.interactions" | "suspend_data";
  rawData?: Record<string, any>;
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

function normalizeScore(value: unknown) {
  const normalizedValue = normalizeString(value);
  if (!normalizedValue) {
    return null;
  }

  const numericValue = Number(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function flattenPrimitiveValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenPrimitiveValues(entry));
  }

  if (isPlainObject(value)) {
    const directText = [
      value.text,
      value.label,
      value.value,
      value.answer,
      value.response,
      value.name,
      value.title,
      value.prompt,
      value.pattern,
    ]
      .map((entry) => normalizeString(entry))
      .filter(Boolean);

    if (directText.length) {
      return directText;
    }

    return Object.values(value).flatMap((entry) => flattenPrimitiveValues(entry));
  }

  const normalizedValue = normalizeString(value);
  return normalizedValue ? [normalizedValue] : [];
}

function toDisplayString(value: unknown) {
  return flattenPrimitiveValues(value).filter(Boolean).join(", ");
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => normalizeString(value)).filter(Boolean)));
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function decodeSuspendDataPayload(suspendData: string) {
  const normalizedSuspendData = normalizeString(suspendData);
  if (!normalizedSuspendData) {
    return null;
  }

  const candidateStrings = [
    normalizedSuspendData,
    (() => {
      try {
        return decodeURIComponent(normalizedSuspendData);
      } catch (error) {
        return "";
      }
    })(),
    LZString.decompressFromEncodedURIComponent(normalizedSuspendData) || "",
    LZString.decompressFromBase64(normalizedSuspendData) || "",
    LZString.decompress(normalizedSuspendData) || "",
  ].filter(Boolean);

  for (const candidate of candidateStrings) {
    const parsed = safeJsonParse(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function findCandidateQuizArray(rootValue: unknown): any[] {
  if (!rootValue) {
    return [];
  }

  const root = isPlainObject(rootValue) ? rootValue : {};
  const directCandidates = [
    root.quiz && isPlainObject(root.quiz) ? root.quiz.questions : null,
    root.questions,
    root.interactions,
    root.responses,
  ];
  const firstDirectCandidate = directCandidates.find((value) => Array.isArray(value));

  if (Array.isArray(firstDirectCandidate)) {
    return firstDirectCandidate;
  }

  const queue: unknown[] = [root];
  const visited = new Set<unknown>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    if (Array.isArray(current)) {
      current.forEach((entry) => queue.push(entry));
      continue;
    }

    if (!isPlainObject(current)) {
      continue;
    }

    const nestedCandidate = [current.questions, current.interactions, current.responses].find((value) =>
      Array.isArray(value)
    );
    if (Array.isArray(nestedCandidate)) {
      return nestedCandidate;
    }

    Object.values(current).forEach((entry) => queue.push(entry));
  }

  return [];
}

function buildQuestionMetadataMap(parsedSuspendData: any) {
  const candidateQuestions = Array.isArray(parsedSuspendData?.quiz?.questions)
    ? parsedSuspendData.quiz.questions
    : Array.isArray(parsedSuspendData?.questions)
      ? parsedSuspendData.questions
      : [];

  const metadataMap = new Map<string, Partial<ScormInteractionPayload>>();

  candidateQuestions.forEach((entry: any, index: number) => {
    const safeEntry = isPlainObject(entry) ? entry : {};
    const key = normalizeString(safeEntry.questionId || safeEntry.id || safeEntry.identifier || safeEntry.name) || `index:${index}`;

    metadataMap.set(key, {
      id: normalizeString(safeEntry.questionId || safeEntry.id || safeEntry.identifier || safeEntry.name),
      question: normalizeString(
        safeEntry.question ||
        safeEntry.prompt ||
        safeEntry.text ||
        safeEntry.title ||
        safeEntry.label ||
        safeEntry.description
      ),
      correctResponses: uniqueStrings(
        flattenPrimitiveValues(
          safeEntry.correctResponses ||
          safeEntry.correct_responses ||
          safeEntry.correctAnswer ||
          safeEntry.correct_answer ||
          safeEntry.correctResponse ||
          safeEntry.correct_response ||
          safeEntry.expectedAnswer ||
          safeEntry.expected_answer ||
          safeEntry.solution
        )
      ),
      maxMarks: normalizeScore(safeEntry.weighting ?? safeEntry.maxMarks ?? safeEntry.max_marks ?? safeEntry.marks),
    });
  });

  return metadataMap;
}

function normalizeSuspendDataInteraction(entry: any, index: number, metadataMap: Map<string, Partial<ScormInteractionPayload>>) {
  const safeEntry = isPlainObject(entry) ? entry : {};
  const metadataKey = normalizeString(safeEntry.questionId || safeEntry.id || safeEntry.identifier || safeEntry.name) || `index:${index}`;
  const metadata = metadataMap.get(metadataKey) || {};

  return {
    index,
    id: normalizeString(safeEntry.questionId || safeEntry.id || safeEntry.identifier || safeEntry.name || metadata.id),
    type: normalizeString(safeEntry.type || safeEntry.kind || safeEntry.questionType),
    question: normalizeString(
      safeEntry.question ||
      safeEntry.prompt ||
      safeEntry.text ||
      safeEntry.title ||
      safeEntry.label ||
      safeEntry.description ||
      metadata.question
    ),
    learnerResponse: toDisplayString(
      safeEntry.learnerResponse ??
      safeEntry.studentResponse ??
      safeEntry.response ??
      safeEntry.answer ??
      safeEntry.value ??
      safeEntry.userAnswer ??
      safeEntry.selected ??
      safeEntry.selectedOption ??
      safeEntry.selectedOptions
    ),
    correctResponses: uniqueStrings(
      flattenPrimitiveValues(
        safeEntry.correctResponses ??
        safeEntry.correct_responses ??
        safeEntry.correctAnswer ??
        safeEntry.correct_answer ??
        safeEntry.correctResponse ??
        safeEntry.correct_response ??
        safeEntry.expectedAnswer ??
        safeEntry.expected_answer ??
        safeEntry.solution ??
        metadata.correctResponses
      )
    ),
    result: normalizeString(
      typeof safeEntry.result === "boolean"
        ? safeEntry.result ? "correct" : "incorrect"
        : safeEntry.result ?? safeEntry.status ?? safeEntry.isCorrect
    ).toLowerCase(),
    latency: normalizeString(safeEntry.latency),
    time: normalizeString(safeEntry.time || safeEntry.timestamp),
    maxMarks: normalizeScore(
      safeEntry.weighting ?? safeEntry.maxMarks ?? safeEntry.max_marks ?? safeEntry.marks ?? metadata.maxMarks
    ),
    source: "suspend_data" as const,
    rawData: isPlainObject(entry) ? entry : { value: entry },
  };
}

function buildSuspendDataInteractions(suspendData: string) {
  const parsedSuspendData = decodeSuspendDataPayload(suspendData);
  if (!parsedSuspendData) {
    return [];
  }

  const metadataMap = buildQuestionMetadataMap(parsedSuspendData);
  const candidateArray = findCandidateQuizArray(parsedSuspendData);

  return candidateArray.map((entry, index) => normalizeSuspendDataInteraction(entry, index, metadataMap));
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
      question: "",
      learnerResponse: "",
      correctResponses: [],
      result: "",
      latency: "",
      time: "",
      maxMarks: null,
      source: "cmi.interactions" as const,
      rawData: {},
    };

    currentInteraction.rawData = currentInteraction.rawData || {};
    currentInteraction.rawData[propertyPath] = String(value ?? "");

    if (propertyPath === "id") {
      currentInteraction.id = normalizeString(value);
    } else if (propertyPath === "type") {
      currentInteraction.type = normalizeString(value);
    } else if (propertyPath === "result") {
      currentInteraction.result = normalizeString(value).toLowerCase();
    } else if (propertyPath === "student_response" || propertyPath === "learner_response") {
      currentInteraction.learnerResponse = normalizeString(value);
    } else if (propertyPath === "latency") {
      currentInteraction.latency = normalizeString(value);
    } else if (propertyPath === "time") {
      currentInteraction.time = normalizeString(value);
    } else if (propertyPath === "weighting") {
      currentInteraction.maxMarks = normalizeScore(value);
    } else if (propertyPath === "description" || propertyPath === "text") {
      currentInteraction.question = normalizeString(value);
    } else {
      const correctResponseMatch = propertyPath.match(/^correct_responses\.(\d+)\.pattern$/);
      if (correctResponseMatch) {
        const patternIndex = Number(correctResponseMatch[1]);
        const nextCorrectResponses = Array.isArray(currentInteraction.correctResponses)
          ? [...currentInteraction.correctResponses]
          : [];
        nextCorrectResponses[patternIndex] = normalizeString(value);
        currentInteraction.correctResponses = nextCorrectResponses.filter(Boolean);
      }
    }

    interactionMap.set(interactionIndex, currentInteraction);
  });

  return Array.from(interactionMap.values())
    .sort((left, right) => left.index - right.index)
    .map((interaction) => ({
      ...interaction,
      correctResponses: uniqueStrings(Array.isArray(interaction.correctResponses) ? interaction.correctResponses : []),
    }));
}

function enrichNativeInteractions(nativeInteractions: ScormInteractionPayload[], suspendDataInteractions: ScormInteractionPayload[]) {
  if (!suspendDataInteractions.length) {
    return nativeInteractions;
  }

  const fallbackMap = new Map<string, ScormInteractionPayload>();
  suspendDataInteractions.forEach((interaction, index) => {
    fallbackMap.set(interaction.id || `index:${interaction.index || index}`, interaction);
  });

  return nativeInteractions.map((interaction, index) => {
    const fallbackInteraction = fallbackMap.get(interaction.id || `index:${interaction.index || index}`);
    if (!fallbackInteraction) {
      return interaction;
    }

    return {
      ...interaction,
      question: interaction.question || fallbackInteraction.question,
      learnerResponse: interaction.learnerResponse || fallbackInteraction.learnerResponse,
      correctResponses: interaction.correctResponses?.length
        ? interaction.correctResponses
        : fallbackInteraction.correctResponses,
      latency: interaction.latency || fallbackInteraction.latency,
      time: interaction.time || fallbackInteraction.time,
      maxMarks: interaction.maxMarks ?? fallbackInteraction.maxMarks ?? null,
      rawData: {
        ...(fallbackInteraction.rawData || {}),
        ...(interaction.rawData || {}),
      },
    };
  });
}

function getInteractionCount(state: Record<string, string>) {
  const indexes = new Set<number>();

  Object.keys(state).forEach((key) => {
    const match = key.match(/^cmi\.interactions\.(\d+)\./);
    if (match) {
      indexes.add(Number(match[1]));
    }
  });

  return indexes.size;
}

function getCorrectResponseCount(state: Record<string, string>, interactionIndex: number) {
  const indexes = new Set<number>();

  Object.keys(state).forEach((key) => {
    const match = key.match(new RegExp(`^cmi\\.interactions\\.${interactionIndex}\\.correct_responses\\.(\\d+)\\.`));
    if (match) {
      indexes.add(Number(match[1]));
    }
  });

  return indexes.size;
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

    const suspendData = normalizeString(state["cmi.suspend_data"]);
    const nativeInteractions = extractScormInteractions(state);
    const fallbackInteractions = buildSuspendDataInteractions(suspendData);
    const interactions = nativeInteractions.length
      ? enrichNativeInteractions(nativeInteractions, fallbackInteractions)
      : fallbackInteractions;

    return {
      userId,
      courseId,
      moduleId: normalizeString(options.context.moduleId),
      sectionId: normalizeString(options.context.sectionId),
      lesson_status: normalizeString(state["cmi.core.lesson_status"]) || "not_attempted",
      score: normalizeScore(state["cmi.core.score.raw"]),
      lesson_location: normalizeString(state["cmi.core.lesson_location"]),
      suspend_data: suspendData,
      session_time: normalizeString(state["cmi.core.session_time"]) || DEFAULT_SCORM_TIME,
      total_time: normalizeString(state["cmi.core.total_time"]) || DEFAULT_SCORM_TIME,
      interactions,
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

      if (key === "cmi.interactions._count") {
        lastError = "0";
        return String(getInteractionCount(state));
      }

      const correctResponseCountMatch = key.match(/^cmi\.interactions\.(\d+)\.correct_responses\._count$/);
      if (correctResponseCountMatch) {
        lastError = "0";
        return String(getCorrectResponseCount(state, Number(correctResponseCountMatch[1])));
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
