import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Style from "./AdminRentals.module.css";
import rentalApi from "../../services/rentalApi";

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    active: 0,
    completed: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchRentals();
    fetchStats();
  }, [currentPage, filter, searchTerm]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await rentalApi.getAllRentals({
        page: currentPage,
        limit: 10,
        status: filter === "all" ? undefined : filter,
        search: searchTerm,
      });

      console.log("Rentals API Response:", response); // Debug log

      if (response && response.status === "success") {
        // Based on the backend controller, data is directly in response.data
        const rentalsData = response.data || [];
        setRentals(rentalsData);
        setTotalPages(response.totalPages || 1);
      } else {
        console.log("No success status, setting empty array");
        setRentals([]);
      }
    } catch (error) {
      console.error("Error fetching rentals:", error);
      toast.error("Error loading rental requests");
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await rentalApi.getRentalStats();
      console.log("Stats API Response:", response); // Debug log

      if (response && response.status === "success") {
        // Transform the backend stats format to frontend format
        const backendStats = response.data;
        const statusBreakdown = backendStats.statusBreakdown || [];

        const transformedStats = {
          total: backendStats.totalRequests || 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          active: 0,
          completed: 0,
          cancelled: 0,
        };

        // Convert the status breakdown array to our format
        statusBreakdown.forEach((stat) => {
          if (transformedStats.hasOwnProperty(stat._id)) {
            transformedStats[stat._id] = stat.count;
          }
        });

        setStats(transformedStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep default stats on error
    }
  };

  const handleStatusUpdate = async (rentalId, newStatus, adminNotes = "") => {
    try {
      const response = await rentalApi.updateRentalStatus(rentalId, {
        status: newStatus,
        adminNotes,
      });

      if (response.status === "success") {
        toast.success(`Rental request ${newStatus} successfully`);
        fetchRentals();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating rental status");
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredRentals = (rentals || []).filter((rental) => {
    if (filter === "all") return true;
    return rental.status === filter;
  });

  const StatusUpdateModal = ({ rental, onClose, onUpdate }) => {
    const [selectedStatus, setSelectedStatus] = useState(rental.status);
    const [notes, setNotes] = useState(rental.adminNotes || "");

    const handleSubmit = (e) => {
      e.preventDefault();
      onUpdate(rental._id, selectedStatus, notes);
      onClose();
    };

    return (
      <div className={Style.modalOverlay} onClick={onClose}>
        <div className={Style.modal} onClick={(e) => e.stopPropagation()}>
          <div className={Style.modalHeader}>
            <h3>Update Rental Status</h3>
            <button onClick={onClose} className={Style.closeBtn}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit} className={Style.modalForm}>
            <div className={Style.formGroup}>
              <label>Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={Style.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className={Style.formGroup}>
              <label>Admin Notes:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                placeholder="Add notes for the customer..."
                className={Style.notesTextarea}
              />
            </div>
            <div className={Style.modalActions}>
              <button
                type="button"
                onClick={onClose}
                className={Style.cancelBtn}
              >
                Cancel
              </button>
              <button type="submit" className={Style.updateBtn}>
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const [selectedRental, setSelectedRental] = useState(null);

  return (
    <div className={Style.adminRentals}>
      {/* Header */}
      <div className={Style.pageHeader}>
        <div className={Style.headerLeft}>
          <h1>
            <i className="fas fa-calendar-alt"></i>
            Rental Management
          </h1>
          <p>Manage all rental requests and bookings</p>
        </div>
        <div className={Style.headerRight}>
          <button
            onClick={() => {
              fetchRentals();
              fetchStats();
            }}
            className={Style.refreshBtn}
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={Style.statsGrid}>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <i className="fas fa-list"></i>
          </div>
          <div className={Style.statInfo}>
            <h3>{stats.total}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <i className="fas fa-clock"></i>
          </div>
          <div className={Style.statInfo}>
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className={Style.statInfo}>
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <i className="fas fa-play-circle"></i>
          </div>
          <div className={Style.statInfo}>
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <i className="fas fa-check-double"></i>
          </div>
          <div className={Style.statInfo}>
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <i className="fas fa-times-circle"></i>
          </div>
          <div className={Style.statInfo}>
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={Style.filtersSection}>
        <div className={Style.filterTabs}>
          {[
            "all",
            "pending",
            "approved",
            "active",
            "completed",
            "rejected",
          ].map((status) => (
            <button
              key={status}
              className={`${Style.filterTab} ${
                filter === status ? Style.active : ""
              }`}
              onClick={() => {
                setFilter(status);
                setCurrentPage(1);
              }}
            >
              {status === "all" ? "All" : getStatusText(status)}
              {status !== "all" && (
                <span className={Style.count}>({stats[status] || 0})</span>
              )}
            </button>
          ))}
        </div>
        <div className={Style.searchBox}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by product name, customer name, or rental ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Rentals Table */}
      <div className={Style.tableContainer}>
        {loading ? (
          <div className={Style.loading}>
            <div className={Style.spinner}></div>
            <p>Loading rental requests...</p>
          </div>
        ) : !filteredRentals || filteredRentals.length === 0 ? (
          <div className={Style.emptyState}>
            <i className="fas fa-calendar-times"></i>
            <h3>No rental requests found</h3>
            <p>There are no rental requests matching your criteria.</p>
          </div>
        ) : (
          <table className={Style.rentalsTable}>
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Rental Period</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filteredRentals || []).map((rental) => (
                <tr key={rental._id}>
                  <td>
                    <span className={Style.rentalId}>
                      #{rental._id.slice(-8)}
                    </span>
                  </td>
                  <td>
                    <div className={Style.productInfo}>
                      <img
                        src={
                          rental.product?.imageCover || "/placeholder-image.jpg"
                        }
                        alt={rental.product?.title || rental.product?.name}
                        className={Style.productImage}
                      />
                      <div>
                        <div className={Style.productName}>
                          {rental.product?.title || rental.product?.name}
                        </div>
                        <div className={Style.productPrice}>
                          {rental.dailyRate} EGP/day
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={Style.customerInfo}>
                      <div className={Style.customerName}>
                        {rental.personalInfo?.fullName}
                      </div>
                      <div className={Style.customerPhone}>
                        {rental.personalInfo?.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={Style.rentalPeriod}>
                      <div>{formatDate(rental.requestedStartDate)}</div>
                      <div className={Style.to}>to</div>
                      <div>{formatDate(rental.requestedEndDate)}</div>
                      <div className={Style.duration}>
                        ({rental.rentalDays} days)
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={Style.costInfo}>
                      <div className={Style.totalCost}>
                        {rental.totalPrice} EGP
                      </div>
                      {rental.depositAmount > 0 && (
                        <div className={Style.deposit}>
                          +{rental.depositAmount} EGP deposit
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${Style.status} ${getStatusClass(
                        rental.status
                      )}`}
                    >
                      {getStatusText(rental.status)}
                    </span>
                  </td>
                  <td>{formatDate(rental.createdAt)}</td>
                  <td>
                    <div className={Style.actions}>
                      <button
                        onClick={() => setSelectedRental(rental)}
                        className={Style.actionBtn}
                        title="Update Status"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() =>
                          window.open(`/rental-details/${rental._id}`, "_blank")
                        }
                        className={Style.actionBtn}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={Style.pagination}>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={Style.pageBtn}
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          <div className={Style.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`${Style.pageNumber} ${
                  currentPage === page ? Style.active : ""
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={Style.pageBtn}
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedRental && (
        <StatusUpdateModal
          rental={selectedRental}
          onClose={() => setSelectedRental(null)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
