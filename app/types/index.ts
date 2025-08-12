// Types for our CLI application
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  parameters: PromptParameter[];
  createdAt: string;
}

export interface PromptParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

export interface CLICommand {
  command: string;
  description: string;
  example: string;
  category: string;
}

export interface Agent {
  id: number;
  name: string;
  description: string;
  type: "agent" | "workflow";
  status: "draft" | "active" | "archived";
  taskRequirements: string;
  generatedPrompt?: string;
  configuration?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  id: number;
  name: string;
  description: string;
  category: string;
  toolType: 'mcp' | 'cli' | 'openapi';
  usage?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserSession {
  id: number;
  sessionId: string;
  currentStep: string;
  status: string;
  context?: any;
  createdAt: Date;
  updatedAt: Date;
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

export interface Reference {
  id: number;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferenceAnalysis {
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

export type ActiveView = 'dashboard' | 'agents' | 'builder' | 'tools' | 'terminal' | 'references' | 'docs';
export type GenerationType = "agent" | "workflow";
export type ToolType = 'mcp' | 'cli' | 'openapi';