import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Privacy Policy | Droutfit",
    description: "Learn how Droutfit collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0a0d14] text-gray-300 font-sans selection:bg-blue-500/30">
            <Navbar />

            <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">Privacy Policy</h1>
                <p className="text-gray-400 mb-12">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <div className="prose prose-invert prose-blue max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p className="leading-relaxed">
                            Welcome to Droutfit ("Company", "we", "our", "us"). We respect your privacy and are committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit the website Droutfit.com and use our API, applications, and services (collectively, our "Services"), and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Data Collection and Usage</h2>
                        <p className="leading-relaxed mb-4">
                            We collect several types of information from and about users of our Services, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong className="text-white">Image Data:</strong> For the primary function of our Virtual Try-On API, we process images uploaded by users. <strong>Important:</strong> Image data is temporarily processed in memory to generate the requested output and is strictly isolated. We do not use your personal images to train our base AI models, and caching is swept regularly.</li>
                            <li><strong className="text-white">Account Information:</strong> When you create an account, we collect your name, email address, and authentication credentials.</li>
                            <li><strong className="text-white">Usage Data:</strong> We automatically collect details of your visits to our Services, including traffic data, location data, logs, generation metrics, and other communication data and the resources that you access and use.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Payment Information</h2>
                        <p className="leading-relaxed">
                            We use third-party payment processors (such as Stripe and Whop) to process payments. We do not store your complete credit card numbers or raw payment logic on our servers. Your payment data is handled securely and directly by these PCI-compliant providers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                        <p className="leading-relaxed">
                            We have implemented measures designated to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls. Any payment transactions and API communications will be encrypted using SSL/TLS technology.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Disclosures</h2>
                        <p className="leading-relaxed">
                            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Your Privacy Rights</h2>
                        <p className="leading-relaxed">
                            Depending on your location (such as under the GDPR or CCPA), you may have certain rights regarding your personal information, including the right to access, correct, delete, or restrict the processing of your personal data. To exercise these rights comprehensively, please contact our support team. You may also delete your account and associated data directly through your dashboard settings at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Our Privacy Policy</h2>
                        <p className="leading-relaxed">
                            It is our policy to post any changes we make to our privacy policy on this page. If we make material changes to how we treat our users' personal information, we will notify you by email to the primary email address specified in your account or through a notice on the Website home page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Contact Information</h2>
                        <p className="leading-relaxed">
                            To ask questions or comment about this privacy policy and our privacy practices, please contact our support team through the official support channels in your Dashboard.
                        </p>
                    </section>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-white/10 bg-[#050608] py-8 text-center text-sm font-bold text-gray-600">
                <p>© {new Date().getFullYear()} Droutfit. All rights reserved.</p>
            </footer>
        </div>
    );
}
