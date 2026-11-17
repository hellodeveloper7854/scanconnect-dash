import howItWorksBanner from '../assets/images/howitworksbanner.png';
import howItWorksBannerMobile from '../assets/images/howitworksbannermobile.png';
import scanBanner from '../assets/images/scanbanner.png';
import shopBanner from '../assets/images/shopbanner.png';
import aboutBanner from '../assets/images/aboutbanner.png';
import sosEmergencyImg from '../assets/images/sosemmergencyimg.png';
import videoWalkImg from '../assets/images/howitworks/videowalkimg.png';
import tutorialVideoPreviewImg from '../assets/images/howitworks/tutorialvideopreview.png';
import videoWalkImg2 from '../assets/images/howitworks/videowalkimg2.png';
import videoWalkImg3 from '../assets/images/howitworks/videowalkimg3.png';
import scanBanner1 from '../assets/images/scanbanner1.png';
import scanBanner2 from '../assets/images/scanbanner2.png';

/**
 * Every piece of text and every image on the main website pages that the admin
 * dashboard can change, with the value the website ships with. The website
 * renders these defaults first and swaps in whatever an admin saved (see
 * useSiteContent), so an empty database shows the original pages.
 *
 * Keys are stored in the SiteContent table as (page, key). Use lowercase
 * letters, digits, ".", "-" and "_" only (the server enforces this).
 */

export type FieldType = 'text' | 'longtext' | 'url' | 'image';

export interface ImageSpec {
  /** Recommended upload size in pixels. */
  width: number;
  height: number;
  /** Where on the page it appears / how it is cropped. */
  note: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  /** What the website shows when nothing is saved: the text, or the bundled image URL. */
  default: string;
  hint?: string;
  maxLength?: number;
  image?: ImageSpec;
}

export interface SectionDef {
  id: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}

export interface PageDef {
  id: string;
  label: string;
  /** Website path, for the "View page" link. */
  path: string;
  description: string;
  sections: SectionDef[];
}

export const MAX_IMAGE_MB = 2;
export const HIGHLIGHT_HINT = 'Wrap words in **double asterisks** to show them highlighted in yellow.';

const text = (key: string, label: string, def: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  key, label, type: 'text', default: def, maxLength: 200, ...extra,
});
const longtext = (key: string, label: string, def: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  key, label, type: 'longtext', default: def, maxLength: 1200, ...extra,
});
const url = (key: string, label: string, def: string, extra: Partial<FieldDef> = {}): FieldDef => ({
  key, label, type: 'url', default: def, maxLength: 500, ...extra,
});
const image = (key: string, label: string, def: string, spec: ImageSpec, extra: Partial<FieldDef> = {}): FieldDef => ({
  key, label, type: 'image', default: def, image: spec, ...extra,
});

/** Repeated "title + description" cards, numbered 1..n. */
const cards = (prefix: string, noun: string, items: Array<[string, string]>): FieldDef[] =>
  items.flatMap(([title, desc], i) => [
    text(`${prefix}.${i + 1}.title`, `${noun} ${i + 1} — title`, title),
    longtext(`${prefix}.${i + 1}.desc`, `${noun} ${i + 1} — description`, desc),
  ]);

/** Repeated single-line items, numbered 1..n. */
const lines = (prefix: string, noun: string, items: string[]): FieldDef[] =>
  items.map((v, i) => text(`${prefix}.${i + 1}`, `${noun} ${i + 1}`, v));

// ------------------------------------------------------------------ pages

const HOW_IT_WORKS: PageDef = {
  id: 'how-it-works',
  label: 'How it works',
  path: '/',
  description: 'The whole home page, top to bottom: banner, how it works, videos, benefits, industries, services, SOS, app download, guides heading, company and closing sections.',
  sections: [
    {
      id: 'hero',
      title: 'Top banner',
      fields: [
        image('hero.image', 'Banner image (desktop)', howItWorksBanner, {
          width: 1600, height: 690,
          note: 'Wide image behind the heading on laptops and desktops. Keep the car/subject on the right; the left side is covered by the heading.',
        }),
        image('hero.image_mobile', 'Banner image (mobile)', howItWorksBannerMobile, {
          width: 800, height: 1140,
          note: 'Tall image behind the heading on phones.',
        }),
        text('hero.title_1', 'Heading — first line', 'Protect Your Privacy.'),
        text('hero.title_2', 'Heading — highlighted line', 'Stay Reachable.', { hint: 'Shown in yellow under the first line.' }),
        text('hero.subtitle', 'Sub-heading', 'The Smart QR Tag for Every Vehicle.'),
        longtext('hero.body', 'Paragraph',
          'Whether it’s a blocked driveway, headlights left on, or an **accidental emergency**, anyone can contact you or your **family members** instantly—without ever seeing your phone number.',
          { hint: HIGHLIGHT_HINT }),
        text('hero.tagline', 'Tag line', 'Privacy-First • Instant Contact • No App Required • Lifetime Access • No Monthly Subscription'),
        text('hero.cta_primary', 'Main button — text', 'Buy Now'),
        text('hero.cta_secondary', 'Second button — text', 'How It Works'),
      ],
    },
    {
      id: 'why',
      title: '“Privacy Meets Convenience” section',
      fields: [
        text('why.badge', 'Small label', 'WHY CHOOSE SCAN CONNECT?'),
        text('why.title', 'Heading', 'Privacy Meets Convenience'),
        longtext('why.p1', 'Paragraph 1', 'Traditional parking contact stickers expose your personal phone number to everyone. Scan Connect changes that.'),
        longtext('why.p2', 'Paragraph 2', 'Your vehicle becomes instantly reachable while your identity stays protected through our secure communication platform.'),
        text('why.scenarios_label', 'Situations list — lead-in', 'Whether it\'s:'),
        text('why.scenario.1', 'Situation 1', 'Someone blocking your vehicle'),
        text('why.scenario.2', 'Situation 2', 'Headlights left ON'),
        text('why.scenario.3', 'Situation 3', 'Windows left open'),
        text('why.scenario.4', 'Situation 4', 'A parking emergency'),
        text('why.scenario.5', 'Situation 5', 'An accident or damage'),
        text('why.scenario.6', 'Situation 6', 'A security concern'),
        text('why.footer', 'Situations list — closing line', 'People can reach you instantly without compromising your privacy.'),
        image('why.image', 'Walkthrough picture', videoWalkImg, { width: 1200, height: 675, note: 'Picture beside the “Privacy Meets Convenience” text; clicking it plays the walkthrough video. Shown wide (16:9) with rounded corners.' }),
      ],
    },
    {
      id: 'steps',
      title: 'How it works — 3 steps',
      fields: [
        text('steps.badge', 'Small label', 'HOW IT WORKS'),
        text('steps.title', 'Heading', 'Simple. Secure. Instant.'),
        ...cards('steps', 'Step', [
          ['Activate Your Tag', 'Attach the premium waterproof QR tag to your car or bike and activate it once by linking your mobile number securely.'],
          ['Anyone Scans & Connects', 'Using any smartphone camera—no app, no registration—they simply scan and choose to Call or WhatsApp you instantly.'],
          ['Your Privacy Stays Protected, Anywhere', 'Neither party ever sees the other’s number. Stay reachable at airports, malls, offices, or the roadside—anywhere in India.'],
        ]),
      ],
    },
    {
      id: 'video',
      title: 'Video section',
      fields: [
        text('video.badge', 'Small label', 'VIDEO SECTION'),
        text('video.title', 'Heading', 'See Scan Connect in Action'),
        longtext('video.body', 'Paragraph', 'Watch our quick walkthroughs and discover how Scan Connect helps people reach you without revealing your phone number.'),
        longtext('video.1.caption', 'Video 1 — caption shown in the player', 'Walkthrough Video Playing: Activate your QR tag, receive secure calls, protect your privacy, and handle parking emergencies'),
        text('video.1.desc', 'Video 1 — description', 'A quick 90-second walkthrough of activating your tag and staying reachable.'),
        text('video.1.duration', 'Video 1 — length (e.g. 1:30)', '1:30'),
        text('video.1.title', 'Video 1 — title', 'Scan Connect Video Walkthrough'),
        text('video.2.caption', 'Video 2 — caption shown in the player', 'Installation Video Playing: Peel, stick, and activate your Scan Connect QR tag in under two minutes'),
        text('video.2.desc', 'Video 2 — description', 'Step-by-step guide to placing and activating your Scan Connect tag.'),
        text('video.2.duration', 'Video 2 — length (e.g. 1:30)', '1:10'),
        text('video.2.title', 'Video 2 — title', 'How to Install Your QR Tag'),
        longtext('video.3.caption', 'Video 3 — caption shown in the player', 'SOS Demo Playing: One tap connects a scanner to your emergency family contact and nearby help services'),
        text('video.3.desc', 'Video 3 — description', 'See how family and emergency family contacts are reached in a single tap.'),
        text('video.3.duration', 'Video 3 — length (e.g. 1:30)', '0:55'),
        text('video.3.title', 'Video 3 — title', 'SOS & Emergency Family Contact Demo'),
        text('video.4.caption', 'Video 4 — caption shown in the player', 'Privacy Demo Playing: Masked calling routes every conversation without exposing either phone number'),
        text('video.4.desc', 'Video 4 — description', 'A look at the masked-call technology that keeps both sides anonymous.'),
        text('video.4.duration', 'Video 4 — length (e.g. 1:30)', '1:05'),
        text('video.4.title', 'Video 4 — title', 'How Your Number Stays Private'),
        longtext('video.5.caption', 'Video 5 — caption shown in the player', 'Industries Demo Playing: Municipal corporations, malls, airports, and campuses using Scan Connect tags'),
        text('video.5.desc', 'Video 5 — description', 'From malls to airports, see where Scan Connect tags are used every day.'),
        text('video.5.duration', 'Video 5 — length (e.g. 1:30)', '1:20'),
        text('video.5.title', 'Video 5 — title', 'Scan Connect Across India'),
        text('video.6.caption', 'Video 6 — caption shown in the player', 'Testimonial Playing: Vehicle owners describe how Scan Connect resolved real parking situations'),
        text('video.6.desc', 'Video 6 — description', 'Vehicle owners share how Scan Connect helped in real parking emergencies.'),
        text('video.6.duration', 'Video 6 — length (e.g. 1:30)', '1:40'),
        text('video.6.title', 'Video 6 — title', 'Real Owners, Real Stories'),
        image('video.1.thumb', 'Video 1 — thumbnail', tutorialVideoPreviewImg, { width: 1280, height: 720, note: 'Cover picture of the video card, shown 16:9 and cropped to fit.' }),
        image('video.2.thumb', 'Video 2 — thumbnail', videoWalkImg2, { width: 1280, height: 720, note: 'Cover picture of the video card, shown 16:9 and cropped to fit.' }),
        image('video.3.thumb', 'Video 3 — thumbnail', videoWalkImg3, { width: 1280, height: 720, note: 'Cover picture of the video card, shown 16:9 and cropped to fit.' }),
        image('video.4.thumb', 'Video 4 — thumbnail', scanBanner, { width: 1280, height: 720, note: 'Cover picture of the video card, shown 16:9 and cropped to fit.' }),
        image('video.5.thumb', 'Video 5 — thumbnail', scanBanner1, { width: 1280, height: 720, note: 'Cover picture of the video card, shown 16:9 and cropped to fit.' }),
        image('video.6.thumb', 'Video 6 — thumbnail', scanBanner2, { width: 1280, height: 720, note: 'Cover picture of the video card, shown 16:9 and cropped to fit.' }),
      ],
    },
    {
      id: 'customer',
      title: 'Customer benefits',
      fields: [
        text('customer.badge', 'Small label', 'CUSTOMER BENEFITS'),
        text('customer.title', 'Heading', 'More Than Just a QR Sticker'),
        text('customer.1', 'Benefit 1', 'Protect your personal phone number'),
        text('customer.2', 'Benefit 2', 'Avoid unnecessary spam calls'),
        text('customer.3', 'Benefit 3', 'Receive genuine parking-related alerts'),
        text('customer.4', 'Benefit 4', 'Easy installation in under one minute'),
        text('customer.5', 'Benefit 5', 'Weatherproof premium quality'),
        text('customer.6', 'Benefit 6', 'Works with any smartphone'),
        text('customer.7', 'Benefit 7', 'No battery required'),
        text('customer.8', 'Benefit 8', 'Lifetime usability'),
        text('customer.9', 'Benefit 9', 'Made for Indian roads and conditions'),
      ],
    },
    {
      id: 'industries',
      title: 'Industries we serve',
      fields: [
        text('industries.badge', 'Small label', 'INDUSTRIES WE SERVE'),
        text('industries.title', 'Heading', 'Smart Mobility Solutions for Every Parking Ecosystem'),
        text('industries.benefits_label', 'Label above each benefit list', 'Benefits'),
        longtext('industries.1.desc', 'Industry 1 — description', 'Digitize urban parking with intelligent vehicle identification, real-time communication, and efficient parking management designed for high-density cities.'),
        text('industries.1.title', 'Industry 1 — title', 'Municipal Corporations'),
        text('industries.1.benefit.1', 'Industry 1 — benefit 1', 'Smart Parking Management'),
        text('industries.1.benefit.2', 'Industry 1 — benefit 2', 'Digital Vehicle Communication'),
        text('industries.1.benefit.3', 'Industry 1 — benefit 3', 'Reduced Traffic Congestion'),
        text('industries.1.benefit.4', 'Industry 1 — benefit 4', 'Better Citizen Experience'),
        longtext('industries.2.desc', 'Industry 2 — description', 'Improve customer satisfaction with seamless parking communication while gaining valuable operational insights to enhance retail experiences.'),
        text('industries.2.title', 'Industry 2 — title', 'Shopping Centres & Retail'),
        text('industries.2.benefit.1', 'Industry 2 — benefit 1', 'Better Customer Convenience'),
        text('industries.2.benefit.2', 'Industry 2 — benefit 2', 'Improved Parking Flow'),
        text('industries.2.benefit.3', 'Industry 2 — benefit 3', 'Increased Visitor Satisfaction'),
        text('industries.2.benefit.4', 'Industry 2 — benefit 4', 'Enhanced Merchant Experience'),
        longtext('industries.3.desc', 'Industry 3 — description', 'Transform airport parking through digital vehicle communication, faster customer assistance, and intelligent parking operations.'),
        text('industries.3.title', 'Industry 3 — title', 'Airports'),
        text('industries.3.benefit.1', 'Industry 3 — benefit 1', 'Efficient Parking Management'),
        text('industries.3.benefit.2', 'Industry 3 — benefit 2', 'Improved Traveler Experience'),
        text('industries.3.benefit.3', 'Industry 3 — benefit 3', 'Real-Time Communication'),
        text('industries.3.benefit.4', 'Industry 3 — benefit 4', 'Smart Digital Infrastructure'),
        longtext('industries.4.desc', 'Industry 4 — description', 'Offer shoppers a hassle-free parking experience with quick owner notifications and improved vehicle safety.'),
        text('industries.4.title', 'Industry 4 — title', 'Supermarkets'),
        text('industries.4.benefit.1', 'Industry 4 — benefit 1', 'Faster Customer Assistance'),
        text('industries.4.benefit.2', 'Industry 4 — benefit 2', 'Safer Parking Areas'),
        text('industries.4.benefit.3', 'Industry 4 — benefit 3', 'Convenient Shopping Experience'),
        text('industries.4.benefit.4', 'Industry 4 — benefit 4', 'Better Parking Utilization'),
        longtext('industries.5.desc', 'Industry 5 — description', 'Simplify commuter parking with secure vehicle identification, monthly pass integration, and seamless communication.'),
        text('industries.5.title', 'Industry 5 — title', 'Railway Stations'),
        text('industries.5.benefit.1', 'Industry 5 — benefit 1', 'Daily Commuter Convenience'),
        text('industries.5.benefit.2', 'Industry 5 — benefit 2', 'Digital Permit Management'),
        text('industries.5.benefit.3', 'Industry 5 — benefit 3', 'Smart Parking Solutions'),
        text('industries.5.benefit.4', 'Industry 5 — benefit 4', 'Efficient Operations'),
        text('industries.6.desc', 'Industry 6 — description', 'Create safer campuses with intelligent vehicle management for students, faculty, and visitors.'),
        text('industries.6.title', 'Industry 6 — title', 'Universities & Educational Campuses'),
        text('industries.6.benefit.1', 'Industry 6 — benefit 1', 'Campus Parking Management'),
        text('industries.6.benefit.2', 'Industry 6 — benefit 2', 'Student & Staff Convenience'),
        text('industries.6.benefit.3', 'Industry 6 — benefit 3', 'Visitor Vehicle Communication'),
        text('industries.6.benefit.4', 'Industry 6 — benefit 4', 'Data & Analytics Dashboard'),
      ],
    },
    {
      id: 'services',
      title: 'Smart vehicle services',
      fields: [
        text('services.badge', 'Small label', 'SMART VEHICLE SERVICES'),
        text('services.title', 'Heading', 'Everything Your Vehicle Needs in One Place'),
        text('services.body', 'Paragraph', 'Access useful automotive services directly from the Scan Connect ecosystem.'),
        text('services.1.desc', 'Service 1 — description', 'Find the nearest petrol and diesel fuel stations near your vehicle location.'),
        text('services.1.title', 'Service 1 — title', 'Nearby Fuel Stations'),
        text('services.2.desc', 'Service 2 — description', 'Instant contact numbers & directions for nearest traffic and city police stations.'),
        text('services.2.title', 'Service 2 — title', 'Police Assistance'),
        text('services.3.desc', 'Service 3 — description', 'Emergency trauma centers & ambulance contacts available 24/7.'),
        text('services.3.title', 'Service 3 — title', 'Hospitals & Emergency Care'),
        text('services.4.desc', 'Service 4 — description', '24x7 roadside tyre repair, puncture fix & battery jumpstart services.'),
        text('services.4.title', 'Service 4 — title', 'Tyre & Puncture Repair'),
        text('services.5.desc', 'Service 5 — description', 'Instant FASTag balance check & toll recharge via UPI/Netbanking.'),
        text('services.5.title', 'Service 5 — title', 'FASTag Recharge'),
        text('services.6.desc', 'Service 6 — description', 'Check pending traffic fines & pay challans online instantly by VIN.'),
        text('services.6.title', 'Service 6 — title', 'Traffic Challan Check'),
        text('services.7.desc', 'Service 7 — description', 'Verify RTO RC status, insurance expiry & vehicle ownership details.'),
        text('services.7.title', 'Service 7 — title', 'Vehicle Information'),
        text('services.8.desc', 'Service 8 — description', 'Check DL validity, endorsement records & renewal timelines.'),
        text('services.8.title', 'Service 8 — title', 'Driving Licence Verification'),
      ],
    },
    {
      id: 'sos',
      title: 'SOS emergency assistance',
      fields: [
        text('sos.badge', 'Small label', 'SOS EMERGENCY ASSISTANCE'),
        text('sos.title', 'Heading', 'Help is Just **One Tap** Away', { hint: HIGHLIGHT_HINT }),
        longtext('sos.body', 'Paragraph', 'In an emergency, every second matters. The SOS button in the Scan Connect app gives you instant access to critical emergency services and your trusted contacts—without wasting time searching for phone numbers.'),
        text('sos.point.1.label', 'Highlight 1 — text', 'Notify Family & Friends'),
        text('sos.point.2.label', 'Highlight 2 — text', 'Available 24×7'),
        text('sos.point.3.label', 'Highlight 3 — text', 'Designed for Roadside Emergencies'),
        text('sos.point.4.label', 'Highlight 4 — text', 'Works Across India'),
        image('sos.image', 'Emergency picture', sosEmergencyImg, { width: 1200, height: 900, note: 'Large picture beside the heading, shown about 4:3 with rounded corners.' }),
        text('sos.live', 'Red badge on the picture', 'Live SOS'),
        text('sos.caption', 'Caption on the picture', '24×7 Emergency Response, Anywhere in India'),
        text('sos.safe_title', 'Lower box — heading', 'Stay Safe Wherever You Go'),
        longtext('sos.safe_body', 'Lower box — paragraph', 'Whether you\'re driving through a busy city, travelling on highways, or parking in unfamiliar locations, the Scan Connect SOS feature ensures that help is always just a tap away.'),
        text('sos.safe_tagline', 'Lower box — tag line', 'Your Safety. Your Family\'s Peace of Mind. Always Connected.'),
      ],
    },
    {
      id: 'quick',
      title: 'Quick emergency access',
      fields: [
        text('quick.badge', 'Small label', 'QUICK EMERGENCY ACCESS'),
        text('quick.title', 'Heading', 'Emergency Help When Every Second Counts'),
        text('quick.body', 'Paragraph', 'Access important emergency services directly from the Scan Connect platform.'),
        text('quick.label', 'List label', 'Quick access to:'),
        text('quick.only_here', 'Badge on the first item', 'Only Here'),
        text('quick.1.label', 'Item 1 — text', 'Emergency Family Contact'),
        text('quick.2.label', 'Item 2 — text', 'Ambulance'),
        text('quick.3.label', 'Item 3 — text', 'Police'),
        text('quick.4.label', 'Item 4 — text', 'Fire Department'),
        text('quick.5.label', 'Item 5 — text', 'Hospitals'),
        text('quick.6.label', 'Item 6 — text', 'Roadside Assistance'),
        text('quick.closing', 'Closing line', 'Because emergencies shouldn\'t wait.'),
      ],
    },
    {
      id: 'trust',
      title: 'Lifetime peace of mind',
      description: 'Items marked as key benefits keep their highlighted style.',
      fields: [
        text('trust.badge', 'Small label', 'TRUSTED BY THOUSANDS OF VEHICLE OWNERS'),
        text('trust.title', 'Heading', 'One Purchase. Lifetime Peace of Mind.'),
        text('trust.1.label', 'Benefit 1 — text', 'Emergency Family Contact'),
        text('trust.2.label', 'Benefit 2 — text', 'Privacy-Protected Communication'),
        text('trust.3.label', 'Benefit 3 — text', 'Premium Waterproof QR Tag'),
        text('trust.4.label', 'Benefit 4 — text', 'No Monthly Subscription'),
        text('trust.5.label', 'Benefit 5 — text', 'Lifetime QR Activation'),
        text('trust.6.label', 'Benefit 6 — text', 'No App Required for Visitors'),
        text('trust.7.label', 'Benefit 7 — text', 'Instant Call'),
        text('trust.8.label', 'Benefit 8 — text', 'Secure Contact Routing'),
        text('trust.9.label', 'Benefit 9 — text', 'Fast Delivery Across India'),
        text('trust.10.label', 'Benefit 10 — text', 'Easy Self Activation'),
        text('trust.11.label', 'Benefit 11 — text', 'Works 24×7'),
      ],
    },
    {
      id: 'app',
      title: 'Download the app',
      fields: [
        text('app.badge', 'Small label', 'DOWNLOAD THE APP'),
        text('app.title', 'Heading', 'Manage Your Vehicle Anytime'),
        longtext('app.body', 'Paragraph', 'Access your Scan Connect dashboard to manage multiple vehicles, update contact details, view scan history, receive instant notifications, access vehicle services, and manage SOS settings.'),
        text('app.note', 'Note', 'Available for Android and iOS.'),
        url('app.ios_link', 'App Store link', 'https://apps.apple.com/search?term=ScanConnect'),
        url('app.android_link', 'Google Play link', 'https://play.google.com/store/search?q=ScanConnect&c=apps'),
        image('app.image', 'Poster picture', videoWalkImg, { width: 900, height: 506, note: 'Poster beside the text, shown about 450px wide; its height follows the picture.' }),
      ],
    },
    {
      id: 'guides',
      title: 'Guides & articles',
      description: 'The articles themselves are the blog posts; only the section wording is edited here.',
      fields: [
        text('guides.title', 'Heading', 'Guides & articles'),
        text('guides.view_more', '“View more” link', 'View more'),
        text('guides.read', '“Read article” link', 'Read article'),
      ],
    },
    {
      id: 'company',
      title: 'About the company',
      fields: [
        text('company.badge', 'Small label', 'ABOUT COMPANY'),
        text('company.title', 'Heading', 'Made in India. Built for Smarter Mobility.'),
        longtext('company.p1', 'Paragraph 1', 'Scan Connect is developed by Creative Frameworks with one mission: to make vehicle communication secure, simple, and privacy-first.'),
        longtext('company.p2', 'Paragraph 2', 'We\'re committed to helping millions of vehicle owners stay connected without compromising personal information.'),
      ],
    },
    {
      id: 'about',
      title: 'About Scan Connect',
      fields: [
        text('about.badge', 'Small label', 'ABOUT SCAN CONNECT'),
        text('about.title', 'Heading', 'The Smarter Way to Connect with Your Parked Vehicle'),
        longtext('about.p1', 'Paragraph 1', 'Your vehicle is often left unattended—in parking lots, offices, shopping malls, railway stations, hospitals, or on the roadside. Unexpected situations can happen anytime.'),
        longtext('about.p2', 'Paragraph 2', 'With Scan Connect, anyone can safely reach you by simply scanning the QR code attached to your vehicle. Your phone number always remains private while you receive instant calls or WhatsApp notifications.'),
        longtext('about.p3', 'Closing lines', 'No complicated setup. No app required for the person scanning.\nJust smart, secure communication whenever it matters.', { hint: 'Press Enter for a new line.' }),
      ],
    },
    {
      id: 'cta',
      title: 'Closing call-to-action',
      fields: [
        text('cta.title', 'Heading', 'Ready to Protect Your Privacy?'),
        longtext('cta.body', 'Paragraph', 'Join thousands of vehicle owners who trust Scan Connect every day. Secure your vehicle with a smart QR contact tag today.'),
        text('cta.button_1', 'Yellow button — text', 'Buy Now'),
        text('cta.button_2', 'Black button — text', 'Learn More'),
      ],
    },
  ],
};

const SHOP: PageDef = {
  id: 'shop',
  label: 'Shop',
  path: '/shop',
  description: 'The store page: all sections and the wording of each product card. Product names, prices, features and sizes are fixed in code because orders and checkout depend on them.',
  sections: [
    {
      id: 'hero',
      title: 'Top section',
      fields: [
        image('hero.image', 'Product image', shopBanner, {
          width: 720, height: 760,
          note: 'Shown as a tilting card on the right of the heading (about 360×380 on screen, near-square portrait). Centre the subject.',
        }),
        text('hero.badge', 'Small label', 'OFFICIAL STORE'),
        text('hero.title', 'Heading', 'Smart Protection for Every Journey'),
        text('hero.subtitle', 'Sub-heading', 'Privacy-First QR Tags for Cars, Bikes & Fleets'),
        longtext('hero.body', 'Paragraph',
          'Protect your personal phone number while staying instantly reachable whenever someone needs to contact you. Whether it’s wrong parking, a vehicle emergency, or a helpful alert, Scan Connect ensures secure communication without revealing your identity.'),
        ...lines('hero.benefit', 'Benefit', [
          'One-Time Purchase • Lifetime Activation',
          'No Monthly Subscription',
          'Free Express Delivery Across India',
          'Made in India',
        ]),
        text('hero.cta', 'Button — text', 'View Products'),
      ],
    },
    {
      id: 'trusted',
      title: '“Trusted across India” strip',
      fields: [
        text('trusted.title', 'Heading', 'Trusted Across India'),
        longtext('trusted.body', 'Paragraph', 'Helping vehicle owners, businesses, and organizations stay connected with secure, privacy-first communication.'),
        text('trusted.1.label', 'Badge 1 — text', 'Free Delivery Across India'),
        text('trusted.2.label', 'Badge 2 — text', 'Privacy Protected'),
        text('trusted.3.label', 'Badge 3 — text', 'Instant Activation'),
        text('trusted.4.label', 'Badge 4 — text', 'Secure Call Routing'),
        text('trusted.5.label', 'Badge 5 — text', 'Made for Indian Roads'),
      ],
    },
    {
      id: 'tag',
      title: '“Smart QR Tag” intro',
      fields: [
        text('tag.badge', 'Small label', 'SCAN CONNECT TAG'),
        text('tag.title', 'Heading', 'The Smart QR Tag That Protects Your Privacy'),
        longtext('tag.body', 'Paragraph',
          'From wrong parking notifications to emergency assistance, Scan Connect lets anyone contact you instantly—without ever revealing your personal phone number.'),
        text('tag.perfect_label', '“Perfect for” label', 'Perfect For'),
        text('tag.perfect.1', 'Tag 1', 'Emergency Family Contact'),
        text('tag.perfect.2', 'Tag 2', 'Wrong Parking Alerts'),
        text('tag.perfect.3', 'Tag 3', 'Vehicle Safety Notifications'),
        text('tag.perfect.4', 'Tag 4', 'Lost Vehicle Assistance'),
        text('tag.perfect.5', 'Tag 5', 'Society & Office Parking'),
        text('tag.perfect.6', 'Tag 6', 'Commercial Fleets'),
      ],
    },
    {
      id: 'catalogue',
      title: 'Product catalogue heading',
      fields: [
        text('catalogue.title', 'Heading', 'Find the Perfect Scan Connect Tag'),
        longtext('catalogue.body', 'Paragraph', 'Premium QR-based contact tags designed for individuals, families, businesses, and commercial fleets.'),
        text('products.1.badge', 'Scan Connect Car Tag (Pack of 2) — badge', 'Best Seller'),
        text('products.1.rating', 'Scan Connect Car Tag (Pack of 2) — rating line', '4.8/5 Customer Rating'),
        longtext('products.1.desc', 'Scan Connect Car Tag (Pack of 2) — description', 'Never worry about missed parking alerts again. Anyone can contact you instantly without seeing your personal phone number.'),
        text('products.1.cta', 'Scan Connect Car Tag (Pack of 2) — button text', 'View Product'),
        text('products.1.ideal', 'Scan Connect Car Tag (Pack of 2) — “ideal for” tags', 'Cars & SUVs, Residential Parking, Office Parking, Shopping Malls, Public Parking', { hint: 'Separate tags with commas.', maxLength: 300 }),
        text('products.2.rating', 'Scan Connect Car Tag (Single Pack) — rating line', '4.8/5 Customer Rating'),
        longtext('products.2.desc', 'Scan Connect Car Tag (Single Pack) — description', 'Never worry about missed parking alerts again. Anyone can contact you instantly without seeing your personal phone number.'),
        text('products.2.cta', 'Scan Connect Car Tag (Single Pack) — button text', 'View Product'),
        text('products.2.ideal', 'Scan Connect Car Tag (Single Pack) — “ideal for” tags', 'Cars & SUVs, Residential Parking, Office Parking, Shopping Malls, Public Parking', { hint: 'Separate tags with commas.', maxLength: 300 }),
        text('products.6.badge', 'Bike + Helmet Tag Combo (2 + 2) — badge', 'Best Value'),
        text('products.6.rating', 'Bike + Helmet Tag Combo (2 + 2) — rating line', '4.8/5 Customer Rating'),
        longtext('products.6.desc', 'Bike + Helmet Tag Combo (2 + 2) — description', '2 Bike Tags and 2 Helmet Tags together — protect two riders and their helmets in one combo pack at a lower price than buying separately.'),
        text('products.6.cta', 'Bike + Helmet Tag Combo (2 + 2) — button text', 'View Product'),
        text('products.6.ideal', 'Bike + Helmet Tag Combo (2 + 2) — “ideal for” tags', 'Two-Wheeler Owners, Riding Duos, Families with Multiple Bikes', { hint: 'Separate tags with commas.', maxLength: 300 }),
        text('products.7.rating', 'Bike + Helmet Tag Combo (1 + 1) — rating line', '4.8/5 Customer Rating'),
        longtext('products.7.desc', 'Bike + Helmet Tag Combo (1 + 1) — description', '1 Bike Tag and 1 Helmet Tag together — cover both your bike and your helmet with a single combo pack.'),
        text('products.7.cta', 'Bike + Helmet Tag Combo (1 + 1) — button text', 'View Product'),
        text('products.7.ideal', 'Bike + Helmet Tag Combo (1 + 1) — “ideal for” tags', 'Two-Wheeler Owners, Daily Commuters', { hint: 'Separate tags with commas.', maxLength: 300 }),
        longtext('products.4.desc', 'Fleet & Commercial Tags — description', 'Designed for logistics companies, delivery fleets, taxis, corporate vehicles, and commercial transportation.'),
        text('products.4.cta', 'Fleet & Commercial Tags — button text', 'Contact Sales'),
        text('products.4.ideal', 'Fleet & Commercial Tags — “ideal for” tags', 'Delivery Vehicles, Taxi Operators, Logistics Companies, Corporate Fleets', { hint: 'Separate tags with commas.', maxLength: 300 }),
        longtext('products.5.desc', 'Home & Society QR Tags — description', 'Enable visitors, security personnel, and neighbors to contact residents securely without exposing private phone numbers.'),
        text('products.5.cta', 'Home & Society QR Tags — button text', 'Contact Us'),
        text('products.5.ideal', 'Home & Society QR Tags — “ideal for” tags', 'Apartments, Villas, Gated Communities, Residential Complexes', { hint: 'Separate tags with commas.', maxLength: 300 }),
        longtext('products.9.desc', 'Bulk Orders — description', 'Ordering for a fleet, dealership, housing society, or business? Get custom pricing and packaging for bulk Scan Connect Tag orders.'),
        text('products.9.cta', 'Bulk Orders — button text', 'Contact Us'),
        text('products.9.ideal', 'Bulk Orders — “ideal for” tags', 'Fleet Operators, Dealerships, Housing Societies, Businesses', { hint: 'Separate tags with commas.', maxLength: 300 }),
      ],
    },
    {
      id: 'box',
      title: '“What’s in the box” heading',
      fields: [
        text('box.badge', 'Small label', "WHAT'S IN THE BOX"),
        text('box.title', 'Heading', 'Everything You Need, Included'),
        longtext('box.body', 'Paragraph', 'No hidden add-ons or renewal fees — every order ships ready to activate.'),
        text('box.1.desc', 'Item 1 — description', 'Waterproof, UV-resistant tag pre-printed with your unique secure QR code.'),
        text('box.1.title', 'Item 1 — title', '1x Premium QR Tag'),
        text('box.2.desc', 'Item 2 — description', 'One-time setup linking the tag to your mobile number — no renewals, ever.'),
        text('box.2.title', 'Item 2 — title', 'Lifetime Activation'),
        text('box.3.desc', 'Item 3 — description', 'Calls & WhatsApp reach you without revealing your real number.'),
        text('box.3.title', 'Item 3 — title', 'Privacy-First Routing'),
        text('box.4.desc', 'Item 4 — description', 'Shipped across India at no extra cost, typically within 3-5 business days.'),
        text('box.4.title', 'Item 4 — title', 'Free Express Delivery'),
        text('box.5.desc', 'Item 5 — description', 'Simple instructions to activate and attach your tag in under a minute.'),
        text('box.5.title', 'Item 5 — title', 'Quick-Start Guide'),
        text('box.6.desc', 'Item 6 — description', 'Dedicated help for setup, replacements, or activation issues.'),
        text('box.6.title', 'Item 6 — title', 'Priority Support Access'),
      ],
    },
    {
      id: 'bulk',
      title: '“Need more than one?” section',
      fields: [
        text('bulk.title', 'Heading', 'Need More Than One?'),
        longtext('bulk.body', 'Paragraph',
          'Whether you’re an individual, business, apartment association, dealership, or fleet operator, we offer bulk orders, reseller programs, franchise opportunities, and enterprise solutions tailored to your needs.'),
      ],
    },
  ],
};

const ABOUT: PageDef = {
  id: 'about',
  label: 'About',
  path: '/about',
  description: 'The About page: mission banner, what we stand for, and custom solutions.',
  sections: [
    {
      id: 'hero',
      title: 'Mission banner',
      fields: [
        text('hero.badge', 'Small label', 'OUR MISSION'),
        text('hero.title', 'Heading', 'Privacy shouldn’t cost you a phone call.'),
        longtext('hero.body', 'Paragraph',
          'Scan Connect started with a simple frustration: leaving your phone number on your dashboard meant spam calls, harassment, and zero privacy. We built a smart QR tag that lets anyone reach you instantly — without ever seeing your actual phone number.'),
        text('hero.cta_primary', 'Yellow button — text', 'GET YOUR TAG'),
        text('hero.cta_secondary', 'Black button — text', 'HOW IT WORKS'),
        image('hero.image', 'Banner image', aboutBanner, {
          width: 1600, height: 600,
          note: 'Full-width picture under the story, shown about 1100×460 (wide, rounded corners). It is cropped to fit, so keep the subject in the middle.',
        }),
      ],
    },
    {
      id: 'values',
      title: '“What we stand for” cards',
      description: 'Cards alternate dark and light automatically.',
      fields: [
        text('values.title', 'Heading', 'What We Stand For'),
        longtext('values.body', 'Paragraph', 'Building reliable, human-centric security products that empower everyday vehicle owners.'),
        ...cards('values', 'Card', [
          ['Emergency Family Contact', 'In an accident or emergency, first responders or bystanders can instantly reach your family through the tag — without needing your phone or unlocking it.'],
          ['Privacy by Default', 'Your phone number is never shared or stored in plaintext. Everything we design ensures absolute privacy, keeping unwanted calls and scams at zero.'],
          ['Instant & Frictionless', 'No app downloads required for scanners. Anyone with a smartphone camera can scan the tag and alert you instantly.'],
          ['Made in India', 'Designed, manufactured, and supported locally by Creative Frameworks for fast-growing Indian cities.'],
          ['Built to Last', 'Weatherproof, UV-resistant tags. No batteries, no maintenance — just a tag that keeps working for years.'],
          ['Always-On Support', 'Our helpdesk and SOS response systems are available 24×7, never more than a call or message away.'],
          ['Honest, Transparent Pricing', 'One-time purchase, lifetime activation, no hidden subscriptions or renewal fees — ever.'],
        ]),
      ],
    },
    {
      id: 'solutions',
      title: 'Custom solutions',
      fields: [
        text('solutions.title', 'Heading', 'Custom Solutions'),
        longtext('solutions.body', 'Paragraph', 'Tailored vehicle tagging and access management for organizations and commercial hubs.'),
        ...cards('solutions', 'Solution', [
          ['Housing Societies', 'Streamline resident vehicle entry, resolve blocked parking disputes instantly, and maintain verified resident logs without public numbers.'],
          ['Garages & Workshops', 'Boost repeat service requests with co-branded vehicle tags that keep your service helpline accessible on every customer vehicle.'],
          ['Commercial Parking Hubs', 'Manage valet queues and parking lot overflow with real-time driver notifications, instant emergency moves, and automated logs.'],
        ]),
        text('solutions.2.cta', 'Solution 2 — link text', 'PARTNER NOW'),
        url('solutions.2.link', 'Solution 2 — link', 'mailto:sales@scanconnect.co.in?subject=Garage%20Co-branding%20Inquiry', { hint: 'https://…, mailto:… or a page like /contact' }),
        text('solutions.3.cta', 'Solution 3 — link text', 'VIEW DEMO'),
        url('solutions.3.link', 'Solution 3 — link', 'mailto:sales@scanconnect.co.in?subject=Parking%20Hubs%20Demo%20Request', { hint: 'https://…, mailto:… or a page like /contact' }),
      ],
    },
  ],
};

const QR_SCAN: PageDef = {
  id: 'qr-scan',
  label: 'QR Scan',
  path: '/qr-scan',
  description: 'The QR Scan page: banner, three steps, trust points, use cases and closing call-to-action.',
  sections: [
    {
      id: 'hero',
      title: 'Top banner',
      fields: [
        text('hero.badge', 'Small label', 'PRIVACY GUARANTEED'),
        text('hero.title', 'Heading', 'Instantly Connect with Vehicle Owners. Completely Private.'),
        longtext('hero.body', 'Paragraph',
          'Need to notify a vehicle owner about wrong parking, headlights left on, an accident, or any emergency? Simply scan the Scan Connect QR Tag and reach them instantly—without revealing your phone number or accessing theirs.'),
        text('hero.tagline', 'Tag line', 'Fast • Secure • Privacy-First • No App Required'),
        text('hero.cta_scan', 'Phone-only scan button — text', 'Scan a QR Tag'),
        text('hero.cta_buy', 'Buy button — text', 'Buy Your Scan Connect Tag'),
        image('hero.image', 'Banner image', scanBanner, {
          width: 1020, height: 766,
          note: 'Card on the right of the heading, shown about 510×383 (landscape, rounded corners). Cropped to fit.',
        }),
      ],
    },
    {
      id: 'intro',
      title: '“How Scan Connect works” heading',
      fields: [
        text('intro.title', 'Heading', 'How Scan Connect Works'),
        text('intro.subtitle', 'Sub-heading', 'Three Simple Steps. One Secure Connection.'),
        longtext('intro.body', 'Paragraph',
          'Scan Connect creates a secure digital bridge between people and vehicles, enabling instant communication while keeping personal information completely private.'),
      ],
    },
    {
      id: 'steps',
      title: 'Three steps',
      fields: cards('steps', 'Step', [
        ['Step 1 — Scan the QR Tag', 'Use your smartphone camera to scan the Scan Connect QR Tag displayed on the vehicle. No app downloads, registrations, or complicated setup required.'],
        ['Step 2 — Choose How to Contact', 'Once the QR page opens, select your preferred way to reach the vehicle owner.'],
        ['Step 3 — Privacy Protected', 'Scan Connect securely routes every call and message through its privacy network. The scanner never sees the owner’s phone number. The owner never sees the scanner’s phone number. Both parties stay protected while communicating seamlessly.'],
      ]),
    },
    {
      id: 'trust',
      title: '“Why millions trust” list',
      fields: [
        text('trust.title', 'Heading', 'Why Millions Trust Scan Connect'),
        ...lines('trust', 'Point', [
          'Personal Phone Numbers Stay Hidden',
          'Instant Communication During Emergencies',
          'No App Required for the Scanner',
          'Secure Call & WhatsApp Routing',
          'Fast & Easy QR Scanning',
          'End-to-End Privacy Protection',
          'Works Anywhere, Anytime',
        ]),
        text('steps.1.note', 'Step 1 — tick line', 'Works with any smartphone'),
        text('steps.2.opt1', 'Step 2 — option 1', 'Secure Call'),
        text('steps.2.opt2', 'Step 2 — option 2', 'WhatsApp Message'),
      ],
    },
    {
      id: 'usecases',
      title: '“When can you use it?” cards',
      fields: [
        text('usecases.title', 'Heading', 'When Can You Use Scan Connect?'),
        longtext('usecases.body', 'Paragraph', 'Whether it’s a minor inconvenience or a critical situation, Scan Connect helps you connect with the vehicle owner instantly.'),
        ...lines('usecases', 'Card', [
          'Vehicle Blocking Your Way',
          'Headlights or Hazard Lights Left On',
          'Roadside Emergency',
          'Accident or Damage Notification',
          'Flat Tyre or Mechanical Issue',
          'Keys Left Inside Vehicle',
          'Suspicious Activity Around the Vehicle',
          'Wrong Parking Alert',
        ]),
      ],
    },
    {
      id: 'cta',
      title: 'Closing call-to-action',
      fields: [
        text('cta.title', 'Heading', 'Ready to Protect Your Privacy?'),
        longtext('cta.body', 'Paragraph 1', 'Join thousands of smart vehicle owners who rely on Scan Connect for secure, hassle-free communication every day.'),
        longtext('cta.body2', 'Paragraph 2', 'Stay reachable when it matters—without ever exposing your personal phone number.'),
        text('cta.tagline', 'Tag line', 'Your Vehicle. Your Privacy. Your Peace of Mind.'),
        text('cta.button_1', 'Black button — text', 'Get Your Scan Connect Tag'),
        text('cta.button_2', 'Yellow button — text', 'View Plans & Pricing'),
      ],
    },
  ],
};

const CONTACT: PageDef = {
  id: 'contact',
  label: 'Contact',
  path: '/contact',
  description: 'The Contact page: headline, email addresses, WhatsApp number, support hours and office address.',
  sections: [
    {
      id: 'hero',
      title: 'Headline',
      fields: [
        text('hero.title', 'Heading', 'Contact Us'),
        text('hero.subtitle', 'Sub-heading', 'We’re Here to Help'),
        longtext('hero.body', 'Paragraph 1', 'Have a question about Scan Connect, your QR tag, an order, or our business solutions? Our support team is ready to assist you with quick, reliable, and personalized service.'),
        longtext('hero.body2', 'Paragraph 2', 'Whether you’re an individual customer, reseller, fleet operator, or enterprise partner, we’re just a call or message away.'),
      ],
    },
    {
      id: 'email',
      title: 'Email card',
      fields: [
        text('email.title', 'Card title', 'Email Us'),
        text('email.intro', 'Intro line', 'For faster assistance, contact the appropriate team:'),
        text('email.1.label', 'Address 1 — label', 'General Enquiries'),
        text('email.1.address', 'Address 1 — email', 'info@scanconnect.co.in'),
        text('email.2.label', 'Address 2 — label', 'Customer Support'),
        text('email.2.address', 'Address 2 — email', 'support@scanconnect.co.in'),
        text('email.3.label', 'Address 3 — label', 'Sales & Business Partnerships'),
        text('email.3.address', 'Address 3 — email', 'sales@scanconnect.co.in'),
      ],
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp support card',
      fields: [
        text('whatsapp.title', 'Card title', 'Chat with our WhatsApp support team'),
        text('whatsapp.display', 'Number shown on the page', '+91 99738 78399'),
        text('whatsapp.number', 'Number for the chat link', '919973878399', {
          hint: 'Digits only with country code, no + or spaces. Used for the wa.me chat link.',
          maxLength: 15,
        }),
        text('whatsapp.hours_label', 'Hours label', 'Support Hours'),
        longtext('whatsapp.hours', 'Support hours', 'Monday – Saturday\n09:00 AM – 06:00 PM (IST)', { hint: 'Press Enter for a new line.' }),
        longtext('whatsapp.note', 'Note', 'Need immediate assistance? Our team is happy to help with product information, activation support, order tracking, and technical queries.'),
      ],
    },
    {
      id: 'connect',
      title: 'Connect card',
      fields: [
        text('connect.title', 'Card title', 'Connect'),
        longtext('connect.body', 'Paragraph', 'Reach us instantly through live chat, our web portal, social handles, or review our terms & conditions.'),
      ],
    },
    {
      id: 'office',
      title: 'Office',
      fields: [
        text('office.title', 'Card title', 'Visit Our Offices'),
        text('office.label', 'Address label', 'Office Address'),
        longtext('office.address', 'Address', 'House No. 1265, Dispensary Road,\nBehind Vishwakarma Temple, Near Aerodrome,\nSonari, Jamshedpur, East Singhbhum,\nJharkhand – 831011', { hint: 'Press Enter for a new line.' }),
        url('office.map_link', 'Google Maps link', 'https://maps.app.goo.gl/taLjuXVuYUhTaQ6aA'),
      ],
    },
    {
      id: 'form',
      title: 'Message form heading',
      fields: [
        text('form.title', 'Heading', 'Send Us a Message'),
        longtext('form.body', 'Paragraph', 'Have a specific question or need assistance? Fill out the form below, and our team will get back to you as soon as possible.'),
      ],
    },
    {
      id: 'why',
      title: '“Why contact us” list',
      fields: [
        text('why.title', 'Heading', 'Why Contact Scan Connect?'),
        text('why.body', 'Paragraph', 'Our dedicated support team can help you with:'),
        text('why.1', 'Topic 1', 'Product Information'),
        text('why.2', 'Topic 2', 'QR Tag Activation'),
        text('why.3', 'Topic 3', 'Order Tracking'),
        text('why.4', 'Topic 4', 'Technical Support'),
        text('why.5', 'Topic 5', 'Bulk & Corporate Orders'),
        text('why.6', 'Topic 6', 'Fleet Solutions'),
        text('why.7', 'Topic 7', 'Reseller & Franchise Opportunities'),
        text('why.8', 'Topic 8', 'Enterprise Parking Solutions'),
        text('why.9', 'Topic 9', 'Returns & Warranty Assistance'),
        text('why.10', 'Topic 10', 'General Questions'),
        text('why.more', '“Show all” button — text', 'View all features'),
        text('why.less', '“Show fewer” button — text', 'Show less'),
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy note',
      fields: [
        text('privacy.badge', 'Small label', 'Your Privacy Matters'),
        longtext('privacy.body', 'Paragraph', 'Every inquiry is handled with the highest level of confidentiality. Your personal information is securely protected and used only to respond to your request—we never share your data with third parties.'),
        text('privacy.1', 'Badge 1', 'Data Encrypted in Transit'),
        text('privacy.2', 'Badge 2', 'Never Sold or Shared'),
        text('privacy.3', 'Badge 3', 'Used Only to Respond to You'),
      ],
    },
    {
      id: 'closing',
      title: 'Closing section',
      fields: [
        text('closing.title', 'Heading', 'Let’s Build Smarter & Safer Mobility Together'),
        longtext('closing.body', 'Paragraph', 'Whether you’re looking to secure a single vehicle or implement intelligent parking solutions for your organization, Scan Connect is here to help.'),
        text('closing.note', 'Small note', 'We’re committed to delivering fast, friendly, and reliable support every step of the way.'),
        text('closing.1', 'Line item 1', 'Call Us'),
        text('closing.2', 'Line item 2', 'Email Us'),
        text('closing.3', 'Line item 3', 'Send a Message'),
      ],
    },
  ],
};

export const PAGES: PageDef[] = [HOW_IT_WORKS, SHOP, ABOUT, QR_SCAN, CONTACT];

export const getPage = (id: string): PageDef | undefined => PAGES.find((p) => p.id === id);

/** key → default, for a page. */
export const defaultsFor = (pageId: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const s of getPage(pageId)?.sections ?? []) for (const f of s.fields) out[f.key] = f.default;
  return out;
};
