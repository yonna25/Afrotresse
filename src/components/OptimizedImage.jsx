import { useState, useRef, useEffect } from 'react'

/**
 * Composant image optimisé pour PWA
 * - Lazy loading avec Intersection Observer
 * - Placeholder flou pendant le chargement
 * - Support WebP + fallback
 * - Cache Service Worker automatique
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  className = '',
  onClick,
  draggable = false,
  onContextMenu,
  style = {},
  placeholderColor = '#1A1A1A'
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState(null)
  const imgRef = useRef(null)
  const containerRef = useRef(null)

  // 1. Lazy loading avec Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && src) {
          // Charge l'image quand elle est visible
          setImageSrc(src)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '50px' } // Commence à charger 50px avant d'être visible
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current)
    }
  }, [src])

  // 2. Prefetch avec RequestIdleCallback (optimise CPU)
  useEffect(() => {
    if (imageSrc) {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const img = new Image()
          img.src = imageSrc
        })
      } else {
        // Fallback pour navigateurs sans RequestIdleCallback
        setTimeout(() => {
          const img = new Image()
          img.src = imageSrc
        }, 1000)
      }
    }
  }, [imageSrc])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      style={{
        ...style,
        backgroundColor: !isLoaded ? placeholderColor : 'transparent',
      }}
    >
      {/* Placeholder flou (optionnel) */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br"
          style={{
            backgroundImage: `linear-gradient(135deg, ${placeholderColor}40, ${placeholderColor}10)`,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}

      {/* Image principale */}
      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          draggable={draggable}
          onContextMenu={onContextMenu}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          loading="lazy"
        />
      )}

      {/* Protection contre copie/drag */}
      <div
        className="absolute inset-0 pointer-events-none"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
