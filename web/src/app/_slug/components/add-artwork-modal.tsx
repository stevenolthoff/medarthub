"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
// Removed usePathname and Image from here, as ImageUploadZone handles it
// import { usePathname } from "next/navigation";
// import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Loader2 } from "lucide-react"; // Removed Plus, ThumbsUp, Eye, Trash2 as they are in ImageUploadZone
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { type RouterOutputs } from "@/lib/server-trpc";
import { ImageUploadZone } from "./ImageUploadZone"; // Import the new ImageUploadZone component

// Use inferred type directly for artwork, now includes coverImage
type ArtworkData = NonNullable<RouterOutputs['artist']['getBySlug']>['artworks'][0];

// Simple debounce utility
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

type AddArtworkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialArtwork?: ArtworkData;
  onArtworkSaved: () => void;
};

// Removed ImageUploadPlaceholderProps and ImageUploadPlaceholder component

export function AddArtworkModal({ isOpen, onClose, initialArtwork, onArtworkSaved }: AddArtworkModalProps) {
  const { user, isLoggedIn } = useAuth();
  
  // Use refs to store latest mutable state for debounced function and direct field access
  const titleRef = useRef(initialArtwork?.title || "");
  const descriptionRef = useRef(initialArtwork?.description || "");
  const statusRef = useRef<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(initialArtwork?.status || 'DRAFT');
  const coverImageIdRef = useRef<string | null>(initialArtwork?.coverImage?.id || null); // New ref for cover image ID
  const isDirtyRef = useRef(false);

  // This ref will store the ID of the artwork being actively edited/created.
  // Critical for switching from 'create' to 'update' during autosave.
  const currentArtworkIdRef = useRef<string | undefined>(initialArtwork?.id);

  // Use states to trigger re-renders of controlled components in the UI
  const [title, _setTitle] = useState(initialArtwork?.title || "");
  const [description, _setDescription] = useState(initialArtwork?.description || "");

  const [formError, setFormError] = useState<string | null>(null);

  const createArtworkMutation = trpc.artist.createArtwork.useMutation();
  const updateArtworkMutation = trpc.artist.updateArtwork.useMutation();
  const unpublishArtworkMutation = trpc.artist.unpublishArtwork.useMutation();

  const isSaving = createArtworkMutation.isPending || updateArtworkMutation.isPending || unpublishArtworkMutation.isPending;

  // Initialize refs and states when modal opens or initialArtwork changes
  useEffect(() => {
    titleRef.current = initialArtwork?.title || "";
    descriptionRef.current = initialArtwork?.description || "";
    statusRef.current = initialArtwork?.status || 'DRAFT';
    coverImageIdRef.current = initialArtwork?.coverImage?.id || null; // Initialize coverImageId ref
    currentArtworkIdRef.current = initialArtwork?.id;
    isDirtyRef.current = false;

    // Update state to trigger re-render of controlled inputs
    _setTitle(titleRef.current);
    _setDescription(descriptionRef.current);

    setFormError(null);
  }, [initialArtwork, isOpen]);

  // Unified change handler for all form fields
  const handleFieldChange = useCallback((
    ref: React.MutableRefObject<string | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | null>, // Update ref type
    setState: React.Dispatch<React.SetStateAction<string>>,
    value: string | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  ) => {
    ref.current = value;
    setState(value as React.SetStateAction<string>); // Cast for string state setters
    isDirtyRef.current = true;
  }, []);

  const handleImageSelected = useCallback((imageId: string | null, r2Key: string | null) => {
    console.log('AddArtworkModal: Image selected:', { imageId, r2Key });
    coverImageIdRef.current = imageId; // Update the ref with the new image ID
    isDirtyRef.current = true;
  }, []);

  // Memoize the debounced autosave function definition, not its execution
  const debouncedAutosave = useMemo(
    () =>
      debounce(async () => {
        // Read current values from refs
        const currentTitle = titleRef.current.trim();
        const currentDescription = descriptionRef.current.trim();
        const currentStatus = statusRef.current;
        const currentCoverImageId = coverImageIdRef.current; // Get the cover image ID
        const currentArtworkId = currentArtworkIdRef.current; // Get the artwork ID

        if (!isDirtyRef.current || !currentTitle) return; // Only autosave if dirty and title exists

        const dataToSave = {
          title: currentTitle,
          description: currentDescription,
          status: currentStatus,
          coverImageId: currentCoverImageId, // Include coverImageId in autosave
        };
        
        console.log('AddArtworkModal: Autosaving with data:', dataToSave);

        try {
          if (currentArtworkId) {
            // Update existing artwork
            await updateArtworkMutation.mutateAsync({
              artworkId: currentArtworkId,
              ...dataToSave,
            });
            console.log("Artwork autosaved (update)!");
          } else if (user?.artist?.id) {
            // Create new artwork
            const result = await createArtworkMutation.mutateAsync(dataToSave);
            currentArtworkIdRef.current = result.artwork.id; // CRITICAL: Store the new Artwork ID
            // Also update the coverImageIdRef if it was set during this creation for the new artwork
            coverImageIdRef.current = result.artwork.coverImage?.id || null; 
            console.log("Artwork autosaved (create)! New Artwork ID:", result.artwork.id);
            onArtworkSaved(); // Notify parent to refetch when new artwork is created via autosave
          }
          isDirtyRef.current = false; // Reset dirty state after successful autosave
        } catch (error) {
          console.error("Autosave failed:", error);
          // Don't set formError for autosave, it's disruptive
        }
      }, 2000), // 2-second debounce
    [user?.artist?.id, createArtworkMutation, updateArtworkMutation] // Dependencies for useMemo (debounced function itself)
  );

  // Effect to trigger autosave when relevant states/refs change
  useEffect(() => {
    // Only call debounced autosave if dirty and modal is open
    // The actual values are read from refs inside the debounced function.
    if (isDirtyRef.current && isOpen) {
      debouncedAutosave();
    }
    // Cleanup function for object URLs created by dropzone if modal closes or component unmounts
    return () => {
      // Any logic for revoking object URLs should be handled by ImageUploadZone.
      // This modal doesn't directly manage `previewUrl` via `URL.createObjectURL`.
    };
  }, [title, description, statusRef.current, coverImageIdRef.current, isOpen, debouncedAutosave]); // Dependencies for triggering the autosave

  const handleUnpublish = async () => {
    const finalArtworkId = currentArtworkIdRef.current;

    if (!finalArtworkId) {
      setFormError("No artwork to unpublish.");
      return;
    }

    setFormError(null);

    try {
      await unpublishArtworkMutation.mutateAsync({
        artworkId: finalArtworkId,
      });
      console.log("Artwork unpublished!");
      onArtworkSaved(); // Notify parent to refetch
      onClose(); // Close the modal on success
    } catch (error: any) {
      console.error("Unpublish failed:", error);
      setFormError(error.message || "An unexpected error occurred.");
    }
  };

  const handleSubmit = async (submitStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    const finalTitle = titleRef.current.trim();
    const finalDescription = descriptionRef.current.trim();
    const finalCoverImageId = coverImageIdRef.current; // Get the cover image ID
    const finalArtworkId = currentArtworkIdRef.current;

    if (!finalTitle) {
      setFormError("Title is required.");
      return;
    }
    // A cover image is now required for an artwork.
    if (!finalCoverImageId && submitStatus === 'PUBLISHED') {
      setFormError("A cover image is required to publish an artwork.");
      return;
    }
    setFormError(null);

    const dataToSend = {
      title: finalTitle,
      description: finalDescription,
      status: submitStatus,
      coverImageId: finalCoverImageId, // Include coverImageId in manual save
    };
    
    console.log('AddArtworkModal: Manual save with data:', dataToSend);

    try {
      if (finalArtworkId) {
        await updateArtworkMutation.mutateAsync({
          artworkId: finalArtworkId,
          ...dataToSend,
        });
        console.log("Artwork updated!");
      } else {
        const result = await createArtworkMutation.mutateAsync(dataToSend);
        currentArtworkIdRef.current = result.artwork.id; // Update artwork ID if it was a new creation
        coverImageIdRef.current = result.artwork.coverImage?.id || null;
        console.log("Artwork created!");
      }
      onArtworkSaved(); // Notify parent to refetch
      onClose(); // Close the modal on success
    } catch (error: any) {
      console.error("Save failed:", error);
      setFormError(error.message || "An unexpected error occurred.");
    }
  };

  if (!isLoggedIn) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (!isSaving) {
          onClose();
        }
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialArtwork ? "Edit Artwork" : "Create New Artwork"}</DialogTitle>
          <DialogDescription>
            {initialArtwork ? "Update details for your artwork." : "Add a new artwork to your profile."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2.5fr] gap-6">
          <div>
            <ImageUploadZone
              currentArtworkCoverImage={initialArtwork?.coverImage}
              onImageSelected={handleImageSelected}
            />
          </div>

          <div className="space-y-6">
            <Field>
              <FieldLabel htmlFor="title">Project Title</FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="Give your project a title"
                value={title} // Use state for UI rendering
                onChange={(e) => handleFieldChange(titleRef, _setTitle, e.target.value)}
                required
              />
              {(createArtworkMutation.error || updateArtworkMutation.error)?.data?.zodError && (
                <FieldError>
                  {(createArtworkMutation.error || updateArtworkMutation.error)?.data?.zodError
                    ?.find((issue: any) => issue.path?.includes('title'))?.message}
                </FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Tell us about your artwork..."
                value={description} // Use state for UI rendering
                onChange={(e) => handleFieldChange(descriptionRef, _setDescription, e.target.value)}
                rows={5}
              />
            </Field>

          </div>
        </div>

        {formError && (
          <FieldError className="text-center mt-4">{formError}</FieldError>
        )}

        <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-between sm:gap-4">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {initialArtwork?.status === 'PUBLISHED' && (
              <Button
                variant="outline"
                onClick={handleUnpublish}
                disabled={isSaving}
                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Unpublish
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleSubmit('DRAFT')}
              disabled={isSaving || !isDirtyRef.current || !titleRef.current.trim()} // Use ref for dirty state and title
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={isSaving || !titleRef.current.trim() || !coverImageIdRef.current} // Require title AND image to publish
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publish
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
