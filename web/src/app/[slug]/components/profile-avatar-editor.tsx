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
import { Loader2, Pencil, Trash2 } from 'lucide-react';

export function ProfileAvatarEditor({ profilePic }: { 
  profilePic: { key: string } | null 
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const createUploadUrlMutation = trpc.image.createUploadUrl.useMutation();
  const setProfilePicMutation = trpc.artist.setProfilePicture.useMutation();
  const removeProfilePicMutation = trpc.artist.removeProfilePicture.useMutation();
  
  const isUploading = createUploadUrlMutation.isPending || setProfilePicMutation.isPending;
  const isRemoving = removeProfilePicMutation.isPending;
  const isLoading = isUploading || isRemoving;

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

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }
    setError(null);
    try {
      await removeProfilePicMutation.mutateAsync();
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to remove profile picture:', err);
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
              Upload a new image or remove the current one. Recommended: 400x400px, Max 5MB.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="avatar-upload">Upload New Image</FieldLabel>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
              <div>
                {profilePic && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={isLoading}
                  >
                    {isRemoving ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 size-4" />
                    )}
                    Remove Current Photo
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
    </>
  );
}

