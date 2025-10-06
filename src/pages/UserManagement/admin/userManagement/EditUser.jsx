import { useEffect, useState, useRef } from "react";
import axios from "axios";
import FormInput from "../../../../components/forms/FormInput";
import Button from "../../../../components/Button/Button";
import { showStatusToast } from "../../../../components/toastfy/toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function EditUserForm({ userId, onSuccess, onClose }) {
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    mail: "",
    contact: "", // raw phone (no "+")
    password: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  // ✅ Fetch user details
  useEffect(() => {
    if (userId) {
      axios
        .get(`${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const { password, contact, ...rest } = res.data;
          setUser((prev) => ({
            ...prev,
            ...rest,
            contact: contact?.replace(/^\+/, "") || "", // store without "+"
          }));
        })
        .catch((err) => {
          console.error("Failed to fetch user:", err);
          showStatusToast("Access denied or user not found.", "error");
          onClose();
        });
    }
  }, [userId, token, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Validation
  const validateForm = () => {
    if (!user.first_name.trim()) return "First Name is required.";
    if (!/^[A-Za-z ]*$/.test(user.first_name)) return "First Name must contain only letters and spaces.";
    if (!user.last_name.trim()) return "Last Name is required.";
    if (!/^[A-Za-z ]*$/.test(user.last_name)) return "Last Name must contain only letters and spaces.";
    if (!user.mail.trim()) return "Email is required.";
    if (!/^[a-zA-Z0-9@._-]+$/.test(user.mail)) return "Email contains invalid characters.";
    if (!user.contact.trim()) return "Contact number is required.";

    // ✅ Always prefix with "+"
    const phoneNumber = parsePhoneNumberFromString("+" + user.contact);
    if (!phoneNumber || !phoneNumber.isValid()) {
      return "Invalid phone number for the selected country.";
    }

    if (phoneNumber.countryCallingCode === "91" && phoneNumber.nationalNumber.length !== 10) {
      return "Indian contact number must be exactly 10 digits.";
    }
    if (phoneNumber.countryCallingCode === "1" && phoneNumber.nationalNumber.length !== 10) {
      return "US contact number must be exactly 10 digits.";
    }

    return null;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const validationError = validateForm();
    if (validationError) {
      showStatusToast(validationError, "error");
      isSubmittingRef.current = false;
      return;
    }

    setLoading(true);

    try {
      const payload = { ...user };

      // ✅ Normalize phone with "+" prefix
      if (payload.contact && !payload.contact.startsWith("+")) {
        payload.contact = `+${payload.contact}`;
      }

      if (!payload.password) delete payload.password;

      await axios.put(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/${userId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
    } catch (err) {
      console.error("Update failed:", err);
      showStatusToast(err.response?.data?.detail || "Failed to update user.", "error");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
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
            value={user.first_name}
            onChange={(e) => {
              if (/^[a-zA-Z\s]*$/.test(e.target.value)) handleChange(e);
            }}
            placeholder="Enter first name"
          />
          <FormInput
            label="Last Name"
            name="last_name"
            value={user.last_name}
            onChange={(e) => {
              if (/^[a-zA-Z\s]*$/.test(e.target.value)) handleChange(e);
            }}
            placeholder="Enter last name"
          />
        </div>

        {/* Email */}
        <FormInput
          label="Email"
          name="mail"
          type="email"
          value={user.mail}
          onChange={(e) => {
            if (/^[a-zA-Z0-9@._-]*$/.test(e.target.value)) handleChange(e);
          }}
          placeholder="Enter email"
        />

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact
          </label>
          <PhoneInput
            country={"us"} // ✅ default to US
            onlyCountries={["us", "in", "gb", "ca"]} // ✅ restrict dropdown to main countries
            countryCodeEditable={false} // ✅ prevent editing +1 or +91 manually
            value={user.contact}
            onChange={(phone, country) =>
              setUser((prev) => ({
                ...prev,
                contact: phone, // raw without "+"
              }))
            }
            enableSearch
            placeholder="Enter phone number"
            containerClass="w-full"
            inputClass="!w-full !pl-16 !pr-3 !py-2 !border !rounded-md !shadow-sm sm:!text-sm"
            buttonClass="!absolute !left-0 !h-full !rounded-l-md !pl-3 !pr-3 !bg-white !border-r"
            dropdownClass="!z-50"
          />
        </div>

        {/* Password */}
        <FormInput
          label="New Password (Optional)"
          name="password"
          type="password"
          value={user.password}
          onChange={handleChange}
          placeholder="Leave blank to keep current password"
        />

        {/* Active checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={user.is_active}
            onChange={handleChange}
            id="is_active"
            className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Is Active
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
          <Button type="submit" disabled={loading || isSubmittingRef.current} className="flex-1 sm:flex-none">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading || isSubmittingRef.current}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
