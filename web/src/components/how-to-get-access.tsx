export function HowToGetAccess() {
  return (
    <div id="how-does-it-work" className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl text-center">
          How does it work?
        </h2>
        <div className="mt-16 space-y-12 sm:mt-20">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-lg font-semibold">
              1
            </div>
            <div className="flex-1">
              <p className="text-base leading-8 text-gray-600 sm:text-lg">
                Send in basic info and an art example, in the form above.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-lg font-semibold">
              2
            </div>
            <div className="flex-1">
              <p className="text-base leading-8 text-gray-600 sm:text-lg">
                You'll get an email. We'll start the process of setting up your portfolio page.
              </p>
              <p className="text-base leading-8 text-gray-600 sm:text-lg">
              We'll try to pick 10 artists who cover a variety of mediums and subject matters.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-lg font-semibold">
              3
            </div>
            <div className="flex-1">
              <p className="text-base leading-8 text-gray-600 sm:text-lg">
                We'll listen to your feedback and shape a platform tailored to you.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 flex justify-center">
          <a
            href="#request-access"
            className="rounded-md bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer"
          >
            Request early access
          </a>
        </div>
      </div>
    </div>
  )
}
