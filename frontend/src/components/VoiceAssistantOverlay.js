import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaTimes } from 'react-icons/fa';

export default function VoiceAssistantOverlay({
    isActive, transcript, statusHint, onStart, onCancel, onSubmit
}) {
    const [dots, setDots] = useState([]);

    useEffect(() => {
        if (isActive) {
            setDots(Array.from({ length: 8 }, (_, i) => ({
                id: i,
                size: 6 + Math.random() * 14,
                x: 10 + Math.random() * 80,
                delay: i * 0.18,
                duration: 1.2 + Math.random() * 0.8,
                color: ['#64b5f6', '#ce93d8', '#80cbc4', '#ffb74d', '#ef9a9a'][i % 5]
            })));
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
            minHeight: isActive ? '110px' : '66px',
        }}>

            {/* Floating dots */}
            {isActive && dots.map(dot => (
                <span key={dot.id} style={{
                    position: 'absolute', bottom: 0, left: `${dot.x}%`,
                    width: `${dot.size}px`, height: `${dot.size}px`,
                    borderRadius: '50%', background: dot.color, opacity: 0.5,
                    animation: `floatDot ${dot.duration}s ${dot.delay}s ease-in-out infinite alternate`,
                    pointerEvents: 'none',
                }} />
            ))}

            {/* Main row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
                {/* Label */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                        AI Voice Assistant
                    </div>
                    <div style={{ fontSize: '0.78rem', color: isActive ? '#90caf9' : 'var(--text-muted)' }}>
                        {statusHint || 'Click Speak to use voice input'}
                    </div>
                </div>

                {/* Single action button — only two states: Speak or Cancel */}
                {isActive ? (
                    <button onClick={onCancel} title="Cancel"
                        style={{
                            padding: '9px 18px', borderRadius: '10px', cursor: 'pointer',
                            border: '1.5px solid rgba(239,83,80,0.6)',
                            background: 'rgba(239,83,80,0.12)', color: '#ef5350',
                            display: 'flex', alignItems: 'center', gap: '7px',
                            fontWeight: '600', fontSize: '0.85rem', flexShrink: 0,
                            transition: 'all 0.2s ease'
                        }}>
                        <FaTimes size={13} /> Cancel
                    </button>
                ) : (
                    <button onClick={onStart} title="Start voice input"
                        style={{
                            padding: '9px 18px', borderRadius: '10px', cursor: 'pointer',
                            border: '1.5px solid rgba(100,181,246,0.5)',
                            background: 'rgba(100,181,246,0.1)', color: '#90caf9',
                            display: 'flex', alignItems: 'center', gap: '7px',
                            fontWeight: '600', fontSize: '0.85rem', flexShrink: 0,
                            transition: 'all 0.2s ease'
                        }}>
                        <FaMicrophone size={13} /> Speak
                    </button>
                )}

            </div>

            {/* Live subtitle while listening */}
            {isActive && (
                <div style={{
                    marginTop: '12px', position: 'relative', zIndex: 1,
                    padding: '7px 12px', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    minHeight: '32px'
                }}>
                    <span style={{ color: '#e3f2fd', fontSize: '0.9rem', fontWeight: '500', fontStyle: transcript ? 'normal' : 'italic' }}>
                        {transcript || '...'}
                        {transcript && (
                            <span style={{
                                display: 'inline-block', width: '2px', height: '14px',
                                background: '#64b5f6', marginLeft: '2px', verticalAlign: 'middle',
                                animation: 'blinkCursor 0.8s step-end infinite'
                            }} />
                        )}
                    </span>
                </div>
            )}

            {/* Confirmed transcript row (after stop) */}
            {!isActive && transcript && (
                <div style={{
                    marginTop: '10px', position: 'relative', zIndex: 1,
                    padding: '7px 12px', borderRadius: '8px',
                    background: 'rgba(100,181,246,0.06)',
                    border: '1px solid rgba(100,181,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
                }}>
                    <span style={{ color: '#90caf9', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        "{transcript}"
                    </span>
                    <button onClick={onCancel} title="Clear"
                        style={{
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
                            cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center'
                        }}>
                        <FaTimes size={12} />
                    </button>
                </div>
            )}

            <style>{`
                @keyframes floatDot {
                    0%   { transform: translateY(0)    scale(1);   opacity: 0.45; }
                    100% { transform: translateY(-38px) scale(1.3); opacity: 0.1; }
                }
                @keyframes blinkCursor {
                    0%,100% { opacity:1; } 50% { opacity:0; }
                }
            `}</style>
        </div>
    );
}
