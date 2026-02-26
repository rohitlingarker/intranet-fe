"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { showStatusToast } from "../../../components/toastfy/toast.jsx";
import { ArrowLeft, User, MapPin, Check, X } from "lucide-react";
import { set } from "date-fns";

export default function HrProfileView() {

const { user_uuid } = useParams();
const navigate = useNavigate();

const token = localStorage.getItem("token");
const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;

const tabs = ["overview","education","experience","identity documents"];

const [profile,setProfile] = useState(null);
const [loading,setLoading] = useState(true);
const [verificationStatus,setVerificationStatus] = useState(null);
const [activeTab,setActiveTab] = useState("overview");

const [sectionStatus,setSectionStatus] = useState({
overview:false,
education:false,
experience:false,
"identity documents":false
});

const [docStatus,setDocStatus] = useState({});
const [showConfirm,setShowConfirm] = useState(false);
const [showSuccess,setShowSuccess] = useState(false);
const [finalLoading,setFinalLoading] = useState(false);
const [rejectModal,setRejectModal] = useState(false);
const [rejectDocKey,setRejectDocKey] = useState(null);
const [rejectRemarks,setRejectRemarks] = useState("");
const [loadedFromStorage,setLoadedFromStorage] = useState(false);

const getDocKey = (d,i)=> d.document_uuid || d.file_path || `${i}`;

useEffect(()=>{
(async()=>{

try{

const res = await axios.get(`${BASE_URL}/hr/hr/${user_uuid}`,{
headers:{Authorization:`Bearer ${token}`}
});

setProfile(res.data);
const status = res.data.offer?.offer_status;
setVerificationStatus(status);

if(status === "Verified"){

setSectionStatus({
overview:true,
education:true,
experience:true,
"identity documents":true
});

const allDocs = {};

[
...(res.data.education_documents || []),
...(res.data.identity_documents || []),
...(res.data.experience?.flatMap(e=>e.documents || []) || [])
].forEach((d,i)=>{
allDocs[getDocKey(d,i)] = true;
});

setDocStatus(allDocs);
setActiveTab("overview");


}else{

// Submitted → reset UI
setSectionStatus({
overview:false,
education:false,
experience:false,
"identity documents":false
});

setDocStatus({});
setActiveTab("overview");
// // remove old verification progress if status is Submitted
// localStorage.removeItem(`hr_verify_${user_uuid}`);

const saved = localStorage.getItem(`hr_verify_${user_uuid}`);

// restore progress if HR already started verification
if(saved){

const parsed = JSON.parse(saved);
setSectionStatus(parsed.sectionStatus || {});
setDocStatus(parsed.docStatus || {});
setActiveTab(parsed.activeTab || "overview");

}

}
/* restore saved verification */


setLoadedFromStorage(true);

}catch{
showStatusToast("Failed to load profile","error");
}finally{
setLoading(false);
}

})();

},[user_uuid]);

/* save verification state */

useEffect(()=>{
  if(!loadedFromStorage) return;

const data = {sectionStatus,docStatus,activeTab};

localStorage.setItem(`hr_verify_${user_uuid}`,JSON.stringify(data));

},[sectionStatus,docStatus,activeTab]);


/* open document */

async function openFileInNewTab(url){

if(!url) return;

const tab = window.open("","_blank");

try{

const res = await axios.get(`${BASE_URL}/hr/view_documents`,{
params:{file_path:encodeURIComponent(url)},
headers:{Authorization:`Bearer ${token}`}
});

tab.location.href = res.data.replace(/^"+|"+$/g,"");

}catch{

tab.close();
showStatusToast("Failed to open document","error");

}

}
const handleRejectDocument = ()=>{

if(!rejectRemarks.trim()){
showStatusToast("Please enter rejection remarks","error");
return;
}

setDocStatus(s=>({
...s,
[rejectDocKey]:{
status:false,
remarks:rejectRemarks
}
}));

setRejectModal(false);
setRejectRemarks("");
setRejectDocKey(null);

};

/* verify section */

const verifySection = ()=>{

const currentDocs =
activeTab==="education"
? profile.education_documents || []
: activeTab==="experience"
? profile.experience?.flatMap(e=>e.documents || []) || []
: activeTab==="identity documents"
? profile.identity_documents || []
: [];

const allDocsDone =
currentDocs.length===0 ||
currentDocs.every((d,i)=>{

const doc = docStatus[getDocKey(d,i)];

if(typeof doc === "object"){
return doc.status === true;
}

return doc === true;

});

if(!allDocsDone){
showStatusToast("Please verify all documents first","error");
return;
}

setSectionStatus(s=>({...s,[activeTab]:true}));
showStatusToast("Section verified","success");

};

/* final verify */

const allSectionsVerified = Object.values(sectionStatus).every(Boolean);
const allDocsVerified =
Object.values(docStatus).length>0 &&
Object.values(docStatus).every(d=>{
if(typeof d === "object"){
return d.status === true;
}
return d === true;
});

const finalVerifyProfile = async()=>{

if(!allSectionsVerified || !allDocsVerified){

showStatusToast("Verify all sections & documents first","error");
return;

}

try{

setFinalLoading(true);

await axios.post(`${BASE_URL}/hr/verify-profile`,
{user_uuid,status:"Verified"},
{headers:{Authorization:`Bearer ${token}`}}
);

localStorage.removeItem(`hr_verify_${user_uuid}`);

setVerificationStatus("Verified");
setSectionStatus({
overview:true,
education:true,
experience:true,
"identity documents":true
});
const allDocs = {};

[
...(profile.education_documents || []),
...(profile.identity_documents || []),
...(profile.experience?.flatMap(e=>e.documents || []) || [])
].forEach((d,i)=>{
allDocs[getDocKey(d,i)] = true;
});

setDocStatus(allDocs);
setShowConfirm(false);
setShowSuccess(true);

showStatusToast("Profile verified successfully","success");

}catch{

showStatusToast("Final verification failed","error");

}finally{

setFinalLoading(false);

}

};

if(loading) return <CenteredMsg text="Loading profile..." />;
if(!profile || !profile.offer)
return <CenteredMsg text="Profile not found" error />;

const {
offer,
personal_details,
addresses,
education_documents,
experience,
identity_documents
} = profile;

const groupedEducation = groupEducation(education_documents);
const groupedExperience = groupExperience(experience);
const groupedIdentity = groupIdentity(identity_documents);

return(

<div className="min-h-screen bg-[#f4f6fb]">

<Header offer={offer} verificationStatus={verificationStatus} navigate={navigate} />

{/* progress tracker */}

<div className="max-w-6xl mx-auto mt-6 px-6">

<div className="bg-white rounded-xl border p-4 flex justify-between">

<div className="flex gap-6 text-sm">

{tabs.map(t=>(

<div key={t} className="flex items-center gap-2">

<div
className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
${sectionStatus[t] ? "bg-green-500 text-white":"bg-gray-200"}`}
>
{sectionStatus[t] && "✓"}
</div>

<span className="capitalize">{t}</span>

</div>

))}

</div>

<div className="text-sm font-semibold">
Progress {Object.values(sectionStatus).filter(Boolean).length}/{tabs.length}
</div>

</div>

</div>

{/* tabs */}

<div className="max-w-6xl mx-auto px-6 mt-6 border-b flex gap-6 text-sm">

{tabs.map(t=>(

<button
key={t}
onClick={()=>setActiveTab(t)}
className={`pb-3 capitalize ${
activeTab===t
? "text-indigo-600 border-b-2 border-indigo-600"
: "text-gray-500"
}`}
>
{t}
</button>

))}

</div>

{/* content */}

<div className="max-w-6xl mx-auto p-6 space-y-6">

{activeTab==="overview" && (

<Section title="Personal & Address" verified={sectionStatus.overview}>

<div className="grid md:grid-cols-2 gap-6">

<ColorCard title="Personal Information" icon={<User size={18}/>}>
<Info label="First Name" value={offer.first_name}/>
<Info label="Last Name" value={offer.last_name}/>
<Info label="Email" value={offer.email}/>
<Info label="Phone" value={offer.contact_number}/>
<Info label="DOB" value={personal_details?.date_of_birth}/>
<Info label="Gender" value={personal_details?.gender}/>
<Info label="Marital Status" value={personal_details?.marital_status}/>
<Info label="Blood Group" value={personal_details?.blood_group}/>
<Info label="Nationality" value={personal_details?.nationality}/>
<Info label="Residence" value={personal_details?.residence}/>
</ColorCard>

<ColorCard title="Address" icon={<MapPin size={18}/>}>
{addresses?.map(a=>(
<div key={a.address_uuid} className="text-sm space-y-1">
<Info label="Address Type" value={a.address_type}/>
<Info label="Address1" value={a.address_line1}/>
<Info label="Address2" value={a.address_line2}/>
<Info label="City" value={a.city}/>
<Info label="District" value={a.district_or_ward}/>
<Info label="State" value={a.state_or_region}/>
<Info label="Postal Code" value={a.postal_code}/>
<Info label="Country" value={a.country}/>
</div>
))}
</ColorCard>

</div>

</Section>

)}

{activeTab==="education" &&
Object.values(groupedEducation).map((edu,i)=>(

<Section key={i} title={edu.title} verified={sectionStatus.education}>

<div className="text-sm text-gray-600 mb-3">
<p><b>Institution:</b> {edu.institution}</p>
<p><b>Specialization:</b> {edu.specialization}</p>
<p><b>Year:</b> {edu.year}</p>
</div>

<DocCard
documents={edu.documents}
docStatus={docStatus}
setDocStatus={setDocStatus}
onView={openFileInNewTab}
setRejectDocKey={setRejectDocKey}
setRejectModal={setRejectModal}
verificationStatus={verificationStatus}
/>

</Section>

))}

{activeTab==="experience" &&
Object.values(groupedExperience).map((exp,i)=>(

<Section key={i} title={exp.title} verified={sectionStatus.experience}>

<div className="text-sm text-gray-600 mb-3">
<p><b>Company:</b> {exp.company_name}</p>
<p><b>Role:</b> {exp.role_title}</p>
<p><b>Employment:</b> {exp.employment_type}</p>
<p><b>Start:</b> {exp.start_date}</p>
<p><b>End:</b> {exp.end_date || "Current"}</p>
<p><b>Remarks:</b> {exp.remarks}</p>
</div>

<DocCard documents={exp.documents}
docStatus={docStatus}
setDocStatus={setDocStatus}
onView={openFileInNewTab}
setRejectDocKey={setRejectDocKey}
setRejectModal={setRejectModal}
verificationStatus={verificationStatus}/>

</Section>

))}

{activeTab==="identity documents" &&
Object.values(groupedIdentity).map((doc,i)=>(

<Section key={i} title={doc.title} verified={sectionStatus["identity documents"]}>



<DocCard documents={doc.documents}
docStatus={docStatus}
setDocStatus={setDocStatus}
onView={openFileInNewTab}
setRejectDocKey={setRejectDocKey}
setRejectModal={setRejectModal}
verificationStatus={verificationStatus}
/>
</Section>

))}

{/* navigation */}

<div className="flex justify-between pt-6">

<button
disabled={activeTab==="overview"}
onClick={()=>setActiveTab(tabs[tabs.indexOf(activeTab)-1])}
className="px-4 py-2 border rounded disabled:opacity-40"
>
Previous
</button>

{/* CENTER BUTTON GROUP */}

<div className="flex gap-3 mx-auto">

{!sectionStatus[activeTab] && verificationStatus!=="Verified" && (
<button
onClick={verifySection}
className="px-4 py-2 bg-green-600 text-white rounded"
>
Verify Section
</button>
)}

{activeTab!=="identity documents" ? (

<button
onClick={()=>setActiveTab(tabs[tabs.indexOf(activeTab)+1])}
className="px-4 py-2 bg-indigo-600 text-white rounded"
>
Next
</button>

) : (

<button
onClick={()=>setShowConfirm(true)}
disabled={verificationStatus==="Verified"}
className="px-6 py-2 bg-green-700 text-white rounded disabled:opacity-40"
>
Final Verify Profile
</button>

)}

</div>

{/* spacer to balance layout */}

<div className="w-[90px]" />

</div>

</div>

{/* sticky panel */}

{verificationStatus!=="Verified" && (

<div className="fixed bottom-6 right-6 bg-white border shadow-lg rounded-xl p-4 w-64">

<p className="text-sm font-semibold mb-2">
Verification Status
</p>

<p className="text-xs text-gray-500 mb-3">
Sections Verified:
{Object.values(sectionStatus).filter(Boolean).length}/{tabs.length}
</p>

<button
onClick={()=>setShowConfirm(true)}
disabled={!allSectionsVerified || !allDocsVerified}
className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-40"
>
Final Verify
</button>

</div>

)}

{/* confirm modal */}

{showConfirm && (

<Modal>

<h2 className="text-lg font-semibold">
Verify this profile?
</h2>

<div className="flex gap-3 justify-center mt-4">

<button
onClick={()=>setShowConfirm(false)}
className="px-4 py-2 border rounded"
>
Cancel
</button>

<button
onClick={finalVerifyProfile}
className="px-6 py-2 bg-green-600 text-white rounded"
>
{finalLoading ? "Verifying..." : "Yes Verify"}
</button>

</div>

</Modal>

)}

{showSuccess && (

<Modal>

<div className="flex flex-col items-center gap-4">

<div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl">
✓
</div>

<h2 className="text-xl font-semibold">
Profile Verified
</h2>

<button
onClick={()=>navigate(-1)}
className="px-6 py-2 bg-indigo-600 text-white rounded"
>
Go Back
</button>

</div>

</Modal>

)}
{rejectModal && (

<Modal>

<h2 className="text-lg font-semibold">
Reject Document
</h2>

<textarea
value={rejectRemarks}
onChange={(e)=>setRejectRemarks(e.target.value)}
placeholder="Enter rejection remarks"
className="border rounded w-full p-2 mt-3 text-sm"
/>

<div className="flex gap-3 justify-center mt-4">

<button
onClick={()=>setRejectModal(false)}
className="px-4 py-2 border rounded"
>
Cancel
</button>

<button
onClick={handleRejectDocument}
className="px-6 py-2 bg-red-600 text-white rounded"
>
Reject
</button>

</div>

</Modal>

)}

</div>

);

}

/* components */

const Header = ({offer,verificationStatus,navigate})=>(
<div className="bg-white border-b">

<div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-6">


<div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
{offer.first_name?.[0]}
</div>

<div className="flex-1">

<h1 className="text-xl font-semibold">
{offer.first_name} {offer.last_name}
</h1>

<p className="text-gray-500 text-sm">
{offer.designation}
</p>

<p className="text-gray-400 text-sm">
{offer.email} • {offer.contact_number}
</p>

</div>

<span className="px-4 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
{verificationStatus || "Pending"}
</span>

</div>

</div>
);

const DocCard = ({
documents=[],
onView,
docStatus,
setDocStatus,
setRejectDocKey,
setRejectModal,
verificationStatus
})=>(
<div className="space-y-3">

{documents.map((d,i)=>{

const key = d.document_uuid || d.file_path || `${i}`;
const verified = docStatus[key]?.status ?? docStatus[key];
const remarks = docStatus[key]?.remarks;

return(

<div key={key}
className="border rounded-lg p-4 flex justify-between items-center bg-gray-50">

<div>

<p className="font-medium">
{d.document_name || d.doc_type || d.identity_type}
</p>
{d.identity_file_number && (
<p className="text-xs text-gray-600">
ID Number: {d.identity_file_number}
</p>
)}
{remarks && (
<p className="text-xs text-red-600 mt-1">
Reason: {remarks}
</p>
)}

{d.uploaded_at &&
<p className="text-xs text-gray-500">
Uploaded: {new Date(d.uploaded_at).toLocaleDateString()}
</p>}

</div>

<div className="flex items-center gap-3">

<button
onClick={()=>onView(d.file_path)}
className="text-indigo-600 text-sm"
>
View
</button>

{verificationStatus === "Verified" ? (

<span className="text-xs font-semibold text-green-600">
Verified
</span>

) : (

<>
<span className={`text-xs font-semibold ${
docStatus[key] === true ? "text-green-600":"text-gray-400"
}`}>
{docStatus[key] === true ? "Verified":"Pending"}
</span>

<Check
size={18}
className="text-green-600 cursor-pointer"
onClick={()=>setDocStatus(s=>({...s,[key]:true}))}
/>

<X
size={18}
className="text-red-500 cursor-pointer"
onClick={()=>{
setRejectDocKey(key);
setRejectModal(true);
}}
/>
</>

)}

</div>

</div>

);

})}

</div>
);

const Section = ({title,children,verified})=>(
<div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">

<div className="flex justify-between">
<h3 className="font-semibold text-lg">{title}</h3>
{verified && <span className="text-green-600 text-sm">✔ Verified</span>}
</div>

{children}

</div>
);

const ColorCard = ({title,icon,children})=>(
<div className="bg-gray-50 rounded-lg p-4 border space-y-2">

<div className="flex items-center gap-2 font-semibold text-indigo-600">
{icon} {title}
</div>

{children}

</div>
);

const Info = ({label,value})=>(
<p className="text-sm">
<span className="text-gray-500">{label}: </span>
{value || "—"}
</p>
);

const Modal = ({children})=>(
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="bg-white rounded-xl p-6 text-center">
{children}
</div>
</div>
);

const CenteredMsg = ({text,error})=>(
<div className={`p-20 text-center ${error ? "text-red-600":""}`}>
{text}
</div>
);

/* grouping */

const groupEducation = (l=[]) =>
l.reduce((a,e)=>{

const k = `${e.education_level} - ${e.specialization}`;

a[k] ||= {
title:k,
institution:e.institution_name,
specialization:e.specialization,
year:e.year_of_passing,
documents:[]
};

a[k].documents.push(e);

return a;

},{});

const groupExperience = (l=[]) =>
l.reduce((a,e)=>{

const k = `${e.company_name} - ${e.role_title}`;

a[k] ||= {
title:k,
company_name:e.company_name,
role_title:e.role_title,
employment_type:e.employment_type,
start_date:e.start_date,
end_date:e.end_date,
remarks:e.remarks,
documents:[]
};

a[k].documents.push(...(e.documents || []));

return a;

},{});

const groupIdentity = (l=[]) =>
l.reduce((a,d)=>{

a[d.identity_type] ||= {title:d.identity_type,documents:[]};

a[d.identity_type].documents.push(d);

return a;

},{});