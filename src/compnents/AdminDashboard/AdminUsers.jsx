import React, { useState, useEffect } from "react";
import {
  getUsers,
  deleteUser,
  updateUserRole,
  createUser,
} from "../../services/adminApi";
import Style from "./AdminUsers.module.css";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaUserShield,
  FaUserCheck,
  FaSpinner,
  FaChartBar,
} from "react-icons/fa";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      toast.error(err.message || "Failed to fetch users");
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (err) {
        toast.error(err.message || "Failed to delete user");
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update user role");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // For new users, password is required
    if (!isEditing && !formData.password.trim()) {
      toast.error("Password is required for new users");
      return;
    }

    // Validate password strength for new users
    if (!isEditing && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && selectedUser) {
        await updateUserRole(selectedUser._id, formData.role);
        toast.success("User role updated successfully");
      } else {
        // Create new user
        const userData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          password: formData.password,
          phone: formData.phone.trim() || undefined,
        };

        await createUser(userData);
        toast.success("User created successfully");
      }
      setShowModal(false);
      setIsEditing(false);
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        role: "user",
        phone: "",
        password: "",
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const openModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        password: "", // Don't prefill password for security
      });
      setIsEditing(true);
    } else {
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        role: "user",
        phone: "",
        password: "",
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setIsEditing(false);
    setFormData({
      name: "",
      email: "",
      role: "user",
      phone: "",
      password: "",
    });
  };

  const filteredUsers = (users || []).filter((user) => {
    if (!user || !user.name || !user.email) return false;

    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Statistics
  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const regularUsers = users.filter((user) => user.role === "user").length;

  if (loading) {
    return (
      <div className={Style.loading}>
        <FaSpinner className={Style.spinner} />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={Style.adminUsers}>
      <div className={Style.header}>
        <div className={Style.headerContent}>
          <h2>
            <FaUsers className={Style.headerIcon} />
            Manage Users
          </h2>
          <p className={Style.headerSubtitle}>
            Manage user accounts and permissions
          </p>
        </div>
        <button className={Style.addButton} onClick={() => openModal()}>
          <FaUserPlus />
          Add New User
        </button>
      </div>

      {/* Statistics Cards */}
      <div className={Style.statsContainer}>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <FaUsers />
          </div>
          <div className={Style.statContent}>
            <h3>{totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <FaUserShield />
          </div>
          <div className={Style.statContent}>
            <h3>{adminUsers}</h3>
            <p>Administrators</p>
          </div>
        </div>

        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <FaUserCheck />
          </div>
          <div className={Style.statContent}>
            <h3>{regularUsers}</h3>
            <p>Regular Users</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={Style.filtersContainer}>
        <div className={Style.searchBox}>
          <FaSearch className={Style.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={Style.searchInput}
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className={Style.roleFilter}
        >
          <option value="all">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="user">Regular Users</option>
        </select>
      </div>

      {/* Users Table */}
      <div className={Style.tableContainer}>
        {filteredUsers.length === 0 ? (
          <div className={Style.emptyState}>
            <FaUsers className={Style.emptyIcon} />
            <h3>No Users Found</h3>
            <p>
              {searchTerm || filterRole !== "all"
                ? "No users match your search criteria"
                : "No users available yet"}
            </p>
          </div>
        ) : (
          <table className={Style.usersTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className={Style.tableRow}>
                  <td className={Style.userInfo}>
                    <div className={Style.userAvatar}>
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} />
                      ) : (
                        <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className={Style.userName}>
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td className={Style.userEmail}>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className={`${Style.roleSelect} ${Style[user.role]}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className={Style.userPhone}>{user.phone || "-"}</td>
                  <td>
                    <div className={Style.actionButtons}>
                      <button
                        className={Style.editButton}
                        onClick={() => openModal(user)}
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={Style.deleteButton}
                        onClick={() => handleDelete(user._id)}
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className={Style.modalOverlay} onClick={closeModal}>
          <div
            className={Style.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={Style.modalHeader}>
              <h3>
                {isEditing ? (
                  <>
                    <FaEdit className={Style.modalIcon} />
                    Edit User
                  </>
                ) : (
                  <>
                    <FaUserPlus className={Style.modalIcon} />
                    Add New User
                  </>
                )}
              </h3>
              <button
                className={Style.closeButton}
                onClick={closeModal}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={Style.modalForm}>
              <div className={Style.formGrid}>
                <div className={Style.formGroup}>
                  <label htmlFor="name">
                    Full Name <span className={Style.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value.trim() })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className={Style.formGroup}>
                  <label htmlFor="email">
                    Email Address <span className={Style.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value.trim() })
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {!isEditing && (
                  <div className={Style.formGroup}>
                    <label htmlFor="password">
                      Password <span className={Style.required}>*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Enter password (min 6 characters)"
                      required={!isEditing}
                      minLength={6}
                    />
                  </div>
                )}

                <div className={Style.formGroup}>
                  <label htmlFor="role">
                    User Role <span className={Style.required}>*</span>
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className={Style.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.trim() })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className={Style.modalActions}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={Style.cancelButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={Style.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className={Style.loadingIcon} />
                      {isEditing ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>{isEditing ? "Update User" : "Add User"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
