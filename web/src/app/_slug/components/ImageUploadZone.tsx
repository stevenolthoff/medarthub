"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, CheckCircle, CircleX } from 'lucide-react';
import { FieldError } from '@/components/ui/field';
import { trpc } from '@/lib/trpc'; // Import trpc for the mutation
import { generateOptimizedClientUrl } from '@/lib/utils'; // Use optimized URLs
import { useAuth } from '@/hooks/use-auth'; // To get userId for R2 key prefix

// Define the new type for files with upload status
interface FileWithUploadStatus extends File {
  id: string; // Client-side unique ID (from uuidv4 or simple concatenation)
  status: 'idle' | 'pending' | 'uploading' | 'success' | 'error' | 'rejected';
  errorMessage?: string; // For upload errors or rejection reasons
  r2Key?: string; // The key in R2 if successfully uploaded
  imageId?: string; // The ID of the Image record in the database
  previewUrl?: string; // URL for local preview (createObjectURL)
  width?: number;
  height?: number;
}

interface ImageUploadZoneProps {
  currentArtworkCoverImage?: {
    id: string;
    key: string;
    width?: number | null;
    height?: number | null;
  } | null; // The artwork's current cover image data (if editing)
  onImageSelected: (imageId: string | null, r2Key: string | null) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 1; // Only allow one image for the cover

export function ImageUploadZone({ currentArtworkCoverImage, onImageSelected }: ImageUploadZoneProps) {
  const { user, isLoggedIn } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<FileWithUploadStatus | null>(null);
  const [internalPreviewUrl, setInternalPreviewUrl] = useState<string | null>(null);

  const createUploadUrlMutation = trpc.image.createUploadUrl.useMutation();

  // Effect to handle initial image if provided (e.g., for editing existing artwork)
  useEffect(() => {
    if (currentArtworkCoverImage && !uploadedFile) {
      // If editing an existing artwork with a cover image, populate the state
      const initialImageKey = currentArtworkCoverImage.key;
      const initialImageId = currentArtworkCoverImage.id;
      const initialWidth = currentArtworkCoverImage.width || undefined;
      const initialHeight = currentArtworkCoverImage.height || undefined;
      (async () => {
        const optimizedUrl = await generateOptimizedClientUrl(initialImageKey, {
          width: initialWidth || 600,
          height: initialHeight || 450,
          format: 'webp',
        });
        setUploadedFile({
          id: initialImageId, // Use the image's actual ID
          imageId: initialImageId,
          r2Key: initialImageKey,
          name: initialImageKey.split('/').pop() || "existing_artwork_image.png", // Derive name from key
          type: "image/jpeg", // Placeholder type, ideally fetched from DB
          size: 0, // Placeholder size, ideally fetched from DB
          status: 'success', // Assume success for existing images
          previewUrl: optimizedUrl,
          width: initialWidth,
          height: initialHeight,
        } as FileWithUploadStatus);
        setInternalPreviewUrl(optimizedUrl);
      })();
    } else if (!currentArtworkCoverImage && uploadedFile && uploadedFile.status === 'success') {
      // If modal re-opened for new artwork, but had a previous successful upload, keep it.
      // Do nothing, let the uploadedFile state persist until explicitly removed.
    } else if (!currentArtworkCoverImage && !uploadedFile) {
      // If no initial image and no uploaded file, ensure states are cleared.
      setUploadedFile(null);
      setInternalPreviewUrl(null);
    }
  }, [currentArtworkCoverImage]);


  const uploadFileToR2 = useCallback(async (fileWithStatus: FileWithUploadStatus) => {
    if (!isLoggedIn || !user?.id) {
      setUploadedFile(prev => prev ? { ...prev, status: 'error', errorMessage: 'Authentication required for upload.' } : null);
      onImageSelected(null, null);
      return;
    }

    setUploadedFile(prev => prev ? { ...prev, status: 'uploading' } : null); // Update status

    try {
      const { id: imageRecordId, key: r2Key, uploadUrl } = await createUploadUrlMutation.mutateAsync({
        filename: fileWithStatus.name,
        contentType: fileWithStatus.type,
        fileSize: fileWithStatus.size,
        width: fileWithStatus.width,
        height: fileWithStatus.height,
      });

      const blobBody = new Blob([fileWithStatus], { type: fileWithStatus.type });
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': fileWithStatus.type },
        body: blobBody,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Failed to upload to R2: ${uploadResponse.status} - ${errorText}`);
      }

      // Build optimized preview URL
      const optimizedPreviewUrl = await generateOptimizedClientUrl(r2Key, {
        width: fileWithStatus.width || 600,
        height: fileWithStatus.height || 450,
        format: 'webp',
      });

      const updatedFile: FileWithUploadStatus = {
        ...fileWithStatus,
        status: 'success',
        r2Key,
        imageId: imageRecordId,
        previewUrl: optimizedPreviewUrl,
      };
      setUploadedFile(updatedFile);
      setInternalPreviewUrl(updatedFile.previewUrl || null);
      onImageSelected(updatedFile.imageId || null, updatedFile.r2Key || null);

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Unknown upload error';
      setUploadedFile(prev => prev ? { ...prev, status: 'error', errorMessage } : null);
      onImageSelected(null, null);
    }
  }, [isLoggedIn, user?.id, createUploadUrlMutation, onImageSelected]);


  const onDropAccepted = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Clean up previous object URL if any
      if (uploadedFile?.previewUrl && uploadedFile.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedFile.previewUrl);
      }
      
      // Load image dimensions client-side
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
          };
          img.onerror = () => {
            URL.revokeObjectURL(img.src);
            resolve({ width: 0, height: 0 });
          };
          img.src = e.target as any as string;
          img.src = e.target?.result as string;
        };
        reader.onerror = () => resolve({ width: 0, height: 0 });
        reader.readAsDataURL(file);
      });

      const fileWithStatus: FileWithUploadStatus = Object.assign(file, {
        id: `${file.name}-${file.size}-${file.lastModified}`, // Simple client-side unique ID
        status: 'pending' as const,
        previewUrl: URL.createObjectURL(file), // Create object URL for local preview
        width: dimensions.width || undefined,
        height: dimensions.height || undefined,
      });
      setUploadedFile(fileWithStatus);
      setInternalPreviewUrl(fileWithStatus.previewUrl || null);
      uploadFileToR2(fileWithStatus);
    }
  }, [uploadFileToR2, uploadedFile]);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    if (rejection) {
      const errorMessage = rejection.errors.map(e => e.message).join('; ');
      // Clean up previous object URL if any
      if (uploadedFile?.previewUrl && uploadedFile.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedFile.previewUrl);
      }

      const fileWithStatus: FileWithUploadStatus = {
        ...rejection.file,
        id: `${rejection.file.name}-${rejection.file.size}-${rejection.file.lastModified}`,
        status: 'rejected',
        errorMessage,
      } as FileWithUploadStatus; // Cast to ensure it matches the interface
      setUploadedFile(fileWithStatus);
      setInternalPreviewUrl(null); // Clear preview for rejected files
      onImageSelected(null, null); // No image selected
    }
  }, [onImageSelected, uploadedFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp'],
    },
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled: !isLoggedIn || uploadedFile?.status === 'uploading' || createUploadUrlMutation.isPending,
  });

  const handleRemoveImage = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent dialog from closing due to click bubbling

    if (uploadedFile?.previewUrl && uploadedFile.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedFile.previewUrl); // Clean up object URL
    }
    setUploadedFile(null);
    setInternalPreviewUrl(null);
    onImageSelected(null, null); // Clear selected image
  }, [uploadedFile, onImageSelected]);

  const isLoadingOrUploading = createUploadUrlMutation.isPending || uploadedFile?.status === 'uploading' || uploadedFile?.status === 'pending';

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="text-base font-semibold mb-3">Project Cover (required)</h3>
      {internalPreviewUrl && uploadedFile?.status !== 'rejected' ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg mb-4 group">
          <Image
            src={internalPreviewUrl}
            alt="Artwork cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            unoptimized={!internalPreviewUrl?.includes('imgproxy')}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRemoveImage}
              aria-label="Remove cover image"
              disabled={isLoadingOrUploading}
            >
              <Trash2 className="size-4 mr-2" /> Remove Image
            </Button>
          </div>
          {isLoadingOrUploading && (
             <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-lg font-bold">
              <Loader2 className="animate-spin mr-2" /> Uploading...
             </div>
          )}
          {uploadedFile?.status === 'error' && (
             <div className="absolute inset-0 bg-red-800/70 flex flex-col items-center justify-center text-white text-lg font-bold p-4">
              <CircleX className="size-8 mb-2" /> Upload Failed
              <p className="text-sm font-normal text-center mt-2">{uploadedFile.errorMessage}</p>
             </div>
          )}
          {uploadedFile?.status === 'success' && (
            <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-white text-sm bg-black/50 px-2 py-1 rounded-md">
              <CheckCircle className="size-4 text-green-400" /> Image Uploaded
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50/50 transition-all duration-200 mb-4
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100/50'}
            ${isLoadingOrUploading || !isLoggedIn ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
          `}
          aria-live="polite"
          aria-label="File drop zone for artwork cover image"
          tabIndex={isLoadingOrUploading || !isLoggedIn ? -1 : 0}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
            {isLoadingOrUploading ? (
              <Loader2 className="animate-spin size-8 text-blue-600" />
            ) : (
              <Plus className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">
            {isDragActive ? 'Drop the file here...' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-gray-500 text-xs">
            Recommended size: 1400x1050px • Max 10MB • JPG, PNG, GIF, SVG, WebP
          </p>
          {uploadedFile?.status === 'rejected' && (
            <FieldError className="mt-2 text-red-600 text-sm text-center">
              {uploadedFile.errorMessage || "File rejected."}
            </FieldError>
          )}
          {createUploadUrlMutation.isError && (
             <FieldError className="mt-2 text-red-600 text-sm text-center">
               Failed to prepare upload: {createUploadUrlMutation.error.message}
             </FieldError>
          )}
          {!isLoggedIn && (
            <FieldError className="mt-2 text-red-600 text-sm text-center">
              You must be logged in to upload images.
            </FieldError>
          )}
        </div>
      )}
    </div>
  );
}
