export function FAQ() {
  return (
    <div id="faq" className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Can't find the answer you're looking for? Reach out to {' '}
              <a href="mailto:stef@magicwords.dev" className="font-semibold text-orange-600 hover:text-orange-500 cursor-pointer">
                stef@magicwords.dev
              </a>
              .
            </p>
            <div className="mt-12 flex justify-center gap-x-6 md:justify-start">
              <a
                href="#request-access"
                className="rounded-md bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer"
              >
                Request early access
              </a>
            </div>
          </div>
          <div className="w-full max-w-xl lg:ml-auto">
            <dl className="w-full max-w-xl space-y-8">
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  What do early access artists get?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  1. A really pretty portfolio page that will up your odds of clients finding you. This page will be optimized for Google so you are maximally findable.
                  <br />
                  2. The option to shape a showcase that YOU want and one that helps medical illustrators get jobs.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                What will the showcase look like?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                Like Dribbble or Behance but exclusively for medical illustrators.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  Will this cost money?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Free accounts for everyone. Paid ad spots.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  How do you decide if I get early access?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  I can only handle 10 right now, and I need artists in a variety of mediums and subject matter. That's the criteria. With enough interest, the doors will be wide open.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  Why are you doing this?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Because I am personally annoyed by the situation. Let's level the playing field.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  When will this be available?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  I don't know. Depends on how much interest there is.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  WHO are you?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Steven Olthoff: <a href="https://www.linkedin.com/in/steven-william-o/" className="font-semibold text-orange-600 hover:text-orange-500 cursor-pointer">LinkedIn</a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

