import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSettings } from '../../hooks/useSettings';
import { useMistakes } from '../../hooks/useMistakes';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import Card from '../common/Card';
import Button from '../common/Button';
import { ShieldCheckIcon, UserGroupIcon, SunIcon, MoonIcon, LanguageIcon } from '../icons/HeroIcons';
import { ExamMode, Language } from '../../types';

const SettingsPage: React.FC = () => {
  const { 
    animationsEnabled, setAnimationsEnabled, 
    theme, setTheme, 
    examMode, setExamMode,
    notificationsEnabled, setNotificationsEnabled
  } = useSettings();
  const { language, setLanguage, t } = useLocale();
  const { clearMistakes } = useMistakes();
  const { user } = useAuth();

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  
  const [linkedMentors, setLinkedMentors] = useState<string[]>([]); 

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    const studentDataKey = `jee-genius-student-data-${user?.email}`;
    const studentData = JSON.parse(localStorage.getItem(studentDataKey) || '{}');
    studentData.inviteCode = code;
    localStorage.setItem(studentDataKey, JSON.stringify(studentData));
    toast.success("Invite code generated and active for one use.");
  };

  const handleResetAccount = () => {
    if (window.confirm("Are you sure you want to reset your account? All mistakes, plans, and progress will be permanently deleted.")) {
      clearMistakes();
      if(user?.email) {
          localStorage.removeItem(`jee-genius-plan-${user.email}`);
          localStorage.removeItem(`jee-genius-gamification-${user.email}`);
      }
      localStorage.removeItem('jee-genius-community-questions'); // This is global, fine to clear.
      toast.success("Your account has been reset.");
      // Consider a full page reload or redirect to reflect changes immediately
      window.location.reload();
    }
  };

  const handleNotificationToggle = () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setNotificationsEnabled(true);
            toast.success("Notifications enabled!");
            new Notification("JEE Genius AI", { body: "You will now receive study reminders.", icon: "/favicon.svg"});
          } else {
            toast.error("Notifications were denied. You can enable them in your browser settings.");
          }
        });
      } else {
        toast.error("This browser does not support desktop notifications.");
      }
    } else {
      setNotificationsEnabled(false);
      toast.success("Notifications disabled.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-page-enter">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('settings')}</h1>

      <div className="space-y-8">
        
        <Card>
          <h2 className="text-xl font-semibold text-cyan-600 dark:text-cyan-400 mb-4">General</h2>
          
           <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-gray-800 dark:text-white">{t('language')}</p>
              <div className="flex items-center gap-2">
                  <Button size="sm" variant={language === 'en' ? 'primary' : 'secondary'} onClick={() => setLanguage('en')}>EN</Button>
                  <Button size="sm" variant={language === 'hi' ? 'primary' : 'secondary'} onClick={() => setLanguage('hi')}>HI</Button>
              </div>
          </div>
          
          <div className="flex items-center justify-between">
              <p className="font-medium text-gray-800 dark:text-white">{t('examMode')}</p>
              <div className="flex items-center gap-2">
                  {(['JEE', 'BITSAT', 'VITEEE'] as ExamMode[]).map(mode => (
                      <Button key={mode} size="sm" variant={examMode === mode ? 'primary' : 'secondary'} onClick={() => setExamMode(mode)}>{mode}</Button>
                  ))}
              </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-cyan-600 dark:text-cyan-400 mb-4">{t('appearance')}</h2>
          <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-gray-800 dark:text-white">{t('theme')}</p>
              <div className="flex items-center gap-2">
                  <Button size="sm" variant={theme === 'light' ? 'primary' : 'secondary'} onClick={() => setTheme('light')} leftIcon={<SunIcon className="w-5 h-5"/>} />
                  <Button size="sm" variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={() => setTheme('dark')} leftIcon={<MoonIcon className="w-5 h-5"/>} />
              </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{t('reduceAnimations')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('reduceAnimationsDesc')}</p>
            </div>
            <button type="button" onClick={() => setAnimationsEnabled(!animationsEnabled)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 ${animationsEnabled ? 'bg-cyan-600' : 'bg-gray-600'}`} role="switch" aria-checked={animationsEnabled}>
              <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${animationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}/>
            </button>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold text-cyan-600 dark:text-cyan-400 mb-4">{t('notifications')}</h2>
           <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{t('studyReminders')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('studyRemindersDesc')}</p>
            </div>
            <button type="button" onClick={handleNotificationToggle} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 ${notificationsEnabled ? 'bg-cyan-600' : 'bg-gray-600'}`} role="switch" aria-checked={notificationsEnabled}>
              <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}/>
            </button>
          </div>
        </Card>

        {user?.role === 'student' && (
          <Card>
            <h2 className="text-xl font-semibold text-cyan-600 dark:text-cyan-400 mb-4 flex items-center"><UserGroupIcon className="w-6 h-6 mr-2"/>{t('parentMentorAccess')}</h2>
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('parentMentorAccessDesc')}</p>
                <div className="flex items-center gap-4">
                    <Button onClick={generateInviteCode} leftIcon={<ShieldCheckIcon className="w-5 h-5 mr-2"/>}>{t('generateInviteCode')}</Button>
                    {inviteCode && <p className="text-lg font-mono tracking-widest bg-gray-200 dark:bg-gray-900/50 p-2 rounded-md">{inviteCode}</p>}
                </div>
                {inviteCode && <p className="text-xs text-gray-500">{t('shareInviteCode', { email: user.email })}</p>}
            </div>
             <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-medium text-gray-800 dark:text-white">{t('linkedMentors')}</h3>
                {linkedMentors.length === 0 ? (
                    <p className="text-sm text-gray-500 mt-2">{t('noLinkedMentors')}</p>
                ) : (
                    <ul className="mt-2 space-y-2">
                        {/* UI for linked mentors would go here */}
                    </ul>
                )}
             </div>
          </Card>
        )}

        <Card>
            <h2 className="text-xl font-semibold text-red-500 mb-4">{t('dangerZone')}</h2>
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-gray-800 dark:text-white">{t('resetAccount')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('resetAccountDesc')}</p>
                </div>
                 <Button variant="secondary" onClick={handleResetAccount} className="bg-red-900/50 text-red-300 hover:bg-red-800/50 focus:ring-red-500">
                    {t('resetAccount')}
                 </Button>
            </div>
        </Card>

      </div>
    </div>
  );
};

export default SettingsPage;
