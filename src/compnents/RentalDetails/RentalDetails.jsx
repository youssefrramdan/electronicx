import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { rentalApi } from "../../services/rentalApi";
import Style from "./RentalDetails.module.css";

const RentalDetails = () => {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentalDetails();
  }, [rentalId]);

  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      const response = await rentalApi.getRentalRequest(rentalId);

      if (response.status === "success") {
        setRental(response.data);
      }
    } catch (error) {
      console.error("Error fetching rental details:", error);
      if (error.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول أولاً");
        navigate("/login");
      } else if (error.response?.status === 404) {
        toast.error("Rental request not found");
        navigate("/my-rentals");
      } else {
        toast.error("Error loading rental details");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      active: "Active",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: Style.statusPending,
      approved: Style.statusApproved,
      rejected: Style.statusRejected,
      active: Style.statusActive,
      completed: Style.statusCompleted,
      cancelled: Style.statusCancelled,
    };
    return statusClasses[status] || "";
  };

  const getReturnConditionText = (condition) => {
    const conditionMap = {
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
      damaged: "Damaged",
    };
    return conditionMap[condition] || condition;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={Style.loading}>
        <div className={Style.spinner}></div>
        <p>Loading rental details...</p>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className={Style.error}>
        <h2>Rental request not found</h2>
        <button onClick={() => navigate("/my-rentals")}>
          Back to My Rentals
        </button>
      </div>
    );
  }

  return (
    <div className={Style.rentalDetails}>
      <div className={Style.container}>
        {/* Header */}
        <div className={Style.header}>
          <button
            className={Style.backButton}
            onClick={() => navigate("/my-rentals")}
          >
            <i className="fas fa-arrow-left"></i>
            Back to My Rentals
          </button>
          <div className={Style.titleSection}>
            <h1>Rental Request Details</h1>
            <p>Request ID: {rental._id}</p>
          </div>
          <div className={`${Style.status} ${getStatusClass(rental.status)}`}>
            {getStatusText(rental.status)}
          </div>
        </div>

        <div className={Style.content}>
          {/* Product Information */}
          <div className={Style.section}>
            <h2>
              <i className="fas fa-box"></i>
              Product Information
            </h2>
            <div className={Style.productCard}>
              <div className={Style.productImage}>
                <img
                  src={rental.product?.imageCover || "/placeholder-image.jpg"}
                  alt={rental.product?.title || rental.product?.name}
                />
              </div>
              <div className={Style.productInfo}>
                <h3>{rental.product?.title || rental.product?.name}</h3>
                <div className={Style.productMeta}>
                  <div className={Style.metaItem}>
                    <span className={Style.label}>Daily Rate:</span>
                    <span className={Style.value}>{rental.dailyRate} EGP</span>
                  </div>
                  <div className={Style.metaItem}>
                    <span className={Style.label}>Deposit Amount:</span>
                    <span className={Style.value}>
                      {rental.depositAmount} EGP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className={Style.section}>
            <h2>
              <i className="fas fa-user"></i>
              Personal Information
            </h2>
            <div className={Style.infoGrid}>
              <div className={Style.infoItem}>
                <span className={Style.label}>Full Name:</span>
                <span className={Style.value}>
                  {rental.personalInfo?.fullName}
                </span>
              </div>
              <div className={Style.infoItem}>
                <span className={Style.label}>Phone Number:</span>
                <span className={Style.value}>
                  {rental.personalInfo?.phone}
                </span>
              </div>
              <div className={Style.infoItem}>
                <span className={Style.label}>ID Card Number:</span>
                <span className={Style.value}>
                  {rental.personalInfo?.idCardNumber}
                </span>
              </div>
              <div className={Style.infoItem}>
                <span className={Style.label}>Address:</span>
                <span className={Style.value}>
                  {rental.personalInfo?.address}
                </span>
              </div>
            </div>
          </div>

          {/* ID Card Images */}
          <div className={Style.section}>
            <h2>
              <i className="fas fa-id-card"></i>
              ID Card Images
            </h2>
            <div className={Style.idImages}>
              <div className={Style.idImageCard}>
                <h4>Front Side</h4>
                <div className={Style.idImage}>
                  <img
                    src={rental.idCardImages?.front}
                    alt="ID Front"
                    onClick={() =>
                      window.open(rental.idCardImages?.front, "_blank")
                    }
                  />
                </div>
              </div>
              <div className={Style.idImageCard}>
                <h4>Back Side</h4>
                <div className={Style.idImage}>
                  <img
                    src={rental.idCardImages?.back}
                    alt="ID Back"
                    onClick={() =>
                      window.open(rental.idCardImages?.back, "_blank")
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period & Pricing */}
          <div className={Style.section}>
            <h2>
              <i className="fas fa-calendar-alt"></i>
              Rental Period & Pricing
            </h2>
            <div className={Style.rentalInfo}>
              <div className={Style.dateRange}>
                <div className={Style.dateItem}>
                  <span className={Style.label}>Requested Start Date:</span>
                  <span className={Style.value}>
                    {formatDateOnly(rental.requestedStartDate)}
                  </span>
                </div>
                <div className={Style.dateItem}>
                  <span className={Style.label}>Requested End Date:</span>
                  <span className={Style.value}>
                    {formatDateOnly(rental.requestedEndDate)}
                  </span>
                </div>
                {rental.actualStartDate && (
                  <div className={Style.dateItem}>
                    <span className={Style.label}>Actual Start Date:</span>
                    <span className={Style.value}>
                      {formatDateOnly(rental.actualStartDate)}
                    </span>
                  </div>
                )}
                {rental.actualEndDate && (
                  <div className={Style.dateItem}>
                    <span className={Style.label}>Actual End Date:</span>
                    <span className={Style.value}>
                      {formatDateOnly(rental.actualEndDate)}
                    </span>
                  </div>
                )}
              </div>

              <div className={Style.pricing}>
                <div className={Style.priceItem}>
                  <span className={Style.label}>Number of Days:</span>
                  <span className={Style.value}>{rental.rentalDays} days</span>
                </div>
                <div className={Style.priceItem}>
                  <span className={Style.label}>Daily Rate:</span>
                  <span className={Style.value}>{rental.dailyRate} EGP</span>
                </div>
                <div className={Style.priceItem}>
                  <span className={Style.label}>Total Rental:</span>
                  <span className={Style.value}>{rental.totalPrice} EGP</span>
                </div>
                <div className={Style.priceItem}>
                  <span className={Style.label}>Deposit Amount:</span>
                  <span className={Style.value}>
                    {rental.depositAmount} EGP
                  </span>
                </div>
                <div className={`${Style.priceItem} ${Style.total}`}>
                  <span className={Style.label}>Total Required:</span>
                  <span className={Style.value}>
                    {rental.totalPrice + rental.depositAmount} EGP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className={Style.section}>
            <h2>
              <i className="fas fa-history"></i>
              Request Timeline
            </h2>
            <div className={Style.timeline}>
              <div className={Style.timelineItem}>
                <div className={Style.timelineIcon}>
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className={Style.timelineContent}>
                  <h4>Request Submitted</h4>
                  <p>{formatDate(rental.createdAt)}</p>
                </div>
              </div>

              {rental.approvedAt && (
                <div className={Style.timelineItem}>
                  <div className={Style.timelineIcon}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className={Style.timelineContent}>
                    <h4>Request Approved</h4>
                    <p>{formatDate(rental.approvedAt)}</p>
                    {rental.approvedBy && (
                      <small>By: {rental.approvedBy.name}</small>
                    )}
                  </div>
                </div>
              )}

              {rental.rejectedAt && (
                <div className={Style.timelineItem}>
                  <div className={Style.timelineIcon}>
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <div className={Style.timelineContent}>
                    <h4>Request Rejected</h4>
                    <p>{formatDate(rental.rejectedAt)}</p>
                  </div>
                </div>
              )}

              {rental.returnedAt && (
                <div className={Style.timelineItem}>
                  <div className={Style.timelineIcon}>
                    <i className="fas fa-undo-alt"></i>
                  </div>
                  <div className={Style.timelineContent}>
                    <h4>Product Returned</h4>
                    <p>{formatDate(rental.returnedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Return Information */}
          {rental.status === "completed" && (
            <div className={Style.section}>
              <h2>
                <i className="fas fa-undo-alt"></i>
                Return Information
              </h2>
              <div className={Style.returnInfo}>
                {rental.returnCondition && (
                  <div className={Style.returnItem}>
                    <span className={Style.label}>
                      Product Condition on Return:
                    </span>
                    <span className={`${Style.value} ${Style.condition}`}>
                      {getReturnConditionText(rental.returnCondition)}
                    </span>
                  </div>
                )}
                <div className={Style.returnItem}>
                  <span className={Style.label}>Deposit Status:</span>
                  <span className={Style.value}>
                    {rental.depositReturned ? "Returned" : "Not returned yet"}
                  </span>
                </div>
                {rental.depositReturnedAmount > 0 && (
                  <div className={Style.returnItem}>
                    <span className={Style.label}>
                      Deposit Amount Returned:
                    </span>
                    <span className={Style.value}>
                      {rental.depositReturnedAmount} EGP
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {rental.adminNotes && (
            <div className={Style.section}>
              <h2>
                <i className="fas fa-sticky-note"></i>
                Admin Notes
              </h2>
              <div className={Style.adminNotes}>
                <p>{rental.adminNotes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RentalDetails;
