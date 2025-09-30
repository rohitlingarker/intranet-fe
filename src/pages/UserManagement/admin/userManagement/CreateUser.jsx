import { useState } from "react";
import axios from "axios";
import { showStatusToast } from "../../../../components/toastfy/toast";
import FormInput from "../../../../components/forms/FormInput";
import Button from "../../../../components/Button/Button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function CreateUserForm({ onSuccess, onClose }) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mail: "",
    contact: "",
    password: "",
    is_active: true,
  });

  const [generatedPassword, setGeneratedPassword] = useState("");
 
  const generatePasswordFromUser = (firstName, mobile) => {
    if (!firstName.trim()) return showSingleToast("First Name is required.");
    if (!/^[A-Za-z ]*$/.test(form.first_name)) return showSingleToast("First Name must contain only letters and spaces.");
    const namePart = (firstName || "").slice(0, 4);
    const digits = String(mobile || "").replace(/\D/g, "");
    const mobilePart = digits.slice(-4);
    let base = `${namePart}@${mobilePart}`;
    // Enforce backend rules: ≥8 chars, upper, lower, digit, special
    if (!/[A-Z]/.test(base)) base = base.replace(/^[a-z]/, (c) => c.toUpperCase()) || `T${base}`;
    if (!/[a-z]/.test(base)) base += "a";
    if (!/\d/.test(base)) base += "1";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(base)) base += "!";
    while (base.length < 8) base += "0";
    return base;
  };

  const [loading, setLoading] = useState(false);
  const [toastActive, setToastActive] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const showSingleToast = (message, type = "error") => {
    if (!toastActive) {
      setToastActive(true);
      showStatusToast(message, type);
      setTimeout(() => setToastActive(false), 3000);
    }
  };

  // ✅ Validation function
  const validateForm = () => {
    if (!form.first_name.trim()) return showSingleToast("First Name is required.");
    if (!/^[A-Za-z ]*$/.test(form.first_name)) return showSingleToast("First Name must contain only letters and spaces.");
    if (!form.last_name.trim()) return showSingleToast("Last Name is required.");
    if (!/^[A-Za-z ]*$/.test(form.last_name)) return showSingleToast("Last Name must contain only letters and spaces.");
    if (!form.mail.trim()) return showSingleToast("Email is required.");
    if (!/^[a-zA-Z0-9@._-]+$/.test(form.mail)) return showSingleToast("Email contains invalid characters.");
    if (!form.contact.trim()) return showSingleToast("Contact number is required.");

    // ✅ Parse phone number
    const phoneNumber = parsePhoneNumberFromString("+" + form.contact.replace(/\D/g, ""));
    if (!phoneNumber || !phoneNumber.isValid()) {
      return showSingleToast("Invalid phone number for the selected country.");
    }

    // ✅ Strict national number length check
    const countryCode = phoneNumber.countryCallingCode; // e.g., "91"
    const nationalLen = phoneNumber.nationalNumber.length;

    if (countryCode === "91" && nationalLen !== 10) {
      return showSingleToast("Indian contact number must be exactly 10 digits.");
    }
    if (countryCode === "1" && nationalLen !== 10) {
      return showSingleToast("US contact number must be exactly 10 digits.");
    }

    if (!form.password.trim()) return showSingleToast("Password is required.");
    if (form.password.length < 6) return showSingleToast("Password must be at least 6 characters long.");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validateForm()) return;

    setLoading(true);

  
    const password = generatePasswordFromUser(form.first_name, form.contact);
    if (form.password !== password) {
      showSingleToast("Password does not match the criteria and please click generate password again", "error");
      setLoading(false);
      return;
    }
    console.log(form.contact);
    form.password = password;

    try {
      await axios.post(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      console.error("User creation failed:", err);
      showSingleToast(err?.response?.data?.detail || "Failed to create user.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4 max-h-[60vh] overflow-y-auto"
      >
        {/* First + Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={(e) => {
              if (/^[A-Za-z ]*$/.test(e.target.value)) handleChange(e);
            }}
            placeholder="Enter first name"
            required
          />
          <FormInput
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={(e) => {
              if (/^[A-Za-z ]*$/.test(e.target.value)) handleChange(e);
            }}
            placeholder="Enter last name"
            required
          />
        </div>

        {/* Email */}
        <FormInput
          label="Email"
          type="email"
          name="mail"
          value={form.mail}
          onChange={(e) => {
            if (/^[a-zA-Z0-9@._-]*$/.test(e.target.value)) handleChange(e);
          }}
          placeholder="Enter email"
          required
        />

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact
          </label>
          <PhoneInput
            country={"us"} // default to US, can be changed by user
            value={form.contact}
            onChange={(phone, countryData) =>
              setForm((prev) => ({
                ...prev,
                contact: phone, // always update properly
              }))
            }
            enableSearch
            disableDropdown={false}
            placeholder="Enter phone number"
            containerClass="w-full"
            inputClass="!w-full !pl-16 !pr-3 !py-2 !border !rounded-md !shadow-sm sm:!text-sm"
            buttonClass="!absolute !left-0 !h-full !rounded-l-md !pl-3 !pr-3 !bg-white !border-r"
            dropdownClass="!z-50"
            enableAreaCodes={true}
            countryCodeEditable={true} // ✅ now user can edit number freely
          />
        </div>

        {/* Password */}
        <FormInput
            type="text"
            name="password"
            value={form.password}
            onChange={handleChange}
            onFocus={() => {
              if (!form.password) {
                const localGenerated = generatePasswordFromUser(form.first_name, form.contact);
                if (localGenerated) {
                  setForm((prev) => ({ ...prev, password: localGenerated }));
                  setGeneratedPassword(localGenerated);
                }
              }
            }}
            placeholder="Generate or enter a password"
            minLength={8}
          />

          <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => {
                const suggestion = generatePasswordFromUser(form.first_name, form.contact);
                setForm((prev) => ({ ...prev, password: suggestion }));
                setGeneratedPassword(suggestion);
                showStatusToast("Password generated from current First Name & Contact.", "info");
              }}
            >
              Generate Password
            </Button>

        {/* Active checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active_modal"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="is_active_modal" className="text-sm text-gray-700">
            Active
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
