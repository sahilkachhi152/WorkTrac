import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function Leaves() {
    const [leaves, setLeaves] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");

    // ==========================================
    // LOAD LEAVES
    // ==========================================

    const loadLeaves = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest("/admin/leaves");

            console.log(
                "ADMIN LEAVES FULL RESPONSE:",
                JSON.stringify(data, null, 2)
            );

            const leaveList =
                data.leaves ||
                data.data ||
                data ||
                [];

            setLeaves(Array.isArray(leaveList) ? leaveList : []);
        } catch (err) {
            console.error("ADMIN LEAVES ERROR:", err);

            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaves();
    }, []);

    // ==========================================
    // APPROVE LEAVE
    // ==========================================

    const handleApprove = async (leaveId) => {
        try {
            await apiRequest(
                `/admin/leaves/${leaveId}/approve`,
                {
                    method: "PUT",
                }
            );

            await loadLeaves();
        } catch (err) {
            console.error(
                "APPROVE LEAVE ERROR:",
                err
            );

            alert(
                err.message || "Unable to approve leave"
            );
        }
    };

    // ==========================================
    // REJECT LEAVE
    // ==========================================

    const handleReject = async (leaveId) => {
        try {
            await apiRequest(
                `/admin/leaves/${leaveId}/reject`,
                {
                    method: "PUT",
                }
            );

            await loadLeaves();
        } catch (err) {
            console.error(
                "REJECT LEAVE ERROR:",
                err
            );

            alert(
                err.message || "Unable to reject leave"
            );
        }
    };

    // ==========================================
    // FILTER
    // ==========================================

    const filteredLeaves =
        statusFilter === "all"
            ? leaves
            : leaves.filter(
                (leave) =>
                    String(
                        leave.status || ""
                    ).toLowerCase() ===
                    statusFilter
            );

    // ==========================================
    // COUNTS
    // ==========================================

    const pendingCount = leaves.filter(
        (leave) =>
            String(
                leave.status || ""
            ).toLowerCase() === "pending"
    ).length;

    const approvedCount = leaves.filter(
        (leave) =>
            String(
                leave.status || ""
            ).toLowerCase() === "approved"
    ).length;

    const rejectedCount = leaves.filter(
        (leave) =>
            String(
                leave.status || ""
            ).toLowerCase() === "rejected"
    ).length;

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="page-loading">
                Loading leaves...
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="dashboard-error">
                <h2>
                    Unable to load leave management
                </h2>

                <p>{error}</p>

                <button onClick={loadLeaves}>
                    Try Again
                </button>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="leaves-page">

            {/* HEADER */}

            <div className="leaves-header">

                <div>
                    <h1>
                        Leave Management
                    </h1>

                    <p>
                        Review and manage employee leave requests
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadLeaves}
                >
                    Refresh
                </button>

            </div>

            {/* SUMMARY */}

            <div className="leave-summary">

                <div className="leave-summary-card">

                    <span>
                        Total Requests
                    </span>

                    <strong>
                        {leaves.length}
                    </strong>

                </div>

                <div className="leave-summary-card">

                    <span>
                        Pending
                    </span>

                    <strong className="pending-number">
                        {pendingCount}
                    </strong>

                </div>

                <div className="leave-summary-card">

                    <span>
                        Approved
                    </span>

                    <strong className="approved-number">
                        {approvedCount}
                    </strong>

                </div>

                <div className="leave-summary-card">

                    <span>
                        Rejected
                    </span>

                    <strong className="rejected-number">
                        {rejectedCount}
                    </strong>

                </div>

            </div>

            {/* LEAVE CARD */}

            <div className="leaves-card">

                {/* CARD HEADER */}

                <div className="leaves-card-header">

                    <div>
                        <h2>
                            Leave Requests
                        </h2>

                        <span>
                            Showing {filteredLeaves.length} of{" "}
                            {leaves.length} requests
                        </span>
                    </div>

                    {/* FILTER */}

                    <div className="leave-status-filter">

                        <label>
                            Status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Status
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="approved">
                                Approved
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>

                        </select>

                    </div>

                </div>

                {/* EMPTY */}

                {filteredLeaves.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No leave requests found
                        </h3>

                        <p>
                            There are no leave requests matching
                            the selected status.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="leaves-table">

                            <thead>

                                <tr>
                                    <th>Employee</th>
                                    <th>Leave Type</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredLeaves.map(
                                    (leave) => {

                                        const status =
                                            String(
                                                leave.status || ""
                                            ).toLowerCase();

                                        const employee =
                                            leave.Employee ||
                                            leave.employee ||
                                            {};

                                        const leaveType =
                                            leave.leaveType ||
                                            leave.type ||
                                            {};

                                        const employeeName =
                                            employee.name ||
                                            leave.employeeName ||
                                            "—";

                                        const employeeCode =
                                            employee.employeeCode ||
                                            leave.employeeCode ||
                                            "";

                                        const typeName =
                                            typeof leave.leaveType === "string"
                                                ? leave.leaveType
                                                : leaveType.name ||
                                                leave.leaveTypeName ||
                                                leave.type ||
                                                "—";

                                        const fromDate =
                                            leave.startDate ||
                                            leave.fromDate ||
                                            leave.from ||
                                            "—";

                                        const toDate =
                                            leave.endDate ||
                                            leave.toDate ||
                                            leave.to ||
                                            "—";

                                        const start = new Date(
                                            leave.startDate
                                        );

                                        const end = new Date(
                                            leave.endDate
                                        );

                                        const days =
                                            leave.totalDays ??
                                            leave.days ??
                                            (
                                                leave.startDate &&
                                                    leave.endDate
                                                    ? Math.floor(
                                                        (end - start) /
                                                        (1000 * 60 * 60 * 24)
                                                    ) + 1
                                                    : "—"
                                            );

                                        const reason =
                                            leave.reason ||
                                            leave.description ||
                                            "—";

                                        return (
                                            <tr
                                                key={leave.id}
                                            >

                                                {/* EMPLOYEE */}

                                                <td>

                                                    <strong>
                                                        {employeeName}
                                                    </strong>

                                                    {employeeCode && (
                                                        <small className="leave-employee-code">
                                                            {employeeCode}
                                                        </small>
                                                    )}

                                                </td>

                                                {/* TYPE */}

                                                <td>
                                                    {typeName}
                                                </td>

                                                {/* FROM */}

                                                <td>
                                                    {fromDate}
                                                </td>

                                                {/* TO */}

                                                <td>
                                                    {toDate}
                                                </td>

                                                {/* DAYS */}

                                                <td>
                                                    {days}
                                                </td>

                                                {/* REASON */}

                                                <td className="leave-reason">
                                                    {reason}
                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`leave-status-badge ${status ===
                                                            "pending"
                                                            ? "leave-status-pending"
                                                            : status ===
                                                                "approved"
                                                                ? "leave-status-approved"
                                                                : status ===
                                                                    "rejected"
                                                                    ? "leave-status-rejected"
                                                                    : ""
                                                            }`}
                                                    >
                                                        {leave.status ||
                                                            "Unknown"}
                                                    </span>

                                                </td>

                                                {/* ACTION */}

                                                <td>

                                                    {status ===
                                                        "pending" ? (

                                                        <div className="leave-actions">

                                                            <button
                                                                className="approve-leave-button"
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        leave.id
                                                                    )
                                                                }
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                className="reject-leave-button"
                                                                onClick={() =>
                                                                    handleReject(
                                                                        leave.id
                                                                    )
                                                                }
                                                            >
                                                                Reject
                                                            </button>

                                                        </div>

                                                    ) : (

                                                        <span className="action-completed">
                                                            —
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Leaves;