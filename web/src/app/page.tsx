import { serverTrpc } from "@/lib/server-trpc";
import { ArtistCard } from "@/components/artist-card";

export default async function Home() {
  const artists = await serverTrpc.artist.list.query();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Discover Amazing Artists
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore portfolios from talented creators in the medical and scientific fields.
        </p>
      </header>
      
      {artists.length > 0 ? (
        <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </main>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border h-96">
            <h2 className="text-2xl font-semibold text-foreground">No Artists Yet</h2>
            <p className="mt-2 text-muted-foreground">
                Looks like our gallery is waiting for its first star. Sign up to be the first!
            </p>
        </div>
      )}
    </div>
  );
}
