export default function StatusTimeline() {
  const steps = [
    { label: "Created", color: "green" },
    { label: "Sent", color: "green" },
    { label: "Pending Confirmation", color: "yellow" },
    { label: "Activated", color: "gray" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex-1">

      <h2 className="text-xl font-bold mb-4">
        Status Timeline
      </h2>

      <div className="space-y-6 relative">

        {/* vertical line */}
        <div className="absolute left-2 top-2 bottom-2 w-[2px] bg-gray-300"></div>

        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3 relative">

            <div
              className={`w-4 h-4 rounded-full z-10
              ${step.color === "green" && "bg-green-500"}
              ${step.color === "yellow" && "bg-yellow-400"}
              ${step.color === "gray" && "bg-gray-400"}
              `}
            ></div>

            <span className="text-gray-700">{step.label}</span>

          </div>
        ))}

      </div>
    </div>
  );
}