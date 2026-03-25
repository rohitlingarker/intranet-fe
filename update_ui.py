import os

file_path = r"c:\Users\Lokeshwari.Busam\Desktop\Myfiles\projects\intranet-fe\src\pages\employee-onboarding\components\ViewEmpDetails.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    original_content = f.read()

split_marker = r"/* ========================= UI (UNCHANGED) ========================= */"
parts = original_content.split(split_marker)

if len(parts) < 2:
    print("Marker not found.")
    exit(1)

new_ui = r'''/* ========================= UI (ENHANCED) ========================= */

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in zoom-in duration-300">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-700 mb-6 font-medium transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Offers
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
        {/* Gradient Header Profile */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-6 py-8 md:px-10 md:py-10 text-white relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
            <div className="flex items-center gap-5">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-inner border border-white/20">
                <User size={36} className="text-blue-50" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2 drop-shadow-sm">
                  {employee.first_name} {employee.last_name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-blue-50 bg-black/20 px-3 py-1 rounded-full text-sm font-medium border border-white/10 backdrop-blur-sm shadow-sm">
                    <BadgeCheck size={16} className="text-blue-300" />
                    Status: {employee.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap flex-col md:flex-row items-end md:items-center gap-3">
              {isNoRequest && (
                <button
                  onClick={() => {
                    setEditData(employee);
                    setIsEditing(true);
                  }}
                  disabled={employee.status === "SENT"}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Pencil size={18} />
                  Edit Offer
                </button>
              )}

              {canModifyOfferApprovalRequest && (
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      setOpenApprovalModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Edit Approval
                  </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Approval Badges Area */}
        <div className="bg-blue-50/50 border-b border-gray-100 px-8 py-5">
            <ApprovalStatusBadge
                status={approvalStatus}
                approver={effectiveApprover}
                comments={approvalHistory?.[0]?.comments}
            />
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-10">

        {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Edit Offer Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto pr-2">
           {Object.keys(editData)
.filter(key => [
'first_name','last_name','mail','country_code',
'contact_number','designation','employee_type',
'package','currency','cc_emails'
].includes(key))
.map((key) => (

<label key={key} className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
{toTitleCase(key.replace("_", " "))}

{key === "employee_type" ? (

<select
value={editData[key] || ""}
onChange={(e)=>
setEditData({...editData,[key]:e.target.value})
}
className="border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
>
<option value="">Select Employee Type</option>
<option value="Full-Time">Full-Time</option>
<option value="Part-Time">Part-Time</option>
<option value="Intern">Intern</option>
<option value="Contract">Contract</option>
</select>

) : key === "cc_emails" ? (

<input
value={editData[key] || ""}
onChange={(e)=>
setEditData({...editData,[key]:e.target.value})
}
className="border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
placeholder="Enter emails separated by comma"
/>

) : (

<input
value={editData[key] || ""}
onChange={(e)=>
setEditData({...editData,[key]:e.target.value})
}
className="border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
/>

)}

</label>

))}
          </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              {/* ❌ Cancel */}
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>

              {/* ✅ Save */}
              <button
                onClick={handleUpdateOffer}
                disabled={updating}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg font-medium active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
        )}

        {/* --- DETAILS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailCard icon={<Mail size={20} />} label="Email" value={employee.mail} />
          <DetailCard
            icon={<Phone size={20} />}
            label="Contact"
            value={`+${employee.country_code} ${employee.contact_number}`}
          />
          <DetailCard
            icon={<Briefcase size={20} />}
            label="Designation"
            value={employee.designation}
          />
          <DetailCard
            icon={<Wallet size={20} />}
            label="CTC"
            value={`${employee.package} ${employee.currency}`}
          />
          <DetailCard
            icon={<UserCheck size={20} />}
            label="Employee Type"
            value={employee.employee_type}
          />
         <DetailCard
          icon={<Mail size={20} />}
          label="CC Emails"
          value={
            employee?.cc_emails
              ? employee.cc_emails
                  .split(",")
                  .map(e => e.trim())
                  .filter(Boolean)
                  .join(", ")
              : "—"
          }
          />
        </div>

        <div className="flex flex-wrap gap-4 mt-12 pt-8 border-t border-gray-100">
          <button
            onClick={handleSendOffer}
            disabled={
              approvalStatus !== "APPROVED" ||
              loadingSendOffer ||
              employee?.status === "SENT"
            }
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm
              active:scale-95 flex items-center justify-center gap-2 ${
                approvalStatus !== "APPROVED"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : employee?.status === "SENT"
                  ? "bg-emerald-600 text-white opacity-90 shadow-none cursor-default"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md"
              }`}
          >
            <Mail size={18} />
            {employee?.status === "SENT"
              ? "Offer Sent"
              : loadingSendOffer
              ? "Sending..."
              : "Send Offer"}
          </button>

          <button
            onClick={() => setOpenApprovalModal(true)}
            disabled={!isNoRequest}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm
              active:scale-95 flex items-center justify-center gap-2 ${
                !isNoRequest
                  ? "bg-gray-50 text-gray-400 cursor-not-allowed shadow-none border border-gray-100"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md border border-blue-600"
              }`}
          >
            <UserCheck size={18} />
            Request Approval
          </button>
          
          <div className="flex-1"></div>

          {/* 🔴 DELETE OFFER BUTTON */}
          <button
            onClick={() => setDeleteOfferModal(true)}
            className="px-6 py-3 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white font-medium
            transition-all duration-200 shadow-sm active:scale-95 ml-auto flex items-center gap-2 border border-rose-100 hover:border-rose-600"
          >
            Delete Offer
          </button>
        </div>
      </div>
      </div>

      {/* ---------- APPROVAL MODAL ---------- */}
      {openApprovalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Send for Approval</h3>

            <select
              className="w-full border border-gray-300 rounded-xl p-3 mb-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white"
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
            >
              <option value="">Select Approver</option>
              {adminUsers.map((a) => (
                <option key={a.user_id} value={a.user_id}>
                  {a.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium active:scale-95 disabled:opacity-50" 
                onClick={() => setOpenApprovalModal(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalSubmit}
                disabled={sendingApproval}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all font-medium active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {sendingApproval ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- DELETE OFFER MODAL ---------- */}
      {deleteOfferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-3 text-rose-600 flex items-center gap-2">
              Delete Offer
            </h3>
            <p className="text-base text-gray-600 mb-8 border-l-4 border-rose-500 pl-4 bg-rose-50 py-3 rounded-r-lg">
              Are you sure you want to delete this offer? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 mt-2">
              <button
                onClick={() => setDeleteOfferModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteOffer}
                disabled={deletingOffer}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg transition-all font-medium active:scale-95 disabled:opacity-50"
              >
                {deletingOffer ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */
function DetailCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:border-blue-100 group">
      <div className="bg-blue-50 text-blue-600 rounded-xl p-3 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
        <p className="font-semibold text-gray-800 text-base truncate" title={typeof value === 'string' ? value : ''}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function ApprovalStatusBadge({ status, approver, comments }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
    ON_HOLD: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const dots = {
    PENDING: "bg-amber-500",
    APPROVED: "bg-emerald-500",
    REJECTED: "bg-rose-500",
    ON_HOLD: "bg-slate-500",
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-3">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm border rounded-full font-medium shadow-sm w-fit ${
            styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${dots[status] || "bg-gray-500"} ${status === "PENDING" ? "animate-pulse" : ""}`}></span>
          <span>
            {status === "PENDING" ? "Approval Pending" : status}
          </span>
          {approver && (
            <>
              <span className="w-1 h-1 bg-current opacity-40 rounded-full mx-1"></span>
              <span className="opacity-90">{approver}</span>
            </>
          )}
        </div>
      </div>
      
      {/* COMMENTS BADGE */}
      {comments && comments.trim() !== "" && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mt-1 max-w-full">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Feedback from Approver</p>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            {comments}
          </p>
        </div>
      )}
    </div>
  );
}
'''

new_content = parts[0] + new_ui

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("UI Replaced Successfully")
