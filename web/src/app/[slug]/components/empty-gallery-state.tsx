import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type EmptyGalleryStateProps = {
  isOwner: boolean;
  onAddArtwork: () => void;
};

export function EmptyGalleryState({ isOwner, onAddArtwork }: EmptyGalleryStateProps) {
  if (!isOwner) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects to show yet.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <button
        onClick={onAddArtwork}
        className="aspect-[4/3] w-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50/50 cursor-pointer hover:border-gray-400 hover:bg-gray-100/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Create a new project"
      >
        {/* Plus Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
          <Plus className="w-8 h-8 text-blue-600" strokeWidth={3} />
        </div>
        
        {/* Create Project Button (now just text, as the parent div is the button) */}
        <div className="mb-3 text-gray-900 text-xs font-medium">
          Create a Project
        </div>
        
        {/* Descriptive Text */}
        <div className="text-center">
          <p className="text-gray-600 text-xs leading-relaxed">
            Get feedback, views, and appreciations. Public projects can be featured by our curators.
          </p>
        </div>
      </button>
    </div>
  );
}
