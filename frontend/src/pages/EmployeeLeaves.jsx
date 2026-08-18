import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function EmployeeLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApply, setShowApply] = useState(false);

    const [form, setForm] = useState({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const loadLeaves = async () => {
        try {
            setLoading(true);
            const data = await apiRequest("/leaves/my");
            setLeaves(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await apiRequest("/leaves", {
                method: "POST",
                body: form
            });
            setShowApply(false);
            setForm({ leaveType: "", startDate: "", endDate: "", reason: "" });
            loadLeaves();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="page-loading">Loading leaves...</div>;

    return (
        <div className="employee-leaves-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1>My Leaves</h1>
                    <p>Apply for and track your leave requests</p>
                </div>
                <button
                    className="add-employee-button"
                    onClick={() => setShowApply(!showApply)}
                >
                    {showApply ? "✕ Close" : "+ Apply Leave"}
                </button>
            </div>

            {showApply && (
                <div className="employee-attendance-card">
                    <h2>Apply for Leave</h2>
                    {error && <div className="employee-form-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="employee-form-group">
                            <label>Leave Type</label>
                            <select
                                value={form.leaveType}
                                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                                required
                            >
                                <option value="">Select type</option>
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Casual Leave">Casual Leave</option>
                                <option value="Annual Leave">Annual Leave</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="employee-form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="employee-form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="employee-form-group">
                            <label>Reason</label>
                            <textarea
                                rows="3"
                                value={form.reason}
                                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                placeholder="Explain your leave reason..."
                                required
                            />
                        </div>
                        <div className="employee-modal-actions">
                            <button type="button" className="employee-cancel-button" onClick={() => setShowApply(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="employee-save-button" disabled={submitting}>
                                {submitting ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {leaves.length === 0 ? (
                <div className="empty-state">
                    <h3>No leave requests</h3>
                    <p>You haven't applied for any leave yet.</p>
                </div>
            ) : (
                leaves.map((leave) => (
                    <div key={leave.id} className="employee-leave-card">
                        <h3>{leave.leaveType}</h3>
                        <span className="leave-date">
                            {leave.startDate} → {leave.endDate}
                        </span>
                        <p className="leave-reason">{leave.reason}</p>
                        <div>
                            <span className={`leave-status-badge ${leave.status === "pending" ? "leave-status-pending" :
                                    leave.status === "approved" ? "leave-status-approved" :
                                        "leave-status-rejected"
                                }`}>
                                {leave.status}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default EmployeeLeaves;