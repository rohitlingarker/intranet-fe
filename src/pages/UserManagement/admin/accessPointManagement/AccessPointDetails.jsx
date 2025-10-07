import React, { useEffect, useState } from "react";
import { getAccessPoint } from "../../../../services/accessPointService";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../../../components/Button/Button";
import {
  ArrowLeft,
  Search,
  Link,
  Settings,
  Package,
  Globe,
  Shield,
} from "lucide-react";

const AccessPointDetails = () => {
  const { access_uuid } = useParams();
  const [ap, setAp] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAccessPoint(access_uuid).then((res) => setAp(res.data));
  }, [access_uuid]);

  if (!ap) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      {/* ✅ Back Button Outside Container */}
      <div className="flex justify-end mb-4">
        <Button
          variant="secondary"
          size="medium"
          onClick={() => navigate("/user-management/access-points")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* ✅ Details Card */}
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-6 text-center flex items-center justify-center gap-2">
          <Search className="w-6 h-6" /> Access Point Details
        </h2>

        <div className="space-y-4 text-gray-800">
          <p className="flex items-center gap-2">
            <Link className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-600">Path:</span>{" "}
            {ap.endpoint_path}
          </p>
          <p className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-600">Method:</span>{" "}
            {ap.method}
          </p>
          <p className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-600">Module:</span>{" "}
            {ap.module}
          </p>
          <p className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-600">Public:</span>{" "}
            {ap.is_public ? "Yes" : "No"}
          </p>
          <p className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-600">Permission:</span>{" "}
            {ap.permission_code || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessPointDetails;
