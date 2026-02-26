"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Form components
import FormInput from "../../../components/forms/FormInput";
import FormSelect from "../../../components/forms/FormSelect";

// Toastify
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

export default function CreateOffer() {
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [ccOptions, setCcOptions] = useState([]);
  const [loadingCC, setLoadingCC] = useState(false);


  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mail: "",
    country_code: "",
    contact_number: "",
    designation: "",
    employee_type: "",
    package: "",
    currency: "",
    cc_emails: [],
  });

  const currencies = [
    { label: "INR", value: "INR" },
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
  ];
  const employeeTypes = [
    { label: "Full-Time", value: "Full-Time" },
    { label: "Part-Time", value: "Part-Time" },
    { label: "Contractor", value: "Contractor" },
    { label: "Intern", value: "Intern" },
  ];

  // Fetch countries
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/masters/country`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const formatted = res.data 
        .filter((c) => c.is_active === true)  
        .map((c) => ({
          label: `${c.country_name} (${c.calling_code})`,
          value: c.calling_code,
        }));

        setCountries(formatted);
      } catch (err) {
        console.error("Country load failed:", err);
      }
      setLoadingCountries(false);
    };

    load();
  }, []);
 /* ---------------- LOAD CC USERS ---------------- */

  const fetchCCUsers = async () => {
    setLoadingCC(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offer-approval/admin-users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const formatted = res.data.map((u) => ({
        value: u.mail,
        label: `${u.name} (${u.mail})`,
      }));

      setCcOptions(formatted);
    } catch (err) {
      console.error("Failed to load CC users:", err);
    }

    setLoadingCC(false);
  };

  useEffect(() => {
    fetchCCUsers();
  }, []);


  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cancel click → show confirmation overlay
  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  // Confirm cancel → clear fields
  const confirmCancel = () => {
    setFormData({
      first_name: "",
      last_name: "",
      mail: "",
      country_code: "",
      contact_number: "",
      designation: "",
      employee_type: "",
      package: "",
      currency: "",
      cc_emails: [],
    });
    setShowCancelConfirm(false);
  };

  // Close confirmation → keep fields
  const cancelConfirmation = () => {
    setShowCancelConfirm(false);
  };
  const customSelectStyles = {
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgb(207, 212, 231)",
  }),
};


  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Creating offer...");

    try {
      await axios.post(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.update(toastId, {
        render: "Offer Created Successfully!",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });

      setTimeout(() => navigate("/employee-onboarding"), 900);
      navigate("/employee-onboarding");
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || "Something went wrong.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6 relative">
      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-900">Create Offer</h2>
      <p className="text-gray-500 mt-1 mb-6">
        Fill out the form to create a new offer letter.
      </p>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* First + Last Name */}
        <div className="grid grid-cols-2 gap-6">
          <FormInput
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />
          <FormInput
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <FormInput
          label="Email"
          name="mail"
          type="email"
          value={formData.mail}
          onChange={handleChange}
        />

        {/* Country + Phone */}
        <div className="grid grid-cols-2 gap-6">
                  <FormSelect
            label="Country Code"
            name="country_code"
            value={formData.country_code}
            onChange={handleChange}
            options={
              loadingCountries
                ? [{ label: "Loading countries...", value: "" }]
                : countries
            }
            disabled={loadingCountries}
          />


          <FormInput
            label="Contact Number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
          />
        </div>

        {/* Designation */}
        <FormInput
          label="Designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
        />

        {/* Employee Type */}
        <FormSelect
          label="Employee Type"
          name="employee_type"
          value={formData.employee_type}
          onChange={handleChange}
          options={employeeTypes}
        />
        

        {/* Package */}
        <FormInput
          label="Package"
          name="package"
          value={formData.package}
          onChange={handleChange}
        />

        {/* Currency */}
        <FormSelect
          label="Currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          options={currencies}
        />

         {/* ---------- CC SELECTOR ---------- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CC Recipients (Optional)
          </label>

          <Select
            isMulti
            isLoading={loadingCC}
            options={ccOptions}
            styles={customSelectStyles}
            placeholder="Search and select CC recipients..."


            value={ccOptions.filter((opt) =>
              formData.cc_emails?.includes(opt.value)
            )}

            onChange={(selected) => {
              const emails = selected
                ? selected.map((item) => item.value)
                : [];

              setFormData({
                ...formData,
                cc_emails: emails,
              });
            }}
          />
        </div>
        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancelClick}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
          >
            Create Offer
          </button>
        </div>
      </form>

      {/* 🔒 Overlay Confirmation (INSIDE FORM CARD) */}
      {showCancelConfirm && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Cancel
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel? All entered details will be
              cleared.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={cancelConfirmation}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
