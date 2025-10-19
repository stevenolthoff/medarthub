"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Loader2, Plus, Edit, ThumbsUp, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

// Define ArtworkStatus enum locally since @prisma/client is not available in web workspace
enum ArtworkStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

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

type ArtworkData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: ArtworkStatus;
  createdAt: Date;
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
  const router = usePathname();
  const [title, setTitle] = useState(initialArtwork?.title || "");
  const [description, setDescription] = useState(initialArtwork?.description || "");
  const [status, setStatus] = useState<ArtworkStatus>(initialArtwork?.status || ArtworkStatus.DRAFT);
  const [imageUrl, setImageUrl] = useState<string>(
    initialArtwork?.id ? `https://picsum.photos/600/450?random=${initialArtwork.id}` : ""
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const createArtworkMutation = trpc.artist.createArtwork.useMutation();
  const updateArtworkMutation = trpc.artist.updateArtwork.useMutation();

  const isSaving = createArtworkMutation.isPending || updateArtworkMutation.isPending;

  useEffect(() => {
    if (initialArtwork) {
      setTitle(initialArtwork.title);
      setDescription(initialArtwork.description);
      setStatus(initialArtwork.status);
      setImageUrl(`https://picsum.photos/600/450?random=${initialArtwork.id}`);
    } else {
      setTitle("");
      setDescription("");
      setStatus(ArtworkStatus.DRAFT);
      setImageUrl("");
    }
    setFormError(null);
    setIsDirty(false);
  }, [initialArtwork, isOpen]);

  const handleFieldChange = useCallback((setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setIsDirty(true);
  }, []);

  const handleImageChange = useCallback((url: string) => {
    setImageUrl(url);
    setIsDirty(true);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageUrl("");
    setIsDirty(true);
  }, []);

  const debouncedAutosave = useMemo(
    () =>
      debounce(async () => {
        if (!isDirty || !title.trim()) return;

        const dataToSave = {
          title: title.trim(),
          description: description.trim(),
          status: ArtworkStatus.DRAFT,
        };

        try {
          if (initialArtwork?.id) {
            await updateArtworkMutation.mutateAsync({
              artworkId: initialArtwork.id,
              ...dataToSave,
            });
            console.log("Artwork autosaved (update)!");
          } else if (user?.artist?.id) {
            const result = await createArtworkMutation.mutateAsync(dataToSave);
            console.log("Artwork autosaved (create)!");
          }
          setIsDirty(false);
        } catch (error) {
          console.error("Autosave failed:", error);
        }
      }, 2000),
    [isDirty, title, description, initialArtwork, user?.artist?.id, createArtworkMutation, updateArtworkMutation]
  );

  useEffect(() => {
    if (isDirty) {
      debouncedAutosave();
    }
  }, [title, description, isDirty, debouncedAutosave]);

  const handleSubmit = async (submitStatus: ArtworkStatus) => {
    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setFormError(null);

    const dataToSend = {
      title: title.trim(),
      description: description.trim(),
      status: submitStatus,
    };

    try {
      if (initialArtwork?.id) {
        await updateArtworkMutation.mutateAsync({
          artworkId: initialArtwork.id,
          ...dataToSend,
        });
        console.log("Artwork updated!");
      } else {
        await createArtworkMutation.mutateAsync(dataToSend);
        console.log("Artwork created!");
      }
      onArtworkSaved();
      onClose();
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
                value={title}
                onChange={(e) => handleFieldChange(setTitle, e.target.value)}
                required
              />
              {createArtworkMutation.error?.data?.zodError && Array.isArray(createArtworkMutation.error.data.zodError) && createArtworkMutation.error.data.zodError.some((issue: any) => issue.path?.includes('title')) && (
                <FieldError>
                  {createArtworkMutation.error.data.zodError.find((issue: any) => issue.path?.includes('title'))?.message}
                </FieldError>
              )}
               {updateArtworkMutation.error?.data?.zodError && Array.isArray(updateArtworkMutation.error.data.zodError) && updateArtworkMutation.error.data.zodError.some((issue: any) => issue.path?.includes('title')) && (
                <FieldError>
                  {updateArtworkMutation.error.data.zodError.find((issue: any) => issue.path?.includes('title'))?.message}
                </FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Tell us about your artwork..."
                value={description}
                onChange={(e) => handleFieldChange(setDescription, e.target.value)}
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
            <Button
              variant="outline"
              onClick={() => handleSubmit(ArtworkStatus.DRAFT)}
              disabled={isSaving || !isDirty || !title.trim()}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit(ArtworkStatus.PUBLISHED)}
              disabled={isSaving || !title.trim()}
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
