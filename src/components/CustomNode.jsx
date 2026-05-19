import { Handle, Position } from '@xyflow/react'
import { memo } from 'react'

function CustomNode({ data, selected }) {
  return (
    <div
      style={{
        width: '220px',
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        background: selected
          ? 'linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(0, 210, 255, 0.08) 100%)'
          : 'var(--color-surface-2)',
        border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: selected ? '0 0 24px rgba(108, 92, 231, 0.25)' : 'var(--shadow-card)',
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)'
        e.currentTarget.style.boxShadow = '0 0 24px rgba(108, 92, 231, 0.2)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        }
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: '8px', height: '8px',
          background: 'var(--color-primary)',
          border: '2px solid var(--color-surface)',
        }}
      />

      {/* Function icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'rgba(108, 92, 231, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '13px' }}>ƒ</span>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontSize: '13px', fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text)',
            whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {data.label}
          </div>
          <div style={{
            fontSize: '11px', color: 'var(--color-text-dim)',
            marginTop: '2px',
          }}>
            function
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: '8px', height: '8px',
          background: 'var(--color-accent)',
          border: '2px solid var(--color-surface)',
        }}
      />
    </div>
  )
}

export default memo(CustomNode)
