import { type RouterOutputs } from "@/lib/server-trpc";

type Artist = NonNullable<RouterOutputs['artist']['getBySlug']>;
type Artwork = Artist['artworks'][0];

interface ArtistStructuredDataProps {
  artist: Artist;
  baseUrl: string;
}

interface ArtworkStructuredDataProps {
  artwork: Artwork;
  artist: Artist;
  baseUrl: string;
}

export function ArtistStructuredData({ artist, baseUrl }: ArtistStructuredDataProps) {
  const publishedArtworks = artist.artworks.filter(artwork => artwork.status === 'PUBLISHED');
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": artist.user.name,
    "alternateName": `@${artist.user.username}`,
    "url": `${baseUrl}/${artist.user.username}`,
    "sameAs": [
      // Add social media links if available in the future
    ],
    "description": `Digital artist and creator on Medical Artists with ${publishedArtworks.length} published artworks`,
    "knowsAbout": ["Digital Art", "Illustration", "Creative Design"],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Digital Artist",
      "occupationLocation": {
        "@type": "Country",
        "name": "Global"
      }
    },
    "memberOf": {
      "@type": "Organization",
      "name": "Medical Artists",
      "url": baseUrl
    },
    "creator": publishedArtworks.map(artwork => ({
      "@type": "CreativeWork",
      "name": artwork.title,
      "url": `${baseUrl}/${artist.user.username}/artworks/${artwork.slug}`,
      "description": artwork.description || `${artwork.title} by ${artist.user.name}`,
      "dateCreated": artwork.createdAt,
      "creator": {
        "@type": "Person",
        "name": artist.user.name
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function ArtworkStructuredData({ artwork, artist, baseUrl }: ArtworkStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": artwork.title,
    "description": artwork.description || `${artwork.title} by ${artist.user.name}`,
    "url": `${baseUrl}/${artist.user.username}/artworks/${artwork.slug}`,
    "creator": {
      "@type": "Person",
      "name": artist.user.name,
      "alternateName": `@${artist.user.username}`,
      "url": `${baseUrl}/${artist.user.username}`
    },
    "dateCreated": artwork.createdAt,
    "dateModified": artwork.createdAt,
    "genre": "Digital Art",
    "artform": "Digital Illustration",
    "inLanguage": "en",
    "isPartOf": {
      "@type": "CollectionPage",
      "name": `${artist.user.name}'s Portfolio`,
      "url": `${baseUrl}/${artist.user.username}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Medical Artists",
      "url": baseUrl
    },
    "license": "All Rights Reserved",
    "keywords": ["digital art", "illustration", "creative", "artwork", "portfolio"],
    "image": {
      "@type": "ImageObject",
      "url": `/api/artwork-image/${artwork.id}`,
      "name": artwork.title,
      "description": artwork.description || `${artwork.title} by ${artist.user.name}`,
      "creator": {
        "@type": "Person",
        "name": artist.user.name
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
