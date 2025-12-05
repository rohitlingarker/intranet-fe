export const issueDependencyMap = {
  Epic: ["statuses"],
  Story: ["epics", "sprints", "statuses"],
  Task: ["stories", "sprints", "statuses"],
  Bug: ["tasks", "epics", "sprints"],
};
