import { useState } from "react";
import API from "../api";

export default function Attendance() {
  const [form, setForm] = useState({
    employee_id: "",
    date: "",
    status: "Present",
  });

  const [filter, setFilter] = useState({
    employee_id: "",
    date: "",
  });

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [totalPresent, setTotalPresent] = useState(0);
  const [error, setError] = useState("");

  // ------------------- Mark Attendance -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMarking(true);
    setError("");

    try {
      await API.post("/attendance", form);
      alert("Attendance recorded");

      setForm({ employee_id: "", date: "", status: "Present" });

      // Refresh records if same employee is being viewed
      if (filter.employee_id === form.employee_id) {
        fetchAttendance();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Error adding attendance");
    } finally {
      setMarking(false);
    }
  };

  // ------------------- Fetch Attendance -------------------
  const fetchAttendance = async () => {
    if (!filter.employee_id) return;

    setLoading(true);
    setError("");

    try {
      const params = {};
      if (filter.date) params.date = filter.date;

      const res = await API.get(`/attendance/${filter.employee_id}`, {
        params,
      });

      setRecords(res.data);

      const total = res.data.filter((r) => r.status === "Present").length;

      setTotalPresent(total);
    } catch (err) {
      setError("Error fetching attendance");
      setRecords([]);
      setTotalPresent(0);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Styles -------------------
  const containerStyle = {
    maxWidth: 900,
    width: "90%",
    margin: "2rem auto",
    fontFamily: "Arial, sans-serif",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    boxSizing: "border-box",
  };

  const selectStyle = { ...inputStyle };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    cursor: "pointer",
    marginBottom: "1rem",
  };

  const sectionStyle = { marginBottom: "2rem" };

  return (
    <div style={containerStyle}>
      <h2>Attendance Management</h2>

      {/* --- Mark Attendance Form --- */}
      <div style={sectionStyle}>
        <h3>Mark Attendance</h3>
        <form onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            placeholder="Employee ID"
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
          />

          <input
            style={inputStyle}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <select
            style={selectStyle}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Present</option>
            <option>Absent</option>
          </select>

          <button style={buttonStyle} type="submit" disabled={marking}>
            {marking ? "Marking..." : "Mark Attendance"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>

      {/* --- Attendance Filter & Records --- */}
      <div style={sectionStyle}>
        <h3>View Attendance</h3>

        <input
          style={inputStyle}
          placeholder="Employee ID"
          value={filter.employee_id}
          onChange={(e) =>
            setFilter({
              employee_id: e.target.value,
              date: "", // ✅ Reset date when employee changes
            })
          }
        />

        <input
          style={inputStyle}
          type="date"
          value={filter.date}
          disabled={!filter.employee_id} // ✅ Disable until employee entered
          onChange={(e) => setFilter({ ...filter, date: e.target.value })}
        />

        <button
          style={buttonStyle}
          onClick={fetchAttendance}
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Attendance"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {records.length === 0 && !loading && (
          <p>No attendance records found.</p>
        )}

        {records.length > 0 && (
          <div>
            <p>
              <strong>Total Present Days:</strong> {totalPresent}
            </p>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "1rem",
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    Date
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      {r.date}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      {r.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
