// Defines the shape of a Resource object
export class Resource {
    constructor({ id, name, role, location, skills, allocation, availableDate, project, timeline, initials }) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.location = location;
        this.skills = skills || [];
        this.allocation = allocation;
        this.availableDate = availableDate;
        this.project = project;
        this.timeline = timeline || []; // Array of { startPct, widthPct, color, label }
        this.initials = initials;
    }
}