import React, { useEffect, useState } from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function JobProgress({ jobId }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("PENDING");

  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}/api/leave-types/jobs/${jobId}/stream`);

    eventSource.addEventListener("progress", (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setStatus(data.status);
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  return (
    <div className="p-4 shadow rounded bg-white">
      <h2>Job Status: {status}</h2>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-green-500 h-4 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p>{progress}% complete</p>
    </div>
  );
}
