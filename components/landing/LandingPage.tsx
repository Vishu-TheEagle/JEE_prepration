
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../constants';
import Button from '../common/Button';
import { AtomIcon } from '../icons/HeroIcons';

const features = NAV_ITEMS.filter(item => !['Dashboard', 'Settings', 'Collaboration', 'Community Q&A', 'Leaderboard', 'Career Counseling'].includes(item.name));

const LandingPage: React.FC = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to dashboard if user is already logged in
        if (!loading && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, loading, navigate]);
    
    // Don't render anything while checking auth status to avoid flash of content
    if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <AtomIcon className="w-16 h-16 text-cyan-500 animate-spin" />
          </div>
        );
    }
    
    // If not authenticated, show the landing page.
    return (
        <div className="bg-gradient-to-br from-cyan-50 to-green-100 text-gray-800">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-20">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <AtomIcon className="h-8 w-auto text-cyan-600" />
                        <span className="ml-3 text-2xl font-bold text-gray-800">JEE Genius AI</span>
                    </div>
                    <div>
                        <Link to="/login">
                            <Button>Sign In</Button>
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-6 pt-24 pb-16 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
                    Your Personal AI Mentor for <span className="text-cyan-600">JEE Success</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                    Master Physics, Chemistry, and Maths with an AI-powered platform designed to solve your doubts, generate personalized tests, and create a custom learning path just for you.
                </p>
                <div className="mt-8">
                    <Link to="/login">
                         <Button size="lg" className="transform hover:scale-105 transition-transform">Get Started for Free</Button>
                    </Link>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Ace Your Exams</h2>
                        <p className="mt-4 text-gray-600">All features are powered by cutting-edge AI to give you a competitive edge.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map(feature => (
                            <div key={feature.name} className="p-8 bg-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                                <div className="p-4 bg-cyan-100 rounded-full inline-block mb-4">
                                    {feature.icon({ className: "w-8 h-8 text-cyan-600"})}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{feature.name}</h3>
                                <p className="mt-2 text-gray-600">{getFeatureDescription(feature.i18nKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="bg-gray-800 text-white">
                <div className="container mx-auto px-6 py-8 text-center">
                    <p>&copy; {new Date().getFullYear()} JEE Genius AI. Your partner in exam preparation.</p>
                </div>
            </footer>
        </div>
    );
};

const getFeatureDescription = (i18nKey: string): string => {
    const descriptions: Record<string, string> = {
        aiDoubtSolver: 'Get instant, step-by-step solutions to any question. Just type, speak, or snap a picture.',
        testGenerator: 'Create unlimited custom mock tests based on specific topics, difficulty, and exam patterns.',
        ocrPractice: 'Turn any textbook page or handwritten note into an interactive quiz using your camera.',
        aiNotes: 'Generate comprehensive, well-structured study notes on any topic from the syllabus in seconds.',
        mistakeJournal: 'Automatically log every mistake you make and get AI explanations to learn from them.',
        learningPlan: 'Receive a personalized 7-day study plan from our AI coach, targeting your weakest areas.',
        examSimulation: 'Experience real exam conditions with full-length, timed mock tests for JEE, BITSAT, and VITEEE.',
    };
    return descriptions[i18nKey] || "A powerful tool to boost your preparation.";
}

export default LandingPage;
