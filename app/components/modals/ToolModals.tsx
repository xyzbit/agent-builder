import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import type { Tool, ToolType } from "~/types";

interface ToolModalsProps {
  // Create Modal
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  selectedToolType: ToolType | '';
  toolUsage: string;
  handleToolTypeChange: (type: ToolType, setType: (t: ToolType) => void, setUsage: (u: string) => void) => void;
  setSelectedToolType: (type: ToolType) => void;
  setToolUsage: (usage: string) => void;
  isSubmitting: boolean;
  
  // Edit Modal
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  editingTool: Tool | null;
  toolFetcher: any;
  
  // Delete Modal
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: (open: boolean) => void;
  toolToDelete: Tool | null;
  confirmDeleteTool: () => void;
  
  // Reset functions
  resetToolForm: () => void;
  resetEditToolForm: () => void;
}

export function ToolModals({
  isCreateModalOpen,
  setIsCreateModalOpen,
  selectedToolType,
  toolUsage,
  handleToolTypeChange,
  setSelectedToolType,
  setToolUsage,
  isSubmitting,
  isEditModalOpen,
  setIsEditModalOpen,
  editingTool,
  toolFetcher,
  isDeleteConfirmOpen,
  setIsDeleteConfirmOpen,
  toolToDelete,
  confirmDeleteTool,
  resetToolForm,
  resetEditToolForm,
}: ToolModalsProps) {
  return (
    <>
      {/* Create Tool Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-cli-terminal border-cli-teal/30 text-cli-green max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cli-teal font-mono">Add New Tool</DialogTitle>
            <DialogDescription className="text-cli-yellow font-mono">
              Configure a new tool for your agent workflows
            </DialogDescription>
          </DialogHeader>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="create_tool" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-cli-teal font-mono">Tool Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter tool name"
                  className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-cli-teal font-mono">Category</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="e.g., development, productivity"
                  className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-cli-teal font-mono">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what this tool does"
                className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toolType" className="text-cli-teal font-mono">Tool Type</Label>
              <Select 
                name="toolType" 
                value={selectedToolType} 
                onValueChange={(value: ToolType) => handleToolTypeChange(value, setSelectedToolType, setToolUsage)} 
                required
              >
                <SelectTrigger className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono">
                  <SelectValue placeholder="Select tool type" />
                </SelectTrigger>
                <SelectContent className="bg-cli-terminal border-cli-teal/30">
                  <SelectItem value="mcp" className="text-cli-green font-mono">MCP</SelectItem>
                  <SelectItem value="cli" className="text-cli-green font-mono">CLI</SelectItem>
                  <SelectItem value="openapi" className="text-cli-green font-mono">OpenAPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage" className="text-cli-teal font-mono">Usage Instructions</Label>
              <Textarea
                id="usage"
                name="usage"
                value={toolUsage}
                onChange={(e) => setToolUsage(e.target.value)}
                placeholder="Usage instructions will be auto-filled based on tool type"
                className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetToolForm}
                className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
              >
                {isSubmitting ? 'Creating...' : 'Create Tool'}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Tool Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-cli-terminal border-cli-teal/30 text-cli-green max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cli-teal font-mono">Edit Tool</DialogTitle>
            <DialogDescription className="text-cli-yellow font-mono">
              Update the tool configuration
            </DialogDescription>
          </DialogHeader>
          
          <toolFetcher.Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="update_tool" />
            <input type="hidden" name="id" value={editingTool?.id || ''} />
            
            <div className="space-y-2">
              <Label htmlFor="edit-tool-name" className="text-cli-yellow font-mono">Tool Name</Label>
              <Input
                id="edit-tool-name"
                name="name"
                defaultValue={editingTool?.name || ''}
                className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono focus:border-cli-teal"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-tool-description" className="text-cli-yellow font-mono">Description</Label>
              <Textarea
                id="edit-tool-description"
                name="description"
                defaultValue={editingTool?.description || ''}
                className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono focus:border-cli-teal min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tool-category" className="text-cli-yellow font-mono">Category</Label>
                <Select name="category" defaultValue={editingTool?.category || ''}>
                  <SelectTrigger className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-cli-terminal border-cli-teal/30">
                    <SelectItem value="development" className="text-cli-green font-mono">Development</SelectItem>
                    <SelectItem value="automation" className="text-cli-green font-mono">Automation</SelectItem>
                    <SelectItem value="integration" className="text-cli-green font-mono">Integration</SelectItem>
                    <SelectItem value="analysis" className="text-cli-green font-mono">Analysis</SelectItem>
                    <SelectItem value="communication" className="text-cli-green font-mono">Communication</SelectItem>
                    <SelectItem value="other" className="text-cli-green font-mono">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tool-type" className="text-cli-yellow font-mono">Tool Type</Label>
                <Select name="toolType" defaultValue={editingTool?.toolType || ''}>
                  <SelectTrigger className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-cli-terminal border-cli-teal/30">
                    <SelectItem value="mcp" className="text-cli-green font-mono">MCP</SelectItem>
                    <SelectItem value="cli" className="text-cli-green font-mono">CLI</SelectItem>
                    <SelectItem value="openapi" className="text-cli-green font-mono">OpenAPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-tool-usage" className="text-cli-yellow font-mono">Usage Instructions</Label>
              <Textarea
                id="edit-tool-usage"
                name="usage"
                defaultValue={editingTool?.usage || ''}
                placeholder="Describe how to use this tool..."
                className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono focus:border-cli-teal min-h-[80px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="hidden"
                name="isActive"
                value={editingTool?.isActive ? "true" : "false"}
              />
              <Switch
                defaultChecked={editingTool?.isActive || false}
                onCheckedChange={(checked) => {
                  // Update the hidden input value
                  const hiddenInput = document.querySelector('input[name="isActive"]') as HTMLInputElement;
                  if (hiddenInput) {
                    hiddenInput.value = checked ? "true" : "false";
                  }
                }}
                className="data-[state=checked]:bg-cli-teal"
              />
              <Label className="text-cli-yellow font-mono">Tool is active</Label>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetEditToolForm();
                }}
                className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
              >
                Update Tool
              </Button>
            </DialogFooter>
          </toolFetcher.Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-cli-terminal border-cli-coral/30 text-cli-green">
          <DialogHeader>
            <DialogTitle className="text-cli-coral font-mono">Delete Tool</DialogTitle>
            <DialogDescription className="text-cli-yellow font-mono">
              Are you sure you want to delete "{toolToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
              }}
              className="border-cli-teal text-cli-teal hover:bg-cli-teal/10 font-mono"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteTool}
              className="bg-cli-coral hover:bg-cli-coral/80 text-white font-mono"
            >
              Delete Tool
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}