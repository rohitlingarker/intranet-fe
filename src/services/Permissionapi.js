// src/services/adminApi.js
import API from "./api"; // Import the axios instance from api.js

// Group Management
export const getGroups = async () => {
  const res = await API.get("/admin/groups");
  return res.data;
};

export const createGroup = async (group_name) => {
  return await API.post("/admin/groups", { group_name });
};

export const updateGroup = async (groupId, group_name) => {
  return await API.put(`/admin/groups/${groupId}`, { group_name });
};

export const deleteGroup = async (groupId) => {
  return await API.delete(`/admin/groups/${groupId}`);
};

export const getGroupPermissions = async (groupId) => {
  const res = await API.get(`/admin/groups/${groupId}/permissions`);
  return res.data;
};

export const getUnmappedPermissions = async (groupId) => {
  const res = await API.get(`/admin/groups/${groupId}/permissions/unmapped`);
  return res.data;
};

export const assignPermissionToGroup = async (permissionId, groupId) => {
  return await API.put(`/admin/permissions/${permissionId}/group`, {
    group_id: groupId,
  });
};

// Role Management
export const updateRoleGroups = async (roleId, groupIds) => {
  return await API.put(`/admin/roles/${roleId}/groups`, {
    group_ids: groupIds,
  });
};
