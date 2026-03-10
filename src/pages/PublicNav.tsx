import { useState } from "react";
import { Link } from "react-router-dom";

export default function PublicNavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", path: "/home" },
    { name: "Events", path: "/events" },
    { name: "GE Tracker", path: "/getracker" },
    { name: "GE Planner", path: "/geplanner" },
    { name: "Toon Planner", path: "/toonplanner" },

  ];

  return (
    <nav style={{ backgroundColor: "#1e2f22", color: "#ffd700", position: "fixed", width: "100%", zIndex: 50 }}>
      <div style={{justifyContent: "space-between", alignItems: "center", padding: '10px' }}>
        {/* Logo */}
        <div style={{display: 'flex', gap: '2em', fontWeight: "bold", fontSize: "1.25rem" }}>
          <Link key={`home-link`} to={'/'} style={{ color: "#FFD700", textDecoration: "none" }}>
              Guthix Lives
            </Link>
            <div onClick={() => setIsOpen(!isOpen)} style={{cursor: "pointer", fontSize: "1.5rem" }}>
              {isOpen ? "✕" : "☰"}
            </div>
          </div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: "none", gap: "24px" }}>
          {links.map((link) => (
            <Link key={link.name} to={link.path} style={{ color: "#FFD700", textDecoration: "none" }}>
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu" style={{ display: "flex", flexDirection: "column", padding: "8px 16px", backgroundColor: "#1e1e2f" }}>
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              style={{ color: "#FFD700", padding: "8px 0", textDecoration: "none" }}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}