// import { useState, useEffect, useRef } from "react";
// import { lockRecord, releaseLock, checkLock } from "../services/recordLockService"

// export const useRecordLock = ({ tableName, recordId, user }) => {
//   const [locked, setLocked] = useState(false);
//   const [lockedBy, setLockedBy] = useState(null);
//   const isLockOwner = useRef(false);
  
//   // Lock record when component mounts
//   const acquireLock = async () => {
//     // b. Use `user` prop for the lock payload
//     const res = await lockRecord({ tableName, recordId, lockedBy: user });
//     if (res.success) {
//         setLocked(true);
//         setLockedBy(user);
//     } else {
//         setLocked(true); // It's locked, just by someone else
//         setLockedBy(res.lockedBy || "another user");
//     }
//   };

//   // Release lock when component unmounts
//   const releaseLockOnUnmount = async () => {
//     await releaseLock({ tableName, recordId, lockedBy: user });
//   };

//   // Check lock status
//   const refreshLockStatus = async () => {
//     const res = await checkLock({ tableName, recordId });
//     setLocked(res.locked);
//     setLockedBy(res.lockedBy);
//   };

//   // After
//   useEffect(() => {
//     // The new, more robust guard clause
//       if (!recordId || !user) {
//           return; 
//       }

//       const acquireLock = async () => {
//       // Pass the token to the service
//       const res = await lockRecord({ tableName, recordId, lockedBy: user });
      
//       // Logic to handle the API response
//       if (res.success) {
//       setLocked(true);
//       setLockedBy(user);
//       isLockOwner.current = true;
//       } else {
//       setLocked(true); 
//       setLockedBy(res.lockedBy || "another user");
//       isLockOwner.current = false;
//       }
//     };

//       acquireLock();

//       return () => {
//           const releaseLockOnUnmount = async () => {
//           // Only release the lock if you are the one who holds it
//           if (isLockOwner.current) {
//               await releaseLock({ tableName, recordId, lockedBy: user });
//           }
//           };
//           releaseLockOnUnmount();
//       };
//     // Add token and user to the dependency array
//   }, [tableName, recordId, user]);

//   return { locked, lockedBy, acquireLock, releaseLockOnUnmount, refreshLockStatus };
// };

import { useState, useEffect, useRef } from "react";
import { lockRecord, releaseLock } from "../services/recordLockService";

export const useRecordLock = ({ tableName, recordId, user }) => {
  const [locked, setLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);
  const [lockMessage, setLockMessage] = useState(null);
  const isLockOwner = useRef(false);
  const effectRan = useRef(false);

  useEffect(() => {
    // 1. We still guard the ASYNC LOGIC to prevent double-calls.
    if (effectRan.current === false && recordId && user) {
      const acquireLock = async () => {
        const res = await lockRecord({ tableName, recordId, lockedBy: user });
        if (res.success) {
          setLocked(true);
          setLockedBy(user);
          setLockMessage(res.data.message);
          isLockOwner.current = true;
        } else {
          setLocked(true);
          setLockedBy(res.lockedBy || "another user");
          isLockOwner.current = false;
        }
      };

      acquireLock();
      effectRan.current = true;
    }

    // 2. We ALWAYS return the cleanup function.
    // This ensures that on the second render in Strict Mode, React gets a
    // fresh cleanup function that will have the correct `isLockOwner.current`
    // value when the modal is finally closed.
    return () => {
      const releaseLockOnUnmount = async () => {
        // The check `isLockOwner.current` is still crucial.
        // It ensures we only release the lock if we actually acquired it.
        if (isLockOwner.current) {
          await releaseLock({ tableName, recordId, lockedBy: user });
          // Reset for potential re-use if needed
          isLockOwner.current = false; 
        }
      };
      
      // We only want this to run when the component *truly* unmounts.
      // On the first Strict Mode unmount, isLockOwner is false, so nothing happens.
      // On the final unmount, isLockOwner will be true (if the lock was acquired).
      releaseLockOnUnmount();
    };
  }, [tableName, recordId, user]);

  return { locked, lockedBy, lockMessage };
};