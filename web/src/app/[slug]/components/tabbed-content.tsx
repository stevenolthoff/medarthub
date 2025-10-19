"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyGalleryState } from "./empty-gallery-state";
import { type RouterOutputs } from "@/lib/server-trpc";

type Tab = {
  id: string;
  label: string;
  count?: number;
};

type WorkItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  likes: number;
  views: number;
  category: string;
};

// Use tRPC inferred types
type Artwork = NonNullable<RouterOutputs['artist']['getBySlug']>['artworks'][0];

type TabbedContentProps = {
  isOwner: boolean;
  isLoggedIn: boolean;
  artworks: Artwork[];
};

// Placeholder data for work items
const placeholderWorkItems: WorkItem[] = [
  {
    id: "1",
    title: "Road Trip - A Tiny Animated Short",
    description: "An animated short about a road trip adventure",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    likes: 504,
    views: 4800,
    category: "work"
  },
  {
    id: "2", 
    title: "Warby Parker: Madison",
    description: "Brand identity and visual design",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    likes: 22,
    views: 220,
    category: "work"
  },
  {
    id: "3",
    title: "2024 Illustra",
    description: "Illustration series for 2024",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    likes: 156,
    views: 1200,
    category: "work"
  },
  {
    id: "4",
    title: "Quilt",
    description: "Isometric bedroom design",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    likes: 89,
    views: 795,
    category: "work"
  },
  {
    id: "5",
    title: "Digital Art Collection",
    description: "Modern digital art pieces",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    likes: 234,
    views: 2100,
    category: "work"
  },
  {
    id: "6",
    title: "Brand Identity Project",
    description: "Complete brand identity design",
    imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop",
    likes: 67,
    views: 890,
    category: "work"
  }
];

export function TabbedContent({ isOwner, isLoggedIn, artworks }: TabbedContentProps) {
  // Default tabs - users will be able to customize these later
  const defaultTabs: Tab[] = [
    { id: "work", label: "Work", count: artworks.length },
    { id: "moodboards", label: "Moodboards", count: 0 },
    { id: "appreciations", label: "Appreciations", count: 0 }
  ];
  const [activeTab, setActiveTab] = useState("work");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const getWorkItemsForTab = (tabId: string) => {
    if (tabId === "work") {
      // Convert artworks to work items format
      return artworks.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        description: artwork.description,
        imageUrl: `https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop&sig=${artwork.id}`, // Placeholder image
        likes: Math.floor(Math.random() * 500), // Placeholder likes
        views: Math.floor(Math.random() * 5000), // Placeholder views
        category: "work"
      }));
    }
    // For other tabs, return empty array for now
    return [];
  };

  const currentWorkItems = getWorkItemsForTab(activeTab);

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {defaultTabs.map((tab) => (
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
            {currentWorkItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {(currentWorkItems as WorkItem[]).map((item) => (
                <div key={item.id} className="group relative overflow-hidden cursor-pointer rounded-lg">
                  <div className="aspect-[4/3] relative overflow-hidden rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Hover overlay with text */}
                    <div className="absolute inset-0 bg-black/60 md:bg-black/0 md:group-hover:bg-black/60 transition-all duration-200 flex items-end rounded-lg">
                      <div className="w-full p-4 transform translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-200">
                        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-white/90 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-white/80">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {item.likes}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {item.views.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <EmptyGalleryState isOwner={isOwner} />
            )}
          </div>
        )}

        {activeTab === "moodboards" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Moodboards coming soon...</p>
            {isOwner && (
              <Button className="mt-4" size="sm">
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
    </div>
  );
}
