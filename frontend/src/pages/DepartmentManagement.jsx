import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/api";

function DepartmentManagement() {

    const [departments, setDepartments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingDepartment, setEditingDepartment] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [form, setForm] = useState({
        name: "",
        description: ""
    });


    // ==========================================
    // LOAD DEPARTMENTS
    // ==========================================

    const loadDepartments = async () => {

        try {

            setLoading(true);

            setError("");

            const data =
                await apiRequest(
                    "/departments"
                );

            console.log(
                "DEPARTMENTS:",
                data
            );

            setDepartments(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "DEPARTMENTS ERROR:",
                err
            );

            setError(
                err?.message ||
                "Unable to load departments."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        loadDepartments();

    }, []);


    // ==========================================
    // FILTER DEPARTMENTS
    // ==========================================

    const filteredDepartments =
        useMemo(() => {

            const searchValue =
                search.trim().toLowerCase();

            if (!searchValue) {
                return departments;
            }

            return departments.filter(
                (department) => {

                    const name =
                        String(
                            department.name || ""
                        ).toLowerCase();

                    const description =
                        String(
                            department.description || ""
                        ).toLowerCase();

                    return (
                        name.includes(searchValue) ||
                        description.includes(searchValue)
                    );

                }
            );

        }, [
            departments,
            search
        ]);


    // ==========================================
    // OPEN ADD MODAL
    // ==========================================

    const openAddModal = () => {

        setEditingDepartment(null);

        setForm({
            name: "",
            description: ""
        });

        setError("");

        setSuccess("");

        setShowModal(true);

    };


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (department) => {

        setEditingDepartment(
            department
        );

        setForm({
            name:
                department.name || "",

            description:
                department.description || ""
        });

        setError("");

        setSuccess("");

        setShowModal(true);

    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingDepartment(null);

        setForm({
            name: "",
            description: ""
        });

    };


    // ==========================================
    // FORM CHANGE
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        setError("");

    };


    // ==========================================
    // SAVE DEPARTMENT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const name =
            form.name.trim();

        const description =
            form.description.trim();


        if (!name) {

            setError(
                "Department name is required."
            );

            return;

        }


        try {

            setSaving(true);

            setError("");

            setSuccess("");


            let data;


            // ==================================
            // CREATE
            // ==================================

            if (!editingDepartment) {

                data =
                    await apiRequest(
                        "/departments",
                        {
                            method: "POST",

                            body: {
                                name,
                                description
                            }
                        }
                    );

            }


            // ==================================
            // UPDATE
            // ==================================

            else {

                data =
                    await apiRequest(
                        `/departments/${editingDepartment.id}`,
                        {
                            method: "PUT",

                            body: {
                                name,
                                description
                            }
                        }
                    );

            }


            console.log(
                "DEPARTMENT SAVE:",
                data
            );


            setSuccess(
                data?.message ||
                (
                    editingDepartment
                        ? "Department updated successfully."
                        : "Department created successfully."
                )
            );


            setShowModal(false);

            setEditingDepartment(null);

            setForm({
                name: "",
                description: ""
            });


            await loadDepartments();


        } catch (err) {

            console.error(
                "DEPARTMENT SAVE ERROR:",
                err
            );

            setError(
                err?.message ||
                "Unable to save department."
            );

        } finally {

            setSaving(false);

        }

    };


    // ==========================================
    // DELETE DEPARTMENT
    // ==========================================

    const handleDelete = async (department) => {

        if (!department) {
            return;
        }


        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${department.name}"?\n\nDepartments with assigned employees cannot be deleted.`
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeleting(true);

            setError("");

            setSuccess("");


            const data =
                await apiRequest(
                    `/departments/${department.id}`,
                    {
                        method: "DELETE"
                    }
                );


            console.log(
                "DEPARTMENT DELETE:",
                data
            );


            setSuccess(
                data?.message ||
                "Department deleted successfully."
            );


            await loadDepartments();


        } catch (err) {

            console.error(
                "DEPARTMENT DELETE ERROR:",
                err
            );


            setError(
                err?.message ||
                "Unable to delete department."
            );

        } finally {

            setDeleting(false);

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="page-loading">
                Loading departments...
            </div>
        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="department-management-page">


            {/* =====================================
                HEADER
            ====================================== */}

            <div className="department-management-header">

                <div>

                    <h1>
                        Department Management
                    </h1>

                    <p>
                        Create, edit and manage
                        employee departments
                    </p>

                </div>


                <button
                    type="button"
                    className="department-add-button"
                    onClick={openAddModal}
                    disabled={
                        saving ||
                        deleting
                    }
                >
                    + Add Department
                </button>

            </div>


            {/* =====================================
                SUCCESS
            ====================================== */}

            {success && (

                <div className="department-success-message">

                    {success}

                </div>

            )}


            {/* =====================================
                ERROR
            ====================================== */}

            {error && !showModal && (

                <div className="department-error-message">

                    {error}

                </div>

            )}


            {/* =====================================
                DEPARTMENT LIST
            ====================================== */}

            <section className="department-management-section">


                {/* =================================
                    SECTION HEADER
                ================================== */}

                <div className="department-management-section-header">

                    <div>

                        <h2>
                            Departments
                        </h2>

                        <p>
                            Showing{" "}
                            {filteredDepartments.length}
                            {" "}of{" "}
                            {departments.length}
                            {" "}
                            {departments.length === 1
                                ? "department"
                                : "departments"}
                        </p>

                    </div>

                </div>


                {/* =================================
                    SEARCH
                ================================== */}

                <div className="department-management-search">

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
                        placeholder="Search department or description..."
                    />

                    {search && (

                        <button
                            type="button"
                            className="department-management-clear-search"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            Clear
                        </button>

                    )}

                </div>


                {/* =================================
                    EMPTY
                ================================== */}

                {filteredDepartments.length === 0 ? (

                    <div className="department-management-empty">

                        <h3>
                            No departments found
                        </h3>

                        <p>
                            {search
                                ? "Try a different search."
                                : "Add your first department to get started."}
                        </p>

                    </div>

                ) : (

                    <div className="department-management-table-wrapper">

                        <table className="department-management-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredDepartments.map(
                                    (department) => (

                                        <tr
                                            key={
                                                department.id
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        department.id
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                <strong>
                                                    {
                                                        department.name ||
                                                        "—"
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                {
                                                    department.description ||
                                                    "—"
                                                }

                                            </td>


                                            <td>

                                                <div className="department-management-actions">

                                                    <button
                                                        type="button"
                                                        className="department-edit-button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                department
                                                            )
                                                        }
                                                        disabled={
                                                            saving ||
                                                            deleting
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="department-delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                department
                                                            )
                                                        }
                                                        disabled={
                                                            saving ||
                                                            deleting
                                                        }
                                                    >

                                                        {deleting
                                                            ? "Deleting..."
                                                            : "Delete"}

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =====================================
                ADD / EDIT MODAL
            ====================================== */}

            {showModal && (

                <div
                    className="department-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div
                        className="department-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* HEADER */}

                        <div className="department-modal-header">

                            <div>

                                <h2>
                                    {
                                        editingDepartment
                                            ? "Edit Department"
                                            : "Add Department"
                                    }
                                </h2>

                                <p>
                                    {
                                        editingDepartment
                                            ? "Update department information"
                                            : "Create a new department"
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                className="department-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {error && (

                                <div className="department-form-error">

                                    {error}

                                </div>

                            )}


                            <div className="department-form-group">

                                <label>
                                    Department Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter department name"
                                    disabled={
                                        saving
                                    }
                                    autoFocus
                                />

                            </div>


                            <div className="department-form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter department description"
                                    disabled={
                                        saving
                                    }
                                    rows="4"
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="department-modal-actions">

                                <button
                                    type="button"
                                    className="department-cancel-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="department-save-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingDepartment
                                            ? "Update Department"
                                            : "Add Department"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default DepartmentManagement;