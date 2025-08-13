import { Form } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import type { Tool, Reference, GenerationType } from "~/types";
import { useState } from "react";

interface BuilderViewProps {
  tools: Tool[];
  references: Reference[];
  selectedTools: string[];
  setSelectedTools: (tools: string[]) => void;
  selectedReferences: string[];
  setSelectedReferences: (references: string[]) => void;
  toolUsageInstructions: Record<string, string>;
  setToolUsageInstructions: (instructions: Record<string, string>) => void;
  generationType: GenerationType;
  setGenerationType: (type: GenerationType) => void;
  isSubmitting: boolean;
  actionData?: any;
}

export function BuilderView({
  tools,
  references,
  selectedTools,
  setSelectedTools,
  selectedReferences,
  setSelectedReferences,
  toolUsageInstructions,
  setToolUsageInstructions,
  generationType,
  setGenerationType,
  isSubmitting,
  actionData
}: BuilderViewProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
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
            <input type="hidden" name="selectedReferences" value={JSON.stringify(selectedReferences)} />
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
              <div className="relative">
                <Label className="text-cli-yellow font-mono">Task Requirements</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 h-6 px-2 text-xs text-cli-coral hover:text-cli-yellow hover:bg-cli-bg/30 font-mono"
                    >
                      {safeLucideIcon('BookOpen', 'h-3 w-3 mr-1')}
                      Reference
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-cli-bg border-cli-teal/30">
                    {references.filter(ref => ref.category === 'best_practice').map((reference) => (
                      <DropdownMenuItem
                        key={reference.id}
                        className="text-cli-teal hover:bg-cli-bg/50 font-mono text-xs cursor-pointer"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="taskRequirements"]') as HTMLTextAreaElement;
                          if (textarea && reference.content) {
                            const currentValue = textarea.value;
                            const newValue = currentValue + (currentValue ? '\n\n' : '') + reference.content;
                            textarea.value = newValue;
                            textarea.focus();
                          }
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{reference.name}</span>
                          {reference.description && (
                            <span className="text-cli-coral/70 text-xs">
                              {reference.description.length > 50 ? `${reference.description.substring(0, 50)}...` : reference.description}
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {references.filter(ref => ref.category === 'best_practice').length === 0 && (
                      <DropdownMenuItem disabled className="text-cli-coral/50 font-mono text-xs">
                        No best practice references available
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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

            {/* Advanced Options */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between p-2 text-cli-yellow font-mono hover:bg-cli-bg/30"
                >
                  <span className="flex items-center gap-2">
                    {safeLucideIcon('Settings', 'h-4 w-4')}
                    Advanced Options
                    {(selectedTools.length > 0 || selectedReferences.length > 0) && (
                      <span className="text-xs bg-cli-teal text-white px-2 py-0.5 rounded-full">
                        {selectedTools.length + selectedReferences.length} selected
                      </span>
                    )}
                  </span>
                  {safeLucideIcon(isAdvancedOpen ? 'ChevronUp' : 'ChevronDown', 'h-4 w-4')}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-6 pt-4">
                {/* Tool Selection */}
                <div className="space-y-2">
                  <Label className="text-cli-yellow font-mono">Available Tools (Optional)</Label>
                  <p className="text-xs text-cli-coral/70 font-mono mb-3">
                    Leave empty to use all available tools automatically
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-4 bg-cli-bg/30 rounded-lg border border-cli-teal/20">
                    {tools.map((tool) => (
                      <div key={tool.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tool-${tool.id}`}
                          checked={selectedTools.includes(tool.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTools([...selectedTools, tool.name]);
                              setToolUsageInstructions({
                                ...toolUsageInstructions,
                                [tool.name]: toolUsageInstructions[tool.name] || ''
                              });
                            } else {
                              setSelectedTools(selectedTools.filter(t => t !== tool.name));
                              const newInstructions = { ...toolUsageInstructions };
                              delete newInstructions[tool.name];
                              setToolUsageInstructions(newInstructions);
                            }
                          }}
                          className="border-cli-teal/50"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`tool-${tool.id}`}
                            className="text-cli-teal font-mono text-sm cursor-pointer block"
                          >
                            {tool.name}
                          </Label>
                          {tool.description && (
                            <p className="text-xs text-cli-coral/70 font-mono mt-1">
                              {tool.description.length > 60 ? `${tool.description.substring(0, 60)}...` : tool.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-cli-yellow font-mono">
                    Selected: {selectedTools.length} tools
                  </p>
                </div>

                {/* Reference Selection */}
                <div className="space-y-2">
                  <Label className="text-cli-yellow font-mono">Reference Documents (Optional)</Label>
                  <p className="text-xs text-cli-coral/70 font-mono mb-3">
                    Leave empty to use all available references automatically
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 bg-cli-bg/30 rounded-lg border border-cli-teal/20">
                    {references.map((reference) => (
                      <div key={reference.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reference-${reference.id}`}
                          checked={selectedReferences.includes(reference.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReferences([...selectedReferences, reference.name]);
                            } else {
                              setSelectedReferences(selectedReferences.filter(r => r !== reference.name));
                            }
                          }}
                          className="border-cli-teal/50"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`reference-${reference.id}`}
                            className="text-cli-teal font-mono text-sm cursor-pointer block"
                          >
                            {reference.name}
                          </Label>
                          {reference.description && (
                            <p className="text-xs text-cli-coral/70 font-mono mt-1">
                              {reference.description.length > 80 ? `${reference.description.substring(0, 80)}...` : reference.description}
                            </p>
                          )}
                          <span className="inline-block px-2 py-0.5 text-xs bg-cli-terminal/50 text-cli-yellow rounded mt-1">
                            {reference.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-cli-yellow font-mono">
                    Selected: {selectedReferences.length} references
                  </p>
                </div>
                {/* Tool Usage Instructions - Only shown if tools are manually selected */}
                {selectedTools.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-cli-yellow font-mono">Tool Usage Instructions (Optional)</Label>
                    <p className="text-xs text-cli-coral/70 font-mono mb-3">
                      AI will automatically determine optimal usage, but you can provide specific instructions if needed
                    </p>
                    <div className="space-y-3">
                      {selectedTools.map((toolName) => {
                        const tool = tools.find(t => t.name === toolName);
                        return (
                          <div key={toolName} className="space-y-2">
                            <Label className="text-cli-teal font-mono text-sm">
                              {toolName} - Usage Instructions
                            </Label>
                            <Textarea
                              placeholder={`Describe how to use ${toolName} in this ${generationType}... (optional)`}
                              value={toolUsageInstructions[toolName] || ''}
                              onChange={(e) => {
                                setToolUsageInstructions({
                                  ...toolUsageInstructions,
                                  [toolName]: e.target.value
                                });
                              }}
                              rows={2}
                              className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono text-sm focus:border-cli-coral resize-none"
                            />
                            {tool?.description && (
                              <p className="text-xs text-cli-coral/70 font-mono">
                                Tool description: {tool.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Smart AI Selection Info */}
            <div className="bg-cli-terminal/30 p-4 rounded-lg border border-cli-teal/20">
              <div className="flex items-center gap-2 mb-2">
                {safeLucideIcon('Brain', 'h-4 w-4 text-cli-teal')}
                <span className="font-mono text-cli-teal text-sm font-semibold">AI-Powered Selection</span>
              </div>
              <p className="font-mono text-cli-yellow text-xs leading-relaxed">
                Our AI will intelligently analyze your task requirements and automatically select the most appropriate tools and reference documents. 
                If you don't specify tools or references above, the AI will choose from all available options to create the optimal {generationType}.
              </p>
            </div>


            <div className="flex justify-center gap-4 pt-6">
              <Button
                type="submit"
                name="previewMode"
                value="true"
                disabled={isSubmitting}
                className="max-w-md bg-gradient-to-r from-cli-yellow to-cli-teal hover:from-cli-yellow/80 hover:to-cli-teal/80 text-white font-mono shadow-cli-glow text-lg py-3"
              >
                {isSubmitting ? (
                  <>
                    {safeLucideIcon('Loader2', 'mr-2 h-5 w-5 animate-spin')}
                    AI is generating...
                  </>
                ) : (
                  <>
                    {safeLucideIcon('Eye', 'mr-2 h-5 w-5')}
                    Preview Generate
                  </>
                )}
              </Button>
              
              {actionData?.showPreview && (
                <Button
                  type="submit"
                  name="previewMode"
                  value="false"
                  disabled={isSubmitting}
                  className="max-w-md bg-gradient-to-r from-cli-teal to-cli-coral hover:from-cli-teal/80 hover:to-cli-coral/80 text-white font-mono shadow-cli-glow text-lg py-3"
                >
                  {safeLucideIcon('Save', 'mr-2 h-5 w-5')}
                  Save {generationType.charAt(0).toUpperCase() + generationType.slice(1)}
                </Button>
              )}
            </div>
          </Form>

          {/* Generation Results */}
          {actionData && actionData.showMissingInfo && (
            <div className="mt-6 p-4 bg-cli-bg/50 rounded-lg border border-cli-coral/30">
              <div className="flex items-center gap-2 mb-4">
                {safeLucideIcon('AlertTriangle', 'h-5 w-5 text-cli-coral')}
                <h4 className="font-mono font-semibold text-cli-coral">Configuration Needs Improvement</h4>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-cli-yellow font-mono text-sm">Completeness Score:</span>
                  <span className={`font-mono font-bold ${actionData.completenessScore < 50 ? 'text-cli-coral' : actionData.completenessScore < 80 ? 'text-cli-yellow' : 'text-cli-green'}`}>
                    {actionData.completenessScore}/100
                  </span>
                </div>
              </div>
              
              {actionData.selectedTools && actionData.selectedTools.length > 0 && (
                <div className="mb-4">
                  <p className="text-cli-teal font-mono text-sm mb-2">Selected Tools:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {actionData.selectedTools.map((tool: any, index: number) => (
                      <div key={index} className="bg-cli-terminal/30 p-2 rounded border border-cli-teal/20">
                        <div className="font-mono text-cli-teal text-sm font-semibold">{tool.name}</div>
                        <div className="font-mono text-cli-yellow text-xs">{tool.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {actionData.selectedReferences && actionData.selectedReferences.length > 0 && (
                <div className="mb-4">
                  <p className="text-cli-teal font-mono text-sm mb-2">Selected References:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {actionData.selectedReferences.map((ref: any, index: number) => (
                      <div key={index} className="bg-cli-terminal/30 p-2 rounded border border-cli-teal/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-mono text-cli-teal text-sm font-semibold">{ref.name}</div>
                            <div className="font-mono text-cli-yellow text-xs">{ref.reason}</div>
                          </div>
                          <span className="px-2 py-0.5 text-xs bg-cli-bg/50 text-cli-coral rounded">{ref.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {actionData.missingInfo && actionData.missingInfo.length > 0 && (
                <div className="mb-4">
                  <p className="text-cli-coral font-mono text-sm mb-2">Missing Critical Information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {actionData.missingInfo.map((info: string, index: number) => (
                      <li key={index} className="text-cli-yellow font-mono text-sm">{info}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-cli-yellow/10 rounded border border-cli-yellow/30">
                <p className="text-cli-yellow font-mono text-sm">
                  💡 Please provide the missing information above, then click "AI Generate" again to create a complete {generationType}.
                </p>
              </div>
            </div>
          )}
          
          {/* Preview Generation Results */}
          {actionData && actionData.showPreview && actionData.aiResponse && (
            <div className="mt-6 space-y-6">
              <div className="bg-cli-terminal/50 p-6 rounded-lg border border-cli-teal/30">
                <div className="flex items-center gap-2 mb-4">
                  {safeLucideIcon('Eye', 'h-5 w-5 text-cli-teal')}
                  <h4 className="font-mono font-bold text-cli-teal text-lg">Generation Preview</h4>
                </div>
                
                {/* Generated Result */}
                <div className="mb-6">
                  <h5 className="font-mono text-cli-yellow text-sm mb-2">Generated Prompt:</h5>
                  <div className="bg-cli-bg/50 p-4 rounded border border-cli-teal/20 max-h-96 overflow-y-auto">
                    <pre className="text-cli-teal font-mono text-sm whitespace-pre-wrap">{actionData.aiResponse.result}</pre>
                  </div>
                </div>
                
                {/* Reasoning */}
                <div className="mb-6">
                  <h5 className="font-mono text-cli-yellow text-sm mb-2">Design Reasoning:</h5>
                  <div className="bg-cli-bg/50 p-4 rounded border border-cli-teal/20">
                    <p className="text-cli-teal font-mono text-sm whitespace-pre-wrap">{actionData.aiResponse.reason}</p>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="mb-6">
                  <h5 className="font-mono text-cli-yellow text-sm mb-2">Recommendations:</h5>
                  <div className="bg-cli-bg/50 p-4 rounded border border-cli-teal/20">
                    <ul className="space-y-2">
                      {actionData.aiResponse.recommendations?.map((rec: string, index: number) => (
                        <li key={index} className="text-cli-teal font-mono text-sm flex items-start gap-2">
                          <span className="text-cli-coral">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Missing Tools and References */}
                {(actionData.aiResponse.missingTools?.length > 0 || actionData.aiResponse.missingReferences?.length > 0) && (
                  <div className="mb-6">
                    <h5 className="font-mono text-cli-coral text-sm mb-3">Missing Items (Need to Create):</h5>
                    
                    {actionData.aiResponse.missingTools?.length > 0 && (
                      <div className="mb-4">
                        <p className="font-mono text-cli-yellow text-xs mb-2">Missing Tools:</p>
                        <div className="grid gap-2">
                          {actionData.aiResponse.missingTools.map((tool: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-cli-terminal/30 p-3 rounded border border-cli-coral/20">
                              <div>
                                <span className="font-mono text-cli-coral text-sm font-semibold">{tool.name}</span>
                                <p className="font-mono text-cli-yellow text-xs">{tool.description}</p>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                className="bg-cli-coral/20 border-cli-coral text-cli-coral hover:bg-cli-coral/30 font-mono text-xs"
                                onClick={() => {
                                  // Open tool creation with pre-filled data
                                  const toolData = {
                                    name: tool.name,
                                    description: tool.description,
                                    usage: tool.usage || "请提供使用说明",
                                    category: "development", // default category
                                    toolType: "cli" as const // default type
                                  };
                                  
                                  // Create a form and submit it to open the tool creation modal
                                  const form = document.createElement('form');
                                  form.method = 'post';
                                  form.style.display = 'none';
                                  
                                  // Add form data
                                  Object.entries(toolData).forEach(([key, value]) => {
                                    const input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = key;
                                    input.value = value;
                                    form.appendChild(input);
                                  });
                                  
                                  // Add intent
                                  const intentInput = document.createElement('input');
                                  intentInput.type = 'hidden';
                                  intentInput.name = 'intent';
                                  intentInput.value = 'prefill_tool_creation';
                                  form.appendChild(intentInput);
                                  
                                  document.body.appendChild(form);
                                  form.submit();
                                }}
                              >
                                Quick Create
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {actionData.aiResponse.missingReferences?.length > 0 && (
                      <div>
                        <p className="font-mono text-cli-yellow text-xs mb-2">Missing References:</p>
                        <div className="grid gap-2">
                          {actionData.aiResponse.missingReferences.map((ref: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-cli-terminal/30 p-3 rounded border border-cli-coral/20">
                              <div>
                                <span className="font-mono text-cli-coral text-sm font-semibold">{ref.name}</span>
                                <p className="font-mono text-cli-yellow text-xs">{ref.description}</p>
                                <span className="inline-block px-2 py-0.5 text-xs bg-cli-bg/50 text-cli-coral rounded mt-1">{ref.category}</span>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                className="bg-cli-coral/20 border-cli-coral text-cli-coral hover:bg-cli-coral/30 font-mono text-xs"
                                onClick={() => {
                                  // Open reference creation with pre-filled data
                                  const refData = {
                                    name: ref.name,
                                    description: ref.description,
                                    category: ref.category || "best-practice",
                                    content: ref.content || "请提供具体的文档内容和使用指南"
                                  };
                                  
                                  // Create a form and submit it to open the reference creation modal
                                  const form = document.createElement('form');
                                  form.method = 'post';
                                  form.style.display = 'none';
                                  
                                  // Add form data
                                  Object.entries(refData).forEach(([key, value]) => {
                                    const input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = key;
                                    input.value = value;
                                    form.appendChild(input);
                                  });
                                  
                                  // Add intent
                                  const intentInput = document.createElement('input');
                                  intentInput.type = 'hidden';
                                  intentInput.name = 'intent';
                                  intentInput.value = 'prefill_reference_creation';
                                  form.appendChild(intentInput);
                                  
                                  document.body.appendChild(form);
                                  form.submit();
                                }}
                              >
                                Quick Create
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Save Form */}
                <Form method="post" className="mt-6">
                  <input type="hidden" name="intent" value="save_generated_agent" />
                  <input type="hidden" name="type" value={actionData.type} />
                  <input type="hidden" name="taskRequirements" value={actionData.taskRequirements} />
                  <input type="hidden" name="generatedPrompt" value={actionData.aiResponse.result} />
                  <input type="hidden" name="configuration" value={JSON.stringify(actionData.aiResponse.configuration)} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-cli-yellow font-mono text-sm">Name *</Label>
                      <Input
                        name="name"
                        defaultValue={actionData.name || ""}
                        placeholder="Enter a name for this agent/workflow"
                        className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-cli-yellow font-mono text-sm">Description *</Label>
                      <Input
                        name="description"
                        defaultValue={actionData.description || ""}
                        placeholder="Brief description"
                        className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-cli-teal to-cli-coral hover:from-cli-teal/80 hover:to-cli-coral/80 text-white font-mono shadow-cli-glow"
                    >
                      {safeLucideIcon('Save', 'mr-2 h-4 w-4')}
                      Save {actionData.type?.charAt(0).toUpperCase() + actionData.type?.slice(1)}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          )}

          {actionData && actionData.showCelebration && (
            <div className="mt-6 p-6 bg-gradient-to-r from-cli-teal/20 to-cli-coral/20 rounded-lg border border-cli-green/50">
              <div className="text-center">
                <div className="animate-bounce mb-4">
                  {safeLucideIcon('Sparkles', 'h-12 w-12 text-cli-green mx-auto')}
                </div>
                <h4 className="font-mono font-bold text-cli-green text-xl mb-2">
                  🎉 {generationType.charAt(0).toUpperCase() + generationType.slice(1)} Saved Successfully!
                </h4>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}