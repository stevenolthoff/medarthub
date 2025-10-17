export function HeroBanner() {
  return (
    <div className="h-[20vh] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
      {/* Customizable background pattern or image can go here */}
      <div className="absolute inset-0 bg-black/20"></div>
      {/* Decorative elements for visual appeal */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
