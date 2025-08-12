import { useEffect } from "react";
import { useFetcher, useRevalidator } from "@remix-run/react";
import { useToast } from "~/hooks/use-toast";
import type { Reference } from "~/types";

export function useReferenceHandlers() {
  const { toast } = useToast();
  const referenceFetcher = useFetcher();
  const revalidator = useRevalidator();

  const handleEditReference = (reference: Reference, setEditingReference: (ref: Reference) => void, setIsEditReferenceModalOpen: (open: boolean) => void) => {
    setEditingReference(reference);
    setIsEditReferenceModalOpen(true);
  };

  const handleDeleteReference = (reference: Reference, setReferenceToDelete: (ref: Reference) => void, setIsDeleteReferenceConfirmOpen: (open: boolean) => void) => {
    setReferenceToDelete(reference);
    setIsDeleteReferenceConfirmOpen(true);
  };

  const confirmDeleteReference = (referenceToDelete: Reference | null, setIsDeleteReferenceConfirmOpen: (open: boolean) => void, setReferenceToDelete: (ref: Reference | null) => void) => {
    if (referenceToDelete) {
      referenceFetcher.submit(
        { intent: 'delete_reference', id: referenceToDelete.id.toString() },
        { method: 'post' }
      );
      setIsDeleteReferenceConfirmOpen(false);
      setReferenceToDelete(null);
    }
  };

  const handleToggleReference = (reference: Reference) => {
    referenceFetcher.submit(
      { 
        intent: 'toggle_reference', 
        id: reference.id.toString()
      },
      { method: 'post' }
    );
  };

  // Handle reference fetcher responses
  useEffect(() => {
    if (referenceFetcher.data && 'success' in referenceFetcher.data && referenceFetcher.data.success) {
      const message = 'message' in referenceFetcher.data ? String(referenceFetcher.data.message) : 'Operation completed successfully';
      toast({
        title: "Success",
        description: message,
      });
      
      // Revalidate data to refresh the UI with updated reference information
      revalidator.revalidate();
    } else if (referenceFetcher.data && 'error' in referenceFetcher.data) {
      toast({
        title: "Error",
        description: String(referenceFetcher.data.error),
        variant: "destructive",
      });
    }
  }, [referenceFetcher.data, toast, revalidator]);

  // Check if we need to reset form after successful edit
  const shouldResetEditReferenceForm = referenceFetcher.data && 'success' in referenceFetcher.data && referenceFetcher.data.success && 'reference' in referenceFetcher.data;

  return {
    referenceFetcher,
    handleEditReference,
    handleDeleteReference,
    confirmDeleteReference,
    handleToggleReference,
    shouldResetEditReferenceForm,
  };
}