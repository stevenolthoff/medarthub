import { useDropzone, type FileRejection } from 'react-dropzone'
import { useState, useCallback } from 'react'

interface DropzoneProps {
  onFilesAccepted?: (files: File[]) => void
  onFilesRejected?: (fileRejections: FileRejection[]) => void
}

export const Dropzone = ({ onFilesAccepted, onFilesRejected }: DropzoneProps) => {
  const [files, setFiles] = useState<File[]>([])

  const handleDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setFiles(acceptedFiles)
    if (onFilesAccepted) {
      onFilesAccepted(acceptedFiles)
    }
    if (onFilesRejected && fileRejections.length > 0) {
      onFilesRejected(fileRejections)
    }
  }, [onFilesAccepted, onFilesRejected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
  })

  const handleClearFiles = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setFiles([])
  }

  return (
    <section className="w-full">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        {files.length > 0 ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg font-medium text-gray-700 mb-2">Files ready for upload:</p>
            <ul className="list-disc list-inside text-left text-gray-600 w-full max-w-sm mx-auto">
              {files.map(file => (
                <li key={file.name} className="flex items-center gap-2 py-1">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate" title={file.name}>{file.name} - {Math.round(file.size / 1024)} KB</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleClearFiles}
              className="mt-4 px-4 py-2 bg-red-500 text-black rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear Files
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
                {isDragActive ? 'Drop the files here...' : 'Drag \'n\' drop some files here'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to select files
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
