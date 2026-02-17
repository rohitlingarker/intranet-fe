export default function FiltersBar({
  department,
  setDepartment,
  status,
  setStatus,
  location,
  setLocation,
}) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {/* Department */}
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        style={selectStyle}
      >
        <option value="">All Departments</option>
        <option>Engineering</option>
        <option>Human Resources</option>
      </select>

      {/* Employment Status */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={selectStyle}
      >
        <option value="">All Status</option>
        <option>Working</option>
        <option>Probation</option>
      </select>

      {/* Location */}
      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={selectStyle}
      >
        <option value="">All Locations</option>
        <option>Hyderabad Office</option>
      </select>
    </div>
  );
}

const selectStyle = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 13,
};
