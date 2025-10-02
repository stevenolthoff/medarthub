import { useDropzone, type FileRejection } from 'react-dropzone'
import { useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

// Define the new type for files with upload status
interface FileWithUploadStatus extends File {
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'rejected';
  errorMessage?: string; // For upload errors or rejection reasons
  s3Key?: string; // The key in R2 if successfully uploaded
}

interface DropzoneProps {
  // Optional callbacks for parent components to react to upload events
  onUploadSuccess?: (file: FileWithUploadStatus) => void
  onUploadError?: (file: FileWithUploadStatus) => void
}

export const Dropzone = ({ onUploadSuccess, onUploadError }: DropzoneProps) => {
  const [files, setFiles] = useState<FileWithUploadStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFileToR2 = useCallback(async (fileWithStatus: FileWithUploadStatus) => {
    console.log('Client: uploadFileToR2 called with fileWithStatus:', {
      name: fileWithStatus.name,
      type: fileWithStatus.type,
      size: fileWithStatus.size,
      id: fileWithStatus.id,
      status: fileWithStatus.status
    });

    // Update status to 'uploading'
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === fileWithStatus.id ? { ...f, status: 'uploading' } : f
      )
    )

    try {
      // Log the payload being sent to the backend
      const payload = {
        filename: fileWithStatus.name,
        contentType: fileWithStatus.type,
      };
      console.log('Client: Requesting signed URL with payload:', payload);
      console.log('Client: Payload values check:', {
        filename: payload.filename,
        contentType: payload.contentType,
        filenameType: typeof payload.filename,
        contentTypeType: typeof payload.contentType,
        filenameLength: payload.filename?.length,
        contentTypeLength: payload.contentType?.length
      });

      // 1. Request signed URL from our backend
      const response = await fetch('/api/createUploadUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Replace 'test-user-id' with an actual user ID from your authentication system
          'x-user-id': 'test-user-id',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = `Failed to get upload URL: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // If we can't get text either, use the default message
            console.error('Could not parse error response:', { jsonError, textError });
          }
        }
        throw new Error(errorMessage);
      }

      const { url, key } = await response.json()

      // 2. Upload file to R2 using the signed URL
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': fileWithStatus.type, // Important: must match the content-type sent to /createUploadUrl
        },
        body: fileWithStatus, // Send the File object directly
      })

      if (!uploadResponse.ok) {
        // R2 usually returns plain text errors for failures, not JSON
        const errorText = await uploadResponse.text()
        throw new Error(`Failed to upload to R2: ${uploadResponse.status} - ${errorText}`)
      }

      // Update status to 'success'
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileWithStatus.id ? { ...f, status: 'success', s3Key: key } : f
        )
      )
      onUploadSuccess?.({ ...fileWithStatus, status: 'success', s3Key: key })

    } catch (error: unknown) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'
      // Update status to 'error'
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === fileWithStatus.id
            ? { ...f, status: 'error', errorMessage }
            : f
        )
      )
      onUploadError?.({ ...fileWithStatus, status: 'error', errorMessage })
    }
  }, [onUploadSuccess, onUploadError])

  const handleDrop = useCallback((newAcceptedFiles: File[], newFileRejections: FileRejection[]) => {
    console.log('Client: handleDrop called with:', { 
      newAcceptedFiles: newAcceptedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
      newFileRejections: newFileRejections.length 
    });

    // Add new accepted files to the files state with 'pending' status
    const newAcceptedFilesWithStatus: FileWithUploadStatus[] = newAcceptedFiles.map(file => {
      const fileWithStatus = {
        ...file,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        id: uuidv4(),
        status: 'pending' as const,
      };
      console.log('Client: Created fileWithStatus:', { 
        name: fileWithStatus.name, 
        type: fileWithStatus.type, 
        size: fileWithStatus.size,
        id: fileWithStatus.id 
      });
      return fileWithStatus;
    })

    // Add new rejected files to the files state with 'rejected' status and error messages
    const newRejectedFilesWithStatus: FileWithUploadStatus[] = newFileRejections.map(rejection => ({
      ...rejection.file,
      name: rejection.file.name,
      type: rejection.file.type,
      size: rejection.file.size,
      lastModified: rejection.file.lastModified,
      id: uuidv4(),
      status: 'rejected' as const,
      errorMessage: rejection.errors.map(e => e.message).join('; '),
    }))

    setFiles(prev => [...prev, ...newAcceptedFilesWithStatus, ...newRejectedFilesWithStatus])

    // Immediately start uploads for the newly accepted files
    newAcceptedFilesWithStatus.forEach(file => {
      console.log('Client: Starting upload for file:', { name: file.name, type: file.type });
      uploadFileToR2(file)
    })

  }, [uploadFileToR2])

  // Effect to determine if any files are currently uploading or pending
  useEffect(() => {
    const uploading = files.some(f => f.status === 'uploading' || f.status === 'pending')
    setIsUploading(uploading)
  }, [files])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp']
    },
    maxFiles: 5,
    maxSize: 10485760, // 10MB
    disabled: isUploading, // Disable dropzone while uploads are in progress
  })

  const handleClearAllFiles = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation() // Prevent dropzone from re-opening
    setFiles([])
    setIsUploading(false) // Ensure upload state is reset
  }

  const acceptedUploads = files.filter(f => f.status !== 'rejected')
  const rejectedUploads = files.filter(f => f.status === 'rejected')
  const hasFiles = files.length > 0

  return (
    <section className="w-full">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 min-h-[150px]
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isUploading ? 'cursor-not-allowed opacity-70' : ''}
        `}
        aria-live="polite"
        aria-label="File drop zone for image uploads"
        tabIndex={isUploading ? -1 : 0} // Disable keyboard focus when uploading
      >
        <input {...getInputProps()} />
        {hasFiles ? (
          <div className="flex flex-col items-center space-y-4">
            {acceptedUploads.length > 0 && (
              <div className="w-full">
                <p className="text-lg font-medium text-gray-700 mb-2">Files:</p>
                <ul className="list-disc list-inside text-left w-full max-w-sm mx-auto">
                  {acceptedUploads.map(file => (
                    <li key={file.id} className="flex items-center gap-2 py-1">
                      {/* Status Icons */}
                      {file.status === 'success' && (
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {(file.status === 'pending' || file.status === 'uploading') && (
                        <svg className="animate-spin h-5 w-5 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Uploading">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {file.status === 'error' && (
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      
                      <span className={`truncate ${file.status === 'error' ? 'text-red-600' : 'text-gray-700'}`} title={file.name}>
                        {file.name} - {Math.round(file.size / 1024)} KB
                        {file.status === 'pending' && <span className="text-gray-500 ml-2">(Pending upload)</span>}
                        {file.status === 'uploading' && <span className="text-blue-600 ml-2">(Uploading...)</span>}
                        {file.status === 'success' && <span className="text-green-600 ml-2">(Uploaded)</span>}
                        {file.status === 'error' && <span className="text-red-600 ml-2">(Failed: {file.errorMessage})</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {rejectedUploads.length > 0 && (
              <div className="w-full mt-4">
                <p className="text-lg font-medium text-red-700 mb-2">Rejected Files:</p>
                <ul className="list-disc list-inside text-left w-full max-w-sm mx-auto">
                  {rejectedUploads.map(file => (
                    <li key={file.id} className="flex flex-col gap-1 py-1 text-red-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate" title={file.name}>{file.name} - {Math.round(file.size / 1024)} KB</span>
                      </div>
                      <div className="ml-7 text-sm text-red-500">
                        {file.errorMessage && <div>• {file.errorMessage}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleClearAllFiles}
              className={`mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 border border-red-700 shadow-lg
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label="Clear all files"
              disabled={isUploading} // Disable clear button during upload
            >
              Clear All Files
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop the files here...' : 'Drag \'n\' drop image files here'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to select files
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Accepted: JPG, PNG, GIF, SVG, WebP • Max 5 files • Max 10MB each
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
