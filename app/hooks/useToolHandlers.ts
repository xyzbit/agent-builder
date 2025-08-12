import { useEffect } from "react";
import { useFetcher, useRevalidator } from "@remix-run/react";
import { useToast } from "~/hooks/use-toast";
import type { Tool, ToolType } from "~/types";

export function useToolHandlers() {
  const { toast } = useToast();
  const toolFetcher = useFetcher();
  const revalidator = useRevalidator();

  // Handle tool type change and auto-fill usage
  const handleToolTypeChange = (value: ToolType, setSelectedToolType: (type: ToolType) => void, setToolUsage: (usage: string) => void) => {
    setSelectedToolType(value);
    let defaultUsage = '';
    switch (value) {
      case 'mcp':
        defaultUsage = '如果该mcp工具本身没有描述清楚，可以在此补充，否则可不填';
        break;
      case 'cli':
        defaultUsage = '默认通过 -h 获取cli的使用方式，你也可以做格外补充';
        break;
      case 'openapi':
        defaultUsage = '请填入 openapi 接口文档，建议使用 openapi v3｜swagger 格式';
        break;
    }
    setToolUsage(defaultUsage);
  };

  const handleEditTool = (tool: Tool, setEditingTool: (tool: Tool) => void, setSelectedToolType: (type: ToolType) => void, setToolUsage: (usage: string) => void, setIsEditModalOpen: (open: boolean) => void) => {
    setEditingTool(tool);
    setSelectedToolType(tool.toolType);
    setToolUsage(tool.usage || '');
    setIsEditModalOpen(true);
  };

  const handleDeleteTool = (tool: Tool, setToolToDelete: (tool: Tool) => void, setIsDeleteConfirmOpen: (open: boolean) => void) => {
    setToolToDelete(tool);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteTool = (toolToDelete: Tool | null, setIsDeleteConfirmOpen: (open: boolean) => void, setToolToDelete: (tool: Tool | null) => void) => {
    if (toolToDelete) {
      toolFetcher.submit(
        { intent: 'delete_tool', id: toolToDelete.id.toString() },
        { method: 'post' }
      );
      setIsDeleteConfirmOpen(false);
      setToolToDelete(null);
    }
  };

  const handleToggleTool = (tool: Tool) => {
    toolFetcher.submit(
      { 
        intent: 'toggle_tool', 
        id: tool.id.toString(), 
        isActive: (!tool.isActive).toString() 
      },
      { method: 'post' }
    );
  };

  // Handle tool fetcher responses
  useEffect(() => {
    if (toolFetcher.data && 'success' in toolFetcher.data && toolFetcher.data.success) {
      const message = 'message' in toolFetcher.data ? String(toolFetcher.data.message) : 'Operation completed successfully';
      toast({
        title: "Success",
        description: message,
      });
      
      // Revalidate data to refresh the UI with updated tool information
      revalidator.revalidate();
    } else if (toolFetcher.data && 'error' in toolFetcher.data) {
      toast({
        title: "Error",
        description: String(toolFetcher.data.error),
        variant: "destructive",
      });
    }
  }, [toolFetcher.data, toast, revalidator]);

  // Check if we need to reset form after successful edit
  const shouldResetEditForm = toolFetcher.data && 'success' in toolFetcher.data && toolFetcher.data.success && 'tool' in toolFetcher.data;

  return {
    toolFetcher,
    handleToolTypeChange,
    handleEditTool,
    handleDeleteTool,
    confirmDeleteTool,
    handleToggleTool,
    shouldResetEditForm,
  };
}