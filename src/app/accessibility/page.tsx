'use client';

import Link from 'next/link';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-50/30 to-white py-12 sm:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-calm-600 hover:text-calm-700 font-medium transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Accessibility Statement</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: October 30, 2025</p>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 text-gray-600 leading-relaxed space-y-6">
          <section>
            <p>
              MatchMind Ltd. is a company providing digital mental health matching services.
              We are committed to making our platform accessible to all users, including people with disabilities,
              and to ensuring equal access and equal opportunity for people with diverse abilities.
            </p>
            <p className="mt-3">
              Our accessibility compliance is carried out in accordance with the Israeli Standard SI 5568,
              the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, and the Israeli Equal Rights
              for Persons with Disabilities Regulations (Accessibility Adjustments for Services), 5773-2013.
            </p>
            <p className="mt-3">
              Accessibility compliance has been tested on Chrome, Firefox, Safari, and Edge browsers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Accessibility Features on This Website</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Support for all major standard browsers (Chrome, Firefox, Safari, Edge, Opera).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Content written in clear, readable language with legible fonts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Semantic HTML structure with proper headings, paragraphs, and lists.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Simple, intuitive navigation with clearly organized menus.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Descriptive link text that clearly indicates the destination.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Skip-to-content link at the top of each page for keyboard users.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Text alternatives (alt text) for images and icons for screen reader compatibility.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Fully responsive design adapted to various screen sizes and resolutions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>ARIA roles and attributes implemented throughout for accurate screen reader interpretation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Accessible forms, menus, tabs, dialogs, and interactive elements with proper keyboard support.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Minimum touch target size of 44x44 pixels for mobile accessibility.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-calm-600 mt-1 flex-shrink-0">&#10003;</span>
                <span>Reduced motion support for users who prefer minimal animation.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Adjusting the Display</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0">&bull;</span>
                <span>You can zoom in or out using <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl</kbd> + mouse wheel, or <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">+</kbd> / <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">-</kbd>. Each press adjusts the view by 10%.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0">&bull;</span>
                <span>Font size, contrast, and other visual adjustments can be made through the accessibility menu (the icon at the bottom-left corner of every page).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0">&bull;</span>
                <span>Users without a mouse can navigate using the <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Tab</kbd> key to move between interactive elements and <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd> to activate them.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0">&bull;</span>
                <span>The website does not contain flashing, flickering, or auto-playing content.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Compatibility with Assistive Technologies</h2>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Screen magnifiers (built-in browser zoom)</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Voice recognition software</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Operating system voice control features (VoiceOver, NVDA, JAWS)</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Known Limitations</h2>
            <p className="text-sm">
              We make every effort to ensure all pages on our website are fully accessible.
              However, some pages may not yet be fully optimized, or a suitable technical solution
              has not yet been found. Additionally, third-party content or advertisements embedded
              on the site may not meet our accessibility standards. We are continuously working to
              improve accessibility across all areas of our platform.
            </p>
          </section>

          <section className="bg-calm-50 rounded-xl p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Encountered an Issue? We&apos;re Here to Help</h2>
            <p className="text-sm mb-3">
              If you encounter any accessibility barriers on our website, please don&apos;t hesitate to contact us.
              We take all feedback seriously and will do our best to resolve any issues promptly.
            </p>
            <div className="text-sm space-y-1">
              <p><strong className="text-gray-800">Accessibility Coordinator:</strong> MatchMind Support Team</p>
              <p><strong className="text-gray-800">Email:</strong>{' '}
                <a href="mailto:accessibility@matchmind.co.il" className="text-calm-600 hover:underline">
                  accessibility@matchmind.co.il
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
