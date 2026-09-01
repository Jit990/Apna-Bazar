export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 prose prose-invert prose-red">
            <h1 className="text-3xl font-brand font-bold text-white mb-6">Terms of Service</h1>
            <p className="text-gray-400 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

            <section className="space-y-4 text-gray-300">
                <p>
                    By accessing or using the Apna Bazar application, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                </p>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Accounts and Registration</h2>
                <p>
                    You must register using a valid mobile number to place orders. You are responsible for safeguarding the OTPs and passwords you use to access the Service and for any activities or actions under your password.
                </p>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Purchases and Payments</h2>
                <p>
                    If you wish to purchase any product made available through the Service, you may be asked to supply certain information relevant to your Purchase including your delivery address. Payments are processed securely via our payment partners (e.g., Razorpay) or collected as Cash on Delivery (COD). Product prices and availability are subject to change without notice.
                </p>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Deliveries</h2>
                <p>
                    We operate as a quick-commerce platform. While we strive to meet delivery estimates, times are not guaranteed. We reserve the right to cancel orders if the delivery location falls outside our serviceable zones.
                </p>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Refunds and Cancellations</h2>
                <p>
                    Orders can be canceled prior to dispatch for a full refund. Refund processing for online payments via Razorpay typically takes 5-7 business days depending on your bank.
                </p>

                <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Governing Law</h2>
                <p>
                    These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>

                <p className="mt-8">
                    Contact us at support@apnabazar.com for any queries.
                </p>
            </section>
        </div>
    );
}
