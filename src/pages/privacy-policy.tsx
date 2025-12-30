import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">
        Terms of Service
      </h1>

      <p className="mb-4">
        Welcome to <strong>Amora</strong>. By accessing or using this platform,
        you agree to be bound by these Terms of Service. If you do not agree,
        please do not use the platform.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          1. Eligibility
        </h2>
        <p>
          Amora is strictly for users aged <strong>18 years or older</strong>.
          By using this platform, you confirm that you are at least 18 years old.
          Any violation will result in immediate account termination.
        </p>

        <h2 className="text-xl font-semibold text-white">
          2. Platform Nature
        </h2>
        <p>
          Amora is an early-stage digital platform. Some features may change,
          evolve, or be discontinued at any time without prior notice.
        </p>

        <h2 className="text-xl font-semibold text-white">
          3. User Accounts
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>You are responsible for your account security.</li>
          <li>False information may lead to suspension.</li>
          <li>Accounts are non-transferable.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white">
          4. Content Rules
        </h2>
        <p>
          Users may upload or view content according to their role and plan.
          Content must:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Involve adults (18+ only)</li>
          <li>Not include illegal or harmful material</li>
          <li>Respect consent and platform rules</li>
        </ul>

        <h2 className="text-xl font-semibold text-white">
          5. Plans & Payments
        </h2>
        <p>
          Amora offers Free and Paid plans. Payments are currently processed
          manually. The platform reserves the right to approve or reject payment
          requests.
        </p>

        <h2 className="text-xl font-semibold text-white">
          6. Revenue Sharing (Contributors)
        </h2>
        <p>
          The platform operates on a revenue-sharing model:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Founder / Owner:</strong> 60%</li>
          <li><strong>Contributors (combined):</strong> 40%</li>
        </ul>
        <p>
          Payments to contributors begin only after the platform generates
          revenue. Distribution is based on contribution level and performance.
        </p>

        <h2 className="text-xl font-semibold text-white">
          7. Termination
        </h2>
        <p>
          Amora reserves the right to suspend or terminate any account that
          violates these terms or poses risk to the platform.
        </p>

        <h2 className="text-xl font-semibold text-white">
          8. Limitation of Liability
        </h2>
        <p>
          Amora is provided “as is.” We are not liable for losses, damages, or
          interruptions arising from platform use.
        </p>

        <h2 className="text-xl font-semibold text-white">
          9. Changes to Terms
        </h2>
        <p>
          These terms may be updated at any time. Continued use of Amora means
          acceptance of updated terms.
        </p>

        <p className="text-sm text-gray-400 mt-8">
          Last updated: {new Date().getFullYear()}
        </p>
      </section>
    </main>
  );
};

export default TermsOfService;
