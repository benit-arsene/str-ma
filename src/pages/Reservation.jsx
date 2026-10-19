import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Lock,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Users,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "./footer";
import { fetchTours } from "../api/tours";
import { createReservation } from "../api/reservations";
import "./Reservation.css";
import {
  initiatePayment,
  simulatePaymentOutcome,
  fetchPayment,
  ApiError,
} from "../api/payments";

// Payment simulation is a development/testing capability only. Vite replaces
// `import.meta.env.DEV` with `false` for `vite build`, so the developer panel
// below is compiled out of the customer-facing production bundle entirely. The
// server additionally refuses `/api/payments/simulate` unless
// PAYMENT_SIMULATION_ENABLED=true (see backend/.env.example).
const DEV_PAYMENT_SIMULATION = import.meta.env.DEV;

const formatMoney = (value, currency) => {
  if (value === null || value === undefined || value === "") return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  const formatted = numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${formatted}` : formatted;
};

const formatTravelDate = (value) => {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString();
};

function Reservation() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formState, setFormState] = useState({
    tourId: "",
    travelDate: "",
    travelers: 1,
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [submitState, setSubmitState] = useState("idle");
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  // Snapshot of what the customer booked. `formState` is cleared once the
  // reservation is created, and the reservation response only carries the
  // booking reference, so the checkout summary reads from this instead.
  const [bookingSummary, setBookingSummary] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  // idle | initiating | awaiting | simulating | succeeded | failed | cancelled | error
  const [paymentStep, setPaymentStep] = useState("idle");
  const [paymentError, setPaymentError] = useState(null);
  const [paymentChecking, setPaymentChecking] = useState(false);
  const [searchParams] = useSearchParams();
  const tourParam = searchParams.get("tour");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loadTours = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTours();
        if (!cancelled) {
          setTours(data);

          const requestedTour = tourParam
            ? data.find((t) => t.id === tourParam)
            : null;
          if (requestedTour) {
            setFormState((prev) =>
              prev.tourId === requestedTour.id
                ? prev
                : { ...prev, tourId: requestedTour.id }
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadTours();
    return () => {
      cancelled = true;
    };
  }, [tourParam]);

  const validateForm = () => {
    const errors = {};
    if (!formState.tourId) errors.tourId = "Please select a tour";
    if (!formState.travelDate) errors.travelDate = "Please select a travel date";
    if (!formState.travelers || formState.travelers < 1) errors.travelers = "At least 1 traveler required";
    if (!formState.fullName.trim()) errors.fullName = "Full name is required";
    if (!formState.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) errors.email = "Invalid email format";
    if (!formState.phone.trim()) errors.phone = "Phone number is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const toggleDropdown = () => {
    if (tours.length === 0) return;
    setDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitState("submitting");
    setApiError(null);

    try {
      const selected = tours.find((t) => t.id === formState.tourId);

      const data = await createReservation({
        tourId: formState.tourId,
        travelDate: formState.travelDate,
        travelers: formState.travelers,
        fullName: formState.fullName.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        specialRequests: formState.specialRequests.trim() || undefined,
      });

      setBookingSummary({
        tourName: selected?.name || "Selected tour",
        destination: selected?.destination_name || "",
        currency: selected?.currency || "",
        pricePerPerson: selected?.base_price ?? null,
        travelers: formState.travelers,
        travelDate: formState.travelDate,
        email: formState.email.trim(),
      });
      setReservationData(data);
      setPaymentData(null);
      setPaymentStep("idle");
      setPaymentError(null);
      setSubmitState("success");
      setFormState({
        tourId: "",
        travelDate: "",
        travelers: 1,
        fullName: "",
        email: "",
        phone: "",
        specialRequests: "",
      });
    } catch (err) {
      setApiError(err.message);
      setSubmitState("error");
    }
  };

  const getSelectedTour = () => {
    return tours.find((t) => t.id === formState.tourId);
  };

  const paymentInFlight =
    paymentStep === "initiating" || paymentStep === "confirming";
  const paymentBusy = paymentInFlight || paymentChecking;
  // The transaction is registered on the server but is not settled yet, so the
  // placeholder checkout is waiting for the customer to confirm it.
  const placeholderCheckout =
    paymentStep === "placeholder" || paymentStep === "confirming";

  const estimatedTotal =
    bookingSummary && bookingSummary.pricePerPerson != null
      ? Number(bookingSummary.pricePerPerson) * Number(bookingSummary.travelers || 1)
      : null;
  // Once a transaction exists the server-computed amount wins: pricing and the
  // 3% gateway fee are calculated in PostgreSQL, never in the browser.
  const checkoutAmount = paymentData?.amount ?? estimatedTotal;
  const checkoutCurrency = paymentData?.currency ?? bookingSummary?.currency ?? "";
  const checkoutStatus =
    paymentStep === "succeeded" ? "confirmed" : reservationData?.status;

  // Maps a server-reported transaction status onto a UI step. Only the server
  // can report "succeeded"; no client action ever sets that state directly.
  const applyPayment = (payment) => {
    setPaymentData(payment);
    if (payment.status === "succeeded") {
      setPaymentStep("succeeded");
    } else if (payment.status === "failed") {
      setPaymentStep("failed");
    } else if (payment.status === "cancelled") {
      setPaymentStep("cancelled");
    } else {
      // "initiated" / "processing": not settled, so never presented as paid.
      setPaymentStep("placeholder");
    }
  };

  const startPayment = async (reservationId) => {
    setPaymentStep("initiating");
    setPaymentError(null);
    try {
      // Initiating only registers the transaction and returns the authoritative
      // amount. Pay Now never settles a payment: the outcome is decided by the
      // payment service when the customer confirms the placeholder checkout.
      const payment = await initiatePayment(reservationId);
      applyPayment(payment);
    } catch (err) {
      // initiatePayment is idempotent per reservation, so retrying is safe: it
      // reuses any existing active transaction and never creates a duplicate.
      setPaymentStep("error");
      setPaymentError(
        err.message || "We could not register your payment request. Please try again."
      );
    }
  };

  const recoverPayment = async () => {
    // Used after an ambiguous wire/5xx failure: ask the server for the true
    // state instead of guessing an outcome.
    if (!paymentData?.transactionReference) {
      setPaymentStep("error");
      setPaymentError("Unable to recover payment state. Please try again.");
      return;
    }
    try {
      const payment = await fetchPayment(paymentData.transactionReference);
      applyPayment(payment);
    } catch (err) {
      setPaymentStep("error");
      setPaymentError(err.message);
    }
  };

  const handleRetry = async () => {
    if (paymentBusy) return;
    setPaymentError(null);

    if (!reservationData?.id) return;

    // With a known transaction, resolve its real status before anything else.
    if (paymentData?.transactionReference) {
      setPaymentChecking(true);
      try {
        const existingPayment = await fetchPayment(paymentData.transactionReference);

        if (existingPayment.status === "succeeded") {
          applyPayment(existingPayment);
          return;
        }
        if (existingPayment.status === "initiated" || existingPayment.status === "processing") {
          applyPayment(existingPayment);
          return;
        }
        // failed / cancelled: a fresh attempt on the SAME reservation is
        // allowed and does not create a second reservation.
      } catch {
        setPaymentStep("error");
        setPaymentError("Unable to verify payment status. Please try again.");
        return;
      } finally {
        setPaymentChecking(false);
      }
    }

    await startPayment(reservationData.id);
  };

  // The placeholder checkout confirmation. This is the only customer action
  // that can settle the transaction, and it still asks the payment service for
  // the outcome: the UI never assumes success on its own.
  const handleConfirmPayment = async () => {
    if (paymentBusy || paymentStep !== "placeholder") return;

    const transactionReference = paymentData?.transactionReference;
    if (!transactionReference) {
      setPaymentStep("error");
      setPaymentError("Unable to confirm payment: no payment reference. Please try again.");
      return;
    }

    setPaymentStep("confirming");
    setPaymentError(null);
    try {
      const payment = await simulatePaymentOutcome(transactionReference, "success");
      applyPayment(payment);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // The placeholder payment service is not enabled on this API. Say so
        // plainly instead of pretending anything was paid.
        setPaymentStep("placeholder");
        setPaymentError(
          "Placeholder payments are not enabled on this server, so the payment could not be confirmed. No money has been taken."
        );
        return;
      }
      // Any other definitive 4xx reply, or an ambiguous wire/5xx failure: only
      // the server knows the true state, so re-read it rather than guessing.
      try {
        const payment = await fetchPayment(transactionReference);
        applyPayment(payment);
        if (payment.status === "initiated" || payment.status === "processing") {
          setPaymentError(
            "The payment could not be confirmed, so it is still pending. No money has been taken - please try again."
          );
        }
      } catch (recoverErr) {
        setPaymentStep("error");
        setPaymentError(
          recoverErr.message || "Unable to verify the payment state. Please try again."
        );
      }
    }
  };

  // Developer-only path for the simulated gateway. Callable only when
  // DEV_PAYMENT_SIMULATION is true and only while a transaction is unsettled.
  // The customer-facing success path is the Confirm Payment action above.
  const handleSimulateOutcome = async (outcome) => {
    if (!DEV_PAYMENT_SIMULATION || paymentStep !== "placeholder" || !paymentData) return;
    setPaymentStep("confirming");
    setPaymentError(null);
    try {
      const payment = await simulatePaymentOutcome(
        paymentData.transactionReference,
        outcome,
      );
      applyPayment(payment);
    } catch (err) {
      if (err instanceof ApiError && err.status < 500) {
        // Definitive reply (simulation disabled, reservation ineligible, ...):
        // keep the transaction and surface the reason.
        setPaymentStep("placeholder");
        setPaymentError(err.message);
        return;
      }
      // Ambiguous failure - recover the true state rather than assuming one.
      await recoverPayment();
    }
  };

  // Step one of the customer flow: register the transaction only. This never
  // selects an outcome and never settles the payment.
  const handlePayNow = () => {
    if (paymentBusy || !reservationData?.id) return;
    startPayment(reservationData.id);
  };

  const resetAll = () => {
    setBookingSummary(null);
    setReservationData(null);
    setPaymentData(null);
    setPaymentStep("idle");
    setPaymentError(null);
    setPaymentChecking(false);
    setApiError(null);
    setSubmitState("idle");
    setValidationErrors({});
    setFormState({
      tourId: "",
      travelDate: "",
      travelers: 1,
      fullName: "",
      email: "",
      phone: "",
      specialRequests: "",
    });
  };

  const selectedTour = getSelectedTour();

  if (loading) {
    return (
      <>
        <Navbar />
        <section className="reservation-page">
          <div className="reservation-loading">
            <Loader2 size={40} className="spinner" />
            <p>Loading available tours...</p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <section className="reservation-page">
          <div className="reservation-error">
            <AlertCircle size={40} />
            <p>Failed to load tours</p>
            <p className="error-detail">{error}</p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="reservation-page">
        <div className="reservation-container">
          <header className="reservation-header">
            <h4>| Make a Reservation</h4>
            <h2>Reserve Your <strong>Dream Tour</strong></h2>
            <p>Fill out the form below to submit a reservation request. Our team will contact you shortly to confirm availability and details.</p>
          </header>

          {submitState === "success" && reservationData && (
            <div className="checkout-card">
              <div className="checkout-intro">
                <span className="checkout-intro-icon">
                  <CheckCircle size={40} aria-hidden="true" />
                </span>
                <h3>Reservation Created</h3>
                <p>
                  Your booking request has been received. Review your order and continue
                  below - your booking reference stays the same throughout.
                </p>
              </div>

              <div className="booking-details">
                <p><strong>Booking Reference:</strong> {reservationData.bookingReference}</p>
                <p><strong>Status:</strong> {checkoutStatus}</p>
                <p><strong>Submitted:</strong> {new Date(reservationData.createdAt).toLocaleString()}</p>
                {bookingSummary?.email && (
                  <p><strong>Confirmation Email:</strong> {bookingSummary.email}</p>
                )}
              </div>

              <div className="payment-summary">
                <h3>Order Summary</h3>
                {bookingSummary && (
                  <>
                    <div className="summary-row">
                      <span>Tour</span>
                      <span>{bookingSummary.tourName}</span>
                    </div>
                    {bookingSummary.destination && (
                      <div className="summary-row">
                        <span>Destination</span>
                        <span>{bookingSummary.destination}</span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Travel Date</span>
                      <span>{formatTravelDate(bookingSummary.travelDate)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Travelers</span>
                      <span>{bookingSummary.travelers}</span>
                    </div>
                    {bookingSummary.pricePerPerson != null && (
                      <div className="summary-row">
                        <span>Price Per Person</span>
                        <span>
                          {formatMoney(
                            bookingSummary.pricePerPerson,
                            bookingSummary.currency
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="summary-row summary-row-total">
                  <span>Total Due</span>
                  <span>{formatMoney(checkoutAmount, checkoutCurrency)}</span>
                </div>
                {paymentData?.gatewayFee != null && (
                  <p className="summary-note">
                    Includes a {formatMoney(paymentData.gatewayFee, checkoutCurrency)} payment
                    processing fee.
                  </p>
                )}
                {!paymentData && (
                  <p className="summary-note">
                    The final amount is confirmed by our secure payment service before any
                    charge is made.
                  </p>
                )}
              </div>

              <div className="checkout-payment" aria-live="polite">
                {paymentStep === "succeeded" && (
                  <div className="payment-state payment-state-success">
                    <CheckCircle size={32} aria-hidden="true" />
                    <h4>Payment Confirmed</h4>
                    <p>
                      The payment service confirmed this placeholder payment and your
                      reservation is now confirmed. No real money was charged.
                    </p>
                    <div className="payment-breakdown">
                      <div className="payment-breakdown-row">
                        <span>Amount</span>
                        <span>{formatMoney(paymentData?.amount, checkoutCurrency)}</span>
                      </div>
                      <div className="payment-breakdown-row">
                        <span>Booking reference</span>
                        <span className="payment-breakdown-mono">
                          {reservationData.bookingReference}
                        </span>
                      </div>
                      <div className="payment-breakdown-row is-total">
                        <span>Payment reference</span>
                        <span className="payment-breakdown-mono">
                          {paymentData?.transactionReference}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {(paymentStep === "failed" || paymentStep === "cancelled") && (
                  <div className="payment-state payment-state-warning">
                    <AlertCircle size={32} aria-hidden="true" />
                    <h4>
                      {paymentStep === "failed"
                        ? "Payment Could Not Be Completed"
                        : "Payment Was Cancelled"}
                    </h4>
                    <p>
                      No money has been taken and your reservation is still pending. You can
                      try again whenever you are ready.
                    </p>
                    {paymentData?.transactionReference && (
                      <p className="payment-reference">
                        Transaction Reference: <strong>{paymentData.transactionReference}</strong>
                      </p>
                    )}
                  </div>
                )}

                {placeholderCheckout && (
                  <div className="payment-state payment-state-info">
                    <ShieldCheck size={32} aria-hidden="true" />
                    <h4>Placeholder Payment Checkout</h4>
                    <p>
                      This is a placeholder payment experience: no card details are collected
                      and <strong>no real money will be charged</strong>. Confirming records a
                      simulated payment against this booking so the reservation can be
                      confirmed.
                    </p>
                    <div className="payment-breakdown">
                      <div className="payment-breakdown-row">
                        <span>Amount</span>
                        <span>{formatMoney(paymentData?.amount, checkoutCurrency)}</span>
                      </div>
                      <div className="payment-breakdown-row">
                        <span>Gateway fee (3%)</span>
                        <span>{formatMoney(paymentData?.gatewayFee, checkoutCurrency)}</span>
                      </div>
                      <div className="payment-breakdown-row">
                        <span>Net after gateway fee</span>
                        <span>{formatMoney(paymentData?.merchantNet, checkoutCurrency)}</span>
                      </div>
                      <div className="payment-breakdown-row is-total">
                        <span>Total due</span>
                        <span>{formatMoney(paymentData?.amount, checkoutCurrency)}</span>
                      </div>
                    </div>
                    {paymentData?.transactionReference && (
                      <p className="payment-reference">
                        Payment Reference: <strong>{paymentData.transactionReference}</strong>
                      </p>
                    )}
                    {paymentError && <p className="payment-state-detail">{paymentError}</p>}
                  </div>
                )}

                {paymentStep === "error" && paymentError && (
                  <div className="payment-state payment-state-error" role="alert">
                    <AlertCircle size={32} aria-hidden="true" />
                    <h4>Something Went Wrong</h4>
                    <p>{paymentError}</p>
                  </div>
                )}

                {(paymentStep === "idle" || paymentStep === "initiating") && (
                  <div className="checkout-actions">
                    <button
                      type="button"
                      className="pay-button"
                      onClick={handlePayNow}
                      disabled={paymentBusy}
                      aria-busy={paymentInFlight}
                    >
                      {paymentInFlight ? (
                        <>
                          <Loader2 size={20} className="spinner" aria-hidden="true" />
                          Registering Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard size={20} aria-hidden="true" />
                          Pay Now
                        </>
                      )}
                    </button>
                    <p className="payment-note">
                      <Lock size={14} aria-hidden="true" />
                      Placeholder checkout - starting it never charges anything. You confirm
                      the payment in the next step.
                    </p>
                  </div>
                )}

                {(paymentStep === "failed" ||
                  paymentStep === "cancelled" ||
                  paymentStep === "error") && (
                  <div className="checkout-actions">
                    <button
                      type="button"
                      className="pay-button"
                      onClick={handleRetry}
                      disabled={paymentBusy}
                      aria-busy={paymentBusy}
                    >
                      {paymentBusy ? (
                        <>
                          <Loader2 size={20} className="spinner" aria-hidden="true" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={20} aria-hidden="true" />
                          Try Again
                        </>
                      )}
                    </button>
                    <p className="payment-note">
                      Your booking reference is unchanged and a new attempt never creates a
                      second reservation.
                    </p>
                  </div>
                )}

                {placeholderCheckout && (
                  <div className="checkout-actions">
                    <button
                      type="button"
                      className="pay-button"
                      onClick={handleConfirmPayment}
                      disabled={paymentBusy}
                      aria-busy={paymentBusy}
                    >
                      {paymentStep === "confirming" ? (
                        <>
                          <Loader2 size={20} className="spinner" aria-hidden="true" />
                          Confirming Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard size={20} aria-hidden="true" />
                          Confirm Payment
                        </>
                      )}
                    </button>
                    <p className="payment-note">
                      <Lock size={14} aria-hidden="true" />
                      Confirming asks our payment service for the result. Your reservation is
                      confirmed only if it reports the payment as successful.
                    </p>
                  </div>
                )}

                {DEV_PAYMENT_SIMULATION && placeholderCheckout && paymentData && (
                  <div className="dev-simulation">
                    <p className="dev-simulation-title">
                      <AlertTriangle size={16} aria-hidden="true" />
                      Developer tools: simulated payment gateway
                    </p>
                    <p className="dev-simulation-note">
                      Development builds only. These controls call POST /api/payments/simulate
                      to exercise the failure and cancellation paths (the customer Confirm
                      Payment action covers success). They move no real money and are not part
                      of the customer checkout.
                    </p>
                    <div className="dev-simulation-actions">
                      <button
                        type="button"
                        onClick={() => handleSimulateOutcome("success")}
                        disabled={paymentBusy}
                      >
                        Simulate Success
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateOutcome("failure")}
                        disabled={paymentBusy}
                      >
                        Simulate Failure
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateOutcome("cancellation")}
                        disabled={paymentBusy}
                      >
                        Simulate Cancellation
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="checkout-footer">
                <button type="button" className="link-button" onClick={resetAll}>
                  Make another reservation request
                </button>
              </div>
            </div>
          )}

          {submitState === "error" && apiError && (
            <div className="reservation-error-inline" role="alert">
              <AlertCircle size={20} />
              <p>{apiError}</p>
              <button type="button" onClick={() => { setSubmitState("idle"); setApiError(null); }}>Try Again</button>
            </div>
          )}

          {submitState !== "success" && (
            <form className="reservation-form" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="tour-select">Tour <span className="required">*</span></label>
                  <div
                    ref={selectRef}
                    className={`select-wrapper custom-select-wrapper ${dropdownOpen ? "open" : ""}`}
                  >
                    <Calendar className="input-icon" aria-hidden="true" />
                    <div
                      id="tour-select"
                      role="button"
                      tabIndex={0}
                      aria-expanded={dropdownOpen}
                      aria-label="Select a tour"
                      className={`custom-select-trigger ${formState.tourId ? "has-value" : ""}`}
                      onClick={toggleDropdown}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleDropdown();
                        }
                        if (e.key === "Escape") {
                          setDropdownOpen(false);
                        }
                      }}
                    >
                      {formState.tourId ? (
                        <span className="custom-select-value">
                          {tours.find((t) => t.id === formState.tourId)?.name}
                        </span>
                      ) : (
                        <span className="custom-select-placeholder">Select a tour</span>
                      )}
                      <svg
                        className="custom-select-arrow"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#999"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    {dropdownOpen && (
                      <div className="custom-dropdown-list" role="listbox">
                        <div
                          role="option"
                          aria-selected={!formState.tourId}
                          className={`custom-dropdown-item ${!formState.tourId ? "selected" : ""}`}
                          onClick={() => handleChange("tourId", "")}
                        >
                          Select a tour
                        </div>
                        {tours.map((tour) => (
                          <div
                            key={tour.id}
                            role="option"
                            aria-selected={formState.tourId === tour.id}
                            className={`custom-dropdown-item ${formState.tourId === tour.id ? "selected" : ""}`}
                            onClick={() => {
                              handleChange("tourId", tour.id);
                              setDropdownOpen(false);
                            }}
                          >
                            {tour.name} - {tour.destination_name} ({tour.currency} {tour.base_price})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {validationErrors.tourId && <span className="field-error">{validationErrors.tourId}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="travel-date">Travel Date <span className="required">*</span></label>
                  <div className="select-wrapper">
                    <Calendar className="input-icon" aria-hidden="true" />
                    <input
                      type="date"
                      id="travel-date"
                      value={formState.travelDate}
                      onChange={(e) => handleChange("travelDate", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  {validationErrors.travelDate && <span className="field-error">{validationErrors.travelDate}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="travelers">Number of Travelers <span className="required">*</span></label>
                  <div className="select-wrapper">
                    <Users className="input-icon" aria-hidden="true" />
                    <input
                      type="number"
                      id="travelers"
                      value={formState.travelers}
                      onChange={(e) => handleChange("travelers", parseInt(e.target.value) || 1)}
                      min="1"
                      max="20"
                      required
                    />
                  </div>
                  {validationErrors.travelers && <span className="field-error">{validationErrors.travelers}</span>}
                </div>

                <div className="form-field full-width">
                  <label htmlFor="full-name">Full Name <span className="required">*</span></label>
                  <div className="select-wrapper">
                    <User className="input-icon" aria-hidden="true" />
                    <input
                      type="text"
                      id="full-name"
                      value={formState.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  {validationErrors.fullName && <span className="field-error">{validationErrors.fullName}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email Address <span className="required">*</span></label>
                  <div className="select-wrapper">
                    <Mail className="input-icon" aria-hidden="true" />
                    <input
                      type="email"
                      id="email"
                      value={formState.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                  <div className="select-wrapper">
                    <Phone className="input-icon" aria-hidden="true" />
                    <input
                      type="tel"
                      id="phone"
                      value={formState.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+250 799 347 619"
                      required
                    />
                  </div>
                  {validationErrors.phone && <span className="field-error">{validationErrors.phone}</span>}
                </div>

                <div className="form-field full-width">
                  <label htmlFor="special-requests">Special Requests (Optional)</label>
                  <div className="textarea-wrapper">
                    <MessageSquare className="input-icon" aria-hidden="true" />
                    <textarea
                      id="special-requests"
                      value={formState.specialRequests}
                      onChange={(e) => handleChange("specialRequests", e.target.value)}
                      placeholder="Special Occasions, Special Needs, etc."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {selectedTour && (
                <div className="tour-summary">
                  <h3>Selected Tour Summary</h3>
                  <div className="tour-summary-content">
                    <div className="tour-summary-image">
                      {selectedTour.primary_image?.image_url && (
                        <img src={selectedTour.primary_image.image_url} alt={selectedTour.name} />
                      )}
                    </div>
                    <div className="tour-summary-details">
                      <h4>{selectedTour.name}</h4>
                      <p className="destination">{selectedTour.destination_name}</p>
                      {selectedTour.short_description && (
                        <p className="tour-description">{selectedTour.short_description}</p>
                      )}
                      <div className="tour-meta">
                        <span><strong>Duration:</strong> {selectedTour.duration_days} days</span>
                        <span><strong>Group Size:</strong> {selectedTour.group_size}{selectedTour.group_size_is_minimum ? "+" : ""} People</span>
                        <span><strong>Price:</strong> {selectedTour.currency} {selectedTour.base_price} per person</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={submitState === "submitting" || tours.length === 0}
              >
                {submitState === "submitting" ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Submitting...
                  </>
                ) : (
                  "SUBMIT RESERVATION REQUEST"
                )}
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Reservation;
