import { useState, useEffect, useCallback } from "react";
import { useFetcher } from "@remix-run/react";
import type { ActiveView, GenerationType, Tool, Reference, Agent } from "~/types";

export function useAppState() {
  // SPA state management
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [toolUsageInstructions, setToolUsageInstructions] = useState<Record<string, string>>({});
  const [generationType, setGenerationType] = useState<GenerationType>("agent");

  // References state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Tools state
  const [selectedToolType, setSelectedToolType] = useState<'mcp' | 'cli' | 'openapi' | ''>('');
  const [toolUsage, setToolUsage] = useState('');
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  
  // Reference management states
  const [editingReference, setEditingReference] = useState<Reference | null>(null);
  const [isEditReferenceModalOpen, setIsEditReferenceModalOpen] = useState(false);
  const [isDeleteReferenceConfirmOpen, setIsDeleteReferenceConfirmOpen] = useState(false);
  const [referenceToDelete, setReferenceToDelete] = useState<Reference | null>(null);
  const [isCreateReferenceModalOpen, setIsCreateReferenceModalOpen] = useState(false);

  return {
    // View state
    activeView,
    setActiveView,
    selectedAgent,
    setSelectedAgent,
    
    // Modal states
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isCreateReferenceModalOpen,
    setIsCreateReferenceModalOpen,
    isEditReferenceModalOpen,
    setIsEditReferenceModalOpen,
    isDeleteReferenceConfirmOpen,
    setIsDeleteReferenceConfirmOpen,
    
    // Tool states
    selectedTools,
    setSelectedTools,
    selectedReferences,
    setSelectedReferences,
    toolUsageInstructions,
    setToolUsageInstructions,
    generationType,
    setGenerationType,
    selectedToolType,
    setSelectedToolType,
    toolUsage,
    setToolUsage,
    editingTool,
    setEditingTool,
    toolToDelete,
    setToolToDelete,
    
    // Reference states
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    editingReference,
    setEditingReference,
    referenceToDelete,
    setReferenceToDelete,
  };
}