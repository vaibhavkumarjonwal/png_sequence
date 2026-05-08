import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const TOTAL_FRAMES = 240
const FPS = 24
const DURATION_SECONDS = TOTAL_FRAMES / FPS

function App() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLooping, setIsLooping] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)

  const frameUrls = useMemo(() => {
    return Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const frameNumber = String(i + 1).padStart(4, '0')
      return `/sequence/tmp${frameNumber}.png`
    })
  }, [])

  const preloadRadius = 15
  const loadedFramesRef = useRef(new Set())
  
  useEffect(() => {
    const startIdx = Math.max(0, frameIndex - preloadRadius)
    const endIdx = Math.min(TOTAL_FRAMES - 1, frameIndex + preloadRadius)
    
    for (let i = startIdx; i <= endIdx; i++) {
      if (!loadedFramesRef.current.has(i)) {
        loadedFramesRef.current.add(i)
        const img = new Image()
        img.src = frameUrls[i]
      }
    }
    
    setLoadedCount(loadedFramesRef.current.size)
  }, [frameIndex, frameUrls])

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const frameDurationMs = 1000 / FPS
    const intervalId = window.setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= TOTAL_FRAMES - 1) {
          if (isLooping) {
            return 0
          }

          setIsPlaying(false)
          return prev
        }

        return prev + 1
      })
    }, frameDurationMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isPlaying, isLooping])

  const progress = ((frameIndex + 1) / TOTAL_FRAMES) * 100
  const loadedPercent = Math.round((loadedCount / TOTAL_FRAMES) * 100)

  const handleTogglePlay = () => {
    if (!isPlaying && frameIndex === TOTAL_FRAMES - 1) {
      setFrameIndex(0)
    }
    setIsPlaying((prev) => !prev)
  }

  return (
    <main className="page">
      <section className="player-card">
        <header className="title-row">
          <h1>PNG Sequence Player</h1>
          <span className="tag">24 FPS</span>
        </header>

        <div className="frame-stage">
          <img
            className="frame-image"
            src={frameUrls[frameIndex]}
            alt={`Frame ${frameIndex + 1}`}
            draggable={false}
          />
        </div>

        <div className="stats">
          <p>
            Frame <strong>{frameIndex + 1}</strong> / {TOTAL_FRAMES}
          </p>
          <p>
            Time <strong>{((frameIndex + 1) / FPS).toFixed(2)}s</strong> / {DURATION_SECONDS.toFixed(2)}s
          </p>
          <p>
            Loaded <strong>{loadedCount}</strong> / {TOTAL_FRAMES} ({loadedPercent}%)
          </p>
        </div>

        <div className="controls">
          <button type="button" onClick={handleTogglePlay}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFrameIndex(0)
              setIsPlaying(false)
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className={isLooping ? 'active' : ''}
            onClick={() => setIsLooping((prev) => !prev)}
          >
            Loop: {isLooping ? 'On' : 'Off'}
          </button>
        </div>

        <div className="scrub-wrap">
          <input
            type="range"
            min="0"
            max={TOTAL_FRAMES - 1}
            value={frameIndex}
            onChange={(event) => {
              setFrameIndex(Number(event.target.value))
            }}
          />
          <div className="progress" style={{ '--progress': `${progress}%` }} aria-hidden="true" />
        </div>
      </section>
    </main>
  )
}

export default App
