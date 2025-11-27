// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import FormInput from "../../../../components/forms/FormInput";
// import FormTextArea from "../../../../components/forms/FormTextArea";
// import FormSelect from "../../../../components/forms/FormSelect";

// const EditTestPlan = ({ projectId, planData, onSuccess }) => {
//   const token = localStorage.getItem("token");

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     status: "Active",
//   });

//   const [loading, setLoading] = useState(false);

//   // Pre-fill form on mount
//   useEffect(() => {
//     if (planData) {
//       setFormData({
//         name: planData.name || "",
//         description: planData.description || "",
//         status: planData.status || "Active",
//       });
//     }
//   }, [planData]);

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       toast.error("Name is required.");
//       return;
//     }

//     setLoading(true);

//     try {
//       await axios.put(
//         `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/test-plans/${planData.id}`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       toast.success("Test Plan updated successfully.");
//       if (onSuccess) onSuccess();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update Test Plan.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <FormInput
//         label="Test Plan Name"
//         placeholder="Enter Test Plan name"
//         value={formData.name}
//         onChange={(e) => handleChange("name", e.target.value)}
//         required
//       />

//       <FormTextArea
//         label="Description"
//         placeholder="Enter description"
//         value={formData.description}
//         onChange={(e) => handleChange("description", e.target.value)}
//       />

//       <FormSelect
//         label="Status"
//         value={formData.status}
//         onChange={(e) => handleChange("status", e.target.value)}
//       >
//         <option value="Active">Active</option>
//         <option value="Inactive">Inactive</option>
//       </FormSelect>

//       <div className="flex justify-end gap-2 mt-4">
//         <button
//           type="submit"
//           className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition ${
//             loading ? "opacity-70 cursor-not-allowed" : ""
//           }`}
//           disabled={loading}
//         >
//           {loading ? "Updating..." : "Update Test Plan"}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default EditTestPlan;
