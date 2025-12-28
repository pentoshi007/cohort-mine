import { useState } from 'react';

export default function EmailVerification({ onContinue }) {
    const [email, setEmail] = useState('');

    const isFilled = email.trim().length > 0;

    const handleContinue = () => {
        if (isFilled && onContinue) {
            onContinue(email);
        }
    };

    return (
        <div className="min-h-screen bg-primary-dark flex flex-col items-center justify-center px-4">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-16">
                <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="14" rx="2" />
                    <circle cx="12" cy="11" r="3" />
                    <path d="M6 8h.01M18 8h.01" />
                </svg>
                <span className="text-2xl font-semibold text-cyan-400">Webinar.gg</span>
            </div>

            {/* Card Content */}
            <div className="w-full max-w-md text-center">
                <h1 className="text-2xl font-bold text-white mb-6">Enter Your Email</h1>
                
                <p className="text-gray-400 mb-6">
                    Please enter your email address. We'll send you a verification code.
                </p>

                {/* Input */}
                <input
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-[#2a3a5a] text-white placeholder-gray-500 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                />

                {/* Button - changes color when input is filled */}
                <button
                    disabled={!isFilled}
                    onClick={handleContinue}
                    className={`w-full py-4 rounded-lg font-medium text-white transition-all cursor-pointer ${
                        isFilled 
                            ? 'bg-green-400 hover:bg-green-500' 
                            : 'bg-[#6b7a99] cursor-not-allowed'
                    }`}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

