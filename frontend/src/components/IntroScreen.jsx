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
      className={leaving ? 'folio-screen-out' : ''}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#ffffff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.5rem',
        pointerEvents: 'none'
      }}
    >
      <div className="folio-title-anim" style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        <span style={{
          fontFamily: "'Nunito Sans', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(3.5rem, 10vw, 6rem)',
          color: '#0060AE',
          letterSpacing: '-2px',
          lineHeight: 1
        }}>Folio</span>
        <span style={{
          fontFamily: "'Nunito Sans', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(3.5rem, 10vw, 6rem)',
          color: '#F59E0B',
          lineHeight: 1
        }}>!</span>
      </div>

      <p className="folio-sub-anim" style={{
        fontFamily: "'Nunito Sans', sans-serif",
        fontWeight: 600,
        fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
        color: '#F59E0B',
        letterSpacing: '0.05em',
        margin: 0,
        textAlign: 'center'
      }}>
        The Book Should Have Found You So!
      </p>

      <div className="folio-sub-anim" style={{
        width: 'clamp(180px, 40vw, 300px)',
        height: '3px',
        backgroundColor: '#FEF3C7',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginTop: '0.5rem'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(progress, 100)}%`,
          backgroundColor: '#FBBF24',
          borderRadius: '9999px',
          transition: 'width 0.03s linear',
          boxShadow: '0 0 8px rgba(251,191,36,0.6)'
        }} />
      </div>
    </div>
  )
}
