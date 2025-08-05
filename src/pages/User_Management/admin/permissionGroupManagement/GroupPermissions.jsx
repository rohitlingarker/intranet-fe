export default function GroupPermissions({ permissions, onAssignClick }) {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xl font-bold text-gray-700">Permissions in Group</h4>
        <button
          onClick={onAssignClick}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Add Permission
        </button>
      </div>
      <ul className="space-y-2">
        {permissions.length === 0 ? (
          <p className="text-gray-500">No permissions linked to this group.</p>
        ) : (
          permissions.map((perm, idx) => (
            <li key={idx} className="border p-2 rounded bg-gray-50 shadow-sm">
              <p className="font-medium text-blue-800">{perm.code}</p>
              <p className="text-sm text-gray-600">{perm.description}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
