import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
            <span className="font-semibold text-purple-600">MedicalArtists.co</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="#request-access" className="text-purple-600 hover:text-purple-700 transition-colors cursor-pointer">
              Request Access
            </Link>
            <Link href="#but-why" className="text-purple-600 hover:text-purple-700 transition-colors cursor-pointer">
              But why?
            </Link>
            <Link href="#faq" className="text-purple-600 hover:text-purple-700 transition-colors cursor-pointer">
              Q&A
            </Link>
            <Link href="#launch-notification" className="text-purple-600 hover:text-purple-700 transition-colors cursor-pointer">
              Get Notified
            </Link>
            <Link href="/privacy" className="text-purple-600 hover:text-purple-700 transition-colors cursor-pointer">
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
