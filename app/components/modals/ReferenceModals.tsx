import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import type { Reference } from "~/types";

interface ReferenceModalsProps {
  // Create Modal
  isCreateReferenceModalOpen: boolean;
  setIsCreateReferenceModalOpen: (open: boolean) => void;
  isSubmitting: boolean;
  
  // Edit Modal
  isEditReferenceModalOpen: boolean;
  setIsEditReferenceModalOpen: (open: boolean) => void;
  editingReference: Reference | null;
  referenceFetcher: any;
  
  // Delete Modal
  isDeleteReferenceConfirmOpen: boolean;
  setIsDeleteReferenceConfirmOpen: (open: boolean) => void;
  referenceToDelete: Reference | null;
  confirmDeleteReference: () => void;
  
  // Reset functions
  resetReferenceForm: () => void;
  resetEditReferenceForm: () => void;
}

export function ReferenceModals({
  isCreateReferenceModalOpen,
  setIsCreateReferenceModalOpen,
  isSubmitting,
  isEditReferenceModalOpen,
  setIsEditReferenceModalOpen,
  editingReference,
  referenceFetcher,
  isDeleteReferenceConfirmOpen,
  setIsDeleteReferenceConfirmOpen,
  referenceToDelete,
  confirmDeleteReference,
  resetReferenceForm,
  resetEditReferenceForm,
}: ReferenceModalsProps) {
  return (
    <>
      {/* Create Reference Modal */}
      <Dialog open={isCreateReferenceModalOpen} onOpenChange={setIsCreateReferenceModalOpen}>
        <DialogContent className="bg-cli-terminal border-cli-teal/30 text-cli-green max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cli-teal font-mono">Add New Reference</DialogTitle>
            <DialogDescription className="text-cli-yellow font-mono">
              Create a new reference for your knowledge base
            </DialogDescription>
          </DialogHeader>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="create_reference" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ref-name" className="text-cli-teal font-mono">Reference Name</Label>
                <Input
                  id="ref-name"
                  name="name"
                  placeholder="Enter reference name"
                  className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ref-category" className="text-cli-teal font-mono">Category</Label>
                <Select name="category" required>
                  <SelectTrigger className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-cli-terminal border-cli-teal/30">
                    <SelectItem value="prompt_template" className="text-cli-green font-mono">Prompt Template</SelectItem>
                    <SelectItem value="workflow_guide" className="text-cli-green font-mono">Workflow Guide</SelectItem>
                    <SelectItem value="tool_documentation" className="text-cli-green font-mono">Tool Documentation</SelectItem>
                    <SelectItem value="best_practice" className="text-cli-green font-mono">Best Practice</SelectItem>
                    <SelectItem value="example" className="text-cli-green font-mono">Example</SelectItem>
                    <SelectItem value="configuration" className="text-cli-green font-mono">Configuration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref-description" className="text-cli-teal font-mono">Description</Label>
              <Input
                id="ref-description"
                name="description"
                placeholder="Brief description of the reference"
                className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref-content" className="text-cli-teal font-mono">Content</Label>
              <Textarea
                id="ref-content"
                name="content"
                placeholder="Enter the reference content..."
                className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono min-h-[120px]"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetReferenceForm}
                className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
              >
                {isSubmitting ? 'Creating...' : 'Create Reference'}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Reference Modal */}
      <Dialog open={isEditReferenceModalOpen} onOpenChange={setIsEditReferenceModalOpen}>
        <DialogContent className="bg-cli-terminal border-cli-teal/30 text-cli-green max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cli-teal font-mono">Edit Reference</DialogTitle>
            <DialogDescription className="text-cli-yellow font-mono">
              Update the reference information
            </DialogDescription>
          </DialogHeader>
          
          <referenceFetcher.Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="update_reference" />
            <input type="hidden" name="id" value={editingReference?.id || ''} />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ref-name" className="text-cli-teal font-mono">Reference Name</Label>
                <Input
                  id="edit-ref-name"
                  name="name"
                  defaultValue={editingReference?.name || ''}
                  placeholder="Enter reference name"
                  className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ref-category" className="text-cli-teal font-mono">Category</Label>
                <Select name="category" defaultValue={editingReference?.category || ''} required>
                  <SelectTrigger className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-cli-terminal border-cli-teal/30">
                    <SelectItem value="prompt_template" className="text-cli-green font-mono">Prompt Template</SelectItem>
                    <SelectItem value="workflow_guide" className="text-cli-green font-mono">Workflow Guide</SelectItem>
                    <SelectItem value="tool_documentation" className="text-cli-green font-mono">Tool Documentation</SelectItem>
                    <SelectItem value="best_practice" className="text-cli-green font-mono">Best Practice</SelectItem>
                    <SelectItem value="example" className="text-cli-green font-mono">Example</SelectItem>
                    <SelectItem value="configuration" className="text-cli-green font-mono">Configuration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-ref-description" className="text-cli-teal font-mono">Description</Label>
              <Input
                id="edit-ref-description"
                name="description"
                defaultValue={editingReference?.description || ''}
                placeholder="Brief description of the reference"
                className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-ref-content" className="text-cli-teal font-mono">Content</Label>
              <Textarea
                id="edit-ref-content"
                name="content"
                defaultValue={editingReference?.content || ''}
                placeholder="Enter the reference content..."
                className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono min-h-[120px]"
                required
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditReferenceModalOpen(false);
                  resetEditReferenceForm();
                }}
                className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
              >
                Update Reference
              </Button>
            </DialogFooter>
          </referenceFetcher.Form>
        </DialogContent>
      </Dialog>

      {/* Delete Reference Confirmation Dialog */}
      <Dialog open={isDeleteReferenceConfirmOpen} onOpenChange={setIsDeleteReferenceConfirmOpen}>
        <DialogContent className="bg-cli-terminal border-cli-coral/30 text-cli-green">
          <DialogHeader>
            <DialogTitle className="text-cli-coral font-mono">Delete Reference</DialogTitle>
            <DialogDescription className="text-cli-yellow font-mono">
              Are you sure you want to delete "{referenceToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteReferenceConfirmOpen(false)}
              className="border-cli-teal text-cli-teal hover:bg-cli-teal/10 font-mono"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteReference}
              className="bg-cli-coral hover:bg-cli-coral/80 text-white font-mono"
            >
              Delete Reference
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}