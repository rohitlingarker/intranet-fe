import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CompOffRequestsTable from "./CompOffRequestsTable";
import CompOffRequestModal from "./CompOffRequestModal";
import LoadingSpinner from "../../../components/LoadingSpinner"; // your spinner component

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CompOffPage = forwardRef(
  ({ employeeId, onPendingRequestsChange, refreshKey }, ref) => {
    const [requests, setRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const token = localStorage.getItem("token");

    useImperativeHandle(ref, () => ({
      handleCompOffSubmit,
      refreshRequests: fetchRequests, // ✅ optional: parent can manually trigger
    }));

    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${BASE_URL}/api/compoff/employee/${employeeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          const allRequests = res.data.data || [];
          const pending = allRequests.filter((r) => r.status === "PENDING");

          setRequests(allRequests);
          setPendingRequests([...pending]); // ✅ ensure new array
          if (onPendingRequestsChange) onPendingRequestsChange([...pending]); // ✅ notify parent
        }
      } catch (err) {
        toast.error("Failed to fetch comp-off requests");
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (employeeId) fetchRequests();
    }, [employeeId, refreshKey]); // ✅ refetch when refreshKey changes

    // Handle new comp-off request
    const handleCompOffSubmit = async (payload) => {
      try {
        setIsLoading(true);
        payload = { ...payload, employeeId }; // add employeeId
        const res = await axios.post(
          `${BASE_URL}/api/compoff/request`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          toast.success("Comp-Off request submitted successfully!");
          await fetchRequests(); // refresh list
          return true;
        } else {
          toast.error(res.data.message || "Failed to submit comp-off request.");
          return false;
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while submitting.");
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div>
        {isLoading && <LoadingSpinner />}

        {/* Only show table if there are pending requests */}
        {pendingRequests.length > 0 && !isLoading && (
          <>
            <h2 className="m-4 text-sl font-semibold mb-4">
              Pending Comp-Off Requests
            </h2>
            <CompOffRequestsTable
              key={pendingRequests.map((r) => r.idleaveCompoff).join(",")}
              requests={pendingRequests}
              onCancel={async (id) => {
                try {
                  await axios.put(
                    `${BASE_URL}/api/compoff/employee/cancel/${id}`,
                    {},
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  toast.success("Comp-Off request cancelled!");
                  await fetchRequests(); // ✅ awaited
                } catch {
                  toast.error("Failed to cancel request");
                }
              }}
            />
          </>
        )}

        {/* Button to open modal */}
        {/* <div className="mt-4">
        <button
          onClick={() => setIsCompOffModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Request Comp-Off
        </button>
      </div> */}

        {/* Modal */}
        {/* {isCompOffModalOpen && (
        <CompOffRequestModal
          loading={isLoading}
          onSubmit={handleCompOffSubmit}
          onClose={() => setIsCompOffModalOpen(false)}
        />
      )} */}
      </div>
    );
  }
);

export default CompOffPage;
