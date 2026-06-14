"use client";

import { useState, useEffect } from "react";
import PageHeading from "../../components/PageHeading";
import AnimatedSection from "../../components/AnimatedSection";
import PaymentMethodGrid from "../../components/payment/PaymentMethodGrid";
import QRISPaymentDisplay from "../../components/payment/QRISPaymentDisplay";
import VirtualAccountDisplay from "../../components/payment/VirtualAccountDisplay";
import EWalletPaymentDisplay from "../../components/payment/EWalletPaymentDisplay";
import TestingPaymentDisplay from "../../components/payment/TestingPaymentDisplay";
import BankTransferDisplay from "../../components/payment/BankTransferDisplay";
import PaymentStatusTracker from "../../components/payment/PaymentStatusTracker";
import ProofUploader from "../../components/payment/ProofUploader";
import { initiatePaymentAction, completeTestPaymentAction } from "../actions/payment";
import { usePaymentSocket } from "../../hooks/usePaymentSocket";

/* ── CC Package Options ── */
const PACKAGES = [
  { cc: 50, price: 7500, popular: false },
  { cc: 100, price: 15000, popular: false },
  { cc: 500, price: 70000, popular: true },
  { cc: 1000, price: 135000, popular: false },
];

/* ── VA Bank Options ── */
const BANKS = [
  { id: "BCA", label: "BCA" },
  { id: "BNI", label: "BNI" },
  { id: "MANDIRI", label: "Mandiri" },
  { id: "BRI", label: "BRI" },
  { id: "PERMATA", label: "Permata" },
];

/* ── E-Wallet Options ── */
const WALLETS = [
  { id: "GOPAY", label: "GoPay" },
  { id: "OVO", label: "OVO" },
  { id: "DANA", label: "Dana" },
  { id: "SHOPEEPAY", label: "ShopeePay" },
  { id: "LINKAJA", label: "LinkAja" },
];

type Step = "select-package" | "select-method" | "payment-details" | "status";

export default function TopupPage() {
  const [step, setStep] = useState<Step>("select-package");
  const [selectedPackage, setSelectedPackage] = useState<typeof PACKAGES[0] | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Socket.IO real-time status updates with polling fallback (Task 14.1 & 14.2, Requirement 7.2)
  usePaymentSocket({
    userId: paymentData?.userId || null,
    paymentId: paymentData?.id || null, // Task 14.2: Enable polling fallback
    enabled: !!paymentData && (step === "payment-details" || step === "status"),
    onStatusChange: (update) => {
      console.log("[TopupPage] Real-time payment status update:", update);
      
      // Update local payment state when status changes (Requirement 7.2)
      if (paymentData && update.topUpRequestId === paymentData.id) {
        setPaymentData({
          ...paymentData,
          status: update.status,
          paidAt: update.paidAt,
        });

        // Navigate to status page if not already there, TAPI HANYA jika bukan PENDING
        // (agar user masih bisa melihat detail pembayaran / instruksi transfer)
        if (
          step !== "status" && 
          ["PAID", "APPROVED", "REJECTED", "EXPIRED"].includes(update.status)
        ) {
          setStep("status");
        }
      }
    },
  });

  /* ── Step 1: Select Package ── */
  const handleSelectPackage = (pkg: typeof PACKAGES[0]) => {
    setSelectedPackage(pkg);
    setStep("select-method");
    setError(null);
  };

  /* ── Step 2: Select Method ── */
  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setError(null);
  };

  /* ── Step 3: Initiate Payment ── */
  const handleInitiatePayment = async () => {
    if (!selectedPackage || !selectedMethod) return;

    // Validate sub-selection for VA and E-Wallet
    if (selectedMethod === "VIRTUAL_ACCOUNT" && !selectedBank) {
      setError("Silakan pilih bank terlebih dahulu");
      return;
    }
    if (selectedMethod === "EWALLET" && !selectedWallet) {
      setError("Silakan pilih e-wallet terlebih dahulu");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await initiatePaymentAction(
        selectedPackage.cc,
        selectedPackage.price,
        selectedMethod,
        {
          bank: selectedMethod === "VIRTUAL_ACCOUNT" ? selectedBank : undefined,
          walletType: selectedMethod === "EWALLET" ? selectedWallet : undefined,
        }
      );

      if (result.success) {
        setPaymentData(result.data);
        setStep("payment-details");
      } else {
        setError(result.message || "Gagal membuat pembayaran");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  /* ── Handle test payment complete ── */
  const handleCompleteTest = async () => {
    if (!paymentData?.id) return;
    const result = await completeTestPaymentAction(paymentData.id);
    if (result.success) {
      setPaymentData({ ...paymentData, status: "PAID" });
      setStep("status");
    } else {
      throw new Error(result.message || "Gagal menyelesaikan pembayaran test");
    }
  };

  /* ── Reset flow ── */
  const handleReset = () => {
    setStep("select-package");
    setSelectedPackage(null);
    setSelectedMethod("");
    setSelectedBank("");
    setSelectedWallet("");
    setPaymentData(null);
    setError(null);
  };

  /* ── Step number indicator ── */
  const stepNumber = step === "select-package" ? 1 : step === "select-method" ? 2 : step === "payment-details" ? 3 : 4;

  return (
    <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <PageHeading
        eyebrow="Imperial Treasury"
        title="Isi Ulang Saldo"
        description="Top Up Crown Coins (CC) untuk berpartisipasi dalam lelang."
      />

      {/* Step indicator */}
      <div className="step-track" style={{ marginBottom: "32px" }}>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={n <= stepNumber ? "active" : ""}
            style={{
              transition: "all 0.3s",
              fontSize: "13px",
              fontWeight: n === stepNumber ? 700 : 400,
            }}
          >
            {n}
          </span>
        ))}
      </div>

      <AnimatedSection>
        {/* ════════════════════════════════════════════════ */}
        {/*  STEP 1: Select CC Package                      */}
        {/* ════════════════════════════════════════════════ */}
        {step === "select-package" && (
          <div>
            <h3 style={{
              fontFamily: "var(--font-subheading)",
              color: "var(--color-gold)",
              textAlign: "center",
              marginBottom: "24px",
              fontSize: "20px",
            }}>
              Pilih Jumlah Crown Coins
            </h3>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
              {PACKAGES.map((pkg, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectPackage(pkg)}
                  style={{
                    width: "240px",
                    background: "rgba(8, 24, 21, 0.8)",
                    border: pkg.popular
                      ? "2px solid var(--color-gold)"
                      : "1px solid rgba(201, 168, 76, 0.18)",
                    borderRadius: "12px",
                    padding: "28px 20px",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: pkg.popular ? "0 0 30px rgba(201, 168, 76, 0.15)" : "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(201, 168, 76, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = pkg.popular ? "0 0 30px rgba(201, 168, 76, 0.15)" : "none";
                  }}
                >
                  {pkg.popular && (
                    <div style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--color-gold)",
                      color: "#050508",
                      padding: "4px 16px",
                      borderRadius: "20px",
                      fontWeight: 700,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                      Terpopuler
                    </div>
                  )}

                  <h3 style={{
                    fontSize: "2rem",
                    color: "var(--color-gold)",
                    fontFamily: "var(--font-heading)",
                    margin: "12px 0",
                  }}>
                    {pkg.cc} CC
                  </h3>
                  <p style={{
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    margin: "8px 0",
                    fontFamily: "var(--font-numeric, monospace)",
                  }}>
                    Rp {pkg.price.toLocaleString("id-ID")}
                  </p>
                  <div style={{
                    marginTop: "16px",
                    padding: "10px",
                    background: "rgba(201, 168, 76, 0.08)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--color-emerald-light)",
                  }}>
                    Rp {(pkg.price / pkg.cc).toLocaleString("id-ID")} per CC
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/*  STEP 2: Select Payment Method                  */}
        {/* ════════════════════════════════════════════════ */}
        {step === "select-method" && selectedPackage && (
          <div>
            {/* Summary bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              padding: "12px 20px",
              background: "rgba(201, 168, 76, 0.08)",
              border: "1px solid rgba(201, 168, 76, 0.15)",
              borderRadius: "8px",
              marginBottom: "28px",
              flexWrap: "wrap",
            }}>
              <span style={{ color: "var(--color-gold-light)", fontFamily: "var(--font-numeric, monospace)", fontWeight: 700, fontSize: "18px" }}>
                {selectedPackage.cc} CC
              </span>
              <span style={{ color: "rgba(245, 240, 232, 0.3)" }}>=</span>
              <span style={{ fontFamily: "var(--font-numeric, monospace)", fontWeight: 700, fontSize: "18px" }}>
                Rp {selectedPackage.price.toLocaleString("id-ID")}
              </span>
              <button
                onClick={() => setStep("select-package")}
                style={{
                  fontSize: "12px",
                  color: "var(--color-gold)",
                  background: "none",
                  border: "1px solid rgba(201, 168, 76, 0.3)",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                Ubah
              </button>
            </div>

            <h3 style={{
              fontFamily: "var(--font-subheading)",
              color: "var(--color-gold)",
              textAlign: "center",
              marginBottom: "24px",
              fontSize: "20px",
            }}>
              Pilih Metode Pembayaran
            </h3>

            <PaymentMethodGrid onSelect={handleSelectMethod} selectedMethod={selectedMethod} />

            {/* Sub-selection for VA */}
            {selectedMethod === "VIRTUAL_ACCOUNT" && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", color: "var(--color-ivory)", marginBottom: "10px", fontFamily: "var(--font-subheading)" }}>
                  Pilih Bank:
                </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                  {BANKS.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      style={{
                        padding: "8px 20px",
                        background: selectedBank === bank.id ? "rgba(201, 168, 76, 0.2)" : "rgba(5, 5, 8, 0.5)",
                        border: `1px solid ${selectedBank === bank.id ? "var(--color-gold)" : "rgba(201, 168, 76, 0.2)"}`,
                        borderRadius: "6px",
                        color: selectedBank === bank.id ? "var(--color-gold)" : "var(--color-ivory)",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      {bank.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-selection for E-Wallet */}
            {selectedMethod === "EWALLET" && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", color: "var(--color-ivory)", marginBottom: "10px", fontFamily: "var(--font-subheading)" }}>
                  Pilih E-Wallet:
                </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                  {WALLETS.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => setSelectedWallet(wallet.id)}
                      style={{
                        padding: "8px 20px",
                        background: selectedWallet === wallet.id ? "rgba(16, 185, 129, 0.15)" : "rgba(5, 5, 8, 0.5)",
                        border: `1px solid ${selectedWallet === wallet.id ? "var(--color-emerald-primary)" : "rgba(201, 168, 76, 0.2)"}`,
                        borderRadius: "6px",
                        color: selectedWallet === wallet.id ? "var(--color-emerald-light)" : "var(--color-ivory)",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      {wallet.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{
                marginTop: "16px",
                padding: "10px 16px",
                background: "rgba(139, 26, 26, 0.2)",
                border: "1px solid rgba(139, 26, 26, 0.3)",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "13px",
                textAlign: "center",
              }}>
                {error}
              </div>
            )}

            {/* Confirm button */}
            {selectedMethod && (
              <div style={{ textAlign: "center", marginTop: "28px" }}>
                <button
                  onClick={handleInitiatePayment}
                  disabled={loading}
                  className="primary-action"
                  style={{
                    padding: "14px 40px",
                    fontSize: "16px",
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Memproses..." : "Lanjutkan Pembayaran"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/*  STEP 3: Payment Details (method-specific)      */}
        {/* ════════════════════════════════════════════════ */}
        {step === "payment-details" && paymentData && selectedPackage && (
          <div style={{ maxWidth: "500px", margin: "0 auto" }}>
            {selectedMethod === "QRIS" && (
              <QRISPaymentDisplay
                paymentDetails={paymentData.paymentDetails || {}}
                amount={selectedPackage.cc}
                fiatAmount={selectedPackage.price}
                expiresAt={paymentData.expiresAt}
              />
            )}

            {selectedMethod === "VIRTUAL_ACCOUNT" && (
              <VirtualAccountDisplay
                paymentDetails={paymentData.paymentDetails || {}}
                amount={selectedPackage.cc}
                fiatAmount={selectedPackage.price}
                expiresAt={paymentData.expiresAt}
              />
            )}

            {selectedMethod === "EWALLET" && (
              <EWalletPaymentDisplay
                paymentDetails={paymentData.paymentDetails || {}}
                amount={selectedPackage.cc}
                fiatAmount={selectedPackage.price}
                expiresAt={paymentData.expiresAt}
              />
            )}

            {selectedMethod === "TESTING" && (
              <TestingPaymentDisplay
                paymentDetails={paymentData.paymentDetails || {}}
                paymentId={paymentData.id}
                amount={selectedPackage.cc}
                fiatAmount={selectedPackage.price}
                expiresAt={paymentData.expiresAt}
                onComplete={handleCompleteTest}
              />
            )}

            {selectedMethod === "STRIPE" && (
              <div style={{
                padding: "32px",
                background: "rgba(8, 24, 21, 0.8)",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                borderRadius: "16px",
                textAlign: "center",
              }}>
                <h3 style={{ color: "var(--color-gold)", fontFamily: "var(--font-subheading)", marginBottom: "16px" }}>
                  Pembayaran Kartu Kredit/Debit
                </h3>
                <p style={{ color: "rgba(245, 240, 232, 0.6)", marginBottom: "24px" }}>
                  Anda akan diarahkan ke halaman pembayaran Stripe yang aman.
                </p>
                <a
                  href={paymentData.paymentDetails?.redirectUrl || paymentData.paymentDetails?.sessionUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-action"
                  style={{ display: "inline-block", padding: "14px 32px", textDecoration: "none" }}
                >
                  Bayar dengan Kartu
                </a>
              </div>
            )}

            {selectedMethod === "BANK_TRANSFER" && (
              <>
                <BankTransferDisplay
                  paymentDetails={paymentData.paymentDetails || {}}
                  amount={selectedPackage.cc}
                  fiatAmount={selectedPackage.price}
                  expiresAt={paymentData.expiresAt}
                />
                <div style={{ marginTop: "20px" }}>
                  <ProofUploader
                    paymentId={paymentData.id}
                    onSuccess={(imageUrl) => {
                      console.log("Proof uploaded:", imageUrl);
                      setStep("status");
                    }}
                    onError={(error) => {
                      console.error("Upload error:", error);
                    }}
                  />
                </div>
              </>
            )}

            {/* Back button */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={handleReset}
                style={{
                  background: "none",
                  border: "1px solid rgba(201, 168, 76, 0.3)",
                  color: "var(--color-gold)",
                  padding: "10px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Buat Pembayaran Baru
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/*  STEP 4: Status Tracking                        */}
        {/* ════════════════════════════════════════════════ */}
        {step === "status" && paymentData && (
          <div style={{ maxWidth: "500px", margin: "0 auto" }}>
            <PaymentStatusTracker
              status={paymentData.status || "PAID"}
              expiresAt={paymentData.expiresAt}
              adminNotes={paymentData.adminNotes}
              paidAt={paymentData.paidAt}
              reviewedAt={paymentData.reviewedAt}
              onRetry={handleReset}
            />
            
            {/* ProofUploader - Show for PENDING or PAID status */}
            {(paymentData.status === "PENDING" || paymentData.status === "PAID") && (
              <div style={{ marginTop: "20px" }}>
                <ProofUploader
                  paymentId={paymentData.id}
                  onSuccess={(imageUrl) => {
                    console.log("Proof uploaded:", imageUrl);
                    // Could refresh payment data here if needed
                  }}
                  onError={(error) => {
                    console.error("Upload error:", error);
                  }}
                />
              </div>
            )}
            
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={handleReset}
                style={{
                  background: "none",
                  border: "1px solid rgba(201, 168, 76, 0.3)",
                  color: "var(--color-gold)",
                  padding: "10px 24px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Buat Pembayaran Baru
              </button>
            </div>
          </div>
        )}
      </AnimatedSection>

      <div style={{ marginTop: "4rem", textAlign: "center", color: "rgba(245, 240, 232, 0.4)", fontSize: "13px" }}>
        <p>1 Crown Coin (CC) setara dengan denominasi mata uang Aurum Imperium.</p>
      </div>
    </main>
  );
}
