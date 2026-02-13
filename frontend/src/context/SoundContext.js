import React, { createContext, useContext, useEffect, useState } from 'react';
import soundManager from '../utils/SoundManager';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        // Initialize sound manager on first user interaction to comply with autoplay policy
        const initAudio = () => {
            soundManager.init();
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
        };

        window.addEventListener('click', initAudio);
        window.addEventListener('keydown', initAudio);

        // Check local storage for mute preference
        const savedMute = localStorage.getItem('soundMuted');
        if (savedMute === 'true') {
            setIsMuted(true);
            soundManager.setMuted(true);
        }

        return () => {
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
        };
    }, []);

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        soundManager.setMuted(newMuted);
        localStorage.setItem('soundMuted', newMuted);

        if (!newMuted) {
            soundManager.playClick();
        }
    };

    const playClick = () => soundManager.playClick();
    const playHover = () => soundManager.playHover();
    const playSuccess = () => soundManager.playSuccess();
    const playError = () => soundManager.playError();
    const playWelcome = () => soundManager.playWelcome();

    return (
        <SoundContext.Provider value={{
            isMuted,
            toggleMute,
            playClick,
            playHover,
            playSuccess,
            playError,
            playWelcome
        }}>
            {children}
            {/* Floating Mute Button */}
            <div
                onClick={toggleMute}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 9999,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}
                title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
                className="sound-toggle-btn"
            >
                {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
            </div>
        </SoundContext.Provider>
    );
};
