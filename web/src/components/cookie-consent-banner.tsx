'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;

interface CookiePreferences {
  necessary: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean; // Reserved for future use
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = Cookies.get(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      const parsed = JSON.parse(consent);
      setPreferences(parsed);
      loadAnalyticsScripts(parsed);
    }
  }, []);

  const loadAnalyticsScripts = (prefs: CookiePreferences) => {
    if (prefs.analytics && typeof window !== 'undefined') {
      // Load Google Analytics if enabled
      if (GOOGLE_ANALYTICS_ID) {
        loadGoogleAnalytics(GOOGLE_ANALYTICS_ID);
      }

      // Load Hotjar if enabled
      if (HOTJAR_ID) {
        loadHotjar(HOTJAR_ID);
      }
    }
  };

  const handleAcceptAll = () => {
    const allEnabled: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allEnabled);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = (prefs: CookiePreferences) => {
    savePreferences(prefs);
    setShowPreferences(false);
    setShowBanner(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    Cookies.set(COOKIE_CONSENT_KEY, JSON.stringify(prefs), { expires: 365 }); // Store for 1 year
    setPreferences(prefs);
    loadAnalyticsScripts(prefs);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We use cookies
              </h3>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from. 
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences at any time.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowPreferences(true)}
                className="flex-1 sm:flex-none"
              >
                Customize
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="flex-1 sm:flex-none"
              >
                Reject All
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. You can enable or disable different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Necessary Cookies</h4>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Always Active</span>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies are essential for the website to function properly. They enable core functionality like authentication, 
                  security, and session management. These cookies cannot be disabled.
                </p>
              </div>
              <Switch checked={true} disabled className="mt-1" />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. 
                  This includes services like Google Analytics and Hotjar.
                </p>
                <p className="text-xs text-gray-500">
                  Used for: Page views, user behavior analysis, performance monitoring
                </p>
              </div>
              <Switch 
                checked={preferences.analytics} 
                onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                className="mt-1"
              />
            </div>

            {/* Marketing Cookies - Reserved */}
            <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg opacity-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Coming Soon</span>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies are used to deliver personalized advertisements and track campaign performance.
                </p>
              </div>
              <Switch checked={false} disabled className="mt-1" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleRejectAll}
              className="flex-1"
            >
              Reject All
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Accept All
            </Button>
            <Button
              onClick={() => handleSavePreferences(preferences)}
              className="flex-1 sm:flex-none"
            >
              Save Preferences
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center pt-4 border-t">
            For more information, please review our{' '}
            <a href="/privacy" className="text-indigo-600 hover:text-indigo-500 underline cursor-pointer">
              Privacy Policy
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function to load Google Analytics
function loadGoogleAnalytics(id: string) {
  if (typeof window === 'undefined') return;

  // Load gtag.js
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  `;
  document.head.appendChild(script2);
}

// Helper function to load Hotjar
function loadHotjar(id: string) {
  if (typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.innerHTML = `
    (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:${id},hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  `;
  document.head.appendChild(script);
}

