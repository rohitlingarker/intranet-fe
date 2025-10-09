import { useState } from "react";
import Button from "../../../../components/Button/Button";
import axios from "axios";
import FileUpload from "../../../../components/forms/FileUpload";
import { showStatusToast } from "../../../../components/toastfy/toast";

const BulkUserUpload = ({onClose,onSuccess}) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!file) {
    showStatusToast("Please select a file before submitting.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    showStatusToast("Uploading file, please wait...", "info");

    const response = await axios.post(
      `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/multiple-users`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const { created_count, failed_count } = response.data;

    if (failed_count === 0) {
      showStatusToast(
        `${created_count} users created successfully.`,
        "success"
      );
    } else {
      showStatusToast(
        `${created_count} users created, ${failed_count} failed.`,
        "warning"
      );
    }

    setFile(null);
    if (typeof onSuccess === "function") onSuccess();

  } catch (error) {
    console.error(error);
    showStatusToast(
      `Upload failed: ${error.response?.data?.detail || error.message}`,
      "error"
    );
  }
};


  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        Bulk User Upload
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FileUpload
          label="Select Excel File (.xlsx)"
          name="userFile"
          onChange={handleFileChange}
        />

        {file && (
          <p className="text-sm text-gray-600">
            Selected file: <span className="font-medium">{file.name}</span>
          </p>
        )}

        {/* <Button type="submit" label="Upload" /> */}
        <Button
            type="button"
            variant="primary"
            size="small"
            onClick={handleSubmit}
            className="flex-1 sm:flex-none"
          >
            Upload
          </Button>
      </form>
      <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
    </div>
  );
};

export  {BulkUserUpload};
