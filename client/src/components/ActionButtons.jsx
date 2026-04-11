export default function ActionButtons() {
  return (
    <div className="flex gap-4">

      <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:opacity-90">
        ✅ Accept
      </button>

      <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:opacity-90">
        ✏️ Request Modification
      </button>

      <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:opacity-90">
        ❌ Reject
      </button>

    </div>
  );
}