import { Metadata } from "next";
import { Landing } from "@/components/landing";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://medicalartists.co';
  
  return {
    title: "Medical Artists - Discover Amazing Medical & Scientific Art",
    description: "Explore portfolios from talented creators in the medical and scientific fields.",
    keywords: ["medical art", "scientific illustration", "medical illustration", "digital art", "art portfolio", "medical artists", "healthcare art", "biomedical art"],
    openGraph: {
      title: "Medical Artists - Discover Amazing Medical & Scientific Art",
      description: "Explore portfolios from talented creators in the medical and scientific fields.",
      type: "website",
      url: baseUrl,
      siteName: "Medical Artists",
    },
    twitter: {
      card: "summary_large_image",
      title: "Medical Artists - Discover Amazing Medical & Scientific Art",
      description: "Explore portfolios from talented creators in the medical and scientific fields.",
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

export default function Home() {
  return (
    <div>
      {/* Landing page content will go here */}
      <Landing />
    </div>
  );
}
