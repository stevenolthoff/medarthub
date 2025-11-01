import { serverTrpc } from "@/lib/server-trpc";
import { ArtistCard } from "@/components/artist-card";
import { generateOptimizedServerUrl } from "@/lib/utils";

export default async function Home() {
  const artists = await serverTrpc.artist.list.query();

  const artistsWithImageUrls = artists.map(artist => ({
    ...artist,
    artworks: artist.artworks.map(artwork => ({
      ...artwork,
      coverImageUrl: artwork.coverImage?.key 
        ? generateOptimizedServerUrl(artwork.coverImage.key, { width: 800, height: 600, format: 'webp', quality: 75 })
        : '/placeholder-artwork.svg'
    })),
    profilePicUrl: artist.profilePic?.key
      ? generateOptimizedServerUrl(artist.profilePic.key, { width: 40, height: 40, format: 'webp', quality: 80 })
      : `https://api.dicebear.com/8.x/lorelei/svg?seed=${encodeURIComponent(artist.user.name)}&flip=true`
  }));

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
          {artistsWithImageUrls.map((artist) => (
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
