export default function AgreementCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex-1">

      <h2 className="text-xl font-bold mb-4">
        Agreement Summary
      </h2>

      <div className="border-2 border-blue-400 bg-gray-50 p-4 rounded-md space-y-2">

        <p><b>Title:</b> Freelance Work Agreement</p>
        <p><b>Terms:</b> Website Development</p>
        <p><b>Deadline:</b> 15 May 2026</p>
        <p><b>Payment:</b> 15,000 BDT – Bank Transfer</p>
        <p><b>Penalty:</b> 5% late fee per day</p>

      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">

        <button className="bg-gray-200 px-3 py-2 rounded text-sm">
          📄 Download PDF
        </button>

        <button className="bg-gray-200 px-3 py-2 rounded text-sm">
          📧 Send to Email
        </button>

      </div>

    </div>
  );
}