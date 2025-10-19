import { Button } from "@/components/ui/button";

type EmptyGalleryStateProps = {
  isOwner: boolean;
};

export function EmptyGalleryState({ isOwner }: EmptyGalleryStateProps) {
  if (!isOwner) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects to show yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50/50 cursor-pointer hover:border-gray-400 hover:bg-gray-100/50 transition-all duration-200">
        {/* Plus Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-8 h-8 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
        </div>
        
        {/* Create Project Button */}
        <Button 
          className="mb-3 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
          size="sm"
        >
          Create a Project
        </Button>
        
        {/* Descriptive Text */}
        <div className="text-center">
          <p className="text-gray-600 text-xs leading-relaxed">
            Get feedback, views, and appreciations. Public projects can be featured by our curators.
          </p>
        </div>
      </div>
    </div>
  );
}
