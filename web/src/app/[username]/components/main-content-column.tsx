import Link from "next/link";
import { Button } from "@/components/ui/button";

type MainContentColumnProps = {
  isOwner: boolean;
  isLoggedIn: boolean;
};

export function MainContentColumn({ isOwner, isLoggedIn }: MainContentColumnProps) {
  return (
    <div className="w-full lg:w-2/3">
      <div className="rounded-xl border bg-card p-8 shadow-lg">
        {isOwner ? (
          <div className="text-center">
            <p className="mb-4 text-foreground">This is your private profile view.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You can customize your profile and manage your projects from here.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild>
                <Link href="/settings">Edit Profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/project-briefs">View Your Projects</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">This is a public profile view.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This is how others see your profile.
            </p>
            {!isLoggedIn && (
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">Log in</Link> to interact with this profile.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
