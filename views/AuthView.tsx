import React, { useState } from 'react';
import { useApp } from '../store/context';
import { UserRole } from '../types';
import { Smartphone, Mail, ArrowRight, ShoppingBag, Shield, Store, Truck, Lock, Loader2 } from 'lucide-react';

const AuthView: React.FC = () => {
  const { login } = useApp();
  
  // Auth State
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // --- Handlers ---
  
  const handleRequestOtp = (e: React.FormEvent) => {
      e.preventDefault();
      if(mobileNumber.length < 10) {
          alert("Please enter a valid 10-digit mobile number");
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          setShowOtpInput(true);
          // Simulate OTP
          alert("Your OTP is 1234");
      }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
      e.preventDefault();
      if (otp === '1234') {
          // Mobile login defaults to Customer for now
          login(UserRole.CUSTOMER);
      } else {
          alert("Invalid OTP. Please try 1234.");
      }
  };

  const handleEmailLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      
      setTimeout(() => {
          setIsLoading(false);
          // Simulation logic based on email text
          const lowerEmail = email.toLowerCase();
          
          if (lowerEmail.includes('shop')) login(UserRole.SHOPKEEPER);
          else if (lowerEmail.includes('rider')) login(UserRole.RIDER);
          else if (lowerEmail.includes('admin')) login(UserRole.ADMIN);
          else login(UserRole.CUSTOMER);
      }, 1000);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
          alert("Please enter your email first.");
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          alert(`Password reset link sent to ${email}`);
          setForgotPasswordMode(false);
      }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        {/* Header */}
        <div className="text-center mb-8">
             <h1 className="text-4xl font-bold text-saffron-600 mb-2 tracking-tight">DesiMart</h1>
             <p className="text-gray-600">Login to India's Local Commerce</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Method Toggle */}
            <div className="flex border-b">
                <button 
                   className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 ${authMethod === 'mobile' ? 'text-saffron-600 border-b-2 border-saffron-600 bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}
                   onClick={() => { setAuthMethod('mobile'); setShowOtpInput(false); setForgotPasswordMode(false); }}
                >
                    <Smartphone size={18} />
                    <span>Mobile Number</span>
                </button>
                <button 
                   className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 ${authMethod === 'email' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                   onClick={() => { setAuthMethod('email'); setForgotPasswordMode(false); }}
                >
                    <Mail size={18} />
                    <span>Email ID</span>
                </button>
            </div>

            <div className="p-8">
                {/* Mobile Login Flow */}
                {authMethod === 'mobile' && (
                    <form onSubmit={showOtpInput ? handleVerifyOtp : handleRequestOtp}>
                        {!showOtpInput ? (
                            <>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                <div className="flex border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-saffron-400">
                                    <span className="bg-gray-100 px-3 py-3 text-gray-500 font-medium border-r">+91</span>
                                    <input 
                                        type="tel" 
                                        maxLength={10}
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g,''))}
                                        placeholder="Enter 10 digit number"
                                        className="w-full px-4 py-3 focus:outline-none"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">We will send an OTP to verify your number.</p>
                                
                                <button 
                                    type="submit" 
                                    disabled={isLoading || mobileNumber.length < 10}
                                    className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-3.5 rounded-lg mt-6 transition flex items-center justify-center disabled:opacity-70"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Request OTP"}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-center mb-6">
                                    <p className="text-gray-500 text-sm">OTP sent to +91 {mobileNumber}</p>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowOtpInput(false)}
                                        className="text-saffron-600 text-xs font-bold hover:underline"
                                    >
                                        Change Number
                                    </button>
                                </div>
                                
                                <div className="flex justify-center gap-4 mb-6">
                                    <input 
                                        type="text" 
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP (1234)"
                                        className="w-full text-center text-2xl tracking-widest border-b-2 border-gray-300 focus:border-saffron-500 focus:outline-none py-2"
                                    />
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-3.5 rounded-lg transition"
                                >
                                    Verify & Login
                                </button>
                            </>
                        )}
                    </form>
                )}

                {/* Email Login Flow */}
                {authMethod === 'email' && (
                    <form onSubmit={forgotPasswordMode ? handleForgotPassword : handleEmailLogin}>
                        {forgotPasswordMode ? (
                            <>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Reset Password</h3>
                                <p className="text-sm text-gray-500 mb-4">Enter your email to receive a reset link.</p>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                                >
                                    {isLoading ? "Sending..." : "Send Reset Link"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setForgotPasswordMode(false)}
                                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-800"
                                >
                                    Back to Login
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                            required
                                        />
                                        <div className="flex justify-end mt-1">
                                            <button 
                                                type="button"
                                                onClick={() => setForgotPasswordMode(true)}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg mt-6 transition flex items-center justify-center"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
                                </button>
                            </>
                        )}
                    </form>
                )}
            </div>

            {/* Terms */}
            <div className="bg-gray-50 p-4 text-center text-[10px] text-gray-400 border-t">
                By continuing, you agree to DesiMart's <a href="#" className="underline">Terms of Use</a> and <a href="#" className="underline">Privacy Policy</a>.
            </div>
        </div>
        
        {/* Demo Quick Access */}
        <div className="mt-8 max-w-2xl w-full">
            <div className="flex items-center space-x-2 mb-4 justify-center">
               <div className="h-px bg-gray-300 w-12"></div>
               <span className="text-gray-400 text-xs font-bold uppercase">Quick Demo Access</span>
               <div className="h-px bg-gray-300 w-12"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 <button onClick={() => login(UserRole.CUSTOMER)} className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md border border-transparent hover:border-saffron-400 transition">
                     <ShoppingBag size={20} className="text-saffron-500 mb-1"/>
                     <span className="text-xs font-bold text-gray-700">Customer</span>
                 </button>
                 <button onClick={() => login(UserRole.SHOPKEEPER)} className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md border border-transparent hover:border-green-400 transition">
                     <Store size={20} className="text-green-600 mb-1"/>
                     <span className="text-xs font-bold text-gray-700">Shopkeeper</span>
                 </button>
                 <button onClick={() => login(UserRole.RIDER)} className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md border border-transparent hover:border-blue-400 transition">
                     <Truck size={20} className="text-blue-600 mb-1"/>
                     <span className="text-xs font-bold text-gray-700">Rider</span>
                 </button>
                 <button onClick={() => login(UserRole.ADMIN)} className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md border border-transparent hover:border-purple-400 transition">
                     <Shield size={20} className="text-purple-600 mb-1"/>
                     <span className="text-xs font-bold text-gray-700">Admin</span>
                 </button>
            </div>
        </div>
    </div>
  );
};

export default AuthView;
