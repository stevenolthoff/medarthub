'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export function LaunchNotification() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      })

      if (response.ok) {
        setIsSuccess(true)
        form.reset()
      } else {
        alert('There was an error submitting your request. Please try again.')
      }
    } catch (error) {
      alert('There was an error submitting your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div id="launch-notification" className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
            You're on the list!
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600">
            We'll notify you when we launch. Thanks for your interest!
          </p>
        </div>
      </div>
    )
  }

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
        onSubmit={handleSubmit}
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
                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-500"
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
                className="size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
            </div>
            <label htmlFor="agree-to-policies-launch" className="text-sm/6 text-gray-600 cursor-pointer">
              By selecting this, you agree to our{' '}
              <a href="/privacy" className="font-semibold whitespace-nowrap text-orange-600 hover:text-orange-500 cursor-pointer">
                privacy policy
              </a>
              .
            </label>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="block w-full rounded-md bg-orange-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Notify me'}
          </button>
        </div>
      </form>
    </div>
  )
}

