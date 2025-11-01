import { TabbedContent } from "./tabbed-content";
import { type RouterOutputs } from "@/lib/server-trpc";

type MainContentColumnProps = {
  isOwner: boolean;
  isLoggedIn: boolean;
  artistSlug: string;
  artistName: string;
  about?: string | null;
  initialArtworks?: Array<NonNullable<RouterOutputs['artist']['getBySlug']>['artworks'][0] & { coverImageUrl: string }>;
};

export function MainContentColumn({ isOwner, isLoggedIn, artistSlug, artistName, about, initialArtworks }: MainContentColumnProps) {
  return (
    <div className="w-full lg:w-5/6">
      <TabbedContent isOwner={isOwner} isLoggedIn={isLoggedIn} artistSlug={artistSlug} artistName={artistName} about={about} initialArtworks={initialArtworks} />
    </div>
  );
}
