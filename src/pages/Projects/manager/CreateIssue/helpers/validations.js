export const validateEpic = (f) => {
  if (!f.name) return "Epic Name is required.";
  if (!f.statusId) return "Status is required.";
  return null;
};

export const validateStory = (f) => {
  if (!f.title) return "Story Title is required.";
  if (!f.statusId) return "Status is required.";
  return null;
};

export const validateTask = (f) => {
  if (!f.title) return "Task Title is required.";
  if (!f.statusId) return "Status is required.";
  return null;
};

export const validateBug = (f) => {
  if (!f.title) return "Bug Title is required.";
  return null;
};
