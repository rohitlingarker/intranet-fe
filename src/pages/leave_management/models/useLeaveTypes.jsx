import { useEffect, useState } from "react";

export default function useLeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leave/types")
      .then(res => res.json())
      .then(data => {
        setLeaveTypes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leave types", err);
        setLoading(false);
      });
  }, []);

  return { leaveTypes, loading };
}
