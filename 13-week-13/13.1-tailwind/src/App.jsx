import { useState } from 'react'
import './App.css'
import Button from './components/Button'
import EmailVerification from './components/EmailVerification'
import OTPVerification from './components/OTPVerification'

function App() {
  const [screen, setScreen] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');

  const handleEmailContinue = (emailValue) => {
    setEmail(emailValue);
    setScreen('otp');
  };

  const handleResend = () => {
    console.log('Resending OTP to:', email);
  };

  return (
    <>
      {/* Email & OTP Verification Flow */}
      {screen === 'email' && (
        <EmailVerification onContinue={handleEmailContinue} />
      )}
      {screen === 'otp' && (
        <OTPVerification email={email} onResend={handleResend} />
      )}

      <div className="p-4">
        <Button disabled={true}>Click me</Button>
        <Button disabled={false}>Click me</Button>
      </div>




      <div>-----------------------------------------------------------</div>
      {/* Responsive Flexbox Example */}
      {/* Mobile: column layout, Tablet (md): row layout with gap changes */}
      <div className='bg-green-500 w-full h-[20rem] flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 lg:gap-6'>
        <h1 className='text-sm border p-1'>Hello World</h1>
        <h1 className='text-sm border p-1'>Hello World</h1>
        <h1 className='text-sm border p-1'>Hello World</h1>
      </div>

      <div className='p-4'>
        <h1 className='text-xl font-bold mb-4'>Grid</h1>
        {/* Responsive Grid Example */}
        {/* Mobile: 1 column, Tablet (sm): 2 columns, Desktop (md): 3 columns, Large (lg): 4 columns */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
          <h1 className='text-sm border col-span-1 sm:col-span-2 p-1'>Hello World</h1>
          <h1 className='text-sm border p-1'>Hello World</h1>
          <h1 className='text-sm border p-1'>Hello World</h1>
        </div>
      </div>

      {/* Additional Responsive Examples */}
      <div className='p-4'>
        <h1 className='text-xl font-bold mb-4'>Responsive Text & Spacing</h1>
        {/* Text size changes: sm on mobile, md on tablet, lg on desktop, xl on large screens */}
        <p className='text-sm md:text-base lg:text-lg xl:text-xl mb-2 md:mb-4 lg:mb-6'>
          This text grows larger on bigger screens
        </p>
        {/* Padding changes: p-2 on mobile, p-4 on tablet, p-6 on desktop */}
        <div className='bg-gray-200 p-2 md:p-4 lg:p-6'>
          Responsive padding box
        </div>
      </div>

      {/* Hide/Show Elements at Different Breakpoints */}
      <div className='p-4'>
        <h1 className='text-xl font-bold mb-4'>Visibility Controls</h1>
        {/* Hidden on mobile, visible from md (tablet) onwards */}
        <p className='hidden md:block bg-yellow-200 p-2 mb-2'>
          Visible only on tablet and larger screens (md+)
        </p>
        {/* Visible on mobile, hidden from lg (desktop) onwards */}
        <p className='block lg:hidden bg-pink-200 p-2'>
          Visible only on mobile and tablet (below lg)
        </p>
      </div>
    </>
  );
}

export default App
