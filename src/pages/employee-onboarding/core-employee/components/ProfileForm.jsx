import FormInput from "./FormInput";
import FormSelect from "./FormSelect";

export default function ProfileForm({ form, handleChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormInput label="Employee Name" name="empName" value={form.empName || ""} onChange={handleChange}/>
      <FormInput label="Employee ID" name="empId" value={form.empId || ""} onChange={handleChange}/>
      <FormInput label="Employee Email" name="email" value={form.email || ""} onChange={handleChange}/>
      <FormSelect label="Gender" name="gender" value={form.gender || ""} onChange={handleChange}
        options={["Male","Female","Other"]}/>
      <FormInput label="Contact" name="contact" value={form.contact || ""} onChange={handleChange}/>
      <FormInput label="Father Name" name="fatherName" value={form.fatherName || ""} onChange={handleChange}/>
      <FormInput label="Relation to You" name="fatherRelation" value={form.fatherRelation || ""} onChange={handleChange}/>
      <FormInput label="Mother Name" name="motherName" value={form.motherName || ""} onChange={handleChange}/>
      <FormInput label="Relation to You" name="motherRelation" value={form.motherRelation || ""} onChange={handleChange}/>
    </div>
  );
}
