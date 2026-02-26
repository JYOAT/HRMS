import { useEffect, useState } from "react";
import API from "../api";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    id: "",
    full_name: "",
    email: "",
    department: "",
  });

  const [loading, setLoading] = useState(false); // Adding new employee
  const [deletingId, setDeletingId] = useState(null); // Deleting employee
  const [fetching, setFetching] = useState(false); // Fetching employees
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    setFetching(true);
    try {
      const res = await API.get("/employees");
      setEmployees(res.data);
    } catch {
      setError("Failed to fetch employees");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/employees", form);
      setForm({ id: "", full_name: "", email: "", department: "" });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    setDeletingId(id);
    setError("");
    try {
      await API.delete(`/employees/${id}`);
      fetchEmployees();
    } catch {
      setError("Failed to delete employee");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Employees</h2>

      {/* Add Employee Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          marginBottom: "2rem",
        }}
      >
        <input
          placeholder="ID"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          placeholder="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#1976d2",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Adding..." : "Add Employee"}
        </button>
      </form>

      {/* Error Message */}
      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

      {/* Employee Table */}
      {fetching ? (
        <p>Loading employees...</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                ID
              </th>
              <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                Name
              </th>
              <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                Email
              </th>
              <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                Department
              </th>
              <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  {emp.id}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  {emp.full_name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  {emp.email}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  {emp.department}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    disabled={deletingId === emp.id}
                    style={{
                      padding: "0.4rem 0.6rem",
                      borderRadius: "4px",
                      border: "none",
                      backgroundColor: "#d32f2f",
                      color: "white",
                      cursor: deletingId === emp.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {deletingId === emp.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
