// ASRM (Altman Self-Rating Mania Scale)
export const questions = [
  {
    question: "Choose one out of the following options",
    options: [
      "I do not feel happier or more cheerful than usual.",
      "I occasionally feel happier or more cheerful than usual.",
      "I often feel happier or more cheerful than usual.",
      "I feel happier or more cheerful than usual most of the time.",
      "I feel happier or more cheerful than usual all of the time.",
    ],
  },
  {
    // question: "I feel more self-confident than usual.",
    options: [
      "I do not feel more self-confident than usual.",
      "I occasionally feel more self-confident than usual.",
      "I often feel more self-confident than usual.",
      "I feel more self-confident than usual.",
      "I feel extremely self-confident all of the time.",
    ],
  },
  {
    // question: "I need less sleep than usual.",
    options: [
      "I do not need less sleep than usual.",
      "I occasionally need less sleep than usual.",
      "I often need less sleep than usual.",
      "I frequently need less sleep than usual.",
      "I can go all day and night without any sleep and still not feel tired.",
    ],
  },
  {
    // question: "I talk more than usual.",
    options: [
      "I do not talk more than usual.",
      "I occasionally talk more than usual.",
      "I often talk more than usual.",
      "I frequently talk more than usual.",
      "I talk constantly and cannot be interrupted.",
    ],
  },
  {
    // question: "I have been more active than usual (socially, sexually, at work, home or school).",
    options: [
      "I have not been more active than usual.",
      "I have occasionally been more active than usual.",
      "I have often been more active than usual.",
      "I have frequently been more active than usual.",
      "I am constantly active or on the go all the time.",
    ],
  },
];

// DEPRESSION (PHQ-9)
export const depressionQuestions = [
  {
    question: "Little interest or pleasure in doing things",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ]
  },
  {
    question: "Feeling down, depressed, or hopeless",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ]
  },
  {
    question: "Trouble falling or staying asleep, or sleeping too much",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ]
  },
  {
    question: "Feeling tired or having little energy",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ]
  },
  {
    question: "Poor appetite or overeating",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ]
  },
  {
    question: "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ]
  },
  {
    question: "Trouble concentrating on things , such as reading the newspaper or watching television",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ]
  },
  {
    question: "Moving or speaking so slowly that other people could have noticed. Or the opposite being so figety or restless that you have been moving around a lot more than usual",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ]
  },
  {
    question: "Thoughts of being better off dead or self-harm",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ]
  }
];
export function interpretDepressionScore(score) {
  if (score <= 4) {
    return {
      severity: "Minimal depression",
      description: "Your responses suggest that you're experiencing minimal or no depressive symptoms at this time. This is a positive outcome, but it's always helpful to continue monitoring your well-being and seek support if you notice any changes in mood or behavior."
    };
  }
  if (score <= 9) {
    return {
      severity: "Mild depression",
      description: "Some mild symptoms of depression may be present. While this score doesn't indicate a severe issue, it's a good idea to track how you're feeling. Speaking to a therapist or psychiatrist can provide support to prevent symptoms from worsening."
    };
  }
  if (score <= 14) {
    return {
      severity: "Moderate depression",
      description: "Moderate symptoms of depression are present, which may be affecting your day-to-day life. Seeking support from a mental health professional is recommended at this stage to address your symptoms, learn coping strategies, and prevent further impact on your daily functioning."
    };
  }
  if (score <= 19) {
    return {
      severity: "Moderately severe depression",
      description: "Your score suggests significant depressive symptoms that are likely having a noticeable impact on your life. It's important to consult with a therapist or psychiatrist who can help you manage these symptoms effectively and work with you on a treatment plan."
    };
  }
  return {
    severity: "Severe depression",
    description: "Your score indicates that you're experiencing severe depressive symptoms. It's important to reach out to a mental health professional immediately to receive appropriate treatment, which may include therapy, medication, or a combination of both."
  };
}

// OCIR (Obsessive-Compulsive Inventory - Revised)
export const ocirQuestions = [
  {
    question: "I have saved up so many things that they get in the way.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I check things more often than necessary.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I get upset if objects are not arranged properly.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I feel compelled to count while I am doing things.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I find it difficult to touch an object when I know it has been touched by strangers or certain people.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I find it difficult to control my own thoughts.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I collect things I don't need.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I repeatedly check doors, windows, drawers, etc.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I get upset if others change the way I have arranged things.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I feel I have to repeat certain numbers.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I sometimes have to wash or clean myself simply because I feel contaminated.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I am upset by unpleasant thoughts that come into my mind against my will.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I avoid throwing things away because I am afraid I might need them later.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I repeatedly check gas and water taps and light switches after turning them off.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I need things to be arranged in a particular way.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I feel that there are good and bad numbers.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I wash my hands more often and longer than necessary.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  },
  {
    question: "I frequently get nasty thoughts and have difficulty in getting rid of them.",
    options: [
      "Not at all",
      "A little",
      "Moderately",
      "A lot",
      "Extremely"
    ]
  }
];
export const OCIRgetScoreSeverity = (totalScore) => {
  if (totalScore < 14) {
    return {
      severity: "Minimal OCD symptoms",
      description: ""
    };
  }
  if (totalScore < 21) {
    return {
      severity: "Mild OCD symptoms",
      description: ""
    };
  }
  if (totalScore < 28) {
    return {
      severity: "Moderate OCD symptoms",
      description: ""
    };
  }
  if (totalScore < 35) {
    return {
      severity: "Moderate-severe OCD symptoms",
      description: ""
    };
  }
  return {
    severity: "Severe OCD symptoms",
    description: ""
  };
};


// TRAUMA (International Trauma Questionnaire)
export const traumaQuestions = [
  {
    question: "Having 'flashbacks,' that is, you suddenly acted or felt as if a stressful experience from the past was happening all over again (for example, you reexperienced parts of a stressful experience by seeing, hearing, smelling, or physically feeling parts of the experience)?",
    options: [
      "Not at all",
      "A little bit",
      "Moderately",
      "Quite a bit",
      "Extremely"
    ]
  },
  {
    question: "Feeling very emotionally upset when something reminded you of a stressful experience?",
    options: [
      "Not at all",
      "A little bit",
      "Moderately",
      "Quite a bit",
      "Extremely"
    ]
  },
  {
    question: "Trying to avoid thoughts, feelings, or physical sensations that reminded you of a stressful experience?",
    options: [
      "Not at all",
      "A little bit",
      "Moderately",
      "Quite a bit",
      "Extremely"
    ]
  },
  {
    question: "Thinking that a stressful event happened because you or someone else (who didn’t directly harm you) did something wrong or didn’t do everything possible to prevent it, or because of something about you?",
    options: [
      "Not at all",
      "A little bit",
      "Moderately",
      "Quite a bit",
      "Extremely"
    ]
  },
  {
    question: "Having a very negative emotional state (for example, you were experiencing lots of fear, anger, guilt, shame, or horror) after a stressful experience?",
    options: [
      "Not at all",
      "A little bit",
      "Moderately",
      "Quite a bit",
      "Extremely"
    ]
  },
  {
    question: "Losing interest in activities you used to enjoy before having a stressful experience?",
    options: [
      "Not at all",
      "A little bit",
      "Moderately",
      "Quite a bit",
      "Extremely"
    ]
  },
  {
    question: "Being 'super alert,' on guard, or constantly on the lookout for danger?",
    options: [
      "Not at all",
      "A little bit",
      "Moderately",
      "Quite a bit",
      "Extremely"
    ]
  },
  {
    question: "Feeling jumpy or easily startled when you hear an unexpected noise?",
    options: [
      "Not at all",
      "A little bit",
      "Moderately",
      "Quite a bit",
      "Extremely"
    ]
  },
  {
    question: "Being extremely irritable or angry to the point where you yelled at other people, got into fights, or destroyed things?",
    options: [
      "Not at all",
      "A little bit",
      "Moderately",
      "Quite a bit",
      "Extremely"
    ]
  }
];
export const traumainterpretscore = (totalScore) => {
  const averageScore = totalScore / 9;

  if (averageScore < 1) {
    return {
      severity: "No trauma symptoms",
      description: "Your responses suggest no significant trauma-related symptoms. This indicates emotional stability, but it's still helpful to stay mindful of your mental well-being."
    };
  }

  if (averageScore < 2) {
    return {
      severity: "Mild trauma symptoms",
      description: "You may be experiencing mild trauma-related symptoms. While these may not currently affect your daily life significantly, consider discussing your experiences with a mental health professional to build resilience."
    };
  }

  if (averageScore < 3) {
    return {
      severity: "Moderate trauma symptoms",
      description: "Your responses reflect moderate trauma-related symptoms. These symptoms may be impacting your emotional well-being. Seeking support from a mental health provider is advisable."
    };
  }

  if (averageScore < 4) {
    return {
      severity: "Severe trauma symptoms",
      description: "You appear to be experiencing severe trauma symptoms, which could affect your functioning and relationships. It's strongly recommended to connect with a trauma-informed therapist."
    };
  }

  return {
    severity: "Extreme trauma symptoms",
    description: "Your score indicates extremely high levels of trauma-related distress. Please consider seeking immediate support from a qualified mental health professional."
  };
};


// Beck Anxiety Inventory (BAI)
export const Anxiety = [
  {
    question: "Numbness or tingling",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Feeling hot",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Wobbliness in legs",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Unable to relax",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Fear of worst happening",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Dizzy or lightheaded",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Heart pounding / racing",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Unsteady",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Terrified or afraid",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Nervous",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Feeling of choking",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Hands trembling",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Shaky / unsteady",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Fear of losing control",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Difficulty in breathing",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Fear of dying",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Scared",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Indigestion",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Faint / lightheaded",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Face flushed",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  },
  {
    question: "Hot / cold sweats",
    options: [
      "Not at all",
      "Mildly - it didn't bother me much",
      "Moderately - it wasn't pleasant at times",
      "Severely - it bothered me a lot"
    ]
  }
];
export const AnxietyinterpretScore = (score) => {
  if (score <= 21) {
    return {
      severity: "Low anxiety",
      description: "Your score suggests that you're experiencing low levels of anxiety or only mild symptoms. While it's normal to feel anxious at times, your results indicate that anxiety is not significantly affecting your daily life."
    };
  }

  if (score <= 35) {
    return {
      severity: "Moderate anxiety",
      description: "Your score indicates moderate anxiety, meaning you may be experiencing noticeable symptoms that could be impacting your daily activities, relationships, or work. It's recommended to consider talking to a therapist who can help you explore strategies to manage and reduce anxiety effectively."
    };
  }

  return {
    severity: "High anxiety",
    description: "Your score indicates that anxiety is having a significant impact on your life. These high levels of anxiety may be affecting your ability to function in different areas. It's important to seek professional support from a therapist or psychiatrist to address these symptoms, as treatment can help manage and reduce anxiety."
  };
};

// ADHD
export const adhdDichotomousQuestions = [
  {
    question: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
  },
  {
    question: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
  },
  {
    question: "How often do you have problems remembering appointments or obligations?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
  },
  {
    question: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
  },
  {
    question: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
  },
  {
    question: "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
  }
];
// Dichotomous scoring function (0–6 scale)
export function interpretAdhdDichotomousScore(score: number) {
  if (score < 4) {
    return {
      severity: "Negative screen for ADHD",
      description: "Your score does not meet the threshold for ADHD. However, if you're experiencing functional difficulties, consider discussing your symptoms with a healthcare provider."
    };
  }
  return {
    severity: "Positive screen for ADHD",
    description: "Your score indicates that you screened positive for ADHD. A full diagnostic assessment with a clinician is recommended."
  };
}