import { TabbedContent } from "./tabbed-content";
import { type RouterOutputs } from "@/lib/server-trpc";

// Use tRPC inferred types
type Artwork = NonNullable<RouterOutputs['artist']['getBySlug']>['artworks'][0];

type MainContentColumnProps = {
  isOwner: boolean;
  isLoggedIn: boolean;
  artworks: Artwork[];
};

export function MainContentColumn({ isOwner, isLoggedIn, artworks }: MainContentColumnProps) {
  return (
    <div className="w-full lg:w-5/6">
      <TabbedContent isOwner={isOwner} isLoggedIn={isLoggedIn} artworks={artworks} />
    </div>
  );
}
