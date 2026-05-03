import React, { useEffect, useState } from 'react'

export default function IntroScreen({ onDone }) {
  const [leaving, setLeaving]   = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const step = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(step); return 100 }
        return p + 1.5
      })
    }, 30)

    const exitTimer = setTimeout(() => setLeaving(true), 2800)
    const doneTimer = setTimeout(() => onDone(), 3400)

    return () => {
      clearInterval(step)
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className={`bg-mesh-gradient ${leaving ? 'folio-screen-out' : ''}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.5rem',
        pointerEvents: 'none'
      }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-0 pointer-events-none"></div>

      <div className="folio-title-anim animate-float z-10" style={{ display: 'flex', alignItems: 'baseline', gap: '2px', animationDuration: '4s' }}>
        <span className="text-gradient" style={{
          fontWeight: 800,
          fontSize: 'clamp(3.5rem, 10vw, 6rem)',
          letterSpacing: '-4px',
          lineHeight: 1,
          textTransform: 'uppercase'
        }}>Folio.</span>
      </div>

      <p className="folio-sub-anim z-10" style={{
        fontWeight: 800,
        fontSize: 'clamp(0.65rem, 2vw, 0.85rem)',
        color: '#6B7280',
        letterSpacing: '0.2em',
        margin: 0,
        textAlign: 'center',
        textTransform: 'uppercase'
      }}>
        The books should have found you so
      </p>

      <div className="folio-sub-anim z-10" style={{
        width: 'clamp(150px, 30vw, 250px)',
        height: '2px',
        backgroundColor: '#E5E7EB',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginTop: '1rem',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(progress, 100)}%`,
          backgroundColor: '#000000',
          borderRadius: '9999px',
          transition: 'width 0.03s linear'
        }} />
      </div>
    </div>
  )
}
