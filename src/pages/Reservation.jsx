import { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle, Calendar, Users, User, Mail, Phone, MessageSquare } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "./footer";
import { fetchTours } from "../api/tours";
import { createReservation } from "../api/reservations";
import "./Reservation.css";

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
  const [reservationData, setReservationData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadTours = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTours();
        if (!cancelled) {
          setTours(data);
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
  }, []);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitState("submitting");
    setApiError(null);

    try {
      const data = await createReservation({
        tourId: formState.tourId,
        travelDate: formState.travelDate,
        travelers: formState.travelers,
        fullName: formState.fullName.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        specialRequests: formState.specialRequests.trim() || undefined,
      });

      setReservationData(data);
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
            <div className="reservation-success" role="status" aria-live="polite">
              <CheckCircle size={48} />
              <h3>Reservation Submitted</h3>
              <p>Your reservation request has been received.</p>
              <div className="booking-details">
                <p><strong>Booking Reference:</strong> {reservationData.bookingReference}</p>
                <p><strong>Status:</strong> {reservationData.status}</p>
                <p><strong>Submitted:</strong> {new Date(reservationData.createdAt).toLocaleString()}</p>
              </div>
              <button type="button" onClick={() => { setSubmitState("idle"); setReservationData(null); }}>Make Another Request</button>
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
                  <div className="select-wrapper">
                    <Calendar className="input-icon" aria-hidden="true" />
                    <select
                      id="tour-select"
                      value={formState.tourId}
                      onChange={(e) => handleChange("tourId", e.target.value)}
                      required
                      disabled={tours.length === 0}
                    >
                      <option value="">Select a tour</option>
                      {tours.map((tour) => (
                        <option key={tour.id} value={tour.id}>
                          {tour.name} — {tour.destination_name} ({tour.currency} {tour.base_price})
                        </option>
                      ))}
                    </select>
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
                      placeholder="+1 234 567 890"
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
                      placeholder="Dietary requirements, accessibility needs, special occasions, etc."
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