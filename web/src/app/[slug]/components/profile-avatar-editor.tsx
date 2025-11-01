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
import { Loader2, Pencil } from 'lucide-react';

export function ProfileAvatarEditor() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const createUploadUrlMutation = trpc.image.createUploadUrl.useMutation();
  const setProfilePicMutation = trpc.artist.setProfilePicture.useMutation();
  
  const isLoading = createUploadUrlMutation.isPending || setProfilePicMutation.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File is too large. Maximum size is 5MB.');
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

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image.');
      }

      await setProfilePicMutation.mutateAsync({ imageId });
      
      setIsOpen(false);
      setFile(null);
      router.refresh();

    } catch (err: any) {
      console.error('Failed to update profile picture:', err);
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute bottom-2 right-2 size-10 rounded-full shadow-lg cursor-pointer"
        size="icon"
        aria-label="Change profile picture"
      >
        <Pencil className="size-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new image. Recommended: 400x400px, Max 5MB.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="avatar-upload">New Avatar Image</FieldLabel>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!file || isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

