import React from "react";
import FormInput from "../../../../../components/forms/FormInput";
import FormTextArea from "../../../../../components/forms/FormTextArea";
import FormSelect from "../../../../../components/forms/FormSelect";
import FormDatePicker from "../../../../../components/forms/FormDatePicker";

const StoryFields = ({ formData, onChange, statuses, epics, sprints, users, today }) => (
  <>
    <FormInput label="Title *" name="title" value={formData.title || ""} onChange={onChange} required />

    <FormTextArea label="Description" name="description" value={formData.description || ""} onChange={onChange} />

    <FormTextArea label="Acceptance Criteria" name="acceptanceCriteria" value={formData.acceptanceCriteria || ""} onChange={onChange} />

    <FormInput label="Story Points" name="storyPoints" type="number" value={formData.storyPoints || ""} onChange={onChange} />

    <FormSelect label="Status *" name="statusId" value={formData.statusId ?? ""} onChange={onChange}
      options={statuses.map((s) => ({ label: s.name, value: s.id }))} />

    <FormSelect label="Priority" name="priority" value={formData.priority || "LOW"} onChange={onChange}
      options={[
        { label: "Low", value: "LOW" },
        { label: "Medium", value: "MEDIUM" },
        { label: "High", value: "HIGH" },
        { label: "Critical", value: "CRITICAL" },
      ]} />

    <FormDatePicker label="Start Date" name="startDate" value={formData.startDate || ""} onChange={onChange} min={today} />

    <FormDatePicker label="Due Date" name="dueDate" value={formData.dueDate || ""} onChange={onChange} min={today} />

    <FormSelect label="Epic" name="epicId" value={formData.epicId ?? ""} onChange={onChange}
      options={epics.map((e) => ({ label: e.name, value: e.id }))} />

    <FormSelect label="Sprint" name="sprintId" value={formData.sprintId ?? ""} onChange={onChange}
      options={sprints.map((s) => ({ label: s.name, value: s.id }))} />

    <FormSelect label="Assignee" name="assigneeId" value={formData.assigneeId ?? ""} onChange={onChange}
      options={users.map((u) => ({ label: u.name, value: u.id }))} />

    <FormSelect label="Reporter *" name="reporterId" value={formData.reporterId ?? ""} onChange={onChange}
      options={users.map((u) => ({ label: u.name, value: u.id }))} />
  </>
);

export default StoryFields;
