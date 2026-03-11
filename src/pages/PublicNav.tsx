import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import '../styles/NavMenu.css'

export default function PublicNavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  //Ensure the nav menu is closed after navigating
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const links = [
    { name: "Home", path: "/home" },
    { name: "Events", path: "/events" },
    { name: "GE Tracker", path: "/getracker" },
    { name: "GE Planner", path: "/geplanner" },
    { name: "Toon Planner", path: "/toonplanner" },

  ];

  return (
    <nav className='nav'>
      <div className='nav-content'>
        {/* Logo & Hamburger Menu*/}
        <div className='nav-header-menu'>
            <div onClick={() => setIsOpen(!isOpen)} style={{cursor: "pointer" }}>
              {isOpen ? "✕" : "☰"}
            </div>
          <Link key={`home-link`} to={'/'} className='nav-header'>
              Guthix Lives
            </Link>
          </div>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: "none", gap: "24px" }}>
          {links.map((link) => (
            <Link key={link.name} to={link.path} style={{  }}>
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div   style={{ display: "flex", flexDirection: "column", padding: "8px 16px", backgroundColor: "#1e1e2f" }}>
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className='nav-item'
              style={{ }}
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