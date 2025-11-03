import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://medicalartists.co';
  
  return {
    title: "Privacy Policy - Medical Artists",
    description: "Learn how Medical Artists collects, uses, and protects your personal information.",
    alternates: {
      canonical: `${baseUrl}/privacy`,
    },
  };
}

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="mt-12 space-y-8 text-base text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">1. Introduction</h2>
              <p className="mt-4">
                Welcome to Medical Artists ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">2. Information We Collect</h2>
              
              <h3 className="mt-4 text-xl font-semibold text-gray-900">2.1 Information You Provide to Us</h3>
              <p className="mt-2">
                When you use our platform, we may collect the following types of information:
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li><strong>Account Information:</strong> Username, name, and email address when you create an account</li>
                <li><strong>Authentication Data:</strong> Password (stored securely as a hash)</li>
                <li><strong>Profile Information:</strong> Company name, location, headline, website URL, and biographical information</li>
                <li><strong>Content:</strong> Artwork titles, descriptions, and uploaded images</li>
                <li><strong>Communication Data:</strong> Messages and contact information provided through our request access form</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-gray-900">2.2 Automatically Collected Information</h3>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited and features used</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type, and operating system</li>
                <li><strong>Cookies:</strong> We use an authentication cookie (auth-token) to maintain your session</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">3. How We Use Your Information</h2>
              <p className="mt-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>To create and manage your account</li>
                <li>To authenticate your identity and provide secure access to the platform</li>
                <li>To display your artist profile and artwork to visitors</li>
                <li>To communicate with you about your account and our services</li>
                <li>To improve and optimize our website and services</li>
                <li>To ensure the security and integrity of our platform</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">4. Public Information</h2>
              <p className="mt-4">
                When you create a profile on Medical Artists, certain information is visible to the public:
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>Your artist profile, including headline, company, location, and biographical information</li>
                <li>Published artwork, including titles, descriptions, and images</li>
                <li>Profile and banner images</li>
                <li>Public username and profile URL</li>
              </ul>
              <p className="mt-4">
                Please be aware that any information you choose to make public on your profile can be viewed, accessed, and used by others, including search engines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">5. Information Sharing and Disclosure</h2>
              <p className="mt-4">
                We do not sell, rent, or trade your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                <li><strong>Public Profiles:</strong> Your public profile and artwork are accessible to anyone on the internet</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Service Providers:</strong> With third-party service providers who assist us in operating our platform (e.g., cloud storage providers)</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">6. Data Storage and Security</h2>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>Your data is stored securely using industry-standard practices</li>
                <li>Passwords are hashed using secure cryptographic methods</li>
                <li>Authentication tokens are encrypted and stored in secure cookies</li>
                <li>We use HTTPS encryption for all data transmission</li>
                <li>Regular security assessments are conducted to protect against unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">7. Cookies and Tracking Technologies</h2>
              <p className="mt-4">
                We use various types of cookies and tracking technologies to enhance your experience on our platform:
              </p>

              <h3 className="mt-4 text-xl font-semibold text-gray-900">7.1 Necessary Cookies</h3>
              <p className="mt-2">
                These cookies are essential for the website to function properly and cannot be switched off. They include:
              </p>
              <ul className="mt-2 ml-6 list-disc space-y-2">
                <li><strong>Authentication cookies (auth-token):</strong> Maintain your logged-in session for up to 7 days</li>
                <li><strong>Cookie consent:</strong> Store your cookie preferences</li>
                <li><strong>Security cookies:</strong> Protect against fraudulent activity</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-gray-900">7.2 Analytics Cookies</h3>
              <p className="mt-2">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use:
              </p>
              <ul className="mt-2 ml-6 list-disc space-y-2">
                <li><strong>Google Analytics:</strong> Collects information about your use of the website, such as pages visited, time spent, and navigation patterns. This helps us improve our website's performance and user experience. 
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 underline ml-1 cursor-pointer">
                    Learn more about Google Analytics privacy
                  </a>
                </li>
                <li><strong>Hotjar:</strong> Records and analyzes user interactions, including heatmaps, session recordings, and feedback tools. This helps us understand how users navigate and interact with our site.
                  <a href="https://www.hotjar.com/legal/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 underline ml-1 cursor-pointer">
                    Learn more about Hotjar privacy
                  </a>
                </li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-gray-900">7.3 Managing Cookies</h3>
              <p className="mt-2">
                You can control which cookies you accept through our cookie preferences manager, accessible from the cookie banner or footer link. 
                You can also control cookies through your browser settings. However, disabling necessary cookies may limit your ability to use certain features of our website.
              </p>
              <p className="mt-4">
                To manage your Google Analytics privacy settings, you can use the 
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 underline ml-1 cursor-pointer">
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">8. Your Rights and Choices</h2>
              <p className="mt-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and personal information</li>
                <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">9. GDPR and CCPA Compliance</h2>
              <p className="mt-4">
                We are committed to complying with data protection laws around the world, including:
              </p>

              <h3 className="mt-4 text-xl font-semibold text-gray-900">9.1 European Union (GDPR)</h3>
              <p className="mt-2">
                If you are located in the European Union, you have additional rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="mt-2 ml-6 list-disc space-y-2">
                <li><strong>Right to access:</strong> Obtain confirmation that we process your personal data and access to it</li>
                <li><strong>Right to rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Right to erasure:</strong> Request deletion of your personal data under certain circumstances</li>
                <li><strong>Right to restrict processing:</strong> Limit how we use your personal data</li>
                <li><strong>Right to data portability:</strong> Receive your personal data in a structured, commonly used format</li>
                <li><strong>Right to object:</strong> Object to processing of your personal data for certain purposes</li>
                <li><strong>Right to withdraw consent:</strong> Withdraw your consent for processing based on consent</li>
                <li><strong>Right to lodge a complaint:</strong> File a complaint with a supervisory authority</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-gray-900">9.2 California (CCPA)</h3>
              <p className="mt-2">
                If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="mt-2 ml-6 list-disc space-y-2">
                <li><strong>Right to know:</strong> Request information about what personal information we collect and how it's used</li>
                <li><strong>Right to delete:</strong> Request deletion of your personal information</li>
                <li><strong>Right to opt-out:</strong> Opt out of the sale of your personal information (we do not sell personal information)</li>
                <li><strong>Right to non-discrimination:</strong> We will not discriminate against you for exercising your CCPA rights</li>
              </ul>

              <p className="mt-4">
                We do not sell personal information as defined by the CCPA. Any sharing of data is only as described in Section 5 of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">10. Children's Privacy</h2>
              <p className="mt-4">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">11. International Data Transfers</h2>
              <p className="mt-4">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our services, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">12. Changes to This Privacy Policy</h2>
              <p className="mt-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">13. Contact Us</h2>
              <p className="mt-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">Medical Artists</p>
                <p>Email: privacy@medicalartists.co</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

