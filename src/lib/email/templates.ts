const ACCENT = '#E85A2B';
const BG_PRIMARY = '#0a0a0a';
const BG_CARD = '#141414';
const TEXT_PRIMARY = '#f5f5f5';
const TEXT_SECONDARY = '#a0a0a0';
const BORDER = '#2a2a2a';

function layout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="hr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${BG_PRIMARY};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT_PRIMARY};">
<div style="max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;padding:24px 0;border-bottom:2px solid ${ACCENT};">
    <h1 style="margin:0;font-size:28px;font-weight:800;color:${ACCENT};letter-spacing:1px;">SV CARS</h1>
    <p style="margin:4px 0 0;font-size:12px;color:${TEXT_SECONDARY};letter-spacing:2px;">RENT A CAR • MOSTAR</p>
  </div>
  <div style="padding:24px 0;">
    ${content}
  </div>
  <div style="border-top:1px solid ${BORDER};padding:20px 0;text-align:center;font-size:12px;color:${TEXT_SECONDARY};">
    <p style="margin:0;">SV Cars d.o.o. • Vojno bb, 88000 Mostar, BiH</p>
    <p style="margin:4px 0 0;">Tel: +387 63 09 09 08 • Email: info@sv-cars.ba</p>
  </div>
</div>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;color:${TEXT_SECONDARY};white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:8px 12px;font-size:14px;color:${TEXT_PRIMARY};font-weight:500;">${value}</td>
  </tr>`;
}

function table(rows: string): string {
  return `<table style="width:100%;border-collapse:collapse;background:${BG_CARD};border-radius:8px;border:1px solid ${BORDER};overflow:hidden;">${rows}</table>`;
}

// --- Template interfaces ---

export interface ReservationEmailData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleName?: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  totalPrice?: number;
  source?: string;
}

export interface ContactMessageEmailData {
  name: string;
  email?: string;
  phone?: string;
  message: string;
}

export interface WeeklyReportData {
  totalReservations: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  totalRevenue: number;
  bySource: { website: number; instagram_dm: number; whatsapp: number; phone: number };
  contactMessages: number;
  weekStart: string;
  weekEnd: string;
}

// --- Templates ---

export function reservationConfirmationEmail(data: ReservationEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:${TEXT_PRIMARY};">Vaša rezervacija je primljena!</h2>
    <p style="margin:0 0 20px;font-size:14px;color:${TEXT_SECONDARY};">Hvala Vam na povjerenju. Kontaktirat ćemo Vas uskoro za potvrdu.</p>
    ${table(`
      ${data.vehicleName ? row('Vozilo', data.vehicleName) : ''}
      ${row('Preuzimanje', data.pickupDate)}
      ${row('Povrat', data.returnDate)}
      ${row('Lokacija preuzimanja', data.pickupLocation)}
      ${row('Lokacija povrata', data.returnLocation)}
      ${data.totalPrice ? row('Cijena', `${data.totalPrice} KM`) : ''}
    `)}
    <p style="margin:20px 0 0;font-size:13px;color:${TEXT_SECONDARY};">
      Za sve informacije možete nas kontaktirati na <span style="color:${ACCENT};">+387 63 09 09 08</span> ili
      <span style="color:${ACCENT};">info@sv-cars.ba</span>.
    </p>`;

  return {
    subject: `Rezervacija primljena${data.vehicleName ? ` — ${data.vehicleName}` : ''}`,
    html: layout('Potvrda rezervacije', content),
  };
}

export function adminNewReservationEmail(data: ReservationEmailData): { subject: string; html: string } {
  const sourceLabels: Record<string, string> = {
    website: 'Web', instagram_dm: 'Instagram', whatsapp: 'WhatsApp', phone: 'Telefon',
  };

  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:${ACCENT};">Nova rezervacija!</h2>
    <p style="margin:0 0 20px;font-size:14px;color:${TEXT_SECONDARY};">Stigla je nova rezervacija. Detalji:</p>
    ${table(`
      ${row('Kupac', data.customerName)}
      ${row('Telefon', data.customerPhone)}
      ${data.customerEmail ? row('Email', data.customerEmail) : ''}
      ${data.vehicleName ? row('Vozilo', data.vehicleName) : ''}
      ${row('Datumi', `${data.pickupDate} → ${data.returnDate}`)}
      ${row('Lokacija', `${data.pickupLocation} → ${data.returnLocation}`)}
      ${data.totalPrice ? row('Cijena', `${data.totalPrice} KM`) : ''}
      ${row('Izvor', sourceLabels[data.source || 'website'] || data.source || 'Web')}
    `)}`;

  return {
    subject: `Nova rezervacija — ${data.customerName}${data.vehicleName ? ` (${data.vehicleName})` : ''}`,
    html: layout('Nova rezervacija', content),
  };
}

export function adminNewContactMessageEmail(data: ContactMessageEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:${ACCENT};">Nova poruka s kontakt forme</h2>
    <p style="margin:0 0 20px;font-size:14px;color:${TEXT_SECONDARY};">Primili ste novu poruku:</p>
    ${table(`
      ${row('Ime', data.name)}
      ${data.email ? row('Email', data.email) : ''}
      ${data.phone ? row('Telefon', data.phone) : ''}
    `)}
    <div style="margin:16px 0;padding:16px;background:${BG_CARD};border-radius:8px;border:1px solid ${BORDER};font-size:14px;line-height:1.6;color:${TEXT_PRIMARY};">
      ${data.message.replace(/\n/g, '<br>')}
    </div>`;

  return {
    subject: `Kontakt poruka — ${data.name}`,
    html: layout('Nova kontakt poruka', content),
  };
}

const statusLabels: Record<string, { label: string; color: string; text: string }> = {
  confirmed: { label: 'Potvrđena', color: '#22c55e', text: 'Vaša rezervacija je potvrđena! Veselimo se Vašem dolasku.' },
  cancelled: { label: 'Otkazana', color: '#ef4444', text: 'Vaša rezervacija je otkazana. Za sve informacije kontaktirajte nas.' },
  completed: { label: 'Završena', color: '#3b82f6', text: 'Vaša rezervacija je označena kao završena. Hvala na povjerenju!' },
};

export function statusUpdateEmail(data: ReservationEmailData, newStatus: string): { subject: string; html: string } {
  const info = statusLabels[newStatus] || { label: newStatus, color: TEXT_SECONDARY, text: '' };

  const content = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="display:inline-block;padding:8px 20px;border-radius:20px;font-size:14px;font-weight:700;color:${info.color};border:2px solid ${info.color};">
        ${info.label}
      </div>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:${TEXT_SECONDARY};text-align:center;">${info.text}</p>
    ${table(`
      ${data.vehicleName ? row('Vozilo', data.vehicleName) : ''}
      ${row('Preuzimanje', data.pickupDate)}
      ${row('Povrat', data.returnDate)}
      ${row('Lokacija', `${data.pickupLocation} → ${data.returnLocation}`)}
      ${data.totalPrice ? row('Cijena', `${data.totalPrice} KM`) : ''}
    `)}
    <p style="margin:20px 0 0;font-size:13px;color:${TEXT_SECONDARY};text-align:center;">
      Za sve informacije: <span style="color:${ACCENT};">+387 63 09 09 08</span> ili <span style="color:${ACCENT};">info@sv-cars.ba</span>
    </p>`;

  return {
    subject: `Rezervacija ${info.label.toLowerCase()}${data.vehicleName ? ` — ${data.vehicleName}` : ''}`,
    html: layout(`Rezervacija ${info.label.toLowerCase()}`, content),
  };
}

export function weeklyReportEmail(data: WeeklyReportData): { subject: string; html: string } {
  const statRow = (label: string, value: string | number, color?: string) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid ${BORDER};">
      <span style="font-size:13px;color:${TEXT_SECONDARY};">${label}</span>
      <span style="font-size:16px;font-weight:700;color:${color || TEXT_PRIMARY};">${value}</span>
    </div>`;

  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:${ACCENT};">Sedmični izvještaj</h2>
    <p style="margin:0 0 20px;font-size:14px;color:${TEXT_SECONDARY};">${data.weekStart} — ${data.weekEnd}</p>

    <div style="background:${BG_CARD};border-radius:8px;border:1px solid ${BORDER};overflow:hidden;margin-bottom:16px;">
      ${statRow('Ukupno rezervacija', data.totalReservations, ACCENT)}
      ${statRow('Na čekanju', data.pendingCount, '#eab308')}
      ${statRow('Potvrđene', data.confirmedCount, '#22c55e')}
      ${statRow('Završene', data.completedCount, '#3b82f6')}
      ${statRow('Otkazane', data.cancelledCount, '#ef4444')}
    </div>

    <div style="background:${BG_CARD};border-radius:8px;border:1px solid ${BORDER};overflow:hidden;margin-bottom:16px;">
      ${statRow('Prihod (bez otkazanih)', `${data.totalRevenue} KM`, '#22c55e')}
      ${statRow('Kontakt poruke', data.contactMessages)}
    </div>

    <h3 style="margin:20px 0 8px;font-size:14px;color:${TEXT_SECONDARY};">Po izvoru</h3>
    <div style="background:${BG_CARD};border-radius:8px;border:1px solid ${BORDER};overflow:hidden;">
      ${statRow('Web', data.bySource.website)}
      ${statRow('Instagram', data.bySource.instagram_dm)}
      ${statRow('WhatsApp', data.bySource.whatsapp)}
      ${statRow('Telefon', data.bySource.phone)}
    </div>`;

  return {
    subject: `SV Cars — Sedmični izvještaj (${data.weekStart} – ${data.weekEnd})`,
    html: layout('Sedmični izvještaj', content),
  };
}
