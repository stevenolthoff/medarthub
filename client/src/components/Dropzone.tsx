import { useDropzone, type FileRejection } from 'react-dropzone'
import { useState, useCallback } from 'react'

interface DropzoneProps {
  onFilesAccepted?: (files: File[]) => void
  onFilesRejected?: (fileRejections: FileRejection[]) => void
}

export const Dropzone = ({ onFilesAccepted, onFilesRejected }: DropzoneProps) => {
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([])

  const handleDrop = useCallback((newAcceptedFiles: File[], newFileRejections: FileRejection[]) => {
    setAcceptedFiles(prev => [...prev, ...newAcceptedFiles])
    setRejectedFiles(prev => [...prev, ...newFileRejections])
    
    if (onFilesAccepted) {
      onFilesAccepted(newAcceptedFiles)
    }
    if (onFilesRejected && newFileRejections.length > 0) {
      onFilesRejected(newFileRejections)
    }
  }, [onFilesAccepted, onFilesRejected])

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
  })

  const handleClearAllFiles = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setAcceptedFiles([])
    setRejectedFiles([])
  }

  const hasFiles = acceptedFiles.length > 0 || rejectedFiles.length > 0

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
        `}
        aria-live="polite"
        aria-label="File drop zone for image uploads"
      >
        <input {...getInputProps()} />
        {hasFiles ? (
          <div className="flex flex-col items-center space-y-4">
            {acceptedFiles.length > 0 && (
              <div className="w-full">
                <p className="text-lg font-medium text-green-700 mb-2">Accepted Files:</p>
                <ul className="list-disc list-inside text-left text-green-600 w-full max-w-sm mx-auto">
                  {acceptedFiles.map(file => (
                    <li key={file.name} className="flex items-center gap-2 py-1">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate" title={file.name}>{file.name} - {Math.round(file.size / 1024)} KB</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {rejectedFiles.length > 0 && (
              <div className="w-full">
                <p className="text-lg font-medium text-red-700 mb-2">Rejected Files:</p>
                <ul className="list-disc list-inside text-left text-red-600 w-full max-w-sm mx-auto">
                  {rejectedFiles.map((rejection, index) => (
                    <li key={`${rejection.file.name}-${index}`} className="flex flex-col gap-1 py-1">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate" title={rejection.file.name}>{rejection.file.name} - {Math.round(rejection.file.size / 1024)} KB</span>
                      </div>
                      <div className="ml-7 text-sm">
                        {rejection.errors.map((error, errorIndex) => (
                          <div key={errorIndex} className="text-red-500">
                            • {error.message}
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleClearAllFiles}
              className="mt-4 px-4 py-2 bg-red-500 text-black rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 border border-red-700 shadow-lg"
              aria-label="Clear all files"
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
