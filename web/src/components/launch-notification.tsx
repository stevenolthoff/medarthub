'use client';

import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { FieldError } from './ui/field';
import { Button } from './ui/button';

export function LaunchNotification() {
  const [email, setEmail] = useState('');
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);

  const subscribeMutation = trpc.launchNotification.subscribe.useMutation({
    onSuccess: () => {
      setEmail('');
      setAgreedToPolicies(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (subscribeMutation.isPending || !agreedToPolicies) return;
    subscribeMutation.mutate({ email });
  };
  
  if (subscribeMutation.isSuccess) {
    return (
        <div id="launch-notification" className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
                    You're on the list!
                </h2>
                <p className="mt-2 text-lg/8 text-gray-600">
                    {subscribeMutation.data.message}
                </p>
            </div>
        </div>
    );
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
      <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl sm:mt-20">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                checked={agreedToPolicies}
                onChange={(e) => setAgreedToPolicies(e.target.checked)}
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
         {subscribeMutation.isError && (
          <FieldError className="mt-4 text-center">
            {subscribeMutation.error.message}
          </FieldError>
        )}
        <div className="mt-10">
          <Button
            type="submit"
            className="block w-full"
            disabled={subscribeMutation.isPending || !agreedToPolicies}
          >
            {subscribeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Notify me
          </Button>
        </div>
      </form>
    </div>
  )
}

