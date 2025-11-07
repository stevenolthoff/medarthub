import { Metadata } from "next";
import { Landing } from "@/components/landing";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://medicalartists.co";
  const title = "Medical Artists | Behance for Medical Illustrators";
  const description =
    "Join the Medical Artists early access waitlist to showcase your medical illustration portfolio, connect with healthcare clients, and learn how to land your first projects.";

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: [
      "medical illustrators",
      "medical illustration portfolio",
      "scientific illustration",
      "biomedical art",
      "healthcare branding",
      "medical art marketplace",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: baseUrl,
      siteName: "Medical Artists",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
