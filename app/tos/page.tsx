export default function TosPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
      <section className="space-y-4 text-gray-300 leading-relaxed">
        <p>By using OmeTalk, you confirm that you are at least <strong>18 years old</strong>.</p>
        <h2 className="text-lg font-semibold text-white mt-6">Prohibited content</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Illegal content of any kind</li>
          <li>Sexual content involving minors — strictly prohibited and will be reported to authorities</li>
          <li>Harassment, threats, or hate speech</li>
          <li>Spam or automated messages</li>
        </ul>
        <h2 className="text-lg font-semibold text-white mt-6">Moderation</h2>
        <p>OmeTalk provides a report button in every chat. Reports are reviewed manually. We reserve the right to ban users who violate these terms.</p>
        <h2 className="text-lg font-semibold text-white mt-6">Privacy</h2>
        <p>Anonymous users are identified only by a randomly generated token. No personal data is collected. Chat messages are automatically deleted 24 hours after a session ends.</p>
        <h2 className="text-lg font-semibold text-white mt-6">Disclaimer</h2>
        <p>OmeTalk is not responsible for the content of user conversations. Use this service at your own risk.</p>
        <p className="text-sm text-gray-500 mt-8">Last updated: May 2026</p>
      </section>
    </main>
  )
}
