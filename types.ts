
export enum AssessmentStage {
  WELCOME = 'welcome',
  AUDIO = 'audio',
  CAMERA = 'camera',
  TEXT = 'text',
  MICRO_TESTS = 'micro_tests',
  BEHAVIORAL = 'behavioral',
  ANALYZING = 'analyzing',
  REPORT = 'report'
}

export interface AssessmentData {
  audioMetrics?: {
    transcript: string;
    pauseCount: number;
    fillerWords: string[];
    speechRate: number;
  };
  visualMetrics?: {
    blinkRate: number;
    gazeStability: number;
    expressionDelta: number;
    motorLag: number;
  };
  textMetrics?: {
    content: string;
    backspaces: number;
    typingSpeed: number;
    errors: number;
    complexity: number;
  };
  cognitiveScores?: {
    memoryScore: number;
    attentionScore: number;
    reactionTimeMs: number;
  };
  behavioralData?: {
    sleepRating: number;
    activityLevel: number;
    socialEngagement: number;
    stressFrequency: number;
  };
}

export interface DiagnosticReport {
  overallRisk: 'Low' | 'Moderate' | 'Elevated';
  confidence: number;
  analysis: {
    speech: string;
    visual: string;
    cognitive: string;
  };
  recommendations: string[];
  // Clinical reasoning and search-grounded text from Gemini
  medicalGrounding: string;
}
