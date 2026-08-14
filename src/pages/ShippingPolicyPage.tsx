import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Shipping Coverage',
    body: (
      <>
        <p>
          We currently provide delivery services across India, subject to courier availability and serviceability at
          the delivery address.
        </p>
        <p>Some remote or restricted locations may have longer delivery times or limited courier availability.</p>
      </>
    ),
  },
  {
    title: '2. Order Processing',
    body: (
      <>
        <p>Orders are generally processed after successful payment confirmation.</p>
        <p>Most orders are dispatched within 1&ndash;3 business days, subject to product availability and verification.</p>
        <p>Orders placed on Sundays, public holidays, or during promotional periods may require additional processing time.</p>
        <p>
          Once your order has been dispatched, you will receive shipping/tracking information through the contact
          details provided during checkout, where tracking is available.
        </p>
      </>
    ),
  },
  {
    title: '3. Estimated Delivery Time',
    body: (
      <>
        <p>After dispatch, the estimated delivery time is generally:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-neutral-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-neutral-50 text-left">
                <th className="px-4 py-3 font-bold text-[#0F0F0F] border-b border-neutral-200">Location</th>
                <th className="px-4 py-3 font-bold text-[#0F0F0F] border-b border-neutral-200">Estimated Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 border-b border-neutral-100">Metro &amp; Major Cities</td>
                <td className="px-4 py-3 border-b border-neutral-100">2&ndash;5 business days</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-neutral-100">Other Serviceable Locations</td>
                <td className="px-4 py-3 border-b border-neutral-100">4&ndash;8 business days</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Remote / Special Delivery Areas</td>
                <td className="px-4 py-3">5&ndash;12 business days or longer</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Delivery timelines are estimates and are not guaranteed.</p>
        <p>
          Actual delivery may vary based on the destination, courier availability, weather, public holidays,
          transportation conditions, and other circumstances outside our reasonable control.
        </p>
      </>
    ),
  },
  {
    title: '4. Free Delivery',
    body: (
      <>
        <p>
          Where a product or promotional offer states &ldquo;Free Delivery Across India,&rdquo; standard shipping
          charges for eligible locations will be covered by Scan Connect.
        </p>
        <p>
          Additional charges may apply for special delivery requirements, remote locations, or services specifically
          requested by the customer, where applicable.
        </p>
        <p>Any applicable charges will be communicated before dispatch.</p>
      </>
    ),
  },
  {
    title: '5. Shipping Address',
    body: (
      <>
        <p>Customers are responsible for providing an accurate and complete delivery address.</p>
        <p>Please ensure that your order includes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Full Name</li>
          <li>Complete Address</li>
          <li>City</li>
          <li>State</li>
          <li>PIN Code</li>
          <li>Valid Mobile Number</li>
        </ul>
        <p>
          Scan Connect is not responsible for delivery delays or failed delivery resulting from an incorrect or
          incomplete address provided by the customer.
        </p>
      </>
    ),
  },
  {
    title: '6. Order Tracking',
    body: (
      <>
        <p>
          Once your order is dispatched, tracking information may be provided through SMS, email, WhatsApp, or your
          account dashboard, depending on the courier and available services.
        </p>
        <p>You can use the tracking information to monitor your shipment.</p>
        <p>
          If tracking information does not update immediately, please allow reasonable time for the courier&apos;s
          system to register the shipment.
        </p>
      </>
    ),
  },
  {
    title: '7. Delivery Attempts',
    body: (
      <>
        <p>The courier may make multiple delivery attempts depending on its operational policy.</p>
        <p>If the recipient is unavailable, the courier may:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Attempt delivery again.</li>
          <li>Contact the recipient.</li>
          <li>Leave a delivery notification.</li>
          <li>Return the package to the sender after unsuccessful attempts.</li>
        </ul>
        <p>Customers should ensure that the provided mobile number remains reachable during the delivery period.</p>
      </>
    ),
  },
  {
    title: '8. Delayed Delivery',
    body: (
      <>
        <p>Delivery may be delayed due to circumstances including:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Severe weather</li>
          <li>Natural disasters</li>
          <li>Transportation disruptions</li>
          <li>Public holidays</li>
          <li>Courier operational issues</li>
          <li>Strikes</li>
          <li>Incorrect address information</li>
          <li>High-volume periods</li>
          <li>Government restrictions</li>
          <li>Remote-area delivery limitations</li>
          <li>Other events beyond our reasonable control</li>
        </ul>
        <p>If your order appears significantly delayed, please contact our support team with your order number.</p>
      </>
    ),
  },
  {
    title: '9. Damaged Package',
    body: (
      <>
        <p>Please inspect your package when it is delivered.</p>
        <p>If the outer packaging appears significantly damaged, tampered with, or opened, you should:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Take photographs/videos of the package.</li>
          <li>Note the condition of the package.</li>
          <li>Contact Scan Connect support as soon as possible.</li>
          <li>Provide your order number and relevant photographs/videos.</li>
        </ol>
        <p>Where required, we may request additional information to investigate the issue with the courier.</p>
      </>
    ),
  },
  {
    title: '10. Wrong, Missing, or Damaged Product',
    body: (
      <>
        <p>If you receive:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>A wrong product</li>
          <li>A missing item</li>
          <li>A damaged product</li>
          <li>An incomplete order</li>
        </ul>
        <p>please contact us within 48 hours of delivery. Please provide:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Order number</li>
          <li>Registered mobile/email</li>
          <li>Photographs of the package</li>
          <li>Photographs of the product</li>
          <li>Unboxing video, where available</li>
          <li>Description of the issue</li>
        </ul>
        <p>
          After verification, we may offer a replacement, refund, or other appropriate resolution in accordance with
          our Refund &amp; Returns Policy.
        </p>
      </>
    ),
  },
  {
    title: '11. Undelivered / Returned Shipments',
    body: (
      <>
        <p>An order may be returned to us if:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>The address is incorrect.</li>
          <li>The PIN code is incorrect.</li>
          <li>The recipient is unavailable after repeated attempts.</li>
          <li>The customer refuses delivery.</li>
          <li>The location is not serviceable.</li>
          <li>The courier cannot complete delivery for operational reasons.</li>
        </ul>
        <p>
          If a shipment is returned because of incorrect information supplied by the customer or repeated failed
          delivery attempts, additional shipping charges may apply for re-dispatch, where permitted.
        </p>
      </>
    ),
  },
  {
    title: '12. International Shipping',
    body: (
      <>
        <p>
          Unless specifically stated otherwise on the product page or checkout, Scan Connect currently does not
          guarantee international shipping.
        </p>
        <p>
          Customers outside India should contact our support/sales team before placing an order to confirm
          availability and applicable shipping charges.
        </p>
      </>
    ),
  },
  {
    title: '13. Shipping & Product Activation',
    body: (
      <>
        <p>Delivery of a physical Scan Connect tag and activation of the tag are separate processes.</p>
        <p>
          After receiving the product, customers may be required to complete the activation process and link the tag
          to their account/vehicle.
        </p>
        <p>Please follow the activation instructions supplied with the product.</p>
      </>
    ),
  },
  {
    title: '14. Change of Delivery Address',
    body: (
      <>
        <p>If you need to change your shipping address, contact us as soon as possible after placing the order.</p>
        <p>Address changes may not be possible once the order has been packed or handed over to the courier.</p>
        <p>
          If the shipment has already been dispatched, the customer may need to coordinate directly with the courier
          where such modification is available.
        </p>
      </>
    ),
  },
  {
    title: '15. Shipping During Sales & Promotions',
    body: (
      <>
        <p>
          During major sales, festive periods, product launches, or promotional campaigns, order volumes may be
          significantly higher than normal.
        </p>
        <p>Processing and delivery may therefore take longer than standard estimates. We appreciate your patience during such periods.</p>
      </>
    ),
  },
  {
    title: '16. Contact Shipping Support',
    body: (
      <>
        <p>For questions regarding your shipment, contact:</p>
        <p className="font-bold text-[#1B1C1C]">Scan Connect Support</p>
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
        <p className="font-bold text-[#1B1C1C]">Support Hours:</p>
        <p>Monday &ndash; Saturday, 09:00 AM &ndash; 06:00 PM IST</p>
        <p>Please keep your order number available when contacting our support team.</p>
      </>
    ),
  },
  {
    title: '17. Important Notice',
    body: (
      <>
        <p>
          Delivery timelines provided by Scan Connect are estimates and may vary depending on the courier,
          destination, and circumstances outside our reasonable control.
        </p>
        <p>By placing an order, you acknowledge and accept the shipping terms described in this policy.</p>
      </>
    ),
  },
];

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F0F0F] font-sans antialiased">
      <DashboardHeader
        userData={{ fullName: '', mobileNumber: '', email: '' }}
        onLogout={() => {}}
        activeNav="Shipping Policy"
        isLoggedIn={false}
        onNavClick={(nav) => {
          const path = nav === 'How it works' ? '/' : nav === 'QR Scan' ? '/qr-scan' : `/${nav.toLowerCase()}`;
          window.location.href = path;
        }}
      />

      <main className="flex-1">
        <div className="py-14 sm:py-20 bg-neutral-50/60 border-b border-neutral-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F0F0F] tracking-tight">Shipping Policy</h1>
            <p className="text-[#5D5F5F] text-sm font-semibold uppercase tracking-wider">Last Updated: August 2026</p>
            <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed">
              At Scan Connect, we aim to make your order experience simple, reliable, and transparent. This Shipping
              Policy explains how we process and deliver Scan Connect QR tags and other physical products purchased
              through our website.
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

          <div className="pt-2 space-y-1">
            <p className="font-black text-[#1B1C1C] text-lg">Scan Connect</p>
            <p className="text-[#5D5F5F] font-semibold">Smart Protection. Secure Connection.</p>
            <p className="text-[#5D5F5F]">Operated by Creative Frame Works Pvt Ltd</p>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};
