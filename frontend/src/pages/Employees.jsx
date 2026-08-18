import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/api";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeCode: "",
    department: "",
    deviceId: "",
    mobileNumber: "",
    scheme: ""
  });
  const [formError, setFormError] = useState("");

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    employeeCode: "",
    department: "",
    deviceId: "",
    mobileNumber: "",
    scheme: ""
  });
  const [editError, setEditError] = useState("");

  // Load employees & departments
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/admin/employees");
      setEmployees(data.employees || data || []);
    } catch (err) {
      setError(err?.message || "Unable to load employees");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await apiRequest("/departments");
      setDepartmentList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load departments");
    }
  };

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  // Derived department list for filter
  const departments = useMemo(() => {
    const names = employees
      .map((employee) =>
        employee.Department?.name ||
        employee.department?.name ||
        employee.department ||
        "Not Assigned"
      )
      .filter(Boolean);
    return [...new Set(names)].sort();
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const department =
        employee.Department?.name ||
        employee.department?.name ||
        employee.department ||
        "Not Assigned";
      const matchesSearch =
        !searchValue ||
        String(employee.employeeCode || "").toLowerCase().includes(searchValue) ||
        String(employee.name || "").toLowerCase().includes(searchValue) ||
        String(employee.email || "").toLowerCase().includes(searchValue) ||
        String(department).toLowerCase().includes(searchValue);
      const matchesDepartment =
        departmentFilter === "all" || department === departmentFilter;
      const employeeStatus = String(employee.status || "").toLowerCase();
      const matchesStatus =
        statusFilter === "all" || employeeStatus === statusFilter;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const activeCount = employees.filter(
    (e) => String(e.status || "").toLowerCase() === "active"
  ).length;
  const inactiveCount = employees.length - activeCount;

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setStatusFilter("all");
  };
  const filtersApplied =
    search.trim() !== "" ||
    departmentFilter !== "all" ||
    statusFilter !== "all";

  // Mobile number formatter (onBlur only)
  const formatMobile = (value) => {
    if (value.startsWith("+91")) return value;
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length === 10 ? `+91${cleaned}` : value;
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      employeeCode: "",
      department: "",
      deviceId: "",
      mobileNumber: "",
      scheme: ""
    });
    setFormError("");
  };

  const openAddModal = () => {
    resetForm();
    setSuccess("");
    setError("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (saving) return;
    setShowAddModal(false);
    resetForm();
  };

  const handleAddEmployee = async (event) => {
    event.preventDefault();
    setFormError("");
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;
    const employeeCode = form.employeeCode.trim();
    const department = form.department.trim();
    const deviceId = form.deviceId.trim();
    const mobileNumber = form.mobileNumber.trim();
    const scheme = form.scheme;

    if (!name) { setFormError("Employee name is required"); return; }
    if (name.length < 3) { setFormError("Name must contain at least 3 characters"); return; }
    if (!email) { setFormError("Email is required"); return; }
    if (!password) { setFormError("Password is required"); return; }
    if (password.length < 6) { setFormError("Password must contain at least 6 characters"); return; }
    if (!employeeCode) { setFormError("Employee code is required"); return; }

    try {
      setSaving(true);
      const payload = { name, email, password, employeeCode, deviceId: deviceId || null, mobileNumber: mobileNumber || null, scheme: scheme || null };
      if (department) payload.department = department;
      const data = await apiRequest("/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSuccess(data?.message || "Employee created successfully");
      setShowAddModal(false);
      resetForm();
      await loadEmployees();
    } catch (err) {
      setFormError(err?.message || "Unable to create employee");
    } finally {
      setSaving(false);
    }
  };

  // Edit handlers
  const openEditModal = (employee) => {
    const department =
      employee.Department?.name ||
      employee.department?.name ||
      employee.department ||
      "";
    setEditingEmployee(employee);
    setEditForm({
      name: employee.name || "",
      email: employee.email || "",
      employeeCode: employee.employeeCode || "",
      department,
      deviceId: employee.deviceId || "",
      mobileNumber: employee.mobileNumber || "",
      scheme: employee.scheme || ""
    });
    setEditError("");
    setError("");
    setSuccess("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) return;
    setShowEditModal(false);
    setEditingEmployee(null);
    setEditForm({
      name: "",
      email: "",
      employeeCode: "",
      department: "",
      deviceId: "",
      mobileNumber: "",
      scheme: ""
    });
    setEditError("");
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditError("");
    setError("");
    setSuccess("");
  };

  const handleUpdateEmployee = async (event) => {
    event.preventDefault();
    setEditError("");
    setError("");
    setSuccess("");

    if (!editingEmployee) {
      setEditError("Employee information is missing");
      return;
    }

    const name = editForm.name.trim();
    const email = editForm.email.trim();
    const employeeCode = editForm.employeeCode.trim();
    const department = editForm.department.trim();
    const deviceId = editForm.deviceId.trim();
    const mobileNumber = editForm.mobileNumber.trim();
    const scheme = editForm.scheme;

    if (!name) { setEditError("Employee name is required"); return; }
    if (name.length < 3) { setEditError("Name must contain at least 3 characters"); return; }
    if (!email) { setEditError("Email is required"); return; }
    if (!employeeCode) { setEditError("Employee code is required"); return; }

    try {
      setSaving(true);
      const payload = { name, email, employeeCode, deviceId: deviceId || null, mobileNumber: mobileNumber || null, scheme: scheme || null };
      if (department) payload.department = department;
      else payload.department = null;

      const data = await apiRequest(`/admin/employees/${editingEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSuccess(data?.message || "Employee updated successfully");
      setShowEditModal(false);
      setEditingEmployee(null);
      await loadEmployees();
    } catch (err) {
      setEditError(err?.message || "Unable to update employee");
    } finally {
      setSaving(false);
    }
  };
  // ==========================================
  // ACTIVATE / DEACTIVATE EMPLOYEE
  // ==========================================

  const handleEmployeeStatusChange = async (employee) => {
    if (!employee?.id) return;

    const currentStatus = String(employee.status || "").toLowerCase();
    const isActive = currentStatus === "active";
    const newStatus = isActive ? "inactive" : "active";

    const confirmed = window.confirm(
      isActive
        ? `Are you sure you want to deactivate ${employee.name}?`
        : `Are you sure you want to activate ${employee.name}?`
    );

    if (!confirmed) return;

    try {
      setStatusUpdatingId(employee.id);
      setError("");
      setSuccess("");

      const endpoint = isActive
        ? `/admin/employees/${employee.id}/deactivate`
        : `/admin/employees/${employee.id}/activate`;

      console.log("EMPLOYEE STATUS UPDATE:", { employeeId: employee.id, endpoint, newStatus });

      const data = await apiRequest(endpoint, { method: "PUT" });

      console.log("EMPLOYEE STATUS RESPONSE:", data);

      setSuccess(data?.message || `Employee ${newStatus} successfully`);
      await loadEmployees();
    } catch (err) {
      console.error("EMPLOYEE STATUS ERROR:", err);
      setError(err?.message || "Unable to update employee status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // ==========================================
  // EMPLOYEE PROFILE
  // ==========================================

  const openEmployeeProfile = async (employee) => {
    if (!employee?.id) return;

    try {
      setShowProfileModal(true);
      setProfileLoading(true);
      setProfileError("");
      setEmployeeProfile(null);

      const data = await apiRequest(`/admin/employees/${employee.id}/profile`);
      console.log("EMPLOYEE PROFILE:", data);
      setEmployeeProfile(data);
    } catch (err) {
      console.error("EMPLOYEE PROFILE ERROR:", err);
      setProfileError(err?.message || "Unable to load employee profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const closeEmployeeProfile = () => {
    setShowProfileModal(false);
    setEmployeeProfile(null);
    setProfileError("");
  };

  // ==========================================
  // DELETE EMPLOYEE
  // ==========================================

  const handleDeleteEmployee = async (employee) => {
    if (!employee) return;

    const employeeName = employee.name || "this employee";
    const employeeCode = employee.employeeCode ? ` (${employee.employeeCode})` : "";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employeeName}${employeeCode}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      console.log("DELETE EMPLOYEE:", employee.id);

      const data = await apiRequest(`/admin/employees/${employee.id}`, {
        method: "DELETE"
      });

      console.log("DELETED EMPLOYEE:", data);

      setSuccess(data?.message || "Employee deleted successfully");
      await loadEmployees();
    } catch (err) {
      console.error("DELETE EMPLOYEE ERROR:", err);
      setError(err?.message || "Unable to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // LOADING & ERROR
  // ==========================================

  if (loading) {
    return <div className="page-loading">Loading employees...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Unable to load employees</h2>
        <p>{error}</p>
        <button onClick={loadEmployees}>Try Again</button>
      </div>
    );
  }

  // ==========================================
  // PAGE RENDER
  // ==========================================

  return (
    <div className="employees-page">
      {/* HEADER */}
      <div className="employees-header">
        <div>
          <h1>Employees</h1>
          <p>Manage WorkTrac employees</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="refresh-button" onClick={loadEmployees} disabled={saving}>
            Refresh
          </button>
          <button className="add-employee-button" onClick={openAddModal} disabled={saving}>
            + Add Employee
          </button>
        </div>
      </div>

      {success && <div className="employee-success-message">{success}</div>}

      {/* SUMMARY */}
      <div className="employee-summary">
        <div className="employee-summary-card">
          <span>Total Employees</span>
          <strong>{employees.length}</strong>
        </div>
        <div className="employee-summary-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="employee-summary-card">
          <span>Inactive</span>
          <strong>{inactiveCount}</strong>
        </div>
      </div>

      {/* EMPLOYEE CARD */}
      <div className="employees-card">
        <div className="employees-card-header">
          <div>
            <h2>Employee List</h2>
            <span>
              Showing {filteredEmployees.length} of {employees.length} employees
            </span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="employee-filters">
          <div className="filter-search">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search code, name, email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Department</label>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {filtersApplied && (
            <button className="clear-filters-button" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        {/* TABLE */}
        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>Try changing your search or filters.</p>
            {filtersApplied && (
              <button className="clear-filters-button" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Mobile</th>
                  <th>Scheme</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Device ID</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const department =
                    employee.Department?.name ||
                    employee.department?.name ||
                    employee.department ||
                    "Not Assigned";

                  const isActive =
                    String(employee.status || "").toLowerCase() === "active";

                  return (
                    <tr key={employee.id}>
                      <td>
                        <strong>{employee.employeeCode || "—"}</strong>
                      </td>
                      <td>{employee.name || "—"}</td>
                      <td>{employee.email || "—"}</td>
                      <td>{department}</td>
                      <td>{employee.mobileNumber || "—"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            employee.scheme === "NAPS"
                              ? "status-active"
                              : employee.scheme === "NATS"
                              ? "status-active"
                              : ""
                          }`}
                        >
                          {employee.scheme || "—"}
                        </span>
                      </td>
                      <td>{employee.role || "—"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            isActive ? "status-active" : "status-inactive"
                          }`}
                        >
                          {employee.status || "Unknown"}
                        </span>
                      </td>
                      <td>{employee.deviceId || "—"}</td>
                      <td>
                        {employee.lastLogin
                          ? new Date(employee.lastLogin).toLocaleString()
                          : "Never"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            type="button"
                            className="employee-profile-button"
                            onClick={() => openEmployeeProfile(employee)}
                            disabled={saving || statusUpdatingId === employee.id}
                          >
                            Profile
                          </button>
                          <button
                            type="button"
                            className="employee-edit-button"
                            onClick={() => openEditModal(employee)}
                            disabled={saving || statusUpdatingId === employee.id}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={
                              isActive
                                ? "employee-deactivate-button"
                                : "employee-activate-button"
                            }
                            onClick={() => handleEmployeeStatusChange(employee)}
                            disabled={saving || statusUpdatingId === employee.id}
                          >
                            {statusUpdatingId === employee.id
                              ? "Updating..."
                              : isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="employee-delete-button"
                            onClick={() => handleDeleteEmployee(employee)}
                            disabled={saving || deleting || statusUpdatingId === employee.id}
                          >
                            {deleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div
          className="employee-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddModal();
            }
          }}
        >
          <div
            className="employee-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="employee-modal-header">
              <div>
                <h2>Add Employee</h2>
                <p>Create a new WorkTrac employee</p>
              </div>
              <button
                type="button"
                className="employee-modal-close"
                onClick={closeAddModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {formError && <div className="employee-form-error">{formError}</div>}

            <form onSubmit={handleAddEmployee}>
              {/* NAME */}
              <div className="employee-form-group">
                <label>Employee Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Enter employee name"
                  disabled={saving}
                />
              </div>

              {/* EMAIL */}
              <div className="employee-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="employee@example.com"
                  disabled={saving}
                />
              </div>

              {/* EMPLOYEE CODE */}
              <div className="employee-form-group">
                <label>Employee Code *</label>
                <input
                  type="text"
                  name="employeeCode"
                  value={form.employeeCode}
                  onChange={handleFormChange}
                  placeholder="EMP001"
                  disabled={saving}
                />
              </div>

              {/* PASSWORD */}
              <div className="employee-form-group">
                <label>Initial Password *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder="Minimum 6 characters"
                  disabled={saving}
                />
              </div>

              {/* DEVICE ID */}
              <div className="employee-form-group">
                <label>Device ID</label>
                <input
                  type="text"
                  name="deviceId"
                  value={form.deviceId}
                  onChange={handleFormChange}
                  placeholder="Enter employee device ID"
                  disabled={saving}
                />
              </div>

              {/* MOBILE NUMBER */}
              <div className="employee-form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleFormChange}
                  onBlur={(e) => {
                    const formatted = formatMobile(e.target.value);
                    setForm((prev) => ({ ...prev, mobileNumber: formatted }));
                  }}
                  placeholder="9876543210"
                  disabled={saving}
                />
              </div>

              {/* SCHEME */}
              <div className="employee-form-group">
                <label>Scheme</label>
                <select
                  name="scheme"
                  value={form.scheme}
                  onChange={handleFormChange}
                  disabled={saving}
                >
                  <option value="">Not Assigned</option>
                  <option value="NAPS">NAPS</option>
                  <option value="NATS">NATS</option>
                </select>
              </div>

              {/* DEPARTMENT */}
              <div className="employee-form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleFormChange}
                  disabled={saving}
                >
                  <option value="">Not Assigned</option>
                  {departmentList
                    .filter((dept) => dept && dept.name)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* ACTIONS */}
              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-cancel-button"
                  onClick={closeAddModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="employee-save-button"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {showEditModal && (
        <div
          className="employee-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div
            className="employee-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="employee-modal-header">
              <div>
                <h2>Edit Employee</h2>
                <p>Update employee information</p>
              </div>
              <button
                type="button"
                className="employee-modal-close"
                onClick={closeEditModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {editError && <div className="employee-form-error">{editError}</div>}

            <form onSubmit={handleUpdateEmployee}>
              {/* NAME */}
              <div className="employee-form-group">
                <label>Employee Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  placeholder="Enter employee name"
                  disabled={saving}
                />
              </div>

              {/* EMAIL */}
              <div className="employee-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  placeholder="employee@example.com"
                  disabled={saving}
                />
              </div>

              {/* EMPLOYEE CODE */}
              <div className="employee-form-group">
                <label>Employee Code *</label>
                <input
                  type="text"
                  name="employeeCode"
                  value={editForm.employeeCode}
                  onChange={handleEditFormChange}
                  placeholder="EMP001"
                  disabled={saving}
                />
              </div>

              {/* MOBILE NUMBER */}
              <div className="employee-form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={editForm.mobileNumber}
                  onChange={handleEditFormChange}
                  onBlur={(e) => {
                    const formatted = formatMobile(e.target.value);
                    setEditForm((prev) => ({ ...prev, mobileNumber: formatted }));
                  }}
                  placeholder="9876543210"
                  disabled={saving}
                />
              </div>

              {/* SCHEME */}
              <div className="employee-form-group">
                <label>Scheme</label>
                <select
                  name="scheme"
                  value={editForm.scheme}
                  onChange={handleEditFormChange}
                  disabled={saving}
                >
                  <option value="">Not Assigned</option>
                  <option value="NAPS">NAPS</option>
                  <option value="NATS">NATS</option>
                </select>
              </div>

              {/* DEPARTMENT */}
              <div className="employee-form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={editForm.department}
                  onChange={handleEditFormChange}
                  disabled={saving}
                >
                  <option value="">Not Assigned</option>
                  {departmentList
                    .filter((dept) => dept && dept.name)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* DEVICE ID */}
              <div className="employee-form-group">
                <label>Device ID</label>
                <input
                  type="text"
                  name="deviceId"
                  value={editForm.deviceId}
                  onChange={handleEditFormChange}
                  placeholder="Enter employee device ID"
                  disabled={saving}
                />
              </div>

              {/* ACTIONS */}
              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-cancel-button"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="employee-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE PROFILE MODAL */}
      {showProfileModal && (
        <div
          className="employee-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEmployeeProfile();
            }
          }}
        >
          <div
            className="employee-modal employee-profile-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="employee-modal-header">
              <div>
                <h2>Employee Profile</h2>
                <p>Employee details and activity</p>
              </div>
              <button
                type="button"
                className="employee-modal-close"
                onClick={closeEmployeeProfile}
              >
                ×
              </button>
            </div>

            {profileLoading && (
              <div className="page-loading">Loading employee profile...</div>
            )}

            {!profileLoading && profileError && (
              <div className="employee-form-error">{profileError}</div>
            )}

            {!profileLoading && !profileError && employeeProfile && (
              <>
                {/* EMPLOYEE INFORMATION */}
                <div className="employee-profile-section">
                  <h3>Employee Information</h3>
                  <div className="employee-profile-grid">
                    <div>
                      <span>Name</span>
                      <strong>{employeeProfile.employee?.name || "—"}</strong>
                    </div>
                    <div>
                      <span>Employee Code</span>
                      <strong>{employeeProfile.employee?.employeeCode || "—"}</strong>
                    </div>
                    <div>
                      <span>Email</span>
                      <strong>{employeeProfile.employee?.email || "—"}</strong>
                    </div>
                    <div>
                      <span>Department</span>
                      <strong>
                        {employeeProfile.employee?.Department?.name || "Not Assigned"}
                      </strong>
                    </div>
                    <div>
                      <span>Role</span>
                      <strong>{employeeProfile.employee?.role || "—"}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{employeeProfile.employee?.status || "—"}</strong>
                    </div>
                    <div>
                      <span>Device ID</span>
                      <strong>{employeeProfile.employee?.deviceId || "—"}</strong>
                    </div>
                    <div>
                      <span>Created</span>
                      <strong>
                        {employeeProfile.employee?.createdAt
                          ? new Date(employeeProfile.employee.createdAt).toLocaleString()
                          : "—"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ATTENDANCE SUMMARY */}
                <div className="employee-profile-section">
                  <h3>Attendance</h3>
                  <div className="employee-profile-summary">
                    <div className="employee-profile-summary-card">
                      <span>Total Records</span>
                      <strong>{employeeProfile.attendanceSummary?.totalRecords ?? 0}</strong>
                    </div>
                  </div>
                </div>

                {/* RECENT ATTENDANCE */}
                <div className="employee-profile-section">
                  <h3>Recent Attendance</h3>
                  {employeeProfile.recentAttendance?.length === 0 ? (
                    <p>No attendance records found.</p>
                  ) : (
                    <div className="table-wrapper">
                      <table className="employees-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Sign In</th>
                            <th>Sign Out</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeProfile.recentAttendance.map((record) => (
                            <tr key={record.id}>
                              <td>
                                {record.date
                                  ? new Date(record.date).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td>
                                {record.signInTime
                                  ? new Date(record.signInTime).toLocaleString()
                                  : "—"}
                              </td>
                              <td>
                                {record.signOutTime
                                  ? new Date(record.signOutTime).toLocaleString()
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* LEAVE SUMMARY */}
                <div className="employee-profile-section">
                  <h3>Leave Summary</h3>
                  <div className="employee-profile-summary">
                    <div className="employee-profile-summary-card">
                      <span>Total</span>
                      <strong>{employeeProfile.leaveSummary?.total ?? 0}</strong>
                    </div>
                    <div className="employee-profile-summary-card">
                      <span>Pending</span>
                      <strong>{employeeProfile.leaveSummary?.pending ?? 0}</strong>
                    </div>
                    <div className="employee-profile-summary-card">
                      <span>Approved</span>
                      <strong>{employeeProfile.leaveSummary?.approved ?? 0}</strong>
                    </div>
                    <div className="employee-profile-summary-card">
                      <span>Rejected</span>
                      <strong>{employeeProfile.leaveSummary?.rejected ?? 0}</strong>
                    </div>
                  </div>
                </div>

                {/* RECENT LEAVES */}
                <div className="employee-profile-section">
                  <h3>Recent Leaves</h3>
                  {employeeProfile.recentLeaves?.length === 0 ? (
                    <p>No leave records found.</p>
                  ) : (
                    <div className="table-wrapper">
                      <table className="employees-table">
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeProfile.recentLeaves.map((leave) => (
                            <tr key={leave.id}>
                              <td>{leave.status || "—"}</td>
                              <td>
                                {leave.startDate
                                  ? new Date(leave.startDate).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td>
                                {leave.endDate
                                  ? new Date(leave.endDate).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td>{leave.reason || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* CLOSE */}
                <div className="employee-modal-actions">
                  <button
                    type="button"
                    className="employee-cancel-button"
                    onClick={closeEmployeeProfile}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;