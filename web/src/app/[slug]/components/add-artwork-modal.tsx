"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
import { Loader2, Plus, ThumbsUp, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { type RouterOutputs } from "@/lib/server-trpc"; // For ArtworkData type

// Use inferred type directly
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

interface ImageUploadPlaceholderProps {
  imageUrl?: string;
  onImageChange: (url: string) => void;
  onRemoveImage: () => void;
  isLoading?: boolean;
}

const ImageUploadPlaceholder = ({ imageUrl, onImageChange, onRemoveImage, isLoading }: ImageUploadPlaceholderProps) => {
  const [tempImageUrl, setTempImageUrl] = useState(imageUrl || "");

  useEffect(() => {
    setTempImageUrl(imageUrl || "");
  }, [imageUrl]);

  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempImageUrl(e.target.value);
    onImageChange(e.target.value);
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onRemoveImage();
    setTempImageUrl("");
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="text-base font-semibold mb-3">Project Cover (required)</h3>
      {imageUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg mb-4 group">
          <Image
            src={imageUrl}
            alt="Artwork cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRemove}
              aria-label="Remove cover image"
            >
              <Trash2 className="size-4 mr-2" /> Remove Image
            </Button>
          </div>
          <div className="absolute bottom-3 left-3 text-white text-sm">
            <p className="font-semibold">Untitled Project</p>
            <p className="text-xs">Steven Olthoff</p> 
          </div>
          <div className="absolute bottom-3 right-3 flex items-center space-x-3 text-white text-xs">
            <span className="flex items-center"><ThumbsUp className="size-3 mr-1" /> 0</span>
            <span className="flex items-center"><Eye className="size-3 mr-1" /> 0</span>
          </div>
        </div>
      ) : (
        <div className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50/50 cursor-pointer hover:border-gray-400 hover:bg-gray-100/50 transition-all duration-200 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
            {isLoading ? (
              <Loader2 className="animate-spin size-8 text-blue-600" />
            ) : (
              <Plus className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Click to upload or drag & drop</p>
          <p className="text-gray-500 text-xs">Recommended size: 1400x1050px</p>
        </div>
      )}
      <Field>
        <FieldLabel htmlFor="imageUrlInput">Image URL (Placeholder)</FieldLabel>
        <Input
          id="imageUrlInput"
          type="url"
          placeholder="Enter image URL (e.g., https://picsum.photos/600/450)"
          value={tempImageUrl}
          onChange={handleManualUrlChange}
          className="w-full"
        />
        <FieldDescription>
          For now, manually enter an image URL. Actual upload coming soon.
        </FieldDescription>
      </Field>
    </div>
  );
};

export function AddArtworkModal({ isOpen, onClose, initialArtwork, onArtworkSaved }: AddArtworkModalProps) {
  const { user, isLoggedIn } = useAuth();
  
  // Use refs to store latest mutable state for debounced function and direct field access
  const titleRef = useRef(initialArtwork?.title || "");
  const descriptionRef = useRef(initialArtwork?.description || "");
  const statusRef = useRef<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>(initialArtwork?.status || 'DRAFT');
  const imageUrlRef = useRef<string>(initialArtwork?.id ? `https://picsum.photos/600/450?random=${initialArtwork.id}` : "");
  const isDirtyRef = useRef(false);

  // This ref will store the ID of the artwork being actively edited/created.
  // Critical for switching from 'create' to 'update' during autosave.
  const currentArtworkIdRef = useRef<string | undefined>(initialArtwork?.id);

  // Use states to trigger re-renders of controlled components in the UI
  const [title, _setTitle] = useState(initialArtwork?.title || "");
  const [description, _setDescription] = useState(initialArtwork?.description || "");
  const [imageUrl, _setImageUrl] = useState<string>(imageUrlRef.current);

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
    imageUrlRef.current = initialArtwork?.id ? `https://picsum.photos/600/450?random=${initialArtwork.id}` : "";
    currentArtworkIdRef.current = initialArtwork?.id;
    isDirtyRef.current = false;

    // Update state to trigger re-render of controlled inputs
    _setTitle(titleRef.current);
    _setDescription(descriptionRef.current);
    _setImageUrl(imageUrlRef.current);

    setFormError(null);
  }, [initialArtwork, isOpen]);

  // Unified change handler for all form fields
  const handleFieldChange = useCallback((
    ref: React.MutableRefObject<string | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>,
    setState: React.Dispatch<React.SetStateAction<string>>,
    value: string | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  ) => {
    ref.current = value;
    setState(value as React.SetStateAction<string>); // Cast for string state setters
    isDirtyRef.current = true;
  }, []);

  const handleImageChange = useCallback((url: string) => {
    imageUrlRef.current = url;
    _setImageUrl(url);
    isDirtyRef.current = true;
  }, []);

  const handleRemoveImage = useCallback(() => {
    imageUrlRef.current = "";
    _setImageUrl("");
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
        const currentArtworkId = currentArtworkIdRef.current; // Get the artwork ID

        if (!isDirtyRef.current || !currentTitle) return; // Only autosave if dirty and title exists

        const dataToSave = {
          title: currentTitle,
          description: currentDescription,
          status: currentStatus,
        };

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
            currentArtworkIdRef.current = result.artwork.id; // CRITICAL: Store the new ID
            console.log("Artwork autosaved (create)! New ID:", result.artwork.id);
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
  }, [title, description, statusRef.current, isOpen, debouncedAutosave]); // Dependencies for triggering the autosave

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
    const finalArtworkId = currentArtworkIdRef.current;

    if (!finalTitle) {
      setFormError("Title is required.");
      return;
    }
    setFormError(null);

    const dataToSend = {
      title: finalTitle,
      description: finalDescription,
      status: submitStatus,
    };

    try {
      if (finalArtworkId) {
        await updateArtworkMutation.mutateAsync({
          artworkId: finalArtworkId,
          ...dataToSend,
        });
        console.log("Artwork updated!");
      } else {
        await createArtworkMutation.mutateAsync(dataToSend);
        console.log("Artwork created!");
      }
      // After manual save, also ensure the currentArtworkIdRef is updated if it was a new creation
      // The createArtworkMutation.onSuccess handles this already, but double-checking here for explicit full saves.
      if (!finalArtworkId && createArtworkMutation.data?.artwork.id) {
        currentArtworkIdRef.current = createArtworkMutation.data.artwork.id;
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
            <ImageUploadPlaceholder
              imageUrl={imageUrl}
              onImageChange={handleImageChange}
              onRemoveImage={handleRemoveImage}
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

            <div className="space-y-4 text-muted-foreground text-sm">
              <p className="font-semibold text-foreground">Project Tags <span className="text-xs">(limit of 10)</span></p>
              <Input placeholder="Add up to 10 keywords to help people discover your project" disabled />
              <p className="font-semibold text-foreground">Tools Used</p>
              <Input placeholder="What software, hardware, or materials did you use?" disabled />
              <p className="font-semibold text-foreground">How Would You Categorize This Project? <span className="text-xs">(required)</span></p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {['Graphic Design', 'Interaction Design', 'Architecture', 'Illustration', 'Fashion', 'Advertising', 'Photography', 'Product Design'].map(cat => (
                  <div key={cat} className="flex items-center space-x-2">
                    <input type="checkbox" id={cat} className="size-4 rounded border-gray-300 text-primary focus:ring-primary" disabled />
                    <label htmlFor={cat}>{cat}</label>
                  </div>
                ))}
                <Button variant="link" size="sm" className="justify-start px-0" disabled>View All Fields...</Button>
              </div>
              <p className="font-semibold text-foreground">Behance Visibility <span className="text-xs">(required)</span></p>
              <select className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" disabled>
                <option>Everyone</option>
              </select>
              <p className="font-semibold text-foreground">Copyright & License</p>
              <p>All Rights Reserved <Button variant="link" size="sm" className="px-0" disabled>Edit</Button></p>
              <Field>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="adultContent" className="size-4 rounded border-gray-300 text-primary focus:ring-primary" disabled />
                  <label htmlFor="adultContent">This project contains adult content</label>
                </div>
                <Button variant="link" size="sm" className="justify-start px-0" disabled>Add co-owners, credits, and more...</Button>
              </Field>
            </div>
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
              disabled={isSaving || !titleRef.current.trim()} // Use ref for title
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
