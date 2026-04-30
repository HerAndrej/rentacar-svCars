import { sendEmail } from './resend';
import {
  reservationConfirmationEmail,
  adminNewReservationEmail,
  adminNewContactMessageEmail,
  statusUpdateEmail,
  type ReservationEmailData,
  type ContactMessageEmailData,
} from './templates';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export function notifyReservationCreated(data: ReservationEmailData): void {
  const promises: Promise<void>[] = [];

  if (ADMIN_EMAIL) {
    const admin = adminNewReservationEmail(data);
    promises.push(sendEmail({ to: ADMIN_EMAIL, ...admin }));
  }

  if (data.customerEmail) {
    const customer = reservationConfirmationEmail(data);
    promises.push(sendEmail({ to: data.customerEmail, ...customer }));
  }

  if (promises.length > 0) {
    Promise.all(promises).catch(() => {});
  }
}

export function notifyContactMessage(data: ContactMessageEmailData): void {
  if (!ADMIN_EMAIL) return;
  const { subject, html } = adminNewContactMessageEmail(data);
  sendEmail({ to: ADMIN_EMAIL, subject, html }).catch(() => {});
}

export function notifyStatusChange(data: ReservationEmailData, newStatus: string): void {
  if (!data.customerEmail) return;
  if (!['confirmed', 'cancelled', 'completed'].includes(newStatus)) return;
  const { subject, html } = statusUpdateEmail(data, newStatus);
  sendEmail({ to: data.customerEmail, subject, html }).catch(() => {});
}
