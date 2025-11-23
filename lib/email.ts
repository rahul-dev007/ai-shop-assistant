// lib/email.ts
"use server";

import nodemailer from "nodemailer";

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} = process.env;

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT ? Number(EMAIL_PORT) : 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendOrderEmail(payload: {
  toCustomer?: string | null;
  customerName: string;
  phone: string;
  address: string;
  productId: string;
  quantity: number;
  orderId: string;
}) {
  const from = EMAIL_FROM || EMAIL_USER;

  const {
    toCustomer,
    customerName,
    phone,
    address,
    quantity,
    productId,
    orderId,
  } = payload;

  // Owner email
  await transporter.sendMail({
    from,
    to: EMAIL_USER,
    subject: `New order #${orderId}`,
    text: `
New order received:

Order ID: ${orderId}
Name: ${customerName}
Phone: ${phone}
Address: ${address}
Product ID: ${productId}
Quantity: ${quantity}
    `,
  });

  // Customer email
  if (toCustomer) {
    await transporter.sendMail({
      from,
      to: toCustomer,
      subject: "আপনার অর্ডার কনফার্ম হয়েছে · Hope Boutique",
      text: `
${customerName},
আপনার অর্ডার কনফার্ম হয়েছে 🥰

Order ID: ${orderId}
Product ID: ${productId}
Quantity: ${quantity}
      `,
    });
  }
}
