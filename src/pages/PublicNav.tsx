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
    { name: "Characters", path: "/characters" },
    { name: "Events", path: "/events" },
    { name: "GE Tracker", path: "/getracker" },
    // { name: "GE Planner", path: "/geplanner" },
    // { name: "Toon Planner", path: "/toonplanner" },

  ];

  return (
    <nav className='nav'>
      <div className='nav-content' onClick={() => setIsOpen(!isOpen)} style={{cursor: "pointer" }}>
        {/* Logo & Hamburger Menu*/}

        <div className='flex-wrap-gap' style={{gap: '20px', fontSize: '24px', letterSpacing: '2px'}}>
          <div onClick={() => setIsOpen(!isOpen)} >
            {isOpen ? "✕" : "☰"}
          </div>
          <div>
            <Link key={`home-link`} to={'/'} className='nav-header'>
            Guthix Lives
          </Link>
          </div>
          
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
        <div   style={{letterSpacing: '2px', display: "flex", flexDirection: "column", padding: "8px 16px", backgroundColor: "#1e1e2f" }}>
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