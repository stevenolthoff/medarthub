"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyGalleryState } from "./empty-gallery-state";
import { AddArtworkModal } from "./add-artwork-modal";
import { ArtworkLightbox } from "./artwork-lightbox";
import { type RouterOutputs } from "@/lib/server-trpc";
import { Edit, Trash2, Loader2, Plus, ThumbsUp, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRouter, usePathname, useParams } from "next/navigation";
import { getArtworkImageUrl } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  count?: number;
};

// Use inferred type directly
type Artwork = NonNullable<RouterOutputs['artist']['getBySlug']>['artworks'][0];

type TabbedContentProps = {
  isOwner: boolean;
  isLoggedIn: boolean;
  artistSlug: string;
  artistName: string;
};

export function TabbedContent({ isOwner, isLoggedIn, artistSlug, artistName }: TabbedContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("work");
  
  // Fetch artist data using tRPC query
  const { data: artistProfile, isLoading } = trpc.artist.getBySlug.useQuery({
    slug: artistSlug,
  });
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false); // Renamed for clarity
  const [artworkToEdit, setArtworkToEdit] = useState<Artwork | undefined>(undefined);

  // State for the new lightbox modal
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedArtworkIdForLightbox, setSelectedArtworkIdForLightbox] = useState<string | null>(null);

  // Get artworks from query data, with loading state
  const artworks = artistProfile?.artworks || [];
  const currentWorkItems = artworks.filter(artwork => 
    isOwner ? true : artwork.status === 'PUBLISHED'
  ).map(artwork => ({
    ...artwork,
    likes: Math.floor(Math.random() * 500),
    views: Math.floor(Math.random() * 5000),
  }));

  const defaultTabs: Tab[] = [
    { id: "work", label: "Work" },
    { id: "moodboards", label: "Moodboards", count: 0 },
    { id: "appreciations", label: "Appreciations", count: 0 }
  ];

  const tabsWithDynamicCounts = defaultTabs.map(tab => {
    if (tab.id === 'work') {
      return { ...tab, count: currentWorkItems.length };
    }
    return tab;
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleOpenAddArtworkModal = () => {
    setArtworkToEdit(undefined);
    setIsAddEditModalOpen(true);
  };

  const handleCloseAddArtworkModal = () => {
    setIsAddEditModalOpen(false);
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setArtworkToEdit(artwork);
    setIsAddEditModalOpen(true);
  };

  const deleteArtworkMutation = trpc.artist.deleteArtwork.useMutation({
    onSuccess: () => {
      // Invalidate the artist query to refetch the data
      utils.artist.getBySlug.invalidate({ slug: artistSlug });
    },
    onError: (error) => {
      console.error("Failed to delete artwork:", error.message);
    },
  });

  const handleDeleteArtwork = async (artworkId: string) => {
    if (window.confirm("Are you sure you want to delete this artwork? This action cannot be undone.")) {
      await deleteArtworkMutation.mutateAsync({ artworkId });
    }
  };

  const utils = trpc.useUtils();
  
  const handleArtworkSaved = () => {
    // Invalidate the artist query to refetch the data
    utils.artist.getBySlug.invalidate({ slug: artistSlug });
  };

  // Open lightbox handler
  const handleOpenLightbox = (artworkId: string) => {
    setSelectedArtworkIdForLightbox(artworkId);
    setIsLightboxOpen(true);
  };

  // Close lightbox handler
  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedArtworkIdForLightbox(null);
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabsWithDynamicCounts.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "work" && (
          <div>
            {!isOwner && currentWorkItems.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Viewing {currentWorkItems.length} projects
                </p>
              </div>
            )}

            {/* Gallery Grid */}
            {isOwner && currentWorkItems.length === 0 ? (
              <EmptyGalleryState isOwner={isOwner} onAddArtwork={handleOpenAddArtworkModal} />
            ) : currentWorkItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {isOwner && (
                  <button
                    onClick={handleOpenAddArtworkModal}
                    className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50/50 cursor-pointer hover:border-gray-400 hover:bg-gray-100/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Add new artwork"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-blue-600" strokeWidth={3} />
                    </div>
                    <span className="mb-3 text-gray-700 font-medium text-xs">Add New Artwork</span>
                  </button>
                )}
                {(currentWorkItems as (Artwork & { likes: number; views: number })[]).map((item) => (
                <div key={item.id} 
                     className="group relative overflow-hidden cursor-pointer rounded-lg"
                     onClick={() => handleOpenLightbox(item.id)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-lg">
                    <Image
                      src={getArtworkImageUrl(item.id)}
                      alt={`${item.title} by ${artistName} - Digital artwork on MedArtHub`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    {/* Status indicator for drafts */}
                    {isOwner && item.status === 'DRAFT' && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full z-10">DRAFT</span>
                    )}
                    {/* Hover overlay with text */}
                    <div className="absolute inset-0 bg-black/60 md:bg-black/0 md:group-hover:bg-black/60 transition-all duration-200 flex items-end rounded-lg">
                      <div className="w-full p-4 transform translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-200">
                        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-white/90 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-white/80">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {item.likes}
                            </span>
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {item.views.toLocaleString()}
                            </span>
                          </div>
                          {isOwner && (
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="icon-sm"
                                onClick={(e) => { e.stopPropagation(); handleEditArtwork(item); }}
                                aria-label={`Edit ${item.title}`}
                                className="z-10 bg-white/20 hover:bg-white/30 text-white"
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                onClick={(e) => { e.stopPropagation(); handleDeleteArtwork(item.id); }}
                                aria-label={`Delete ${item.title}`}
                                disabled={deleteArtworkMutation.isPending}
                                className="z-10 bg-red-600/70 hover:bg-red-700/80 text-white"
                              >
                                {deleteArtworkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="size-4" />}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <EmptyGalleryState isOwner={isOwner} onAddArtwork={handleOpenAddArtworkModal} />
            )}
          </div>
        )}

        {activeTab === "moodboards" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Moodboards coming soon...</p>
            {isOwner && (
              <Button className="mt-4" size="sm" onClick={handleOpenAddArtworkModal}>
                Create Moodboard
              </Button>
            )}
          </div>
        )}

        {activeTab === "appreciations" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Appreciations will be shown here.</p>
          </div>
        )}
      </div>

      <AddArtworkModal
        isOpen={isAddEditModalOpen} // Use the specific state for add/edit modal
        onClose={handleCloseAddArtworkModal}
        initialArtwork={artworkToEdit}
        onArtworkSaved={handleArtworkSaved}
      />

      {/* Artwork Lightbox Component */}
      {currentWorkItems.length > 0 && artistSlug && (
        <ArtworkLightbox
          isOpen={isLightboxOpen}
          onClose={handleCloseLightbox}
          artworks={currentWorkItems}
          initialArtworkId={selectedArtworkIdForLightbox}
          artistSlug={artistSlug}
        />
      )}
    </div>
  );
}
