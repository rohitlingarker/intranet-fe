import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

const Navbar = ({ logo, navItems = [] }) => {
  const navRef = useRef(null);
  const [offsetTop, setOffsetTop] = useState(0);

  useEffect(() => {
    if (navRef.current) {
      setOffsetTop(navRef.current.getBoundingClientRect().top);
    }
  }, []);

  return (
    <nav
      ref={navRef}
      className="border-b px-6 py-4 sticky bg-white"
      style={{ top: offsetTop, zIndex: 50 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-lg font-bold text-indigo-900">{logo}</div>

        <div className="flex gap-6">
          {navItems.map(({ name, onClick, isActive }, index) => {
            const baseClasses =
              "group flex items-center gap-2 cursor-pointer pb-1 relative text-gray-800 transition-colors duration-500 ease-in-out";

            const activeTextClasses = "text-indigo-900 font-semibold";
            const inactiveTextClasses = "text-gray-800";

            return (
              <button
                key={index}
                type="button"
                onClick={onClick}
                aria-current={isActive ? "page" : undefined}
                className={`${baseClasses} ${
                  isActive ? activeTextClasses : inactiveTextClasses
                } text-base`}
              >
                <span>{name}</span>

                <span
                  className={`
                    absolute bottom-0 left-1/2 h-[1.5px] w-full
                    bg-indigo-900 rounded
                    transform -translate-x-1/2
                    transition-opacity duration-500
                    pointer-events-none
                    ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                  `}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  logo: PropTypes.node,
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      isActive: PropTypes.bool,
    })
  ),
};

export default Navbar;
