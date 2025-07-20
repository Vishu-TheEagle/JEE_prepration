
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { AtomIcon, UserCircleIcon, DevicePhoneMobileIcon } from '../icons/HeroIcons';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

type Role = 'student' | 'parent';

const LoginPage: React.FC = () => {
  const { login, loginAsParent, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>('student');

  // Student state
  const [step, setStep] = useState<'email' | 'password' | 'twoFactor'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Parent state
  const [studentEmail, setStudentEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  const handleStudentEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
        setStep('password');
    } else {
        toast.error("Please enter a valid email address.");
    }
  }

  const handleStudentLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password) {
        toast.error("Please enter a password.");
        return;
      }
      setIsProcessing(true);
      setStep('twoFactor');

      try {
        await login(email, password);
        toast.success("Successfully verified and logged in!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
        setStep('email'); // Reset on failure
      } finally {
        setIsProcessing(false);
      }
  }
  
  const handleGoBack = () => {
      setStep('email');
      setPassword('');
  }

  const handleParentLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim() || !inviteCode.trim()) {
      toast.error("Please fill in both fields.");
      return;
    }
    setIsProcessing(true);
    try {
        await loginAsParent(studentEmail, inviteCode);
        toast.success(`Successfully linked to ${studentEmail}`);
    } catch(error) {
        toast.error(error instanceof Error ? error.message : "Invalid student email or invite code.");
    } finally {
        setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <AtomIcon className="w-16 h-16 text-cyan-400 animate-spin" />
      </div>
    );
  }
  
  const TabButton = ({ role, label }: {role: Role, label: string}) => (
    <button
      onClick={() => setActiveRole(role)}
      className={`flex-1 py-2 text-sm font-medium transition-colors ${activeRole === role ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
    >
      {label}
    </button>
  );

  const renderStudentForm = () => {
    switch (step) {
        case 'email':
            return (
                <div key="email" className="animate-fade-in">
                    <h1 className="text-2xl font-bold text-white">Student Sign in</h1>
                    <p className="mt-2 text-gray-400">to continue to JEE Genius AI</p>
                    <form onSubmit={handleStudentEmailSubmit} className="mt-6 space-y-4">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required autoFocus />
                        <div className="pt-2"><Button type="submit" className="w-full">Next</Button></div>
                    </form>
                </div>
            );
        case 'password':
            return (
                 <div key="password" className="animate-fade-in">
                    <h1 className="text-2xl font-bold text-white">One last step</h1>
                     <div className="mt-2 flex items-center justify-center gap-2 border border-gray-600 rounded-full px-3 py-1 w-fit mx-auto bg-gray-900/50">
                        <UserCircleIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-300">{email}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">Enter a password to secure your account or sign in.</p>
                    <form onSubmit={handleStudentLogin} className="mt-4 space-y-4">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create or enter password" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required autoFocus />
                        <div className="pt-2 flex justify-between items-center">
                            <Button type="button" variant="secondary" onClick={handleGoBack}>Back</Button>
                            <Button type="submit" isLoading={isProcessing}>Sign in or Create Account</Button>
                        </div>
                    </form>
                </div>
            );
        case 'twoFactor':
             return (
                <div key="twoFactor" className="animate-fade-in text-center">
                    <h1 className="text-2xl font-bold text-white">Verifying</h1>
                    <p className="mt-4 text-gray-400">Securely logging you in...</p>
                    <div className="my-8 flex justify-center items-center">
                        <div className="relative">
                            <DevicePhoneMobileIcon className="w-20 h-20 text-cyan-400" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><AtomIcon className="w-10 h-10 text-cyan-400 animate-spin" /></div>
                        </div>
                    </div>
                    <p className="text-lg font-medium text-gray-300 animate-pulse">Please wait...</p>
                </div>
            );
    }
  }

  const renderParentForm = () => (
      <div key="parent" className="animate-fade-in">
          <h1 className="text-2xl font-bold text-white">Parent/Mentor Sign in</h1>
          <p className="mt-2 text-gray-400">Enter invite details to access dashboard</p>
          <form onSubmit={handleParentLoginSubmit} className="mt-6 space-y-4">
              <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="Student's Email Address" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
              <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="6-Digit Invite Code" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required maxLength={6} />
              <div className="pt-2"><Button type="submit" isLoading={isProcessing} className="w-full">Access Dashboard</Button></div>
          </form>
      </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <style>{`.animate-fade-in { animation: page-enter 0.4s ease-in-out; }`}</style>
      <div className="w-full max-w-sm p-8 space-y-4 bg-gray-800 rounded-2xl shadow-2xl text-center">
        <div className="flex flex-col items-center">
           <div className="p-3 bg-cyan-500/10 rounded-full mb-2">
             <AtomIcon className="w-12 h-12 text-cyan-400" />
           </div>
        </div>

        <div className="flex border-b border-gray-700">
            <TabButton role="student" label="Student" />
            <TabButton role="parent" label="Parent/Mentor" />
        </div>
        
        <div className="pt-2">
            {activeRole === 'student' ? renderStudentForm() : renderParentForm()}
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
