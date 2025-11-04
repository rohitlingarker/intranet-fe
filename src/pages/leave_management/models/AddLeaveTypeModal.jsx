import React, { useState, useEffect, Fragment } from "react";
import { X, FileText, Check, ChevronDown } from "lucide-react";
import axios from "axios";
import { Listbox, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
 
const BASE_URL = import.meta.env.VITE_BASE_URL;

const useLeavelables = () => {
  const [leavelables, setLeavelables] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchLeavelables = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/leave/types`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("res", res);
        const types = res.data?.data || res.data || [];
        setLeavelables(types); // store full {name, label} objects
      } catch (err) {
        toast.error("Failed to fetch leave labels.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeavelables();
  }, []);

  return { leavelables, loading };
};


const defaultForm = {
  leaveTypeId: "",
  leaveName: "",
  description: "",
  maxDaysPerYear: "",
  maxCarryForwardPerYear: "",
  maxCarryForward: "",
  requiresDocumentation: false,
  expiryDays: "",
  waitingPeriodDays: "",
  advanceNoticeDays: "",
  pastDateLimitDays: "",
  allowHalfDay: true,
  allowNegativeBalance: false,
  noticePeriodRestriction: false,
  weekendsAndHolidaysAllowed: false,
  active: true,
  effectiveStartDate: "",
  deactivationEffectiveDate: "",
};
 
const AddLeaveTypeModal = ({ isOpen, onClose, editData = null, onSuccess }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const { leavelables, loading: loadinglables } = useLeavelables();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) {
      setFormData(editData ? { ...defaultForm, ...editData } : defaultForm);
    }
  }, [isOpen, editData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      maxDaysPerYear: formData.maxDaysPerYear
        ? Number(formData.maxDaysPerYear)
        : null,
      maxCarryForward: formData.maxCarryForward
        ? Number(formData.maxCarryForward)
        : 0,
      maxCarryForwardPerYear: formData.maxCarryForwardPerYear
        ? Number(formData.maxCarryForwardPerYear)
        : 0,
      expiryDays: formData.expiryDays ? Number(formData.expiryDays) : 0,
      waitingPeriodDays: formData.waitingPeriodDays
        ? Number(formData.waitingPeriodDays)
        : 0,
      advanceNoticeDays: formData.advanceNoticeDays
        ? Number(formData.advanceNoticeDays)
        : 0,
      pastDateLimitDays: formData.pastDateLimitDays
        ? Number(formData.pastDateLimitDays)
        : 0,
    };

    const url = editData
      ? `${BASE_URL}/api/leave/update-leave-type/${editData.leaveTypeId}`
      : `${BASE_URL}/api/leave/add-leave-type`;

    try {
      const response = editData
        ? await axios.patch(url, payload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
        : await axios.post(url, payload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

      if (response.data?.success) {
        toast.success(
          response.data.message ||
            (editData ? "Leave type updated!" : "Leave type added!")
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.data?.message || "Something went wrong!");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit leave type"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto relative">
        {submitting && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-xl z-50">
            <LoadingSpinner text="Submitting..." />
          </div>
        )}
 
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {editData ? "Edit Leave Type" : "Add New Leave Type"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Leave Name Dropdown */}
          {/* Leave Name Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Name *
            </label>
            {loadinglables ? (
              <p className="text-gray-500 text-sm">Loading leave labels...</p>
            ) : (
              <Listbox
                value={formData.leaveName}
                onChange={(selectedName) =>
                  setFormData((prev) => ({ ...prev, leaveName: selectedName }))
                }
              >
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm">
                    <span className="block truncate">
                      {leavelables.find(
                        (item) => item.name === formData.leaveName
                      )?.label || "Select leave name"}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {leavelables.map((item) => (
                        <Listbox.Option
                          key={item.name}
                          value={item.name}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-green-100 text-green-900"
                                : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {item.label}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                  <Check className="w-5 h-5" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            )}
          </div>

          {/* Effective Dates */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Start Date *
              </label>
              <input
                type="date"
                name="effectiveStartDate"
                value={formData.effectiveStartDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deactivation Effective Date
              </label>
              <input
                type="date"
                name="deactivationEffectiveDate"
                value={formData.deactivationEffectiveDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Numeric Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "maxDaysPerYear",
              "maxCarryForward",
              "maxCarryForwardPerYear",
              "expiryDays",
              "waitingPeriodDays",
              "advanceNoticeDays",
              "pastDateLimitDays",
            ].map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  name={key}
                  type="number"
                  min="0"
                  value={formData[key]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
          </div>
 
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Describe the leave type"
            />
          </div>

          {/* Boolean Fields */}
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "requiresDocumentation",
              "allowHalfDay",
              "allowNegativeBalance",
              "noticePeriodRestriction",
              "weekendsAndHolidaysAllowed",
              "active",
            ].map((key) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  id={key}
                  type="checkbox"
                  name={key}
                  checked={formData[key]}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label
                  htmlFor={key}
                  className="text-sm font-medium text-gray-700"
                >
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
              </div>
            ))}
          </div>
 
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-gray-800 border border-gray-300 hover:bg-gray-100 font-medium transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors flex items-center justify-center"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : editData
                ? "Update Leave Type"
                : "Add Leave Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default AddLeaveTypeModal;