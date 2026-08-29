'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-50/30 to-white py-12 sm:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-calm-600 hover:text-calm-700 font-medium transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: October 30, 2025</p>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 text-gray-600 leading-relaxed space-y-8">

          {/* Agreement to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Agreement to Terms</h2>
            <p>
              These Terms and Conditions constitute a legally binding agreement made between you, whether personally
              or on behalf of an entity (&ldquo;you&rdquo;), and MatchMind Ltd. (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
              or &ldquo;our&rdquo;), concerning your access to and use of the matchmind.co.il website, as well as
              any related media form, media channel, or mobile application related, linked, or otherwise connected
              thereto (collectively, the &ldquo;Site&rdquo;).
            </p>
            <p className="mt-3">
              You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these
              Terms and Conditions. If you do not agree with all of these Terms and Conditions, then you are expressly
              prohibited from using the Site and you must discontinue use immediately.
            </p>
            <p className="mt-3">
              We reserve the right, in our sole discretion, to make changes or modifications to these Terms and
              Conditions at any time and for any reason. We will alert you about any changes by updating the
              &ldquo;Last updated&rdquo; date of these Terms and Conditions. It is your responsibility to periodically
              review these Terms and Conditions to stay informed of updates. You will be subject to, and will be
              deemed to have been made aware of and to have accepted, the changes in any revised Terms and Conditions
              by your continued use of the Site after the date such revised Terms are posted.
            </p>
            <p className="mt-3">
              The Site is intended for users who are at least 18 years old. Users who are minors in the jurisdiction
              in which they reside must have the permission of, and be directly supervised by, their parent or guardian
              to use the Site. If you are a minor, you must have your parent or guardian read and agree to these Terms
              and Conditions prior to you using the Site.
            </p>
          </section>

          {/* Nature of Services */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Nature of Services</h2>
            <p>
              MatchMind is a digital platform designed to match patients with licensed therapists based on
              personal preferences, therapeutic needs, and compatibility factors. Our service facilitates
              connections between patients and mental health professionals.
            </p>
            <p className="mt-3 font-medium text-gray-800">
              Important: MatchMind does not provide medical advice, diagnosis, or treatment. The platform is a
              matching and facilitation tool only. All clinical decisions are made solely by licensed therapists.
              In case of a mental health emergency, please contact your local emergency services or crisis hotline
              immediately.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases,
              functionality, software, website designs, text, photographs, and graphics on the Site (collectively,
              the &ldquo;Content&rdquo;) and the trademarks, service marks, and logos contained therein (the
              &ldquo;Marks&rdquo;) are owned or controlled by us or licensed to us, and are protected by copyright
              and trademark laws and various other intellectual property rights.
            </p>
            <p className="mt-3">
              The Content and the Marks are provided on the Site &ldquo;AS IS&rdquo; for your information and personal
              use only. Except as expressly provided in these Terms, no part of the Site and no Content or Marks may
              be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, transmitted,
              distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our
              express prior written permission.
            </p>
            <p className="mt-3">
              Provided that you are eligible to use the Site, you are granted a limited license to access and use the
              Site and to download or print a copy of any portion of the Content to which you have properly gained
              access solely for your personal, non-commercial use. We reserve all rights not expressly granted to you.
            </p>
          </section>

          {/* User Representations */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">User Representations</h2>
            <p className="mb-3">By using the Site, you represent and warrant that:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>All registration information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update it as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
              <li>You are not under the age of 18, or if a minor, you have received parental permission to use the Site.</li>
              <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
              <li>You will not use the Site for any illegal or unauthorized purpose.</li>
              <li>Your use of the Site will not violate any applicable law or regulation.</li>
            </ol>
            <p className="mt-3 text-sm">
              If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right
              to suspend or terminate your account and refuse any and all current or future use of the Site.
            </p>
          </section>

          {/* User Registration */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">User Registration</h2>
            <p>
              You may be required to register with the Site. You agree to keep your password confidential and will
              be responsible for all use of your account and password. We reserve the right to remove, reclaim, or
              change a username you select if we determine, in our sole discretion, that such username is inappropriate,
              obscene, or otherwise objectionable.
            </p>
          </section>

          {/* Health Information & Confidentiality */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Health Information &amp; Confidentiality</h2>
            <p>
              In the course of using the Site, you may provide personal health-related information through
              questionnaires, forms, or communications with therapists. We treat all such information as confidential
              and handle it in accordance with applicable privacy laws and our{' '}
              <Link href="/privacy" className="text-calm-600 hover:underline">Privacy Policy</Link>.
            </p>
            <p className="mt-3">
              You acknowledge that while we implement robust security measures to protect your information, no system
              is entirely immune to unauthorized access. You agree to notify us immediately of any unauthorized use
              of your account or any other breach of security.
            </p>
            <p className="mt-3">
              Communications between you and therapists matched through our platform are subject to the professional
              confidentiality obligations of the therapist under applicable law. MatchMind does not access, monitor,
              or store the content of therapeutic sessions.
            </p>
          </section>

          {/* Prohibited Activities */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Activities</h2>
            <p className="mb-3">
              You may not access or use the Site for any purpose other than that for which we make the Site available.
              As a user of the Site, you agree not to:
            </p>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Systematically retrieve data from the Site to create or compile a collection, database, or directory without written permission.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Make any unauthorized use of the Site, including collecting usernames and/or email addresses by electronic or other means for the purpose of sending unsolicited communications.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Circumvent, disable, or otherwise interfere with security-related features of the Site.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar tools.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Interfere with, disrupt, or create an undue burden on the Site or the networks connected to the Site.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Attempt to impersonate another user or person or use the username of another user.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Use any information obtained from the Site in order to harass, abuse, or harm another person.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Decipher, decompile, disassemble, or reverse engineer any of the software comprising or making up a part of the Site.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Upload or transmit viruses, Trojan horses, or other material that interferes with any party&apos;s use and enjoyment of the Site.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Use the Site in a manner inconsistent with any applicable laws or regulations.</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">&bull;</span><span>Misrepresent your identity, qualifications, or relationship with any person or entity when using the platform.</span></li>
            </ul>
          </section>

          {/* Third-Party Websites */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Websites and Content</h2>
            <p>
              The Site may contain links to other websites (&ldquo;Third-Party Websites&rdquo;) as well as content
              belonging to or originating from third parties (&ldquo;Third-Party Content&rdquo;). Such Third-Party
              Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness,
              or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Site
              or any Third-Party Content posted on, available through, or installed from the Site.
            </p>
            <p className="mt-3">
              If you decide to leave the Site and access Third-Party Websites, you do so at your own risk, and you
              should be aware these Terms and Conditions no longer govern. You should review the applicable terms and
              policies of any website to which you navigate from the Site.
            </p>
          </section>

          {/* Site Management */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Site Management</h2>
            <p className="mb-3">We reserve the right, but not the obligation, to:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Monitor the Site for violations of these Terms and Conditions.</li>
              <li>Take appropriate legal action against anyone who violates the law or these Terms and Conditions.</li>
              <li>In our sole discretion, refuse, restrict access to, or limit the availability of the Site or any portion thereof.</li>
              <li>Remove from the Site or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems.</li>
              <li>Otherwise manage the Site in a manner designed to protect our rights and property and to facilitate proper functioning.</li>
            </ol>
          </section>

          {/* Privacy Policy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Privacy Policy</h2>
            <p>
              We care about data privacy and security. Please review our{' '}
              <Link href="/privacy" className="text-calm-600 hover:underline">Privacy Policy</Link>.
              By using the Site, you agree to be bound by our Privacy Policy, which is incorporated into these Terms
              and Conditions. The Site is hosted in Israel. If you access the Site from any other region with laws
              governing personal data collection, use, or disclosure that differ from applicable laws in Israel,
              then through your continued use of the Site, you consent to have your data transferred to and processed
              in Israel, in accordance with applicable data protection laws including the GDPR where applicable.
            </p>
          </section>

          {/* Term and Termination */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Term and Termination</h2>
            <p>
              These Terms and Conditions shall remain in full force and effect while you use the Site. We reserve the
              right to, in our sole discretion and without notice or liability, deny access to and use of the Site to
              any person for any reason or for no reason, including without limitation for breach of any representation,
              warranty, or covenant contained in these Terms and Conditions or of any applicable law or regulation.
            </p>
            <p className="mt-3">
              We may terminate your use or participation in the Site or delete your account and any content or
              information that you posted at any time, without warning, in our sole discretion. If we terminate or
              suspend your account for any reason, you are prohibited from registering and creating a new account
              under your name, a fake or borrowed name, or the name of any third party.
            </p>
          </section>

          {/* Modifications and Interruptions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Modifications and Interruptions</h2>
            <p>
              We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason
              at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of
              the Site without notice at any time. We will not be liable to you or any third party for any modification,
              suspension, or discontinuance of the Site.
            </p>
            <p className="mt-3">
              We cannot guarantee the Site will be available at all times. We may experience hardware, software, or
              other problems or need to perform maintenance, resulting in interruptions, delays, or errors. You agree
              that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to
              access or use the Site during any downtime or discontinuance.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms and Conditions and your use of the Site are governed by and construed in accordance with the
              laws of the State of Israel, without regard to its conflict of law principles. Any legal action or
              proceeding arising out of or related to these Terms and Conditions shall be brought exclusively in the
              competent courts of Tel Aviv-Jaffa, Israel, and you hereby consent to the jurisdiction of such courts.
            </p>
            <p className="mt-3">
              In no event shall any claim, action, or proceeding related to the Site be commenced more than one (1) year
              after the cause of action arose.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Disclaimer</h2>
            <p className="text-sm uppercase tracking-wide">
              The Site is provided on an as-is and as-available basis. You agree that your use of the Site and our
              services will be at your sole risk. To the fullest extent permitted by law, we disclaim all warranties,
              express or implied, in connection with the Site and your use thereof, including the implied warranties
              of merchantability, fitness for a particular purpose, and non-infringement. We make no warranties or
              representations about the accuracy or completeness of the Site&apos;s content and we will assume no
              liability or responsibility for any errors, mistakes, or inaccuracies of content, personal injury or
              property damage resulting from your access to and use of the Site, any unauthorized access to our servers
              and/or any personal information stored therein, any interruption or cessation of transmission, any bugs
              or viruses transmitted through the Site, or any errors or omissions in any content.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="text-sm">
              In no event will we or our directors, employees, or agents be liable to you or any third party for any
              direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost
              profit, lost revenue, loss of data, or other damages arising from your use of the Site, even if we have
              been advised of the possibility of such damages. Our total liability to you for any cause whatsoever shall
              at all times be limited to the amount paid, if any, by you to us during the twelve (12) month period prior
              to any cause of action arising.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Indemnification</h2>
            <p className="text-sm">
              You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of
              our respective officers, agents, partners, and employees, from and against any loss, damage, liability,
              claim, or demand, including reasonable attorneys&apos; fees and expenses, made by any third party due to or
              arising out of: (1) use of the Site; (2) breach of these Terms and Conditions; (3) any breach of your
              representations and warranties set forth in these Terms; (4) your violation of the rights of a third party,
              including but not limited to intellectual property rights; or (5) any harmful act toward any other user of
              the Site with whom you connected via the Site.
            </p>
          </section>

          {/* Electronic Communications */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Electronic Communications</h2>
            <p>
              Visiting the Site, sending us emails, and completing online forms constitute electronic communications.
              You consent to receive electronic communications, and you agree that all agreements, notices, disclosures,
              and other communications we provide to you electronically, via email and on the Site, satisfy any legal
              requirement that such communication be in writing.
            </p>
          </section>

          {/* Corrections */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Corrections</h2>
            <p>
              There may be information on the Site that contains typographical errors, inaccuracies, or omissions.
              We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the
              information on the Site at any time, without prior notice.
            </p>
          </section>

          {/* Miscellaneous */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Miscellaneous</h2>
            <p>
              These Terms and Conditions and any policies or operating rules posted by us on the Site constitute
              the entire agreement and understanding between you and us. Our failure to exercise or enforce any right
              or provision of these Terms and Conditions shall not operate as a waiver of such right or provision.
              These Terms and Conditions operate to the fullest extent permissible by law.
            </p>
            <p className="mt-3">
              If any provision or part of a provision of these Terms and Conditions is determined to be unlawful,
              void, or unenforceable, that provision is deemed severable from these Terms and Conditions and does not
              affect the validity and enforceability of any remaining provisions.
            </p>
            <p className="mt-3">
              There is no joint venture, partnership, employment, or agency relationship created between you and us
              as a result of these Terms and Conditions or use of the Site.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-xl p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-sm mb-3">
              In order to resolve a complaint regarding the Site or to receive further information regarding use
              of the Site, please contact us at:
            </p>
            <div className="text-sm space-y-1">
              <p><strong className="text-gray-800">MatchMind Ltd.</strong></p>
              <p>Tel Aviv, Israel</p>
              <p>
                Email:{' '}
                <a href="mailto:legal@matchmind.co.il" className="text-calm-600 hover:underline">
                  legal@matchmind.co.il
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
