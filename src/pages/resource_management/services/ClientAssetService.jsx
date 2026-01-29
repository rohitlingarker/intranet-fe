import axios from "axios";

const RMS_BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

/* ===============================
   CREATE CLIENT ASSET
   =============================== */
export const createClientAsset = async (assetData) => {
  try {
    const response = await axios.post(
      `${RMS_BASE_URL}/api/clinet-assets`,
      assetData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ===============================
   UPDATE CLIENT ASSET
   =============================== */
export const updateClientAsset = async (assetId, assetData) => {
  try {
    const response = await axios.put(
      `${RMS_BASE_URL}/api/clinet-assets/${assetId}`,
      assetData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ===============================
   DELETE (SOFT DELETE) CLIENT ASSET
   =============================== */
export const deleteClientAsset = async (assetId) => {
  try {
    const response = await axios.delete(
      `${RMS_BASE_URL}/api/clinet-assets/${assetId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ===============================
   GET ASSETS BY CLIENT ID
   =============================== */
export const getAssetsByClient = async (clientId) => {
  try {
    const response = await axios.get(
      `${RMS_BASE_URL}/api/clinet-assets/client/${clientId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
