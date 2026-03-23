import axios from "axios";

const BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

export const getResources = async (projectId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/role-off/get-resources/${projectId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});


// ✅ CREATE ROLE-OFF (PM)
export const createRoleOff = async (payload) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/role-off`,
      payload,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


// ✅ GET ALL ROLE-OFFS
// export const getAllRoleOffs = async () => {
//   try {
//     const response = await axios.get(
//       `${BASE_URL}/api/role-off`,
//       {
//         headers: getAuthHeaders(),
//       }
//     );
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };


// ✅ RM APPROVE / REJECT
export const rmAction = async (id, approve, comments) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/role-off/${id}/rm-action`,
      null,
      {
        params: { approve, comments },
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


// ✅ DL ACTION (FULFILL / REJECT)
export const dlAction = async (id, action, comments) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/role-off/${id}/dl-action`,
      null,
      {
        params: { action, comments }, // action = FULFILLED / REJECTED
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllocations = async (projectId) => {
  const response = await axios.get(
    `${BASE_URL}/api/allocation/project/${projectId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const getPendingRoleOffs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/role-off/get-role-off-rm`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPendingRoleOffsForDM = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/role-off/get-role-off-dm`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};