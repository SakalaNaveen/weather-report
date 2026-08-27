import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>☁ Weather Report</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/history">History</Link>
      </div>
    </nav>
  );
}

export default Navbar;