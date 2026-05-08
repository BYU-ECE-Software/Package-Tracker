// Default subject/body builders for order-related emails. Lives in
// lib/notifications/ so both the backend (when a caller omits text) and
// the future frontend (for preview-before-send) can import the same
// strings — paralleling how Package-Tracker eventually wants its package
// templates colocated. No server-only deps; safe to import from client
// components.
//
// TODO (notification logging): once the OrderNotification model exists,
// the `type` discriminator below becomes the row's `type` column. Until
// then it's used only by the `sendOrderEmail` helper for routing /
// debugging.

export type OrderEmailType =
  | 'ORDER_REQUESTED'
  | 'ORDER_PURCHASED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'CUSTOM';

export interface OrderEmailTemplateContext {
  // Currently unused; reserved so future templates can interpolate order
  // metadata (id, vendor name, etc.) without changing every call site.
  orderId?: string;
  vendorName?: string | null;
  total?: number | null;
}

export interface OrderEmailDefaults {
  subject: string;
  body: string;
}

const DEFAULT_SUBJECTS: Record<OrderEmailType, string> = {
  ORDER_REQUESTED: 'Your purchase request was received',
  ORDER_PURCHASED: 'Your purchase has been placed',
  ORDER_COMPLETED: 'Your purchase order is complete',
  ORDER_CANCELLED: 'Your purchase request was cancelled',
  CUSTOM: 'Update on your purchase request',
};

const DEFAULT_BODIES: Record<OrderEmailType, string> = {
  ORDER_REQUESTED:
    'Your purchase request has been submitted. You will receive another email when it is processed.',
  ORDER_PURCHASED:
    'Your purchase request has been placed with the vendor. You will receive another email when it is complete.',
  ORDER_COMPLETED:
    'Your purchase order is complete. You can pick up the items from the ECE office.',
  ORDER_CANCELLED:
    'Your purchase request has been cancelled. Please contact the ECE office if you have questions.',
  CUSTOM: '',
};

/**
 * Build the default subject + body for a given order email type. Use this
 * to pre-fill a SendEmailModal so an admin can preview/edit before
 * sending. Currently context-free; the signature accepts a context object
 * so future template additions can interpolate order details without
 * disturbing call sites.
 */
export function buildDefaultOrderEmail(
  type: OrderEmailType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: OrderEmailTemplateContext = {},
): OrderEmailDefaults {
  return {
    subject: DEFAULT_SUBJECTS[type],
    body: DEFAULT_BODIES[type],
  };
}
