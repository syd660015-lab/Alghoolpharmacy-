/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { DashboardData, AIInsight } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export const analyzeKPIs = async (data: DashboardData): Promise<AIInsight[]> => {
  const prompt = `
    As a Healthcare Quality Management Expert, analyze the following KPI data and provide 3-5 actionable insights in English.
    Focus on trends, potential risks, and recommendations for improvement.
    
    Data:
    Operational:
    - Waiting time: ${data.operational.waitingTime.value} ${data.operational.waitingTime.unit} (Target: ${data.operational.waitingTime.target})
    - Workflow efficiency: ${data.operational.workflowEfficiency.value}% (Target: ${data.operational.workflowEfficiency.target}%)
    - Resource utilization: ${data.operational.resourceUtilization.value}% (Target: ${data.operational.resourceUtilization.target}%)
    
    Clinical:
    - Medication errors: ${data.clinical.medicationErrors.value} (Target: ${data.clinical.medicationErrors.target})
    - Treatment adherence: ${data.clinical.treatmentAdherence.value}% (Target: ${data.clinical.treatmentAdherence.target}%)
    - Clinical outcomes: ${data.clinical.clinicalOutcomes.value}/100
    
    Satisfaction:
    - Survey Score: ${data.satisfaction.surveyScore.value}/5
    - Service Responsiveness: ${data.satisfaction.serviceResponsiveness.value}/10
    
    Return a JSON array of objects with the following structure:
    [{ "id": "string", "title": "string", "description": "string", "severity": "info" | "warning" | "alert", "actionable": boolean, "category": "string" }]
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (result.text) {
      return JSON.parse(result.text);
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
  }

  return [];
};
