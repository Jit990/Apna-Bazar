export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 prose prose-invert prose-red">
            <h1 className="text-3xl font-brand font-bold text-white mb-6">Privacy Policy</h1>
            <p className="text-gray-400 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

            <section className="space-y-4 text-gray-300">
                <p>
                    Apna Bazar ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Progressive Web Application and mobile application.
                </p>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
                <p>We may collect information about you in a variety of ways, including:</p>
                <ul className="list-disc pl-5">
                    <li><strong>Personal Data:</strong> Name, shipping address, email address, and telephone number provided during registration or checkout.</li>
                    <li><strong>Financial Data:</strong> Data related to your payment method. Note: All online payments are securely processed by Razorpay. We do not store full credit card numbers on our servers.</li>
                </ul>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Use of Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-5">
                    <li>Fulfill and manage purchases, orders, and payments.</li>
                    <li>Deliver requested products to your specified location.</li>
                    <li>Administer your account and send important operational communications (e.g., OTPs via MSG91).</li>
                </ul>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Data Security</h2>
                <p>
                    We use administrative, technical, and physical security measures (including Supabase RLS and SSL encryption) to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfectly impenetrable.
                </p>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Play Store & App Permissions</h2>
                <p>
                    Our mobile application may request access to certain device features (such as Network access to connect to our servers). You may change access permissions via your device settings at any time.
                </p>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at support@apnabazar.com.</p>
            </section>
        </div>
    );
}
