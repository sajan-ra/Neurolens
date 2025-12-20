
import OpenAI from "openai";
import { AssessmentData, DiagnosticReport } from "../types";

export const generateFinalReport = async (data: AssessmentData): Promise<DiagnosticReport & { citations?: any[], isDemo?: boolean }> => {
  const API_KEY = process.env.API_KEY;

  // Fallback if API key is missing to prevent Vercel deployment crashes
  if (!API_KEY || API_KEY === 'undefined' || API_KEY === '') {
    console.warn("NeuroLens: No API Key found. Running in simulation mode.");
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    return {
      overallRisk: 'Low',
      confidence: 0.92,
      analysis: {
        speech: "SIMULATED: Vocal patterns show standard frequency distribution. No micro-tremors detected in the 50Hz range.",
        visual: "SIMULATED: Gaze tracking stable with standard saccadic latency of 210ms.",
        cognitive: "SIMULATED: Linguistic variability suggests high executive function and working memory stability."
      },
      recommendations: [
        "Continue routine cognitive monitoring.",
        "Maintain current physical activity levels.",
        "Ensure consistent 7-9 hour sleep cycles."
      ],
      medicalGrounding: "DEMO MODE: In a production environment, this analysis is grounded in real-time medical literature. Currently displaying baseline metrics.",
      isDemo: true,
      citations: [
        { web: { title: "Standard Cognitive Baselines", uri: "https://example.com/demo" } }
      ]
    };
  }

  // Configuration for NVIDIA Integrated API (DeepSeek-V3)
  const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    dangerouslyAllowBrowser: true 
  });

  const prompt = `
    ACT AS A SENIOR NEUROLOGICAL DIAGNOSTIC AI SYSTEM.
    Analyze the following multimodal digital biomarker data for indicators of neurodegenerative risk (specifically targeting Alzheimer's and Parkinson's patterns).

    DATA PACKAGE:
    - ACOUSTIC: ${JSON.stringify(data.audioMetrics)}
    - OCULOMOTOR: ${JSON.stringify(data.visualMetrics)}
    - LINGUISTIC: ${JSON.stringify(data.textMetrics)}
    - BEHAVIORAL CONTEXT: ${JSON.stringify(data.behavioralData)}
    
    REQUIRED OUTPUT:
    Return a STRICT JSON object only. Do not provide any conversational preamble.
    Structure:
    {
      "overallRisk": "Low" | "Moderate" | "Elevated",
      "confidence": number,
      "analysis": {
        "speech": "text",
        "visual": "text",
        "cognitive": "text"
      },
      "recommendations": ["string"],
      "medicalGrounding": "Deep clinical reasoning text"
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/deepseek-v3",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Near-zero temperature for strict structural compliance
      top_p: 1,
      max_tokens: 4096,
      stream: true
    });

    let fullText = "";
    for await (const chunk of completion) {
      fullText += chunk.choices[0]?.delta?.content || "";
    }

    // Attempt to extract JSON if the model included markdown wrappers
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : fullText;
    
    const result = JSON.parse(jsonStr);
    
    return { 
      ...result, 
      citations: [], // Manual citations placeholder
      isDemo: false 
    };
  } catch (error) {
    console.error("Diagnostic Analysis Error:", error);
    throw error;
  }
};
