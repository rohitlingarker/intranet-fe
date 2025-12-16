import React from "react";
import FormInput from "../../../../../components/forms/FormInput";
// import FormInput from "../../../../../forms/FormInput";
import FormTextArea from "../../../../../components/forms/FormTextArea";
import FormSelect from "../../../../../components/forms/FormSelect";

const BugFields = ({ formData, onChange, epics, tasks, sprints, users }) => (
  <>
    <FormInput label="Title *" name="title" value={formData.title || ""} onChange={onChange} required />

    <FormSelect label="Status *" name="status" value={formData.status || "OPEN"} onChange={onChange}
      options={[
        { label: "Open", value: "OPEN" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Resolved", value: "RESOLVED" },
        { label: "Closed", value: "CLOSED" },
        { label: "Reopened", value: "REOPENED" },
      ]} />

    <FormSelect label="Priority *" name="priority" value={formData.priority || "MEDIUM"} onChange={onChange}
      options={[
        { label: "Low", value: "LOW" },
        { label: "Medium", value: "MEDIUM" },
        { label: "High", value: "HIGH" },
        { label: "Critical", value: "CRITICAL" },
      ]} />

    <FormSelect label="Severity *" name="severity" value={formData.severity || "MINOR"} onChange={onChange}
      options={[
        { label: "Minor", value: "MINOR" },
        { label: "Major", value: "MAJOR" },
        { label: "Blocker", value: "BLOCKER" },
      ]} />

    <FormInput label="Type" name="type" value={formData.type || ""} onChange={onChange}
      placeholder="e.g. UI Bug, Functional Bug, Performance Issue" />

    <FormSelect label="Task" name="taskId" value={formData.taskId ?? ""} onChange={onChange}
      options={tasks.map((t) => ({ label: t.title, value: t.id }))} />

    <FormSelect label="Sprint" name="sprintId" value={formData.sprintId ?? ""} onChange={onChange}
      options={sprints.map((s) => ({ label: s.name, value: s.id }))} />

    <FormSelect label="Epic" name="epicId" value={formData.epicId ?? ""} onChange={onChange}
      options={epics.map((e) => ({ label: e.name, value: e.id }))} />

    <FormSelect label="Assignee" name="assigneeId" value={formData.assigneeId ?? ""} onChange={onChange}
      options={users.map((u) => ({ label: u.name, value: u.id }))} />

    <FormSelect label="Reporter *" name="reporterId" value={formData.reporterId ?? ""} onChange={onChange}
      options={users.map((u) => ({ label: u.name, value: u.id }))} />

    <FormTextArea label="Steps to Reproduce" name="stepsToReproduce" value={formData.stepsToReproduce || ""} onChange={onChange}
      placeholder="Step-by-step instructions to reproduce the bug" />

    <FormTextArea label="Expected Result" name="expectedResult" value={formData.expectedResult || ""} onChange={onChange} />

    <FormTextArea label="Actual Result" name="actualResult" value={formData.actualResult || ""} onChange={onChange} />

    <FormInput label="Attachments" name="attachments" value={formData.attachments || ""} onChange={onChange}
      placeholder="Paste file URL or path" />
  </>
);

export default BugFields;
