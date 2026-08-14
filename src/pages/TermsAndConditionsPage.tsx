import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. About Scan Connect',
    body: (
      <>
        <p>
          Scan Connect provides privacy-focused QR-enabled vehicle contact solutions that allow individuals to
          contact a vehicle owner without directly displaying the owner&apos;s personal phone number.
        </p>
        <p>Our Services may include:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Scan Connect QR tags</li>
          <li>Vehicle contact and identification services</li>
          <li>Secure call routing</li>
          <li>WhatsApp communication, where available</li>
          <li>Vehicle-related emergency/contact features</li>
          <li>Parking communication solutions</li>
          <li>Commercial parking and fleet solutions</li>
          <li>Related digital services</li>
        </ul>
        <p>
          The availability of individual features may depend on the product, subscription, location, technology
          integrations, and applicable service conditions.
        </p>
      </>
    ),
  },
  {
    title: '2. Eligibility',
    body: (
      <>
        <p>By using Scan Connect, you confirm that:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>You are legally capable of entering into a binding agreement.</li>
          <li>The information provided by you is accurate and current.</li>
          <li>You will use the Services only for lawful purposes.</li>
          <li>You will not use the Services to harass, threaten, stalk, deceive, impersonate, or harm another person.</li>
        </ul>
        <p>
          If you are purchasing or using Scan Connect on behalf of a company, organization, fleet, society, or other
          entity, you confirm that you have the authority to accept these Terms on its behalf.
        </p>
      </>
    ),
  },
  {
    title: '3. Account Registration',
    body: (
      <>
        <p>Certain features may require you to create an account. You are responsible for:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Providing accurate information.</li>
          <li>Keeping your login credentials confidential.</li>
          <li>Updating your information when required.</li>
          <li>All activity performed through your account.</li>
        </ul>
        <p>You must immediately notify us if you believe your account has been accessed without authorization.</p>
        <p>
          We reserve the right to suspend or terminate accounts containing false, misleading, fraudulent, or unlawful
          information.
        </p>
      </>
    ),
  },
  {
    title: '4. QR Tag Activation',
    body: (
      <>
        <p>
          A Scan Connect QR tag must be activated and linked to the relevant vehicle/contact information before it
          can provide the intended communication functionality.
        </p>
        <p>The customer is responsible for:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Correctly activating the QR tag.</li>
          <li>Entering accurate contact information.</li>
          <li>Linking the correct vehicle.</li>
          <li>Keeping account information updated.</li>
          <li>Ensuring that the QR code remains visible and readable.</li>
        </ul>
        <p>Scan Connect is not responsible for communication failures caused by incorrect information supplied by the customer.</p>
      </>
    ),
  },
  {
    title: '5. QR Tag Usage',
    body: (
      <>
        <p>The QR tag should be installed according to the instructions provided with the product.</p>
        <p>Customers must not:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Alter or damage the QR code.</li>
          <li>Intentionally obscure the QR code.</li>
          <li>Duplicate or reproduce the tag without authorization.</li>
          <li>Use the tag for fraudulent or unlawful purposes.</li>
          <li>Attach the tag to a vehicle without appropriate authorization.</li>
        </ul>
        <p>Scan Connect may deactivate a tag or account where misuse, fraud, abuse, or unlawful activity is suspected.</p>
      </>
    ),
  },
  {
    title: '6. Privacy & Number Protection',
    body: (
      <>
        <p>Privacy is a core feature of Scan Connect.</p>
        <p>
          Where the relevant communication functionality is supported, the system may route communications through a
          privacy-protected communication mechanism so that users do not directly receive each other&apos;s personal
          phone numbers.
        </p>
        <p>However, no technology can guarantee absolute security under every circumstance.</p>
        <p>
          You acknowledge that communication services may depend on third-party telecommunications, messaging,
          internet, hosting, or technology providers.
        </p>
        <p>
          For information about how we collect, use, store, and protect personal information, please refer to our
          Privacy Policy.
        </p>
      </>
    ),
  },
  {
    title: '7. Calls, SMS & WhatsApp Communication',
    body: (
      <>
        <p>
          Depending on the product and service configuration, Scan Connect may enable communication through calls,
          SMS, WhatsApp, or other supported channels.
        </p>
        <p>Communication availability may be affected by:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Network availability</li>
          <li>Mobile operator restrictions</li>
          <li>Internet connectivity</li>
          <li>Third-party service providers</li>
          <li>Device compatibility</li>
          <li>Regional restrictions</li>
          <li>Service outages</li>
          <li>Incorrect information supplied by the user</li>
        </ul>
        <p>Scan Connect does not guarantee uninterrupted communication at all times.</p>
        <p>
          Users must not use the communication system for spam, harassment, threats, solicitation, fraud, or any
          unlawful activity.
        </p>
      </>
    ),
  },
  {
    title: '8. SOS & Emergency Features',
    body: (
      <>
        <p>
          Where available, the SOS feature is intended to provide quick access to configured emergency contacts or
          supported emergency services.
        </p>
        <p className="font-bold text-[#1B1C1C]">
          Scan Connect is not an emergency response agency, ambulance provider, police service, hospital, fire
          department, or roadside rescue organization unless expressly stated otherwise.
        </p>
        <p>SOS functionality may depend on:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Mobile network availability</li>
          <li>GPS/location availability</li>
          <li>Device permissions</li>
          <li>Internet connectivity</li>
          <li>Third-party service availability</li>
          <li>Correct configuration by the user</li>
        </ul>
        <p>In a genuine emergency, users should contact the appropriate local emergency authority directly.</p>
        <p>Scan Connect does not guarantee emergency response time, availability, arrival, or outcome.</p>
      </>
    ),
  },
  {
    title: '9. Product Information & Pricing',
    body: (
      <>
        <p>
          We make reasonable efforts to ensure that product descriptions, images, specifications, prices, and
          availability displayed on our website are accurate.
        </p>
        <p>However, minor variations in product appearance, packaging, color, or design may occur.</p>
        <p>Prices may be changed at any time without prior notice.</p>
        <p>
          Applicable taxes, delivery charges, promotional discounts, and other charges will be displayed during
          checkout where applicable.
        </p>
      </>
    ),
  },
  {
    title: '10. Orders & Payments',
    body: (
      <>
        <p>An order is considered successfully placed only after payment authorization and order confirmation.</p>
        <p>We reserve the right to cancel or refuse an order in circumstances including:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Product unavailability</li>
          <li>Incorrect pricing or product information</li>
          <li>Suspected fraud</li>
          <li>Duplicate or suspicious orders</li>
          <li>Payment failure</li>
          <li>Incorrect shipping information</li>
          <li>Other legitimate operational reasons</li>
        </ul>
        <p>
          If an order is cancelled after payment has been successfully received, the applicable refund will be
          processed according to our Refund &amp; Returns Policy.
        </p>
      </>
    ),
  },
  {
    title: '11. Intellectual Property',
    body: (
      <>
        <p>All content available through Scan Connect, including:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Logos</li>
          <li>Trademarks</li>
          <li>Product designs</li>
          <li>Website design</li>
          <li>Text</li>
          <li>Graphics</li>
          <li>Images</li>
          <li>Videos</li>
          <li>Software</li>
          <li>UI/UX</li>
          <li>Illustrations</li>
          <li>Documentation</li>
        </ul>
        <p>is owned by or licensed to Creative Frame Works Pvt Ltd unless otherwise stated.</p>
        <p>
          You may not reproduce, modify, distribute, sell, copy, reverse engineer, or commercially exploit our
          intellectual property without prior written permission.
        </p>
      </>
    ),
  },
  {
    title: '12. Prohibited Activities',
    body: (
      <>
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use Scan Connect for unlawful purposes.</li>
          <li>Attempt to access another user&apos;s account.</li>
          <li>Circumvent security mechanisms.</li>
          <li>Interfere with our servers or infrastructure.</li>
          <li>Reverse engineer the Service.</li>
          <li>Introduce malicious code.</li>
          <li>Use automated systems to abuse the Service.</li>
          <li>Harass or threaten vehicle owners or scanners.</li>
          <li>Use the platform for spam or fraudulent communication.</li>
          <li>Attempt to obtain personal information belonging to another user.</li>
        </ul>
        <p>Violation of these Terms may result in suspension or termination of access.</p>
      </>
    ),
  },
  {
    title: '13. Third-Party Services',
    body: (
      <>
        <p>
          Scan Connect may integrate with third-party services, including telecommunications, payment, mapping,
          messaging, hosting, analytics, and other technology providers.
        </p>
        <p>
          We are not responsible for interruptions, errors, policies, or failures originating solely from such
          third-party services.
        </p>
        <p>Your use of third-party services may also be subject to their respective terms and policies.</p>
      </>
    ),
  },
  {
    title: '14. Service Availability',
    body: (
      <>
        <p>We aim to maintain reliable Services but do not guarantee uninterrupted or error-free operation.</p>
        <p>Services may temporarily become unavailable because of:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Maintenance</li>
          <li>Technical issues</li>
          <li>Network failures</li>
          <li>Server problems</li>
          <li>Cybersecurity incidents</li>
          <li>Third-party service outages</li>
          <li>Force majeure events</li>
          <li>Government or regulatory restrictions</li>
        </ul>
        <p>We may modify, suspend, or discontinue features when reasonably necessary.</p>
      </>
    ),
  },
  {
    title: '15. Limitation of Liability',
    body: (
      <>
        <p>
          To the maximum extent permitted by applicable law, Scan Connect and Creative Frame Works Pvt Ltd shall not
          be liable for indirect, incidental, special, consequential, or punitive losses arising from the use or
          inability to use the Services.
        </p>
        <p>This includes, where legally permitted:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Loss of profits</li>
          <li>Loss of business</li>
          <li>Loss of data</li>
          <li>Loss caused by communication failure</li>
          <li>Delays caused by third-party providers</li>
          <li>Vehicle damage or loss</li>
          <li>Consequences of misuse of the Service</li>
        </ul>
        <p>Nothing in these Terms excludes liability that cannot legally be excluded under applicable law.</p>
      </>
    ),
  },
  {
    title: '16. Indemnification',
    body: (
      <>
        <p>
          You agree to indemnify and hold harmless Creative Frame Works Pvt Ltd, its employees, directors, officers,
          partners, contractors, and service providers against claims, losses, damages, liabilities, and expenses
          arising from:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Your violation of these Terms.</li>
          <li>Your unlawful use of the Services.</li>
          <li>Your misuse of the QR tag.</li>
          <li>Information or content submitted by you.</li>
          <li>Your violation of another person&apos;s rights.</li>
        </ul>
      </>
    ),
  },
  {
    title: '17. Termination',
    body: (
      <>
        <p>We may suspend or terminate access to the Services where we reasonably believe that:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>These Terms have been violated.</li>
          <li>The account is being used fraudulently.</li>
          <li>The Services are being used unlawfully.</li>
          <li>The account poses a security risk.</li>
          <li>Continued access may harm other users or our platform.</li>
        </ul>
        <p>Termination does not automatically eliminate obligations that arose before termination.</p>
      </>
    ),
  },
  {
    title: '18. Changes to These Terms',
    body: (
      <>
        <p>We may update these Terms from time to time.</p>
        <p>The updated version will be published on this page with a revised &ldquo;Last Updated&rdquo; date.</p>
        <p>
          Your continued use of the Services after an update constitutes acceptance of the revised Terms, subject to
          applicable law.
        </p>
      </>
    ),
  },
  {
    title: '19. Governing Law & Jurisdiction',
    body: (
      <>
        <p>These Terms shall be governed by the laws applicable in India.</p>
        <p>
          Subject to applicable law, disputes arising from these Terms or the Services shall be subject to the
          jurisdiction of the competent courts having jurisdiction over the Company&apos;s registered office.
        </p>
      </>
    ),
  },
  {
    title: '20. Contact Us',
    body: (
      <>
        <p>For questions regarding these Terms, please contact:</p>
        <p className="font-bold text-[#1B1C1C]">Creative Frame Works Pvt Ltd / Scan Connect</p>
        <p>
          Email:{' '}
          <a href="mailto:support@scanconnect.com" className="text-[#F2BA03] font-semibold hover:underline">
            support@scanconnect.com
          </a>
        </p>
        <p>
          Phone:{' '}
          <a href="tel:08047359856" className="text-[#F2BA03] font-semibold hover:underline">
            080-473-59856
          </a>
        </p>
      </>
    ),
  },
];

export const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F0F0F] font-sans antialiased">
      <DashboardHeader
        userData={{ fullName: '', mobileNumber: '', email: '' }}
        onLogout={() => {}}
        activeNav="Terms & Conditions"
        isLoggedIn={false}
        onNavClick={(nav) => {
          const path = nav === 'How it works' ? '/' : nav === 'QR Scan' ? '/qr-scan' : `/${nav.toLowerCase()}`;
          window.location.href = path;
        }}
      />

      <main className="flex-1">
        <div className="py-14 sm:py-20 bg-neutral-50/60 border-b border-neutral-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F0F0F] tracking-tight">Terms &amp; Conditions</h1>
            <p className="text-[#5D5F5F] text-sm font-semibold uppercase tracking-wider">Last Updated: August 2026</p>
            <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed">
              Welcome to Scan Connect, operated by Creative Frame Works Pvt Ltd. These Terms govern your access to
              and use of the Scan Connect website, mobile application, QR contact tags, products, communication
              services, and related services. By accessing our website, purchasing a product, activating a Scan
              Connect tag, or using our Services, you agree to be bound by these Terms.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3 pb-8 border-b border-neutral-100 last:border-b-0">
              <h2 className="text-xl sm:text-2xl font-black text-[#0F0F0F] tracking-tight">{section.title}</h2>
              <div className="text-[#5D5F5F] text-base leading-relaxed space-y-3">{section.body}</div>
            </div>
          ))}

          <p className="font-bold text-[#1B1C1C] text-base pt-2">
            By using Scan Connect, you acknowledge that you have read, understood, and agreed to these Terms &amp;
            Conditions.
          </p>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};
