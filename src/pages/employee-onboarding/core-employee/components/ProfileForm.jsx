import FormInput from "./FormInput";
import FormSelect from "./FormSelect";

export default function ProfileForm({ form, handleChange, isGenerated }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {isGenerated && (
        <FormInput label="Employee ID" name="empId" value={form.empId || ""} onChange={handleChange} disabled={isGenerated}/>
      )}
      {isGenerated && (
        <FormInput label="Employee Email" name="email" value={form.email || ""} onChange={handleChange} disabled={isGenerated}/>
      )}
      <FormInput label="First Name" name="empName" value={form.empName || ""} onChange={handleChange}/>
      <FormInput label="Middle Name" name="empMiddleName" value={form.empMiddleName || ""} onChange={handleChange}/>
      <FormInput label="Last Name" name="empLastName" value={form.empLastName || ""} onChange={handleChange}/>
      <FormInput label="Date of Birth" type="date" name="empDob" value={form.empDob || ""} onChange={handleChange}/>
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
