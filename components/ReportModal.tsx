import { useState } from 'react'

interface Props {
  onReport: (reason: string) => void
  onClose: () => void
}

export default function ReportModal({ onReport, onClose }: Props) {
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    onReport(reason)
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
      <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm space-y-4">
        {submitted ? (
          <>
            <h2 className="text-lg font-semibold">Report submitted</h2>
            <p className="text-gray-400 text-sm">Thank you. We will review it.</p>
            <button onClick={onClose} className="w-full bg-[#2a2a2a] text-white rounded-xl py-2.5 font-semibold">Close</button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Report this user</h2>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe the issue (optional)"
              rows={3}
              className="w-full bg-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm resize-none outline-none placeholder-gray-500"
            />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 bg-[#2a2a2a] text-gray-300 rounded-xl py-2.5 font-semibold">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-semibold hover:bg-red-700">Report</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
