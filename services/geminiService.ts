
import { GoogleGenAI } from "@google/genai";
import { AssessmentData, DiagnosticReport } from "../types";

/**
 * Generates a final neurological assessment report using the Gemini 3 Pro model.
 * It utilizes high-fidelity reasoning and Google Search grounding to provide clinical context.
 */
export const generateFinalReport = async (data: AssessmentData): Promise<DiagnosticReport & { citations?: any[], isDemo?: boolean }> => {
  const API_KEY = process.env.API_KEY;

  // Fallback to Simulation Mode if no API Key is provided
  if (!API_KEY || API_KEY === 'undefined' || API_KEY === '') {
    console.warn("NeuroLens: API_KEY missing. Entering Simulation Mode.");
    
    // Simulate high-latency "Deep Thinking" process
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return {
      overallRisk: 'Low',
      confidence: 0.94,
      analysis: {
        speech: "Biometric analysis indicates standard phonemic variance. No significant prosodic flattening detected.",
        visual: "Saccadic latency within normal 180-230ms range. Oculomotor fixations demonstrate high stability.",
        cognitive: "Linguistic complexity and typing cadence show no signs of motor tremor or executive function decay."
      },
      recommendations: [
        "Continue daily neuro-stimulative activities.",
        "Maintain current cardiovascular exercise regimen.",
        "Conduct follow-up screening in 6 months."
      ],
      medicalGrounding: "Simulated Report: This baseline analysis represents a healthy neurological profile.",
      isDemo: true,
      citations: [{ web: { title: "Clinical Baseline Reference", uri: "https://ai.google.dev/gemini-api/docs/grounding" } }]
    };
  }

  // Initialize Gemini API client using the required configuration
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    TASK: ANALYZE NEUROLOGICAL BIOMARKERS.
    
    INPUT BIOMETRIC DATA:
    - Audio Metrics: ${JSON.stringify(data.audioMetrics)}
    - Visual Metrics: ${JSON.stringify(data.visualMetrics)}
    - Text Metrics: ${JSON.stringify(data.textMetrics)}
    - Lifestyle Context: ${JSON.stringify(data.behavioralData)}
    
    INSTRUCTIONS:
    1. Act as an expert neuro-diagnostic AI.
    2. Analyze the input data for subtle signs of neurological decline (e.g., Parkinson's or Alzheimer's markers).
    3. Use Google Search to cross-reference detected anomalies with recent clinical literature.
    4. Provide the result strictly in JSON format within a code block.
    
    REQUIRED JSON STRUCTURE:
    {
      "overallRisk": "Low" | "Moderate" | "Elevated",
      "confidence": number,
      "analysis": {
        "speech": "clinical interpretation of verbal markers",
        "visual": "clinical interpretation of oculomotor stability",
        "cognitive": "clinical interpretation of motor/logic sync"
      },
      "recommendations": ["3+ specific wellness directives"],
      "medicalGrounding": "Detailed clinical reasoning supported by search data"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Enable thinking budget for complex diagnostic reasoning tasks
        thinkingConfig: { thinkingBudget: 16384 },
      },
    });

    const responseText = response.text || "";
    
    // Extract JSON from the markdown block or directly from the response text
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse structured diagnostic data from model response.");
    }
    
    const cleanedJson = jsonMatch[1] || jsonMatch[0];
    const result = JSON.parse(cleanedJson.trim());
    
    // Extract search grounding citations from groundingMetadata
    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { 
      ...result, 
      citations: citations, 
      isDemo: false 
    };
  } catch (error) {
    console.error("Gemini Diagnostic Inference Failure:", error);
    throw error;
  }
};
