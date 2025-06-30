import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { rentalApi } from "../../services/rentalApi";
import Style from "./MyRentals.module.css";

const MyRentals = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRentals();
  }, [currentPage]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await rentalApi.getUserRentalRequests(currentPage, 10);

      if (response.status === "success") {
        setRentals(response.data);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error fetching rentals:", error);
      if (error.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول أولاً");
        navigate("/login");
      } else {
        toast.error("حدث خطأ في تحميل الإيجارات");
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredRentals = rentals.filter((rental) => {
    if (filter === "all") return true;
    return rental.status === filter;
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className={Style.loading}>
        <div className={Style.spinner}></div>
        <p>Loading rentals...</p>
      </div>
    );
  }

  return (
    <div className={Style.myRentals}>
      <div className={Style.container}>
        <div className={Style.header}>
          <div className={Style.titleSection}>
            <h1>My Rentals</h1>
            <p>Manage all your rental requests</p>
          </div>
          <Link to="/" className={Style.backButton}>
            <i className="fas fa-home"></i>
            Back to Home
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className={Style.filterTabs}>
          <button
            className={`${Style.filterTab} ${
              filter === "all" ? Style.active : ""
            }`}
            onClick={() => setFilter("all")}
          >
            <i className="fas fa-list"></i>
            All ({rentals.length})
          </button>
          <button
            className={`${Style.filterTab} ${
              filter === "pending" ? Style.active : ""
            }`}
            onClick={() => setFilter("pending")}
          >
            <i className="fas fa-clock"></i>
            Pending ({rentals.filter((r) => r.status === "pending").length})
          </button>
          <button
            className={`${Style.filterTab} ${
              filter === "active" ? Style.active : ""
            }`}
            onClick={() => setFilter("active")}
          >
            <i className="fas fa-play-circle"></i>
            Active ({rentals.filter((r) => r.status === "active").length})
          </button>
          <button
            className={`${Style.filterTab} ${
              filter === "completed" ? Style.active : ""
            }`}
            onClick={() => setFilter("completed")}
          >
            <i className="fas fa-check-circle"></i>
            Completed ({rentals.filter((r) => r.status === "completed").length})
          </button>
        </div>

        {/* Rentals List */}
        {filteredRentals.length === 0 ? (
          <div className={Style.emptyState}>
            <div className={Style.emptyIcon}>
              <i className="fas fa-calendar-times"></i>
            </div>
            <h2>No rentals found</h2>
            <p>
              {filter === "all"
                ? "You have not requested any rentals yet"
                : `No rentals found in status "${getStatusText(filter)}"`}
            </p>
            <Link to="/" className={Style.browseButton}>
              <i className="fas fa-search"></i>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className={Style.rentalsList}>
            {filteredRentals.map((rental) => (
              <div key={rental._id} className={Style.rentalCard}>
                <div className={Style.cardHeader}>
                  <div className={Style.productInfo}>
                    <div className={Style.productImage}>
                      <img
                        src={
                          rental.product?.imageCover || "/placeholder-image.jpg"
                        }
                        alt={rental.product?.title || rental.product?.name}
                      />
                    </div>
                    <div className={Style.productDetails}>
                      <h3>{rental.product?.title || rental.product?.name}</h3>
                      <p className={Style.rentalId}>
                        <i className="fas fa-hashtag"></i>
                        Rental ID: {rental._id.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`${Style.status} ${getStatusClass(
                      rental.status
                    )}`}
                  >
                    {getStatusText(rental.status)}
                  </div>
                </div>

                <div className={Style.cardBody}>
                  <div className={Style.rentalDetails}>
                    <div className={Style.detailItem}>
                      <span className={Style.label}>
                        <i className="fas fa-calendar-alt"></i>
                        Rental Period:
                      </span>
                      <span className={Style.value}>
                        {formatDate(rental.requestedStartDate)} -{" "}
                        {formatDate(rental.requestedEndDate)}
                      </span>
                    </div>
                    <div className={Style.detailItem}>
                      <span className={Style.label}>
                        <i className="fas fa-clock"></i>
                        Number of Days:
                      </span>
                      <span className={Style.value}>
                        {rental.rentalDays} days
                      </span>
                    </div>
                    <div className={Style.detailItem}>
                      <span className={Style.label}>
                        <i className="fas fa-money-bill-wave"></i>
                        Total Cost:
                      </span>
                      <span className={Style.value}>
                        {rental.totalPrice} EGP
                      </span>
                    </div>
                    {rental.depositAmount > 0 && (
                      <div className={Style.detailItem}>
                        <span className={Style.label}>
                          <i className="fas fa-shield-alt"></i>
                          Deposit Amount:
                        </span>
                        <span className={Style.value}>
                          {rental.depositAmount} EGP
                        </span>
                      </div>
                    )}
                  </div>

                  {rental.adminNotes && (
                    <div className={Style.adminNotes}>
                      <h4>
                        <i className="fas fa-sticky-note"></i>
                        Admin Notes:
                      </h4>
                      <p>{rental.adminNotes}</p>
                    </div>
                  )}

                  <div className={Style.timestamps}>
                    <div className={Style.timestamp}>
                      <i className="fas fa-plus-circle"></i>
                      Request Date: {formatDate(rental.createdAt)}
                    </div>
                    {rental.approvedAt && (
                      <div className={Style.timestamp}>
                        <i className="fas fa-check-circle"></i>
                        Approval Date: {formatDate(rental.approvedAt)}
                      </div>
                    )}
                    {rental.returnedAt && (
                      <div className={Style.timestamp}>
                        <i className="fas fa-undo-alt"></i>
                        Return Date: {formatDate(rental.returnedAt)}
                      </div>
                    )}
                  </div>
                </div>

                <div className={Style.cardFooter}>
                  <Link
                    to={`/rental-details/${rental._id}`}
                    className={Style.detailsButton}
                  >
                    <i className="fas fa-eye"></i>
                    View Details
                  </Link>

                  {rental.status === "pending" && (
                    <button
                      className={Style.cancelButton}
                      onClick={() => {
                        // TODO: Implement cancel functionality
                        toast.info(
                          "Cancellation functionality will be added soon"
                        );
                      }}
                    >
                      <i className="fas fa-times"></i>
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={Style.pagination}>
            <button
              className={Style.pageButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-right"></i>
              Previous
            </button>

            <div className={Style.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`${Style.pageNumber} ${
                      currentPage === page ? Style.active : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              className={Style.pageButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <i className="fas fa-chevron-left"></i>
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default MyRentals;
