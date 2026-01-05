import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AddCountryIdentityMappingModal from "./AddCountryIdentityMappingModal";

export default function CountryIdentityMapping() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;
  const token = localStorage.getItem("token");

  /* ---------------- FETCH COUNTRIES ---------------- */
  const fetchCountries = async () => {
    const res = await axios.get(`${BASE_URL}/masters/country`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCountries(res.data);
  };

  /* ---------------- FETCH MAPPINGS BY COUNTRY ---------------- */
  const fetchMappings = async (countryUuid) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/identity/country-mapping/identities/${countryUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMappings(res.data);
    } catch {
      toast.error("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE MAPPING ---------------- */
  const deleteMapping = async (mappingUuid) => {
    if (!window.confirm("Remove this identity from country?")) return;

    try {
      await axios.delete(
        `${BASE_URL}/identity/country-mapping/${mappingUuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Mapping removed");
      fetchMappings(selectedCountry);
    } catch {
      toast.error("Failed to delete mapping");
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) fetchMappings(selectedCountry);
  }, [selectedCountry]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Country Identity Mapping
          </h1>
          <p className="text-gray-600">
            Configure required identity documents per country
          </p>
        </div>

        {selectedCountry && (
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2 bg-blue-700 text-white rounded-lg"
          >
            + Add Identity
          </button>
        )}
      </div>

      {/* Country Selector */}
      <select
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        className="border rounded-lg px-3 py-2 mb-6 w-80"
      >
        <option value="">Select Country</option>
        {countries.map((c) => (
          <option key={c.country_uuid} value={c.country_uuid}>
            {c.country_name}
          </option>
        ))}
      </select>

      {/* Mapping Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : mappings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No identities mapped
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Identity Type</th>
                <th className="px-6 py-3 text-left">Mandatory</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((item) => (
                <tr key={item.identity_type_uuid} className="border-b">
                  <td className="px-6 py-3">
                    {item.identity_type_name}
                  </td>
                  <td className="px-6 py-3">
                    {item.is_mandatory ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => deleteMapping(item.mapping_uuid)}
                      className="text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddCountryIdentityMappingModal
          countryUuid={selectedCountry}
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchMappings(selectedCountry)}
        />
      )}
    </div>
  );
}
