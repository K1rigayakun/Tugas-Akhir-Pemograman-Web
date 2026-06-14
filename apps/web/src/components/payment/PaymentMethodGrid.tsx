"use client";

import React, { useState } from "react";
import PaymentMethodCard from "./PaymentMethodCard";

interface PaymentMethodOption {
  id: string;
  label: string;
  description: string;
  iconPath: string;
  priority: number;
}

interface PaymentMethodGridProps {
  onSelect: (methodId: string) => void;
  selectedMethod?: string;
}

/**
 * SVG icon paths for each payment method
 * Using SVG paths instead of emoji per project rules
 */
const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "TESTING",
    label: "Testing / Demo",
    description: "Simulasi pembayaran untuk testing & demo",
    // Flask/beaker icon
    iconPath: "M9 3L9 8.5L4 16.5C3.17 18 4.17 20 6 20H18C19.83 20 20.83 18 20 16.5L15 8.5V3M9 3H15M9 3L8 2M15 3L16 2M10 12H14",
    priority: 1,
  },
  {
    id: "QRIS",
    label: "QRIS",
    description: "Scan QR code dari aplikasi bank manapun",
    // QR code icon
    iconPath: "M3 3H10V10H3V3ZM14 3H21V10H14V3ZM3 14H10V21H3V14ZM14 14H17V17H14V14ZM18 14H21V17H18V14ZM14 18H17V21H14V18ZM18 18H21V21H18V18ZM6 6V7H7V6H6ZM17 6V7H18V6H17ZM6 17V18H7V17H6Z",
    priority: 2,
  },
  {
    id: "VIRTUAL_ACCOUNT",
    label: "Virtual Account",
    description: "Transfer via BCA, BNI, Mandiri, BRI",
    // Bank/building icon
    iconPath: "M3 21H21M3 10H21M5 6L12 3L19 6M4 10V21M20 10V21M8 14V17M12 14V17M16 14V17",
    priority: 3,
  },
  {
    id: "EWALLET",
    label: "E-Wallet",
    description: "GoPay, OVO, Dana, ShopeePay",
    // Wallet icon
    iconPath: "M19 7H5C3.89 7 3 7.89 3 9V18C3 19.1 3.89 20 5 20H19C20.1 20 21 19.1 21 18V9C21 7.89 20.1 7 19 7ZM19 18H5V9H19V18ZM16 13.5C16 12.67 16.67 12 17.5 12C18.33 12 19 12.67 19 13.5C19 14.33 18.33 15 17.5 15C16.67 15 16 14.33 16 13.5ZM5 5H19V7H5V5Z",
    priority: 4,
  },
  {
    id: "STRIPE",
    label: "Kartu Kredit / Debit",
    description: "Visa, Mastercard via Stripe",
    // Credit card icon
    iconPath: "M3 8C3 6.89 3.89 6 5 6H19C20.1 6 21 6.89 21 8V16C21 17.1 20.1 18 19 18H5C3.89 18 3 17.1 3 16V8ZM3 10H21M7 14H10",
    priority: 5,
  },
  {
    id: "BANK_TRANSFER",
    label: "Transfer Bank",
    description: "Transfer manual ke rekening bank",
    // Money transfer icon
    iconPath: "M2 5H22V7H2V5ZM2 9H22V11H2V9ZM2 13H22V15H2V13ZM2 17H22V19H2V17ZM11 20L7 16H15L11 20Z",
    priority: 6,
  },
];

/**
 * PaymentMethodGrid — Grid layout for payment method selection
 * Task 10.2: Define PaymentMethodOption array, responsive grid, sorted by priority
 */
export default function PaymentMethodGrid({ onSelect, selectedMethod }: PaymentMethodGridProps) {
  const sortedMethods = [...PAYMENT_METHODS].sort((a, b) => a.priority - b.priority);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "16px",
      maxWidth: "900px",
      margin: "0 auto",
    }}>
      {sortedMethods.map((method) => (
        <PaymentMethodCard
          key={method.id}
          method={method}
          selected={selectedMethod === method.id}
          onClick={() => onSelect(method.id)}
        />
      ))}
    </div>
  );
}
