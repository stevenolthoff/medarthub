import { TabbedContent } from "./tabbed-content";

type MainContentColumnProps = {
  isOwner: boolean;
  isLoggedIn: boolean;
  artistSlug: string;
  artistName: string;
};

export function MainContentColumn({ isOwner, isLoggedIn, artistSlug, artistName }: MainContentColumnProps) {
  return (
    <div className="w-full lg:w-5/6">
      <TabbedContent isOwner={isOwner} isLoggedIn={isLoggedIn} artistSlug={artistSlug} artistName={artistName} />
    </div>
  );
}
