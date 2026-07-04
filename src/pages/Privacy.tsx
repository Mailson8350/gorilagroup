import SeoHead from "../components/SeoHead";

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <SeoHead title="Privacy Policy" />
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-zinc-700 mb-4">
        This is a short privacy notice for the Gorila Group website. We collect minimal data required for
        contact forms and orders, and use analytics for site improvement. For detailed information, expand this
        section according to applicable laws (GDPR, local regulations).
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Data Collected</h2>
      <p className="text-zinc-700">Contact form inputs, email, phone and basic analytics (IP and usage).</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Cookies</h2>
      <p className="text-zinc-700">We use cookies for functional purposes and analytics. Use the cookie banner to opt-in.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-zinc-700">For privacy requests, contact the site administrator.</p>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Cookie Preferences</h3>
        <p className="text-zinc-700 mb-4">You can clear your consent below to disable analytics.</p>
        <div className="flex gap-3">
          <button
            className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-md"
            onClick={() => {
              localStorage.removeItem("cookieConsent");
              window.dispatchEvent(new Event("cookieConsentChanged"));
              alert("Cookie consent cleared. Reload the page to apply.");
            }}
          >
            Clear Consent
          </button>
        </div>
      </div>
    </div>
  );
}
