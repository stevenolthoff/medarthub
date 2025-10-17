import { TabbedContent } from "./tabbed-content";

type MainContentColumnProps = {
  isOwner: boolean;
  isLoggedIn: boolean;
};

export function MainContentColumn({ isOwner, isLoggedIn }: MainContentColumnProps) {
  return (
    <div className="w-full lg:w-2/3">
      <TabbedContent isOwner={isOwner} isLoggedIn={isLoggedIn} />
    </div>
  );
}
