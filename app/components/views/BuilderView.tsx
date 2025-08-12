import { Form } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { safeLucideIcon } from "~/components/ui/icon";
import { cn } from "~/lib/utils";
import type { Tool, Reference, GenerationType } from "~/types";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";

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
  const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false);
  const taskRequirementsRef = useRef<HTMLTextAreaElement>(null);
  
  // Filter best practice references
  const bestPracticeReferences = references.filter(ref => 
    ref.category.toLowerCase().includes('best practice') || 
    ref.category.toLowerCase().includes('best-practice') ||
    ref.category.toLowerCase().includes('best_practice') ||
    ref.category.toLowerCase().includes('bestpractice')
  );
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
              <div className="flex items-center justify-between">
                <Label className="text-cli-yellow font-mono">Task Requirements</Label>
                <Dialog open={isReferenceDialogOpen} onOpenChange={setIsReferenceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono hover:bg-cli-teal/10 hover:border-cli-teal"
                    >
                      {safeLucideIcon('BookOpen', 'h-4 w-4 mr-1')}
                      Reference
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-cli-terminal border-cli-teal/30 max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-cli-teal font-mono">Best Practice References</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-cli-yellow font-mono text-sm">
                        Click "Insert" to add reference content directly to your task requirements:
                      </p>
                      <div className="grid gap-3 max-h-96 overflow-y-auto">
                        {bestPracticeReferences.length > 0 ? (
                          bestPracticeReferences.map((reference) => (
                            <div key={reference.id} className="p-3 bg-cli-bg/30 rounded-lg border border-cli-teal/20 hover:border-cli-teal/40 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-cli-teal font-mono font-semibold text-sm">{reference.name}</h4>
                                  {reference.description && (
                                    <p className="text-cli-coral/70 font-mono text-xs mt-1">
                                      {reference.description}
                                    </p>
                                  )}
                                  <span className="inline-block px-2 py-0.5 text-xs bg-cli-terminal/50 text-cli-yellow rounded mt-2">
                                    {reference.category}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="ml-2 bg-cli-bg/50 border-cli-coral/30 text-cli-coral font-mono hover:bg-cli-coral/10"
                                  onClick={() => {
                                    if (taskRequirementsRef.current && reference.content) {
                                      const textarea = taskRequirementsRef.current;
                                      const currentValue = textarea.value;
                                      const newValue = currentValue ? `${currentValue}\n\n${reference.content}` : reference.content;
                                      textarea.value = newValue;
                                      textarea.focus();
                                    }
                                    setIsReferenceDialogOpen(false);
                                  }}
                                >
                                  Insert
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-cli-coral/70 font-mono text-sm">
                              No best practice references available.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Textarea
                ref={taskRequirementsRef}
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


            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-md bg-gradient-to-r from-cli-teal to-cli-coral hover:from-cli-teal/80 hover:to-cli-coral/80 text-white font-mono shadow-cli-glow text-lg py-3"
              >
                {isSubmitting ? (
                  <>
                    {safeLucideIcon('Loader2', 'mr-2 h-5 w-5 animate-spin')}
                    AI is analyzing and generating...
                  </>
                ) : (
                  <>
                    {safeLucideIcon('Sparkles', 'mr-2 h-5 w-5')}
                    AI Generate {generationType.charAt(0).toUpperCase() + generationType.slice(1)}
                  </>
                )}
              </Button>
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
          
          {actionData && actionData.showCelebration && (
            <div className="mt-6 p-6 bg-gradient-to-r from-cli-teal/20 to-cli-coral/20 rounded-lg border border-cli-green/50">
              <div className="text-center">
                <div className="animate-bounce mb-4">
                  {safeLucideIcon('Sparkles', 'h-12 w-12 text-cli-green mx-auto')}
                </div>
                <h4 className="font-mono font-bold text-cli-green text-xl mb-2">
                  🎉 {generationType.charAt(0).toUpperCase() + generationType.slice(1)} Generated Successfully!
                </h4>
                <p className="font-mono text-cli-teal text-sm mb-4">
                  Completeness Score: <span className="font-bold text-cli-green">{actionData.completenessScore}/100</span>
                </p>
                
                {actionData.selectedTools && actionData.selectedTools.length > 0 && (
                  <div className="mb-3">
                    <p className="font-mono text-cli-yellow text-sm mb-2">Tools Used:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {actionData.selectedTools.map((tool: any, index: number) => (
                        <span key={index} className="px-3 py-1 bg-cli-teal/20 text-cli-teal font-mono text-sm rounded-full border border-cli-teal/30">
                          {tool.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {actionData.selectedReferences && actionData.selectedReferences.length > 0 && (
                  <div>
                    <p className="font-mono text-cli-yellow text-sm mb-2">References Used:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {actionData.selectedReferences.map((ref: any, index: number) => (
                        <span key={index} className="px-3 py-1 bg-cli-coral/20 text-cli-coral font-mono text-sm rounded-full border border-cli-coral/30">
                          {ref.name}
                        </span>
                      ))}
                    </div>
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