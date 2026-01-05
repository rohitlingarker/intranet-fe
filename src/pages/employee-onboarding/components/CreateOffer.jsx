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

export default function CreateOffer() {
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mail: "",
    country_code: "",
    contact_number: "",
    designation: "",
    package: "",
    currency: "",
  });

  const currencies = [
    { label: "INR", value: "INR" },
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
  ];

  // Fetch countries
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/masters/country`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        const formatted = res.data.map((c) => ({
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

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Creating offer...");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/create`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.update(toastId, {
        render: "Offer Created Successfully!",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });

      setTimeout(() => navigate("/employee-onboarding"), 900);
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
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-6">

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
            className="rounded-lg border-gray-300 text-gray-700"
            placeholder="Enter first name"
          />

          <FormInput
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="rounded-lg border-gray-300 text-gray-700"
            placeholder="Enter last name"
          />
        </div>

        {/* Email */}
        <FormInput
          label="Email"
          name="mail"
          type="email"
          value={formData.mail}
          onChange={handleChange}
          placeholder="Enter email"
          className="rounded-lg border-gray-300 text-gray-700"
        />

        {/* Country + Phone */}
        <div className="grid grid-cols-2 gap-6">
          <FormSelect
            label="Country Code"
            name="country_code"
            value={formData.country_code}
            onChange={handleChange}
            options={countries}
            className="rounded-lg border-gray-300"
          />

          <FormInput
            label="Contact Number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="rounded-lg border-gray-300 text-gray-700"
          />
        </div>

        {/* Designation */}
        <FormInput
          label="Designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          placeholder="Enter designation"
          className="rounded-lg border-gray-300 text-gray-700"
        />

        {/* Package */}
        <FormInput
          label="Package"
          name="package"
          value={formData.package}
          onChange={handleChange}
          placeholder="Ex: 12 LPA"
          className="rounded-lg border-gray-300 text-gray-700"
        />

        {/* Currency */}
        <FormSelect
          label="Currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          options={currencies}
          className="rounded-lg border-gray-300"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/employee-onboarding-dashboard")}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow"
          >
            Create Offer
          </button>
        </div>
      </form>
    </div>
  );
}
