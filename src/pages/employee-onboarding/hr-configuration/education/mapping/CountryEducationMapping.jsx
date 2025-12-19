import { useEffect, useState } from "react";
import axios from "axios";

export default function CountryEducationMapping() {
  const [countries, setCountries] = useState([]);
  const [levels, setLevels] = useState([]);
  const [docs, setDocs] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [country, setCountry] = useState("");
  const [level, setLevel] = useState("");
  const [doc, setDoc] = useState("");
  const [mandatory, setMandatory] = useState(true);

  const BASE = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${BASE}/masters/country`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => setCountries(r.data));

    axios.get(`${BASE}/masters/education-level`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => setLevels(r.data));

    axios.get(`${BASE}/education/education-document`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => setDocs(r.data));
  }, []);

  const loadMappings = async (uuid) => {
    const res = await axios.get(
      `${BASE}/education/country-mapping/${uuid}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMappings(res.data);
  };

  const add = async () => {
    await axios.post(
      `${BASE}/masters/${level}/${doc}/${country}`,
      { is_mandatory: mandatory },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadMappings(country);
  };

  const remove = async (uuid) => {
    if (!confirm("Remove mapping?")) return;
    await axios.delete(`${BASE}/masters/mapping/${uuid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadMappings(country);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">
        Country ↔ Education Mapping
      </h1>

      <select
        className="border p-2 mb-4"
        onChange={(e) => {
          setCountry(e.target.value);
          loadMappings(e.target.value);
        }}
      >
        <option>Select Country</option>
        {countries.map(c => (
          <option key={c.country_uuid} value={c.country_uuid}>
            {c.country_name}
          </option>
        ))}
      </select>

      {country && (
        <>
          <div className="flex gap-3 mb-4">
            <select onChange={e => setLevel(e.target.value)}>
              <option>Education Level</option>
              {levels.map(l => (
                <option key={l.education_uuid} value={l.education_uuid}>
                  {l.education_name}
                </option>
              ))}
            </select>

            <select onChange={e => setDoc(e.target.value)}>
              <option>Document</option>
              {docs.map(d => (
                <option key={d.education_document_uuid} value={d.education_document_uuid}>
                  {d.document_name}
                </option>
              ))}
            </select>

            <label>
              <input
                type="checkbox"
                checked={mandatory}
                onChange={() => setMandatory(!mandatory)}
              /> Mandatory
            </label>

            <button onClick={add} className="bg-blue-700 text-white px-4">
              Add
            </button>
          </div>

          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Education</th>
                <th className="p-3">Document</th>
                <th className="p-3">Mandatory</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map(m => (
                <tr key={m.mapping_uuid} className="border-t">
                  <td className="p-3">{m.education_name}</td>
                  <td className="p-3">{m.document_name}</td>
                  <td className="p-3">{m.is_mandatory ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => remove(m.mapping_uuid)}
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
