"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { RouterOutputs } from '@/lib/server-trpc';

type ArtistProfile = NonNullable<RouterOutputs['artist']['getBySlug']>;

export default function SettingsPage() {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [about, setAbout] = useState('');

  const { data: profile, isLoading: isProfileLoading } = trpc.artist.getBySlug.useQuery(
    { slug: user?.artist?.slug! },
    { enabled: !!user?.artist?.slug }
  );

  const updateProfileMutation = trpc.artist.updateProfile.useMutation({
    onSuccess: () => {
      utils.artist.getBySlug.invalidate({ slug: user?.artist?.slug! });
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    }
  });

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isAuthLoading, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.user.name || '');
      setHeadline(profile.headline || '');
      setCompany(profile.company || '');
      setLocation(profile.location || '');
      setWebsiteUrl(profile.websiteUrl || '');
      setAbout(profile.about || '');
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name,
      headline,
      company,
      location,
      websiteUrl,
      about,
    });
  };

  const isLoading = isAuthLoading || isProfileLoading;

  if (isLoading || !isLoggedIn || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-3 px-4 sm:py-12 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit}>
        <Card className="border-0 bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="pb-2 px-0 sm:px-6 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Basic Information</CardTitle>
            <CardDescription className="hidden sm:block">Update your personal details and professional info.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <FieldGroup className="gap-3 sm:gap-7">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="headline">Headline</FieldLabel>
                <Input id="headline" placeholder="e.g., Senior Designer, Art Director, Student" value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="company">Company</FieldLabel>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input id="location" placeholder="e.g., New York, USA" value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="websiteUrl">Website URL</FieldLabel>
                <Input id="websiteUrl" type="url" placeholder="https://example.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card className="mt-3 border-0 bg-transparent shadow-none sm:mt-8 sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="pb-2 px-0 sm:px-6 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">About Me</CardTitle>
            <CardDescription className="hidden sm:block">Write a short bio about yourself.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <Field>
              <FieldLabel htmlFor="about">Description</FieldLabel>
              <Textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} rows={4} className="sm:rows-6" />
              <div className="text-right mt-2 text-sm text-muted-foreground">
                {about.length} / 2000
              </div>
            </Field>
          </CardContent>
        </Card>

        <div className="mt-4 sm:mt-8 flex justify-end">
          <Button type="submit" disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

