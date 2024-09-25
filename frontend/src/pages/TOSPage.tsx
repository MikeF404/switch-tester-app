import React from 'react';

const TOSPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>By accessing and using this service, you accept and agree to be bound by the terms and provisions of this agreement.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">2. Use of Service</h2>
          <p>You agree to use this service for lawful purposes only and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the service.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Modifications to Service</h2>
          <p>We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Privacy Policy</h2>
          <p>Your use of the service is also governed by our Privacy Policy, which can be found [link to privacy policy].</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">5. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of [your jurisdiction].</p>
        </section>
      </div>
    </div>
  );
};

export default TOSPage;
