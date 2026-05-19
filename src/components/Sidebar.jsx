import { useEffect, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function Sidebar({ isOpen, nodeData, onClose }) {
  const sidebarRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!nodeData && !isOpen) return null

  const details = nodeData?.details || {}
  // Section component
  const Section = ({ title, icon, children }) => (
    <div style={{ marginBottom: '28px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '12px',
      }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <h3 style={{
          fontSize: '13px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--color-text-muted)',
        }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )

  const codeBlockStyle = {
    borderRadius: 'var(--radius-sm)',
    fontSize: '12.5px',
    lineHeight: 1.6,
    margin: 0,
    border: '1px solid var(--color-border)',
    overflowX: 'hidden',
    wordBreak: 'break-word',
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      {/* Panel */}
      <div
        ref={sidebarRef}
        id="detail-sidebar"
        className={isOpen ? 'animate-slideIn' : 'animate-slideOut'}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '480px', maxWidth: '90vw',
          zIndex: 40,
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-elevated)',
          display: 'flex', flexDirection: 'column',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(108, 92, 231, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)',
              color: 'var(--color-primary)',
            }}>
              ƒ
            </div>
            <div>
              <h2 style={{
                fontSize: '16px', fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text)',
              }}>
                {nodeData?.label || 'Function'}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                Function Details
              </p>
            </div>
          </div>

          <button
            id="close-sidebar"
            onClick={onClose}
            style={{
              width: '32px', height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,82,82,0.15)'
              e.currentTarget.style.borderColor = 'var(--color-error)'
              e.currentTarget.style.color = 'var(--color-error)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-2)'
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px',
        }}>
          {/* Documentation */}
          <Section title="Functional Documentation" icon="📖">
            <div style={{
              padding: '16px', borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              fontSize: '14px', lineHeight: 1.75,
              color: 'var(--color-text)',
            }}>
              {details.docs || 'No documentation available.'}
            </div>
          </Section>

          {/* Refactored Code */}
          <Section title="Refactored Code" icon="✨">
            <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={codeBlockStyle}
              showLineNumbers
              wrapLongLines
            >
              {details.refactoredCode || '// No refactored code available.'}
            </SyntaxHighlighter>
          </Section>

          {/* Jest Tests */}
          <Section title="Jest Unit Tests" icon="🧪">
            <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={codeBlockStyle}
              showLineNumbers
              wrapLongLines
            >
              {details.jestTest || '// No tests available.'}
            </SyntaxHighlighter>
          </Section>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '11px', color: 'var(--color-text-dim)',
          textAlign: 'center', flexShrink: 0,
        }}>
          Generated by DevReview AI · Groq LLaMA 3
        </div>
      </div>
    </>
  )
}
