import { Form } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import type { Tool, GenerationType } from "~/types";

interface BuilderViewProps {
  tools: Tool[];
  selectedTools: string[];
  setSelectedTools: (tools: string[]) => void;
  toolUsageInstructions: Record<string, string>;
  setToolUsageInstructions: (instructions: Record<string, string>) => void;
  generationType: GenerationType;
  setGenerationType: (type: GenerationType) => void;
  isSubmitting: boolean;
  actionData?: any;
}

export function BuilderView({
  tools,
  selectedTools,
  setSelectedTools,
  toolUsageInstructions,
  setToolUsageInstructions,
  generationType,
  setGenerationType,
  isSubmitting,
  actionData
}: BuilderViewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-mono font-bold text-cli-teal">Agent & Workflow Builder</h2>
        <p className="text-cli-yellow font-mono">Create intelligent agents and workflows with AI assistance</p>
      </div>

      <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
            {safeLucideIcon('Wrench', 'h-5 w-5')}
            Configuration Builder
          </CardTitle>
          <CardDescription className="text-cli-yellow font-mono">
            Provide task requirements and select tools to generate optimized configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <input type="hidden" name="intent" value={`generate_${generationType}`} />
            <input type="hidden" name="selectedTools" value={JSON.stringify(selectedTools)} />
            <input type="hidden" name="toolUsageInstructions" value={JSON.stringify(toolUsageInstructions)} />

            <div className="space-y-2">
              <Label className="text-cli-yellow font-mono">Configuration Type</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setGenerationType("agent")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-mono text-sm transition-colors",
                    generationType === "agent"
                      ? "bg-cli-teal text-white"
                      : "bg-cli-bg/50 text-cli-teal border border-cli-teal/30"
                  )}
                >
                  {safeLucideIcon('Bot', 'mr-2 h-4 w-4')}
                  Agent
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationType("workflow")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-mono text-sm transition-colors",
                    generationType === "workflow"
                      ? "bg-cli-teal text-white"
                      : "bg-cli-bg/50 text-cli-teal border border-cli-teal/30"
                  )}
                >
                  {safeLucideIcon('GitBranch', 'mr-2 h-4 w-4')}
                  Workflow
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-cli-yellow font-mono">Name</Label>
                <Input
                  name="name"
                  placeholder={`e.g., ${generationType === 'agent' ? 'Data Analysis Agent' : 'Code Review Workflow'}`}
                  className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-cli-yellow font-mono">Description</Label>
                <Input
                  name="description"
                  placeholder="Brief description of the purpose"
                  className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-cli-yellow font-mono">Task Requirements</Label>
              <Textarea
                name="taskRequirements"
                placeholder="Describe what this agent/workflow should accomplish. Be specific about inputs, outputs, and expected behavior."
                rows={4}
                className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral resize-none"
                required
              />
              <p className="text-xs text-cli-coral font-mono">
                Tip: Include details about data types, expected outputs, and any constraints
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-cli-yellow font-mono">Available Tools</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-4 bg-cli-bg/30 rounded-lg border border-cli-teal/20">
                {tools.map((tool) => (
                  <div key={tool.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tool-${tool.id}`}
                      checked={selectedTools.includes(tool.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTools([...selectedTools, tool.name]);
                          setToolUsageInstructions(prev => ({
                            ...prev,
                            [tool.name]: prev[tool.name] || ''
                          }));
                        } else {
                          setSelectedTools(selectedTools.filter(t => t !== tool.name));
                          setToolUsageInstructions(prev => {
                            const newInstructions = { ...prev };
                            delete newInstructions[tool.name];
                            return newInstructions;
                          });
                        }
                      }}
                      className="border-cli-teal/50"
                    />
                    <Label
                      htmlFor={`tool-${tool.id}`}
                      className="text-cli-teal font-mono text-sm cursor-pointer"
                    >
                      {tool.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-cli-yellow font-mono">
                Selected: {selectedTools.length} tools
              </p>
            </div>

            {/* Tool Usage Instructions */}
            {selectedTools.length > 0 && (
              <div className="space-y-4">
                <Label className="text-cli-yellow font-mono">Tool Usage Instructions</Label>
                <div className="space-y-3">
                  {selectedTools.map((toolName) => {
                    const tool = tools.find(t => t.name === toolName);
                    return (
                      <div key={toolName} className="space-y-2">
                        <Label className="text-cli-teal font-mono text-sm">
                          {toolName} - 使用说明
                        </Label>
                        <Textarea
                          placeholder={`请描述在此${generationType === 'agent' ? 'agent' : 'workflow'}中如何使用 ${toolName} 工具...`}
                          value={toolUsageInstructions[toolName] || ''}
                          onChange={(e) => {
                            setToolUsageInstructions(prev => ({
                              ...prev,
                              [toolName]: e.target.value
                            }));
                          }}
                          rows={2}
                          className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono text-sm focus:border-cli-coral resize-none"
                        />
                        {tool?.description && (
                          <p className="text-xs text-cli-coral/70 font-mono">
                            工具描述: {tool.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                name="intent"
                value="validate_config"
                variant="outline"
                disabled={isSubmitting}
                className="border-cli-yellow text-cli-yellow hover:bg-cli-yellow/10 font-mono"
              >
                {safeLucideIcon('CheckCircle', 'mr-2 h-4 w-4')}
                Validate Config
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-cli-teal hover:bg-cli-teal/80 text-white font-mono shadow-cli-glow"
              >
                {isSubmitting ? (
                  <>
                    {safeLucideIcon('Loader2', 'mr-2 h-4 w-4 animate-spin')}
                    Generating...
                  </>
                ) : (
                  <>
                    {safeLucideIcon('Sparkles', 'mr-2 h-4 w-4')}
                    Generate {generationType.charAt(0).toUpperCase() + generationType.slice(1)}
                  </>
                )}
              </Button>
            </div>
          </Form>

          {/* Validation Results */}
          {actionData && 'validation' in actionData && actionData.validation && (
            <div className="mt-6 p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
              <h4 className="font-mono font-semibold text-cli-teal mb-3">Configuration Validation</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {actionData.validation.isComplete ? (
                    <>
                      {safeLucideIcon('CheckCircle', 'h-5 w-5 text-cli-green')}
                      <span className="text-cli-green font-mono">Configuration is complete</span>
                    </>
                  ) : (
                    <>
                      {safeLucideIcon('AlertCircle', 'h-5 w-5 text-cli-yellow')}
                      <span className="text-cli-yellow font-mono">Configuration needs improvement</span>
                    </>
                  )}
                </div>

                {actionData.validation.missingInfo?.length > 0 && (
                  <div>
                    <p className="text-cli-coral font-mono text-sm mb-2">Missing Information:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {actionData.validation.missingInfo.map((info: string, index: number) => (
                        <li key={index} className="text-cli-yellow font-mono text-sm">{info}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {actionData.validation.recommendations?.length > 0 && (
                  <div>
                    <p className="text-cli-teal font-mono text-sm mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {actionData.validation.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-cli-green font-mono text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}