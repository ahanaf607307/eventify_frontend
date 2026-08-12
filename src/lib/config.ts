/**
 * Eventify Next.js - Configuration Enums & Constant Identifiers
 */
export const CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://eventify-backend-roan.vercel.app/api/v1',
  AUTH_STORAGE_KEY: 'eventify_auth_token',
  USER_STORAGE_KEY: 'eventify_user_data',

  ROLES: {
    SYSTEM_OWNER: 'SYSTEM_OWNER',
    MANAGER: 'MANAGER',
    STAFF: 'STAFF',
    USER: 'USER',
  } as const,

  EVENT_STATUS: {
    DRAFT: 'DRAFT',
    UPCOMING: 'UPCOMING',
    ONGOING: 'ONGOING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  } as const,

  BOOKING_STATUS: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    ATTENDED: 'ATTENDED',
    REFUNDED: 'REFUNDED',
  } as const,

  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
  } as const,
};

export type UserRole = keyof typeof CONFIG.ROLES;
export type EventStatus = keyof typeof CONFIG.EVENT_STATUS;
export type BookingStatus = keyof typeof CONFIG.BOOKING_STATUS;
export type PaymentStatus = keyof typeof CONFIG.PAYMENT_STATUS;
