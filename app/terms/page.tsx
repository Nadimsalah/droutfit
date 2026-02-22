import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Terms of Service | Droutfit",
    description: "Terms and conditions for using Droutfit's services.",
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#0a0d14] text-gray-300 font-sans selection:bg-blue-500/30">
            <Navbar />

            <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">Terms of Service</h1>
                <p className="text-gray-400 mb-12">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <div className="prose prose-invert prose-blue max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="leading-relaxed">
                            By accessing or using Droutfit.com and our associated applications and APIs (the "Services"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not access or use the Services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                        <p className="leading-relaxed mb-4">
                            Droutfit provides an AI-powered Virtual Try-On API and web application for e-commerce platforms. We grant you a non-exclusive, non-transferable, revocable license to use our Services in accordance with your chosen pricing tier and these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts & Credits</h2>
                        <p className="leading-relaxed">
                            To use certain features, you must register for an account. You agree to provide accurate and complete information. You are responsible for maintaining the confidentiality of your API keys and passwords.
                            Our services operate on a credit-based system. Credits purchased are non-refundable unless expressly required by law. Unused credits may expire according to the terms of your specific subscription or purchase agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use Policy</h2>
                        <p className="leading-relaxed mb-4">
                            You agree not to use the Services for any unlawful or abusive purpose. You shall not:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Upload explicit, illicit, or otherwise prohibited content to our AI processing endpoints.</li>
                            <li>Attempt to reverse engineer, decompile, or hack the Services or API.</li>
                            <li>Use the Services to build a competitive product.</li>
                            <li>Bypass or attempt to bypass any rate limiting or quota restrictions.</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            Violation of these rules may result in immediate termination of your account without a refund.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
                        <p className="leading-relaxed">
                            Droutfit and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You retain all rights to the imagery you upload to our service; however, you grant us a temporary, restricted license solely to process the images to provide you the requested outputs.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimer of Warranties</h2>
                        <p className="leading-relaxed">
                            The Services are provided "AS IS" and "AS AVAILABLE". We disclaim all warranties of any kind, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee continuous, uninterrupted, or secure access to our Services. AI generations are predictive and we do not guarantee the exact physical accuracy of any rendered garment.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                        <p className="leading-relaxed">
                            In no event shall Droutfit, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill, arising out of your access to or use of or inability to access or use the Services. Our total liability shall not exceed the amount you paid us in the past twelve (12) months.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Modifications to Terms</h2>
                        <p className="leading-relaxed">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
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
