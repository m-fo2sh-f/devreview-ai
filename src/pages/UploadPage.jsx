import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const handleFile = useCallback((f) => {
    setError(null)
    if (f) setFile(f)
  }, [])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setIsDragging(false), [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }, [handleFile])

  const onFileChange = useCallback((e) => {
    handleFile(e.target.files[0])
  }, [handleFile])

  const handleSubmit = useCallback(async () => {
    if (!file) return
    setIsLoading(true)
    setError(null)
    setProgress(0)

    // Simulate smooth progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) { clearInterval(progressInterval); return 90 }
        return prev + Math.random() * 8
      })
    }, 400)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server error: ${res.status}`)
      }

      const data = await res.json()
      setProgress(100)

      // Short delay to show 100%, then navigate
      setTimeout(() => {
        navigate('/result', { state: { analysisData: data, fileName: file.name } })
      }, 400)
    } catch (err) {
      clearInterval(progressInterval)
      setProgress(0)
      setError(err.message || 'Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }, [file, navigate])

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="bg-grid" />

      {/* Header */}
      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--gradient-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color: '#fff',
          }}>D</div>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            DevReview <span style={{ color: 'var(--color-primary)' }}>AI</span>
          </span>
        </div>
        <div style={{
          fontSize: '13px', color: 'var(--color-text-muted)',
          padding: '6px 14px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
        }}>
          Powered by Groq · LLaMA 3
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 20px',
        minHeight: 'calc(100vh - 80px)',
      }}>
        {/* Hero Title */}
        <div className="animate-fadeInUp" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px',
          }}>
            Analyze Your Code
            <br />
            <span style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              with AI Intelligence
            </span>
          </h1>
          <p style={{
            fontSize: '17px', color: 'var(--color-text-muted)',
            maxWidth: '500px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Upload any JavaScript or TypeScript file and get an interactive
            flowchart of your code's architecture, with documentation,
            refactored code, and unit tests.
          </p>
        </div>

        {/* Upload Card */}
        <div className="glass animate-fadeInUp delay-1" style={{
          width: '100%', maxWidth: '560px', padding: '40px',
          boxShadow: 'var(--shadow-glow)',
        }}>
          {/* Dropzone */}
          <div
            id="dropzone"
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border-hover)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              background: isDragging ? 'rgba(108, 92, 231, 0.06)' : 'transparent',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.go,.rs"
              onChange={onFileChange}
              style={{ display: 'none' }}
              id="file-input"
            />

            {/* Upload Icon */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'var(--color-surface-2)', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: file ? 'none' : 'float 3s ease-in-out infinite',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            {file ? (
              <div>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{file.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {formatFileSize(file.size)} — Click or drag to replace
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                  Drop your file here or <span style={{ color: 'var(--color-primary)' }}>browse</span>
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>
                  Supports .js, .jsx, .ts, .tsx, .py, .java, .c, .cpp, .go, .rs
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="animate-fadeIn" style={{
              marginTop: '16px', padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 82, 82, 0.1)',
              border: '1px solid rgba(255, 82, 82, 0.2)',
              color: 'var(--color-error)', fontSize: '14px',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Progress bar */}
          {isLoading && (
            <div className="animate-fadeIn" style={{ marginTop: '20px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: '8px', fontSize: '13px',
              }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Analyzing with AI…</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div style={{
                height: '4px', borderRadius: '2px',
                background: 'var(--color-surface-3)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  background: 'var(--gradient-primary)',
                  width: `${progress}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '12px', fontSize: '12px',
                color: 'var(--color-text-dim)',
              }}>
                <div style={{
                  width: '14px', height: '14px',
                  border: '2px solid var(--color-primary)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Extracting functions and call hierarchy…
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="analyze-button"
            onClick={handleSubmit}
            disabled={!file || isLoading}
            style={{
              width: '100%', marginTop: '24px',
              padding: '14px 24px', borderRadius: 'var(--radius-md)',
              border: 'none', cursor: file && !isLoading ? 'pointer' : 'not-allowed',
              background: file && !isLoading ? 'var(--gradient-primary)' : 'var(--color-surface-3)',
              color: file && !isLoading ? '#fff' : 'var(--color-text-dim)',
              fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.01em',
              transition: 'all var(--transition-base)',
              opacity: file && !isLoading ? 1 : 0.5,
              boxShadow: file && !isLoading ? '0 4px 24px rgba(108, 92, 231, 0.3)' : 'none',
            }}
          >
            {isLoading ? 'Analyzing…' : 'Analyze Code →'}
          </button>
        </div>

        {/* Features */}
        <div className="animate-fadeInUp delay-3" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px', maxWidth: '560px', width: '100%', marginTop: '40px',
        }}>
          {[
            { icon: '🧬', label: 'Function Mapping' },
            { icon: '📝', label: 'Auto Documentation' },
            { icon: '🧪', label: 'Jest Test Generation' },
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '16px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.02)',
              fontSize: '13px', color: 'var(--color-text-muted)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
              {item.label}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
