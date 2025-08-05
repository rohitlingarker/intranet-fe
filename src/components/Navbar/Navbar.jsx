import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = ({ logo = "MyApp", navItems = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-bold text-indigo-900">{logo}</div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="relative text-gray-700 font-medium transition duration-200 hover:text-indigo-900"
              >
                <span className="hover-underline">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Hamburger Icon */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="block py-2 text-gray-700 font-medium transition duration-200 hover:text-indigo-900 relative"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="hover-underline">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hover underline style */}
      <style>{`
        .hover-underline::after {
          content: "";
          position: absolute;
          width: 0%;
          height: 2px;
          left: 0;
          bottom: -2px;
          background-color: #312e81; /* indigo-900 */
          transition: width 0.3s ease-in-out;
        }

        .hover-underline:hover::after {
          width: 100%;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
