import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/api";


function DepartmentSummary() {

    const [departments, setDepartments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [departmentFilter, setDepartmentFilter] =
        useState("all");

    const [statusFilter, setStatusFilter] =
        useState("all");


    // ==========================================
    // LOAD DEPARTMENT ATTENDANCE
    // ==========================================

    const loadDepartmentSummary =
        async (isRefresh = false) => {

            try {

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");


                const data =
                    await apiRequest(
                        "/admin/department-summary"
                    );


                console.log(
                    "DEPARTMENT ATTENDANCE:",
                    data
                );


                setDepartments(
                    data?.departments || []
                );


            } catch (err) {

                console.error(
                    "DEPARTMENT ATTENDANCE ERROR:",
                    err
                );


                setError(
                    err?.message ||
                    "Unable to load department attendance."
                );


            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadDepartmentSummary();

    }, []);


    // ==========================================
    // DEPARTMENT OPTIONS
    // ==========================================

    const departmentOptions =
        useMemo(() => {

            return departments
                .map(
                    department =>
                        department.department
                )
                .filter(Boolean);

        }, [departments]);


    // ==========================================
    // FILTERED DEPARTMENTS
    // ==========================================

    const filteredDepartments =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return departments
                .map(
                    department => {

                        const filteredEmployees =
                            (department.employees || [])
                                .filter(
                                    employee => {

                                        // ==========================
                                        // SEARCH
                                        // ==========================

                                        const matchesSearch =
                                            !searchValue ||

                                            String(
                                                employee.name || ""
                                            )
                                                .toLowerCase()
                                                .includes(
                                                    searchValue
                                                ) ||

                                            String(
                                                employee.employeeCode || ""
                                            )
                                                .toLowerCase()
                                                .includes(
                                                    searchValue
                                                ) ||

                                            String(
                                                employee.email || ""
                                            )
                                                .toLowerCase()
                                                .includes(
                                                    searchValue
                                                );


                                        // ==========================
                                        // STATUS
                                        // ==========================

                                        const matchesStatus =
                                            statusFilter === "all" ||

                                            employee.attendanceStatus ===
                                                statusFilter;


                                        return (
                                            matchesSearch &&
                                            matchesStatus
                                        );

                                    }
                                );


                        return {

                            ...department,

                            employees:
                                filteredEmployees

                        };

                    }
                )
                .filter(
                    department => {

                        // ==========================
                        // DEPARTMENT FILTER
                        // ==========================

                        const matchesDepartment =
                            departmentFilter === "all" ||

                            department.department ===
                                departmentFilter;


                        if (!matchesDepartment) {
                            return false;
                        }


                        return (
                            department.employees.length >
                            0
                        );

                    }
                );

        }, [
            departments,
            search,
            departmentFilter,
            statusFilter
        ]);


    // ==========================================
    // TOTAL FILTERED EMPLOYEES
    // ==========================================

    const totalFilteredEmployees =
        filteredDepartments.reduce(
            (total, department) =>
                total +
                department.employees.length,
            0
        );


    // ==========================================
    // TOTAL DEPARTMENTS SHOWN
    // ==========================================

    const totalFilteredDepartments =
        filteredDepartments.length;


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="page-loading">

                Loading department attendance...

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
                    Unable to load department attendance
                </h2>

                <p>
                    {error}
                </p>


                <button
                    onClick={() =>
                        loadDepartmentSummary()
                    }
                >
                    Try Again
                </button>

            </div>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="department-summary-page">


            {/* =====================================
                HEADER
            ====================================== */}

            <div className="department-summary-header">

                <div>

                    <h1>
                        Department Attendance
                    </h1>

                    <p>
                        Employee attendance by department
                    </p>

                </div>


                <button
                    className="dashboard-refresh-button"
                    onClick={() =>
                        loadDepartmentSummary(true)
                    }
                    disabled={refreshing}
                >

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =====================================
                FILTERS
            ====================================== */}

            <section className="department-attendance-filters">


                {/* SEARCH */}

                <div className="department-filter-group">

                    <label>
                        Search
                    </label>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search employee..."
                    />

                </div>


                {/* DEPARTMENT */}

                <div className="department-filter-group">

                    <label>
                        Department
                    </label>

                    <select
                        value={departmentFilter}
                        onChange={(event) =>
                            setDepartmentFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="all">
                            All Departments
                        </option>


                        {departmentOptions.map(
                            department => (

                                <option
                                    key={department}
                                    value={department}
                                >
                                    {department}
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* STATUS */}

                <div className="department-filter-group">

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
                            All
                        </option>

                        <option value="present">
                            Present
                        </option>

                        <option value="absent">
                            Absent
                        </option>

                    </select>

                </div>


            </section>


            {/* =====================================
                RESULTS INFO
            ====================================== */}

            <div className="department-attendance-results">

                <strong>
                    Employee List
                </strong>

                <span>
                    Showing{" "}
                    {totalFilteredEmployees}
                    {" "}of{" "}
                    {departments.reduce(
                        (total, department) =>
                            total +
                            (department.employees?.length || 0),
                        0
                    )}
                    {" "}employees
                    {" "}across{" "}
                    {totalFilteredDepartments}
                    {" "}departments
                </span>

            </div>


            {/* =====================================
                DEPARTMENT LIST
            ====================================== */}

            <div className="department-attendance-list">


                {filteredDepartments.length === 0 ? (

                    <div className="department-attendance-empty">

                        <h3>
                            No employees found
                        </h3>

                        <p>
                            Try changing your search or filters.
                        </p>

                    </div>

                ) : (

                    filteredDepartments.map(
                        department => {

                            const employees =
                                department.employees || [];


                            const present =
                                employees.filter(
                                    employee =>
                                        employee.attendanceStatus ===
                                        "present"
                                ).length;


                            const absent =
                                employees.filter(
                                    employee =>
                                        employee.attendanceStatus ===
                                        "absent"
                                ).length;


                            const percentage =
                                employees.length > 0

                                    ? (
                                        present /
                                        employees.length *
                                        100
                                    ).toFixed(2)

                                    : "0.00";


                            return (

                                <section
                                    className="department-attendance-section"
                                    key={
                                        department.department
                                    }
                                >


                                    {/* DEPARTMENT HEADER */}

                                    <div className="department-attendance-section-header">

                                        <div>

                                            <span>
                                                Department
                                            </span>

                                            <h2>
                                                {
                                                    department.department
                                                }
                                            </h2>

                                        </div>


                                        <div className="department-attendance-summary">


                                            <div>

                                                <span>
                                                    Employees
                                                </span>

                                                <strong>
                                                    {
                                                        employees.length
                                                    }
                                                </strong>

                                            </div>


                                            <div className="department-present-summary">

                                                <span>
                                                    Present
                                                </span>

                                                <strong>
                                                    {present}
                                                </strong>

                                            </div>


                                            <div className="department-absent-summary">

                                                <span>
                                                    Absent
                                                </span>

                                                <strong>
                                                    {absent}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Attendance
                                                </span>

                                                <strong>
                                                    {percentage}%
                                                </strong>

                                            </div>


                                        </div>

                                    </div>


                                    {/* EMPLOYEE TABLE */}

                                    <div className="department-attendance-table-wrapper">

                                        <table className="department-attendance-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Employee
                                                    </th>

                                                    <th>
                                                        Employee Code
                                                    </th>

                                                    <th>
                                                        Email
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                    <th>
                                                        Sign In
                                                    </th>

                                                    <th>
                                                        Sign Out
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {employees.map(
                                                    employee => {

                                                        const isPresent =
                                                            employee.attendanceStatus ===
                                                            "present";


                                                        return (

                                                            <tr
                                                                key={
                                                                    employee.id
                                                                }
                                                            >

                                                                <td>

                                                                    <strong>
                                                                        {
                                                                            employee.name ||
                                                                            "—"
                                                                        }
                                                                    </strong>

                                                                </td>


                                                                <td>
                                                                    {
                                                                        employee.employeeCode ||
                                                                        "—"
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        employee.email ||
                                                                        "—"
                                                                    }
                                                                </td>


                                                                <td>

                                                                    <span
                                                                        className={
                                                                            isPresent
                                                                                ? "department-attendance-status present"
                                                                                : "department-attendance-status absent"
                                                                        }
                                                                    >

                                                                        {
                                                                            isPresent
                                                                                ? "Present"
                                                                                : "Absent"
                                                                        }

                                                                    </span>

                                                                </td>


                                                                <td>
                                                                    {
                                                                        employee.signInTime
                                                                            ? new Date(
                                                                                employee.signInTime
                                                                            ).toLocaleTimeString(
                                                                                [],
                                                                                {
                                                                                    hour:
                                                                                        "2-digit",
                                                                                    minute:
                                                                                        "2-digit"
                                                                                }
                                                                            )
                                                                            : "—"
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        employee.signOutTime
                                                                            ? new Date(
                                                                                employee.signOutTime
                                                                            ).toLocaleTimeString(
                                                                                [],
                                                                                {
                                                                                    hour:
                                                                                        "2-digit",
                                                                                    minute:
                                                                                        "2-digit"
                                                                                }
                                                                            )
                                                                            : "—"
                                                                    }
                                                                </td>

                                                            </tr>

                                                        );

                                                    }
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </section>

                            );

                        }
                    )

                )}

            </div>


        </div>

    );

}


export default DepartmentSummary;