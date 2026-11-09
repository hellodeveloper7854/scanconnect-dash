/** What the server reports about the WhatsApp alert that goes out with an SOS (POST /api/sos -> `notified`). */
export interface SosNotified {
  total: number;
  eligible: number;
  sent: number;
  failed: number;
  pending: number;
  notConfigured: boolean;
}

/** One plain sentence telling the owner what happened to the WhatsApp alert. */
export function sosNotifiedSummary(n?: Partial<SosNotified> | null): string {
  const total = n?.total ?? 0;
  const eligible = n?.eligible ?? 0;
  const sent = n?.sent ?? 0;
  const failed = n?.failed ?? 0;
  const pending = n?.pending ?? 0;
  if (total === 0) {
    return 'No emergency contacts are saved, so nobody was messaged. Add one in your profile.';
  }
  if (eligible === 0) {
    return 'None of your contacts has WhatsApp alerts turned on, so nobody was messaged. Turn it on for people who agreed, in your profile.';
  }
  if (n?.notConfigured) return 'WhatsApp alerts are not available right now. Please call your contacts.';
  if (sent > 0) {
    const who = sent === 1 ? '1 contact' : `${sent} contacts`;
    const extra =
      failed > 0
        ? ` ${failed === 1 ? '1 contact' : `${failed} contacts`} could not be reached on WhatsApp - please call.`
        : '';
    return `A WhatsApp alert with your location was sent to ${who}.${extra}`;
  }
  if (pending > 0) return 'WhatsApp alerts are being delivered to your contacts.';
  return 'We could not reach your contacts on WhatsApp. Please call them.';
}
