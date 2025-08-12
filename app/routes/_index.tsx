import React, { useEffect } from "react";
import { useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

// Import types
import type { ActiveView } from "~/types";

// Import loader and action
import { createLoader } from "~/lib/index-loader";
import { createAction } from "~/lib/index-action";

// Import hooks
import { useAppState } from "~/hooks/useAppState";
import { useTerminal } from "~/hooks/useTerminal";
import { useToolHandlers } from "~/hooks/useToolHandlers";
import { useReferenceHandlers } from "~/hooks/useReferenceHandlers";

// Import components
import { AppHeader } from "~/components/layout/AppHeader";
import { DashboardView } from "~/components/views/DashboardView";
import { AgentsView } from "~/components/views/AgentsView";
import { TerminalView } from "~/components/views/TerminalView";
import { BuilderView } from "~/components/views/BuilderView";
import { ToolsView } from "~/components/views/ToolsView";
import { ReferencesView } from "~/components/views/ReferencesView";
import { ReferenceModals } from "~/components/modals/ReferenceModals";
import { AgentModal } from "~/components/modals/AgentModal";
import { ToolModals } from "~/components/modals/ToolModals";

// Utility Functions
import { useToast } from "~/hooks/use-toast";

export const meta: MetaFunction = () => {
  return [
    { title: "CLI Prompt Builder - Build Agent Workflows" },
    { name: "description", content: "A command-line interface for building and configuring agent or agentic workflow prompts with guided operations and default settings." },
  ];
};

// Export loader and action
export const loader = createLoader;
export const action = createAction;

export default function Index() {
  const { agents, tools, allTools, references, cliCommands, stats } = useLoaderData<typeof loader>();
  
  // Type casting for Date serialization issues
  const typedAgents = agents as any[];
  const typedTools = tools as any[];
  const typedAllTools = allTools as any[];
  const typedReferences = references as any[];
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();

  // Use custom hooks
  const appState = useAppState();
  const terminal = useTerminal(cliCommands, typedAgents, typedTools, typedReferences);
  const toolHandlers = useToolHandlers();
  const referenceHandlers = useReferenceHandlers();

  const isSubmitting = navigation.state === "submitting";

  // Handle tool form reset after successful edit
  useEffect(() => {
    if (toolHandlers.shouldResetEditForm) {
      appState.setEditingTool(null);
      appState.setSelectedToolType('');
      appState.setToolUsage('');
      appState.setIsEditModalOpen(false);
    }
  }, [toolHandlers.shouldResetEditForm]);

  // Handle reference form reset after successful edit
  useEffect(() => {
    if (referenceHandlers.shouldResetEditReferenceForm) {
      appState.setEditingReference(null);
      appState.setIsEditReferenceModalOpen(false);
    }
  }, [referenceHandlers.shouldResetEditReferenceForm]);

  // Filter references based on search query and category
  const filteredReferences = typedReferences.filter((reference: any) => {
    const matchesSearch = appState.searchQuery === "" || 
      reference.name.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
      reference.description.toLowerCase().includes(appState.searchQuery.toLowerCase());
    
    const matchesCategory = appState.selectedCategory === "all" || 
      reference.category === appState.selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Reset functions
  const resetReferenceForm = () => {
    appState.setIsCreateReferenceModalOpen(false);
  };

  const resetEditReferenceForm = () => {
    appState.setEditingReference(null);
    appState.setIsEditReferenceModalOpen(false);
  };

  // Handle action responses
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      toast({
        title: "Success",
        description: (actionData as any).message || "Operation completed",
        duration: 3000,
      });

      if ('output' in actionData && (actionData as any).output) {
        terminal.setTerminalHistory(prev => [...prev, (actionData as any).output, ""]);
      }

      if (appState.activeView === 'builder') {
        appState.setIsCreateModalOpen(false);
        appState.setSelectedTools([]);
        appState.setSelectedReferences([]);
        appState.setToolUsageInstructions({});
      }
    } else if (actionData && 'error' in actionData && (actionData as any).error) {
      toast({
        title: "Error",
        description: (actionData as any).error,
        duration: 5000,
        variant: "destructive"
      });
    }
  }, [actionData, toast, appState.activeView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cli-dark via-cli-bg to-cli-terminal">
      {/* Header */}
      <AppHeader activeView={appState.activeView} setActiveView={appState.setActiveView} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8">
        {/* Dashboard View */}
        {appState.activeView === 'dashboard' && (
          <DashboardView 
            agents={typedAgents}
            references={typedReferences}
            stats={stats}
            setActiveView={appState.setActiveView}
            setIsCreateReferenceModalOpen={appState.setIsCreateReferenceModalOpen}
            filteredReferences={filteredReferences}
            searchQuery={appState.searchQuery}
            selectedCategory={appState.selectedCategory}
          />
        )}

        {/* Agents View */}
        {appState.activeView === 'agents' && (
          <AgentsView 
            agents={typedAgents}
            setActiveView={appState.setActiveView}
            setSelectedAgent={appState.setSelectedAgent}
          />
        )}

        {/* Terminal View */}
        {appState.activeView === 'terminal' && (
          <TerminalView 
            terminalHistory={terminal.terminalHistory}
            currentCommand={terminal.currentCommand}
            setCurrentCommand={terminal.setCurrentCommand}
            handleTerminalCommand={terminal.handleTerminalCommand}
            isTerminalActive={terminal.isTerminalActive}
            setIsTerminalActive={terminal.setIsTerminalActive}
            terminalRef={terminal.terminalRef}
            cliCommands={cliCommands}
          />
        )}

        {/* Builder View */}
        {appState.activeView === 'builder' && (
          <BuilderView 
            tools={typedTools}
            references={typedReferences}
            selectedTools={appState.selectedTools}
            setSelectedTools={appState.setSelectedTools}
            selectedReferences={appState.selectedReferences}
            setSelectedReferences={appState.setSelectedReferences}
            toolUsageInstructions={appState.toolUsageInstructions}
            setToolUsageInstructions={appState.setToolUsageInstructions}
            generationType={appState.generationType}
            setGenerationType={appState.setGenerationType}
            isSubmitting={isSubmitting}
            actionData={actionData}
          />
        )}

        {/* Tools View */}
        {appState.activeView === 'tools' && (
          <ToolsView 
            allTools={typedAllTools}
            handleEditTool={(tool) => toolHandlers.handleEditTool(
              tool,
              appState.setEditingTool,
              appState.setSelectedToolType,
              appState.setToolUsage,
              appState.setIsEditModalOpen
            )}
            handleDeleteTool={(tool) => toolHandlers.handleDeleteTool(
              tool,
              appState.setToolToDelete,
              appState.setIsDeleteConfirmOpen
            )}
            handleToggleTool={toolHandlers.handleToggleTool}
            setIsCreateModalOpen={appState.setIsCreateModalOpen}
          />
        )}

        {/* References View */}
        {appState.activeView === 'references' && (
          <ReferencesView 
            filteredReferences={filteredReferences}
            searchQuery={appState.searchQuery}
            setSearchQuery={appState.setSearchQuery}
            selectedCategory={appState.selectedCategory}
            setSelectedCategory={appState.setSelectedCategory}
            setIsCreateReferenceModalOpen={appState.setIsCreateReferenceModalOpen}
            handleEditReference={(ref) => referenceHandlers.handleEditReference(
              ref,
              appState.setEditingReference,
              appState.setIsEditReferenceModalOpen
            )}
            handleDeleteReference={(ref) => referenceHandlers.handleDeleteReference(
              ref,
              appState.setReferenceToDelete,
              appState.setIsDeleteReferenceConfirmOpen
            )}
            handleToggleReference={referenceHandlers.handleToggleReference}
          />
        )}

        {/* Docs View - Still under construction */}
        {appState.activeView === 'docs' && (
          <div className="text-center py-12">
            <h2 className="text-cli-teal font-mono text-2xl mb-4">Documentation</h2>
            <p className="text-cli-yellow font-mono">This view will be implemented soon.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReferenceModals
        isCreateReferenceModalOpen={appState.isCreateReferenceModalOpen}
        setIsCreateReferenceModalOpen={appState.setIsCreateReferenceModalOpen}
        isSubmitting={isSubmitting}
        isEditReferenceModalOpen={appState.isEditReferenceModalOpen}
        setIsEditReferenceModalOpen={appState.setIsEditReferenceModalOpen}
        editingReference={appState.editingReference}
        referenceFetcher={referenceHandlers.referenceFetcher}
        isDeleteReferenceConfirmOpen={appState.isDeleteReferenceConfirmOpen}
        setIsDeleteReferenceConfirmOpen={appState.setIsDeleteReferenceConfirmOpen}
        referenceToDelete={appState.referenceToDelete}
        confirmDeleteReference={() => referenceHandlers.confirmDeleteReference(
          appState.referenceToDelete,
          appState.setIsDeleteReferenceConfirmOpen,
          appState.setReferenceToDelete
        )}
        resetReferenceForm={resetReferenceForm}
        resetEditReferenceForm={resetEditReferenceForm}
      />

      {/* Agent Detail Modal */}
      <AgentModal 
        selectedAgent={appState.selectedAgent}
        setSelectedAgent={appState.setSelectedAgent}
      />

      {/* Tool Modals */}
      <ToolModals
        isCreateModalOpen={appState.isCreateModalOpen}
        setIsCreateModalOpen={appState.setIsCreateModalOpen}
        selectedToolType={appState.selectedToolType}
        toolUsage={appState.toolUsage}
        handleToolTypeChange={toolHandlers.handleToolTypeChange}
        setSelectedToolType={appState.setSelectedToolType}
        setToolUsage={appState.setToolUsage}
        isSubmitting={isSubmitting}
        isEditModalOpen={appState.isEditModalOpen}
        setIsEditModalOpen={appState.setIsEditModalOpen}
        editingTool={appState.editingTool}
        toolFetcher={toolHandlers.toolFetcher}
        isDeleteConfirmOpen={appState.isDeleteConfirmOpen}
        setIsDeleteConfirmOpen={appState.setIsDeleteConfirmOpen}
        toolToDelete={appState.toolToDelete}
        confirmDeleteTool={() => toolHandlers.confirmDeleteTool(
          appState.toolToDelete,
          appState.setIsDeleteConfirmOpen,
          appState.setToolToDelete
        )}
        resetToolForm={() => {
          appState.setSelectedToolType('');
          appState.setToolUsage('');
          appState.setIsCreateModalOpen(false);
        }}
        resetEditToolForm={() => {
          appState.setEditingTool(null);
          appState.setSelectedToolType('');
          appState.setToolUsage('');
          appState.setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}