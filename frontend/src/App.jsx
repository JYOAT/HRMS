import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";

export default function App() {
  const navStyle = {
    padding: "1rem",
    backgroundColor: "#1976d2",
    color: "white",
    display: "flex",
    gap: "1rem",
    fontWeight: "bold",
  };

  const linkStyle = { color: "white", textDecoration: "none" };

  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>
          Employees
        </Link>
        <Link to="/attendance" style={linkStyle}>
          Attendance
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </BrowserRouter>
  );
}
