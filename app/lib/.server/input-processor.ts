// @ts-nocheck
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

async function sleepTillEndOfMinute(): Promise<void> {
  return new Promise((resolve) => {
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000;
    console.log("Seconds waiting EoM: ", { delay });
    setTimeout(resolve, delay);
  });
}

async function sleepRandomly(): Promise<void> {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * 10000) + 1000;
    setTimeout(resolve, delay);
  });
}

async function generateWithRetries(prompt: string, retries = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
      });
      return text;
    } catch (error) {
      console.error(`Error on AI generation attempt ${attempt}`, error);
      if (attempt < retries) {
        console.log("Retrying AI generation...");
        await sleepTillEndOfMinute();
        await sleepRandomly();
      } else {
        console.error("Failed AI generation after multiple attempts. No more retries.");
      }
    }
  }
  return null;
}

export interface ProcessingResult {
  response: string;
  nextStep: string;
  missingInfo: string[];
  recommendations: string[];
  confidence: number;
  suggestions: string[];
  isComplete: boolean;
  followUpQuestions?: string[];
}

export interface SessionContext {
  sessionId: string;
  currentStep: string;
  taskType?: string;
  requirements: string[];
  selectedTools: string[];
  missingInfo: string[];
  userResponses: Record<string, any>;
}

export interface BestPracticeAnalysis {
  taskComplexity: "simple" | "moderate" | "complex";
  riskLevel: "low" | "medium" | "high";
  suggestedApproach: string;
  timeEstimate: string;
  requiredSkills: string[];
  potentialChallenges: string[];
  recommendedPractices: Array<{
    title: string;
    priority: "high" | "medium" | "low";
    reasoning: string;
    category: string;
  }>;
  customRecommendations: string[];
  confidence: number;
}

export class InputProcessor {
  async processUserInput(
    userInput: string,
    context: SessionContext,
    availableTools: string[]
  ): Promise<ProcessingResult | null> {
    try {
      const prompt = this.buildProcessingPrompt(userInput, context, availableTools);
      const response = await generateWithRetries(prompt);
      
      if (!response) {
        throw new Error("Failed to process user input");
      }

      return this.parseProcessingResponse(response, context);
    } catch (error) {
      console.error("Error processing user input:", error);
      return null;
    }
  }

  async analyzeRequirements(requirements: string): Promise<BestPracticeAnalysis | null> {
    try {
      const prompt = this.buildAnalysisPrompt(requirements);
      const response = await generateWithRetries(prompt);
      
      if (!response) {
        throw new Error("Failed to analyze requirements");
      }

      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error("Error analyzing requirements:", error);
      return null;
    }
  }

  async provideBestPracticeRecommendations(
    taskType: string,
    requirements: string,
    selectedTools: string[]
  ): Promise<BestPracticeAnalysis | null> {
    try {
      const prompt = this.buildRecommendationPrompt(taskType, requirements, selectedTools);
      const response = await generateWithRetries(prompt);
      
      if (!response) {
        throw new Error("Failed to generate recommendations");
      }

      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return null;
    }
  }

  private buildProcessingPrompt(userInput: string, context: SessionContext, availableTools: string[]): string {
    return `
You are an expert AI assistant helping users build optimal agent workflows and configurations. 

Current Context:
- Session ID: ${context.sessionId}
- Current Step: ${context.currentStep}
- Task Type: ${context.taskType || "general"}
- Previous Requirements: ${context.requirements.join(", ") || "None"}
- Selected Tools: ${context.selectedTools.join(", ") || "None"}
- Available Tools: ${availableTools.join(", ")}

User Input: "${userInput}"

Analyze the user input and provide guidance to help them build the best possible agent or workflow. Consider:
1. Clarity and completeness of requirements
2. Tool selection appropriateness
3. Best practices for the task type
4. Potential challenges or missing information
5. Next steps in the configuration process

Respond with a JSON object containing:
- response: string (helpful response to the user)
- nextStep: string (what should happen next)
- missingInfo: array of strings (what information is still needed)
- recommendations: array of strings (best practice suggestions)
- confidence: number (0-100, how complete the configuration is)
- suggestions: array of strings (specific improvement suggestions)
- isComplete: boolean (whether enough info has been gathered)
- followUpQuestions: array of strings (specific questions to ask the user)

Focus on being helpful, specific, and actionable in your guidance.
`;
  }

  private buildAnalysisPrompt(requirements: string): string {
    return `
You are an expert in agent workflow design and best practices. Analyze the following task requirements and provide comprehensive recommendations:

Requirements: "${requirements}"

Analyze the requirements and provide:
1. Task complexity assessment
2. Risk level evaluation
3. Suggested approach and methodology
4. Time estimation for implementation
5. Required skills and expertise
6. Potential challenges and mitigation strategies
7. Specific best practice recommendations with priorities
8. Custom recommendations based on the specific requirements

Respond with a JSON object containing:
- taskComplexity: "simple" | "moderate" | "complex"
- riskLevel: "low" | "medium" | "high"
- suggestedApproach: string (recommended methodology)
- timeEstimate: string (estimated time to complete)
- requiredSkills: array of strings (skills needed)
- potentialChallenges: array of strings (challenges to expect)
- recommendedPractices: array of objects with title, priority, reasoning, category
- customRecommendations: array of strings (specific to these requirements)
- confidence: number (0-100, confidence in the analysis)

Focus on practical, actionable advice that will help ensure project success.
`;
  }

  private buildRecommendationPrompt(taskType: string, requirements: string, selectedTools: string[]): string {
    return `
You are an expert in agent workflow optimization and industry best practices. Provide recommendations for the following configuration:

Task Type: ${taskType}
Requirements: ${requirements}
Selected Tools: ${selectedTools.join(", ")}

Analyze this configuration and provide:
1. Assessment of tool selection appropriateness
2. Workflow optimization recommendations
3. Best practices specific to this task type
4. Security and performance considerations
5. Common pitfalls to avoid
6. Implementation strategy recommendations

Respond with a JSON object containing:
- taskComplexity: "simple" | "moderate" | "complex"
- riskLevel: "low" | "medium" | "high"
- suggestedApproach: string (recommended approach)
- timeEstimate: string (estimated implementation time)
- requiredSkills: array of strings (skills needed)
- potentialChallenges: array of strings (challenges to expect)
- recommendedPractices: array of objects with title, priority, reasoning, category
- customRecommendations: array of strings (specific recommendations)
- confidence: number (0-100, confidence in recommendations)

Focus on industry best practices and proven methodologies.
`;
  }

  private parseProcessingResponse(response: string, context: SessionContext): ProcessingResult {
    try {
      const parsed = JSON.parse(response);
      return {
        response: parsed.response || "I'm here to help you build the best configuration possible.",
        nextStep: parsed.nextStep || "gather_requirements",
        missingInfo: parsed.missingInfo || [],
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 50,
        suggestions: parsed.suggestions || [],
        isComplete: parsed.isComplete || false,
        followUpQuestions: parsed.followUpQuestions || []
      };
    } catch (error) {
      console.error("Error parsing processing response:", error);
      return {
        response: "I understand you want to build something. Could you provide more details about your specific requirements?",
        nextStep: "gather_requirements",
        missingInfo: ["Specific task requirements", "Expected inputs and outputs", "Success criteria"],
        recommendations: ["Be specific about what you want to accomplish", "Include input/output formats", "Define success criteria"],
        confidence: 25,
        suggestions: ["Provide more detailed requirements"],
        isComplete: false,
        followUpQuestions: [
          "What specific task do you want your agent to perform?",
          "What type of input data will it work with?",
          "What should the output look like?"
        ]
      };
    }
  }

  private parseAnalysisResponse(response: string): BestPracticeAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        taskComplexity: parsed.taskComplexity || "moderate",
        riskLevel: parsed.riskLevel || "medium",
        suggestedApproach: parsed.suggestedApproach || "Start with a simple implementation and iterate",
        timeEstimate: parsed.timeEstimate || "2-4 hours",
        requiredSkills: parsed.requiredSkills || ["Basic programming", "Problem solving"],
        potentialChallenges: parsed.potentialChallenges || ["Requirement clarity", "Tool integration"],
        recommendedPractices: parsed.recommendedPractices || [
          {
            title: "Define Clear Requirements",
            priority: "high",
            reasoning: "Clear requirements prevent scope creep and ensure focused development",
            category: "Planning"
          }
        ],
        customRecommendations: parsed.customRecommendations || ["Start with a prototype", "Test with sample data"],
        confidence: parsed.confidence || 75
      };
    } catch (error) {
      console.error("Error parsing analysis response:", error);
      return {
        taskComplexity: "moderate",
        riskLevel: "medium",
        suggestedApproach: "Start with a simple implementation and iterate based on results",
        timeEstimate: "2-4 hours",
        requiredSkills: ["Basic programming", "Problem solving"],
        potentialChallenges: ["Requirement clarity", "Tool integration", "Testing complexity"],
        recommendedPractices: [
          {
            title: "Define Clear Requirements",
            priority: "high",
            reasoning: "Clear requirements are essential for successful implementation",
            category: "Planning"
          }
        ],
        customRecommendations: ["Start with a simple prototype", "Test with sample data", "Iterate based on feedback"],
        confidence: 60
      };
    }
  }
}

export const inputProcessor = new InputProcessor();
