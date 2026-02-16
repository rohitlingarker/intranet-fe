import { useState, useRef, useEffect } from "react";

export default function FiltersBar() {
  const filtersConfig = [
    { key: "business", label: "Business Unit", options: ["All", "BU1", "BU2"] },
    { key: "dept", label: "Department", options: ["All", "HR", "IT", "Finance"] },
    { key: "location", label: "Location", options: ["All", "Hyderabad", "Chennai"] },
    { key: "cost", label: "Cost Center", options: ["All", "CC101", "CC102"] },
    { key: "legal", label: "Legal Entity", options: ["All", "India Pvt Ltd"] },
    { key: "date", label: "Date Range", options: ["Today", "This Month", "This Year"] },
    { key: "worker", label: "Worker Type", options: ["All", "Permanent", "Contract", "Intern"] },
  ];

  const [openKey, setOpenKey] = useState(null);
  const [selected, setSelected] = useState({});
  const containerRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpenKey(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (key) => {
    setOpenKey(openKey === key ? null : key);
  };

  const selectOption = (key, value) => {
    setSelected((prev) => ({ ...prev, [key]: value }));
    setOpenKey(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        gap: 12,
        margin: "20px 0",
        flexWrap: "wrap",
      }}
    >
      {filtersConfig.map((filter) => (
        <div key={filter.key} style={{ position: "relative" }}>
          {/* Filter Box */}
          <div
            onClick={() => toggleDropdown(filter.key)}
            style={{
              background: "#fff",
              padding: "10px 14px",
              borderRadius: 6,
              border: "1px solid #e2e6ea",
              minWidth: 170,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <span>
              {selected[filter.key] || filter.label}
            </span>
            <span style={{ fontSize: 12 }}>▾</span>
          </div>

          {/* Dropdown */}
          {openKey === filter.key && (
            <div
              style={{
                position: "absolute",
                top: "105%",
                left: 0,
                width: "100%",
                background: "#fff",
                border: "1px solid #e2e6ea",
                borderRadius: 6,
                boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
                zIndex: 100,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {filter.options.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => selectOption(filter.key, opt)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: 14,
                    borderBottom:
                      i !== filter.options.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.background = "#f6f7fb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.background = "white")
                  }
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
