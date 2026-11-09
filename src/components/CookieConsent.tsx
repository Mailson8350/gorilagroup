import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [accepted, setAccepted] = useState<boolean>(() => !!localStorage.getItem("cookieConsent"));

  useEffect(() => {
    const v = !!localStorage.getItem("cookieConsent");
    setAccepted(v);
  }, []);

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50">
      <div className="max-w-3xl mx-auto bg-white border rounded-lg p-4 shadow-lg flex flex-col md:flex-row items-center gap-4">
        <div className="text-sm text-zinc-700">We use cookies to improve the site experience and analytics. By continuing you accept our <a href="/privacy" className="text-primary underline">privacy policy</a>.</div>
        <div className="ml-auto flex items-center gap-3">
          <button
            className="bg-primary text-secondary px-4 py-2 rounded-md font-bold"
            onClick={() => {
              localStorage.setItem("cookieConsent", "1");
              setAccepted(true);
              window.dispatchEvent(new Event("cookieConsentChanged"));
            }}
          >
            Accept
          </button>
          <button
            className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-md font-medium"
            onClick={() => {
              localStorage.setItem("cookieConsent", "0");
              setAccepted(false);
              window.dispatchEvent(new Event("cookieConsentChanged"));
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
