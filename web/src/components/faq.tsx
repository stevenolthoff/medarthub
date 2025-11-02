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
              Can't find the answer you're looking for? Reach out to our{' '}
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer">
                customer support team
              </a>
              .
            </p>
          </div>
          <div className="w-full max-w-xl lg:ml-auto">
            <dl className="w-full max-w-xl space-y-8">
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  How do you make holy water?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  You boil the hell out of it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  What's the best thing about Switzerland?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  What do you call someone with no body and no nose?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Nobody knows. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  Why do you never see elephants hiding in trees?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Because they're so good at it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

