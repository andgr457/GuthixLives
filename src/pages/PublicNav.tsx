import { useState } from "react";
import { Link } from "react-router-dom";

export default function PublicNavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", path: "/home" },
    { name: "Events", path: "/events" },
  ];

  return (
    <nav style={{ backgroundColor: "#1e2f22", color: "#ffd700", position: "fixed", width: "100%", zIndex: 50 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "60px" }}>
        {/* Logo */}
        <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>Guthix Lives</div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: "none", gap: "24px" }}>
          {links.map((link) => (
            <Link key={link.name} to={link.path} style={{ color: "#FFD700", textDecoration: "none" }}>
              {link.name}
            </Link>
          ))}
        </div>

        {/* Hamburger Menu */}
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)} style={{ cursor: "pointer", fontSize: "1.5rem" }}>
          {isOpen ? "✕" : "☰"}
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

      {/* Responsive CSS */}
      <style>
        {`
          @media(min-width: 768px) {
            .desktop-menu { display: flex !important; }
            .hamburger, .mobile-menu { display: none !important; }
          }
        `}
      </style>
    </nav>
  );
}