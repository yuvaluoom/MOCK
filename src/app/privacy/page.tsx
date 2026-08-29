'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-50/30 to-white py-12 sm:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-calm-600 hover:text-calm-700 font-medium transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: October 30, 2025</p>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 text-gray-600 leading-relaxed space-y-8">
          {/* TL;DR Summary */}
          <section className="bg-calm-50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">TL;DR &mdash; Privacy Policy at a Glance</h2>
            <p className="text-sm text-gray-700 mb-3">We respect your privacy. Here are the key points in plain language:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-calm-600 font-bold flex-shrink-0">&#8226;</span>
                <span><strong>What do we collect?</strong> Information you provide (name, email, phone) + technical browsing data (pages viewed, device type, IP address).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 font-bold flex-shrink-0">&#8226;</span>
                <span><strong>Why?</strong> To provide our matching service, improve the platform, and occasionally send updates (only with your consent).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 font-bold flex-shrink-0">&#8226;</span>
                <span><strong>Cookies:</strong> We use cookies for core functionality, performance analytics, and remembering your preferences. You can block them in your browser, but it may affect your experience.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 font-bold flex-shrink-0">&#8226;</span>
                <span><strong>Third-party sharing:</strong> We do not share your data without reason. We only share when required for platform operations (e.g., email service providers), legal compliance, or with your explicit consent.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 font-bold flex-shrink-0">&#8226;</span>
                <span><strong>Security:</strong> Your data is stored securely and we make every effort to protect it.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 font-bold flex-shrink-0">&#8226;</span>
                <span><strong>Transparency:</strong> You can contact us at any time via the Contact page or by email to inquire about your stored data or request its removal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 font-bold flex-shrink-0">&#8226;</span>
                <span><strong>Updates:</strong> This policy may be updated from time to time. Continued use of the website constitutes acceptance of the current version.</span>
              </li>
            </ul>
          </section>

          {/* Introduction */}
          <section>
            <p>
              We respect the privacy of users of this website and its various sections (the &ldquo;Website&rdquo;)
              and place great importance on protecting it. The purpose of this document is to detail how we collect,
              use, store, and share personal information provided or gathered during use of the Website.
            </p>
          </section>

          {/* Registration */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Registration for Services</h2>
            <p>
              When using forms on the Website (such as the &ldquo;Contact Us&rdquo; form, questionnaire,
              or account registration), personal information may be collected, including: full name,
              phone number, and email address. Providing this information is done voluntarily and with
              your full consent.
            </p>
            <p className="mt-3">
              Users under the age of 18 declare that they have obtained the consent of their parents
              or legal guardian to provide information.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Information Collection</h2>
            <p className="mb-3">During your use of the Website, technical and usage information may be collected, including:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Pages visited, content viewed, and time spent on pages.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Device details &mdash; browser type, operating system, IP address, etc.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>If you sign in via a third-party service (e.g., Google), information may be collected in accordance with your settings with that provider.</span></li>
            </ul>
            <p className="mt-3 text-sm">
              Information collected is managed in accordance with the Israeli Privacy Protection Law, 5741-1981,
              the Privacy Protection Regulations (Data Security), 5777-2017, and the EU GDPR regulations (where applicable).
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Use of Third-Party Services</h2>
            <p>
              The Website may utilize third-party services such as: analytics tools (Google Analytics),
              email delivery systems, forms, and plugins. The use of information within these services
              is subject to their respective privacy policies. We recommend reviewing the privacy policies
              of these third parties.
            </p>
          </section>

          {/* External Links */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">External Links</h2>
            <p>
              The Website may contain links to external websites or applications. We have no control
              over their content and are not responsible for their privacy policies. Your use of external
              websites constitutes acceptance of their applicable policies.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies</h2>
            <p className="mb-3">The Website uses cookies for various purposes:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0">&bull;</span>
                <span><strong>Essential cookies</strong> &mdash; Required for the proper functioning of the Website.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0">&bull;</span>
                <span><strong>Performance cookies</strong> &mdash; For collecting anonymous statistical data to improve the user experience.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0">&bull;</span>
                <span><strong>Functional cookies</strong> &mdash; For remembering your preferences (language, filters, accessibility settings).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0">&bull;</span>
                <span><strong>Third-party cookies</strong> &mdash; Such as Google Analytics for traffic analysis.</span>
              </li>
            </ul>
            <p className="mt-3 text-sm">
              You can change your browser settings to block cookies, but some features of the Website
              may not function properly as a result.
            </p>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Storage</h2>
            <p>
              Information is stored in secure databases in accordance with applicable law.
              Some databases may be stored outside of Israel. By using the Website, you consent
              to the international transfer of data. Sensitive information (such as passwords)
              is stored in encrypted form.
            </p>
          </section>

          {/* Use of Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Use of Information</h2>
            <p className="mb-3">Information is used for the following purposes:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Enabling proper use of the Website and its services.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Providing our therapist matching service and responding to inquiries.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Improving the Website, its content, and services.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Sending marketing communications &mdash; subject to prior consent and in accordance with applicable law.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Compliance with legal requirements and binding regulations.</span></li>
            </ul>
          </section>

          {/* Sharing with Third Parties */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Sharing Information with Third Parties</h2>
            <p className="mb-3">Information will not be shared with third parties except in the following cases:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>For the proper operation of the Website (e.g., hosting or email service providers).</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>To comply with legal requirements or a court order.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>When action is required to prevent serious harm to a user or third party.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>With your explicit consent.</span></li>
            </ul>
            <p className="mt-3 text-sm">
              Additionally, we may share statistical, non-personally-identifiable information.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
            <p>
              We implement reasonable technological and organizational measures to protect information
              from unauthorized access, misuse, or disclosure. However, we cannot guarantee absolute protection.
            </p>
          </section>

          {/* Policy Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Privacy Policy</h2>
            <p>
              The company reserves the right to update this privacy policy from time to time.
              Changes will take effect within 48 hours of publication on the Website.
              Continued use of the Website constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-xl p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-sm mb-2">
              For any questions or requests related to this privacy policy, you can reach us through
              the <Link href="/contact" className="text-calm-600 hover:underline">Contact Us</Link> page
              or by email:
            </p>
            <p className="text-sm">
              <a href="mailto:privacy@matchmind.co.il" className="text-calm-600 hover:underline">
                privacy@matchmind.co.il
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
