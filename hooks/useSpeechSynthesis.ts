import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    const speak = useCallback((text: string) => {
        if (!supported || isSpeaking) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
    }, [supported, isSpeaking]);

    const cancel = useCallback(() => {
        if (!supported || !isSpeaking) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [supported, isSpeaking]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (supported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [supported]);


    return { isSpeaking, speak, cancel, supported };
};
