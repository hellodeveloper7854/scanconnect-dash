export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  body: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-fastag-businesses-can-advertise-to-car-owners-on-Scan Connect',
    title: 'How FASTag Businesses Can Advertise to Car Owners on Scan Connect',
    date: 'August 9, 2026',
    category: 'Guides & Tips',
    excerpt:
      'Understanding the financial side of your digital ad strategy is the first step toward connecting with millions of car owners. For fastag.',
    body: [
      'Understanding the financial side of your digital ad strategy is the first step toward connecting with millions of car owners. For fastag businesses looking to scale, the process of getting started is simple and direct. You can begin by reaching out to the Scan Connect team to discuss your specific goals and requirements.',
      'Most companies find that a budget between ₹30,000 and ₹1,00,000 is ideal for launching a pilot campaign. This investment allows you to test different approaches while targeting car owners with ads that resonate with their daily driving habits. By focusing on effective marketing on Scan Connect, you ensure that your brand stays top of mind across India.',
      'Factors Influencing Your Final Spend',
      'Your total investment in fastag advertising depends on several key variables. We recommend reviewing these elements to build a digital advertising plan that fits your budget and reach goals.',
    ],
  },
  {
    slug: '5-common-car-maintenance-mistakes-made-in-delhi-that-cost-thousands',
    title: '5 Common Car Maintenance Mistakes Made In Delhi That Cost Thousands',
    date: 'August 5, 2026',
    category: 'Guides & Tips',
    excerpt: 'One of the most frequent car maintenance mistakes...',
    body: [
      'One of the most frequent car maintenance mistakes Delhi drivers make is skipping regular servicing during the winter smog season, when engines are already under extra strain.',
      'Ignoring small windshield chips, delaying tyre rotation, and using the wrong engine oil grade for extreme temperature swings can all add thousands of rupees to your annual maintenance bill.',
      'Simple habits — checking tyre pressure monthly, servicing your AC before summer, and keeping a maintenance log — go a long way toward avoiding these costly surprises.',
    ],
  },
  {
    slug: 'why-every-garage-owner-should-give-customers-a-car-Scan Connect-tag-after-service',
    title: 'Why Every Garage Owner Should Give Customers a Car Scan Connect Tag After Service',
    date: 'August 3, 2026',
    category: 'Guides & Tips',
    excerpt: 'Think back to the last time you picked up ...',
    body: [
      'Think back to the last time you picked up your car after a service. Chances are, no one gave you an easy way to be reached if something needed attention afterward.',
      'Handing customers a Car Scan Connect Tag at pickup builds trust — it shows you care about what happens after they drive off the lot, and gives them (and anyone near their parked car) a private, direct way to reach them if needed.',
      'Garages that adopt this small gesture consistently see higher repeat business and word-of-mouth referrals.',
    ],
  },
  {
    slug: 'how-car-Scan Connect-tag-helps-with-parking-during-diwali-celebrations',
    title: 'How Car Scan Connect Tag Helps With Parking During Diwali Celebrations',
    date: 'July 28, 2026',
    category: 'Guides & Tips',
    excerpt: 'Diwali season means crowded streets, packed parking lots, and cars parked bumper to bumper for hours.',
    body: [
      'Diwali season means crowded streets, packed parking lots, and cars parked bumper to bumper for hours. When someone needs to reach a blocked vehicle owner, a Scan Connect Tag makes it instant — no hunting for security, no shouting across a parking lot.',
      'Just a quick scan, and the other driver can call or message you directly without ever seeing your personal number.',
    ],
  },
  {
    slug: 'how-car-Scan Connect-tag-helps-during-protests',
    title: 'How Car Scan Connect Tag Helps During Protests',
    date: 'July 22, 2026',
    category: 'Guides & Tips',
    excerpt: 'Unplanned protests and road blockades can leave your car stranded in unexpected places.',
    body: [
      'Unplanned protests and road blockades can leave your car stranded in unexpected places for hours or even days.',
      'A Scan Connect Tag means local shopkeepers, traffic police, or fellow drivers can reach you immediately if your vehicle needs to be moved — without needing to track down your number through third parties.',
    ],
  },
  {
    slug: '5-situations-where-Scan Connect-tag-scan-location-tracking-can-be-useful',
    title: '5 Situations Where Scan Connect Tag Scan Location Tracking Can Be Useful',
    date: 'July 15, 2026',
    category: 'Guides & Tips',
    excerpt: 'Knowing where and when your tag was last scanned adds a helpful layer of context in several situations.',
    body: [
      'Knowing where and when your tag was last scanned adds a helpful layer of context in several situations: recovering a car after valet parking, confirming a delivery pickup location, verifying a service visit, tracking a fleet vehicle, or investigating a reported incident.',
      'Location context, shown only to the vehicle owner, turns a simple contact tag into a lightweight peace-of-mind tool.',
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
