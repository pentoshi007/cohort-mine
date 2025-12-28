import { useState, useRef, useEffect } from 'react';

/**
 * ============================================================================
 * OTP VERIFICATION - OPTIMAL APPROACH
 * ============================================================================
 * 
 * STRATEGY: Use an ARRAY of refs instead of individual refs (ref1, ref2, etc.)
 * This is cleaner and scales to any number of OTP digits.
 * 
 * KEY CONCEPTS:
 * - otp: Array of 6 values ['', '', '', '', '', '']
 * - inputRefs: Array of 6 refs [ref, ref, ref, ref, ref, ref]
 * - handleChange(index, value): Update value & auto-focus next
 * - handleKeyDown(index, e): Handle backspace to go back
 * 
 * ============================================================================
 */

export default function OTPVerification({ email, onResend }) {
    // ========================================================================
    // STATE: Single array to store all 6 OTP digits
    // ========================================================================
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(572);

    // ========================================================================
    // REFS: Array of refs - one for each input box
    // 
    // We use useRef([]) and populate it once. Each inputRefs.current[i] 
    // will hold the reference to the i-th input element.
    // ========================================================================
    const inputRefs = useRef([]);

    // Check if all 6 digits are filled
    const isFilled = otp.every(digit => digit !== '');

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Format timer as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ========================================================================
    // handleChange: Called when user types in any box
    // 
    // 1. Validate input (only digits)
    // 2. Update the otp array at this index
    // 3. If digit entered & not last box → focus next box
    // ========================================================================
    const handleChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) value = value.slice(-1);

        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        // Update otp array
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input if digit entered and not last box
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // ========================================================================
    // handleKeyDown: Handle Backspace navigation
    // 
    // If Backspace pressed on empty box → focus previous box
    // ========================================================================
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        if (timer === 0 && onResend) {
            onResend();
            setTimer(572);
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
                <h1 className="text-2xl font-bold text-white mb-6">Check Your Email For A Code</h1>

                <p className="text-gray-400 mb-8">
                    Please enter the verification code sent to your email id{' '}
                    <span className="text-white font-medium">{email}</span>
                </p>

                {/* ================================================================
                    OTP INPUT BOXES
                    
                    Using .map() to render 6 inputs from the otp array.
                    Each input:
                    - ref: Stored in inputRefs.current[index] for focusing
                    - value: Controlled from otp[index]
                    - onChange: Updates value & auto-focuses next
                    - onKeyDown: Handles backspace to go back
                    ================================================================ */}
                <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}  // Store ref in array
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-14 bg-[#2a3a5a] text-white text-center text-xl font-bold rounded-lg outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                        />
                    ))}
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-2 text-gray-400 my-6">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{formatTime(timer)}</span>
                </div>

                {/* Verify Button - Green when all filled */}
                <button
                    disabled={!isFilled}
                    className={`w-full py-4 rounded-lg font-medium text-white transition-all cursor-pointer ${isFilled
                        ? 'bg-green-400 hover:bg-green-500'
                        : 'bg-[#6b7a99] cursor-not-allowed'
                        }`}
                >
                    Verify
                </button>

                {/* Resend Link */}
                <p className="text-gray-400 mt-4">
                    Can't find the email? Click{' '}
                    <button
                        onClick={handleResend}
                        className={`underline ${timer === 0 ? 'text-cyan-400 cursor-pointer' : 'text-gray-500 cursor-not-allowed'}`}
                        disabled={timer > 0}
                    >
                        here
                    </button>
                    {' '}to resend.
                </p>
            </div>
        </div>
    );
}
