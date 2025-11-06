export function LaunchNotification() {
  return (
    <div id="launch-notification" className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
          Get notified when we launch
        </h2>
        <p className="mt-2 text-lg/8 text-gray-600">
          Want to be notified when we launch? Just leave your email and we'll let you know.
        </p>
      </div>
      <form
        name="launch-notification"
        method="POST"
        data-netlify="true"
        className="mx-auto mt-16 max-w-xl sm:mt-20"
      >
        <input type="hidden" name="form-name" value="launch-notification" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-6">
          <div>
            <label htmlFor="email-launch" className="block text-sm/6 font-semibold text-gray-900">
              Email
            </label>
            <div className="mt-2.5">
              <input
                id="email-launch"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="flex gap-x-4">
            <div className="flex h-6 items-center">
               <input
                id="agree-to-policies-launch"
                name="agree-to-policies-launch"
                type="checkbox"
                required
                className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
            </div>
            <label htmlFor="agree-to-policies-launch" className="text-sm/6 text-gray-600 cursor-pointer">
              By selecting this, you agree to our{' '}
              <a href="/privacy" className="font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-500 cursor-pointer">
                privacy policy
              </a>
              .
            </label>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
          >
            Notify me
          </button>
        </div>
      </form>
    </div>
  )
}

