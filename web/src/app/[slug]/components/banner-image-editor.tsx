"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { trpc } from '@/lib/trpc';
import { Loader2, Trash2 } from 'lucide-react';
import type { RouterOutputs } from '@/lib/server-trpc';

type BannerImage = NonNullable<RouterOutputs['artist']['getBySlug']>['bannerImage'];

interface BannerImageEditorProps {
  bannerImage: BannerImage;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BannerImageEditor({ bannerImage, isOpen: controlledIsOpen, onOpenChange: controlledOnOpenChange }: BannerImageEditorProps) {
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledOnOpenChange || setInternalIsOpen;
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const createUploadUrlMutation = trpc.image.createUploadUrl.useMutation();
  const setBannerImageMutation = trpc.artist.setBannerImage.useMutation();
  const removeBannerImageMutation = trpc.artist.removeBannerImage.useMutation();
  
  const isUploading = createUploadUrlMutation.isPending || setBannerImageMutation.isPending;
  const isRemoving = removeBannerImageMutation.isPending;
  const isLoading = isUploading || isRemoving;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit for banners
        setError('File is too large. Maximum size is 10MB.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file.');
      return;
    }
    setError(null);

    try {
      const { id: imageId, uploadUrl } = await createUploadUrlMutation.mutateAsync({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      await setBannerImageMutation.mutateAsync({ imageId });
      
      setIsOpen(false);
      setFile(null);
      router.refresh();

    } catch (err: any) {
      console.error('Failed to update banner image:', err);
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your banner image?')) {
      return;
    }
    setError(null);
    try {
      await removeBannerImageMutation.mutateAsync();
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to remove banner image:', err);
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Banner Image</DialogTitle>
            <DialogDescription>
              Upload a new image or remove the current one. Recommended: 1500x500px, Max 10MB.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="banner-upload">Upload New Image</FieldLabel>
              <Input
                id="banner-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div>
                {bannerImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={isLoading}
                  >
                    {isRemoving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
                    Remove Current Banner
                  </Button>
                )}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!file || isLoading}>
                  {isUploading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Upload New
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}

