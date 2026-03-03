import React, { useRef, useState, useEffect } from 'react';
import { FaMicrophone, FaTimes, FaArrowRight } from 'react-icons/fa';

/**
 * VoiceAssistantOverlay
 * Props:
 *   isActive      (bool)   - whether listening is active
 *   transcript    (string) - current spoken text
 *   statusHint    (string) - short status message
 *   onStart       (fn)     - called when mic button clicked (not active)
 *   onCancel      (fn)     - called when X button clicked
 *   onSubmit      (fn)     - called when > button clicked (confirm result)
 */
export default function VoiceAssistantOverlay({
    isActive, transcript, statusHint, onStart, onCancel, onSubmit
}) {
    const [dots, setDots] = useState([]);
    const animRef = useRef(null);

    /* Generate random animated dot positions when active */
    useEffect(() => {
        if (isActive) {
            const newDots = Array.from({ length: 8 }, (_, i) => ({
                id: i,
                size: 6 + Math.random() * 14,
                x: 20 + Math.random() * 60,   // % from left
                delay: i * 0.18,
                duration: 1.2 + Math.random() * 0.8,
                color: ['#64b5f6', '#ce93d8', '#80cbc4', '#ffb74d', '#ef9a9a'][i % 5]
            }));
            setDots(newDots);
        } else {
            setDots([]);
        }
    }, [isActive]);

    return (
        <div style={{
            borderRadius: '16px',
            border: `1.5px solid ${isActive ? 'rgba(100,181,246,0.5)' : 'rgba(255,255,255,0.12)'}`,
            background: isActive
                ? 'linear-gradient(135deg, rgba(100,181,246,0.08), rgba(206,147,216,0.08))'
                : 'rgba(255,255,255,0.04)',
            padding: '18px 20px',
            transition: 'all 0.4s ease',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '20px',
            minHeight: isActive ? '110px' : '62px',
        }}>

            {/* ---- Floating animated dots (visible only when active) ---- */}
            {isActive && dots.map(dot => (
                <span key={dot.id} style={{
                    position: 'absolute',
                    bottom: '0',
                    left: `${dot.x}%`,
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    borderRadius: '50%',
                    background: dot.color,
                    opacity: 0.55,
                    animation: `floatDot ${dot.duration}s ${dot.delay}s ease-in-out infinite alternate`,
                    pointerEvents: 'none',
                }} />
            ))}

            {/* ---- Row: Mic icon + text + action buttons ---- */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
                {/* Mic button */}
                <button
                    onClick={isActive ? undefined : onStart}
                    title={isActive ? 'Listening...' : 'Click to speak'}
                    style={{
                        width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isActive ? '#ef5350' : '#64b5f6'}`,
                        background: isActive ? 'rgba(239,83,80,0.18)' : 'rgba(100,181,246,0.12)',
                        color: isActive ? '#ef5350' : '#64b5f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: isActive ? 'default' : 'pointer',
                        animation: isActive ? 'micPulse 1.1s ease-in-out infinite' : 'none',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <FaMicrophone size={18} />
                </button>

                {/* Text area */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                        AI Voice Assistant
                    </div>
                    <div style={{ fontSize: '0.8rem', color: isActive ? '#90caf9' : 'var(--text-muted)' }}>
                        {statusHint || 'Click the mic and speak your expense or command'}
                    </div>
                </div>

                {/* X Cancel button */}
                {isActive && (
                    <button onClick={onCancel} title="Cancel"
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(239,83,80,0.6)',
                            background: 'rgba(239,83,80,0.12)', color: '#ef5350', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s'
                        }}>
                        <FaTimes size={13} />
                    </button>
                )}

                {/* ▶ Submit button (shown when not active and there's a transcript) */}
                {!isActive && transcript && (
                    <button onClick={onSubmit} title="Apply voice input"
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(100,181,246,0.6)',
                            background: 'rgba(100,181,246,0.15)', color: '#64b5f6', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s'
                        }}>
                        <FaArrowRight size={13} />
                    </button>
                )}

                {/* Start mic button (idle, no transcript) */}
                {!isActive && !transcript && (
                    <button onClick={onStart} title="Start voice input"
                        style={{
                            padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(100,181,246,0.4)',
                            background: 'rgba(100,181,246,0.1)', color: '#90caf9', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                        <FaMicrophone size={12} /> Speak
                    </button>
                )}
            </div>

            {/* ---- Live subtitle when listening ---- */}
            {isActive && (
                <div style={{
                    marginTop: '12px', position: 'relative', zIndex: 1,
                    minHeight: '28px',
                    padding: '6px 12px', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <span style={{
                        color: '#e3f2fd', fontSize: '0.9rem', fontWeight: '500',
                        fontStyle: transcript ? 'normal' : 'italic',
                        letterSpacing: '0.01em'
                    }}>
                        {transcript || '...'}
                        {transcript && <span style={{
                            display: 'inline-block', width: '2px', height: '14px',
                            background: '#64b5f6', marginLeft: '2px', verticalAlign: 'middle',
                            animation: 'blinkCursor 0.8s step-end infinite'
                        }} />}
                    </span>
                </div>
            )}

            {/* ---- Confirmed transcript (after stopping) ---- */}
            {!isActive && transcript && (
                <div style={{
                    marginTop: '10px', position: 'relative', zIndex: 1,
                    padding: '6px 12px', borderRadius: '8px',
                    background: 'rgba(100,181,246,0.06)',
                    border: '1px solid rgba(100,181,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
                }}>
                    <span style={{ color: '#90caf9', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        "{transcript}"
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button onClick={onSubmit} title="Apply"
                            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(100,181,246,0.5)', background: 'rgba(100,181,246,0.15)', color: '#64b5f6', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaArrowRight size={10} /> Apply
                        </button>
                        <button onClick={onCancel} title="Dismiss"
                            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(239,83,80,0.4)', background: 'rgba(239,83,80,0.1)', color: '#ef5350', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaTimes size={10} /> Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Inline animation keyframes */}
            <style>{`
                @keyframes floatDot {
                    0%   { transform: translateY(0px) scale(1);   opacity: 0.45; }
                    100% { transform: translateY(-36px) scale(1.3); opacity: 0.12; }
                }
                @keyframes micPulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(239,83,80,0.5); }
                    50%     { box-shadow: 0 0 0 10px rgba(239,83,80,0); }
                }
                @keyframes blinkCursor {
                    0%,100% { opacity:1; } 50% { opacity:0; }
                }
            `}</style>
        </div>
    );
}
