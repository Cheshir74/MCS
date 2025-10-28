import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import FsLightbox from "fslightbox-react";

// --- Глобальный кэш метаданных ---
const imageCache = {}; // { src: { width, height, ratio, orientation } } [web:41]

// Утилита выхода из fullscreen
function exitFullscreenSafe() {
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}
}

function isCrossOrigin(url) {
  if (typeof window === "undefined" || !url) return false; // [web:41]
  try {
    const u = new URL(url, window.location.href);
    return u.origin !== window.location.origin; // [web:41]
  } catch {
    return false; // [web:41]
  }
}

// Единый «сессионный» cache-busting для полноразмерных URL
function addBustOnce(url, seed) {
  if (!url) return url; // [web:41]
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_ts=${seed}`; // [web:41]
}

export default function GalleryApp({ photos, direction = "row", batchSize = 20 }) {
  // Lightbox управление: toggler + slide (1-based), как в рабочем примере
  const [toggler, setToggler] = useState(false); // [web:26]
  const [slide, setSlide] = useState(1);         // 1-based индекс слайда [web:26]

  // Состояние сетки
  const [photoData, setPhotoData] = useState([]);       // массив с ratio/orientation [web:41]
  const [visiblePhotos, setVisiblePhotos] = useState([]); // порции для бесконечной прокрутки [web:41]
  const [rowGroups, setRowGroups] = useState([]);       // сгруппированные ряды для row режима [web:41]
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200); // [web:41]
  const [visibleSet, setVisibleSet] = useState(new Set()); // fade-in [web:41]

  // Окружение/refs
  const isSafari = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent); // [web:41]
  const sessionSeedRef = useRef(Math.floor(Date.now() / 30000)); // единый bust ~30с для полноразмерных [web:41]

  const MAX_CONTAINER_WIDTH = 1320; // [web:41]
  const ROW_GAP = 10;               // [web:41]

  const handleClose = useCallback(() => {
    // Явное закрытие без инверсий и выход из fullscreen
    setTimeout(exitFullscreenSafe, 80); // дать анимации завершиться [web:41]
  }, []); // [web:26][web:41]

  // ---------- Preload размеров превью (без bust на превью) ----------
  const preloadImages = useCallback(() => {
    if (!photos || !photos.length) return; // [web:41]
    const data = [];
    let loaded = 0;

    photos.forEach((p, idx) => {
      if (!p || !p.src) { loaded++; if (loaded === photos.length) setPhotoData(data.filter(Boolean)); return; } // [web:41]

      const makeInfoFromDimensions = dims => {
        const { width, height } = dims;
        if (!width || !height) return null;
        return {
          width,
          height,
          ratio: width / height,
          orientation: width > height ? "landscape" : "portrait"
        };
      };

      const wrapWithIndex = info => ({ ...p, ...info, originalIndex: idx });

      const infoFromProps = makeInfoFromDimensions({ width: p.width, height: p.height });
      if (infoFromProps) {
        imageCache[p.src] = infoFromProps;
        data[idx] = wrapWithIndex(infoFromProps);
        loaded++;
        if (loaded === photos.length) setPhotoData(data.filter(Boolean));
        return;
      }

      // есть кэш — используем сразу
      if (imageCache[p.src]) {
        data[idx] = wrapWithIndex(imageCache[p.src]);
        loaded++;
        if (loaded === photos.length) setPhotoData(data.filter(Boolean));
        return;
      }

      // грузим «легкий» источник (thumbnail), чтобы не трогать полноразмерный файл
      const previewSrc = p.thumbnail || p.src;
      const img = new Image();
      try { if (isCrossOrigin(previewSrc)) img.crossOrigin = "anonymous"; } catch {}
      img.onload = () => {
        const info = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          ratio: img.naturalWidth / img.naturalHeight,
          orientation: img.naturalWidth > img.naturalHeight ? "landscape" : "portrait"
        }; // [web:41]
        imageCache[p.src] = info;
        data[idx] = wrapWithIndex(info);
        loaded++;
        if (loaded === photos.length) setPhotoData(data.filter(Boolean));
      };
      img.onerror = () => {
        loaded++;
        if (loaded === photos.length) setPhotoData(data.filter(Boolean));
      };
      img.src = previewSrc; // Safari требует назначать обработчики до src, иначе onload может потеряться из-за sync cache hit
    });
  }, [photos]); // [web:41]

  useEffect(() => { preloadImages(); }, [preloadImages]); // [web:41]

  // ---------- Порционная загрузка + бесконечная прокрутка ----------
  useEffect(() => {
    if (!photoData.length) return; // [web:41]
    setVisiblePhotos(photoData.slice(0, batchSize)); // [web:41]
  }, [photoData, batchSize]); // [web:41]

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 300;
      if (scrollPosition >= threshold && visiblePhotos.length < photoData.length) {
        setVisiblePhotos(prev => photoData.slice(0, Math.min(prev.length + batchSize, photoData.length)));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visiblePhotos.length, photoData, batchSize]); // [web:41]

  // ---------- ROW layout helpers ----------
  const getLayoutParams = useCallback(() => ({
    rowHeight: 250,
    portraitRowHeight: 215,
    containerWidth: Math.min(windowWidth, MAX_CONTAINER_WIDTH) - 80
  }), [windowWidth]); // [web:41]

  const groupPhotosSmart = useCallback((photosToGroup) => {
    if (!photosToGroup.length || direction !== "row") return []; // [web:41]
    const { containerWidth, rowHeight, portraitRowHeight } = getLayoutParams();
    const rows = [];
    let currentRow = [];
    let rowHasPortrait = false;

    photosToGroup.forEach(photo => {
      currentRow.push(photo);
      if (photo.orientation === "portrait") rowHasPortrait = true;
      const currentRowHeight = rowHasPortrait ? portraitRowHeight : rowHeight;
      const maxPerRow = rowHasPortrait ? 4 : 3;
      const totalWidth = currentRow.reduce((sum, p) => sum + p.ratio * currentRowHeight, 0) + (currentRow.length - 1) * ROW_GAP;
      if (currentRow.length > maxPerRow || totalWidth > containerWidth) {
        if (currentRow.length > 1) {
          const last = currentRow.pop();
          rows.push({ photos: [...currentRow], hasPortrait: rowHasPortrait });
          currentRow = [last];
          rowHasPortrait = last.orientation === "portrait";
        }
      }
    });

    if (currentRow.length) rows.push({ photos: currentRow, hasPortrait: rowHasPortrait });

    // ВАЖНО: без «перераспределения одиночных» во имя стабильности глобальных индексов
    return rows; // индексы остаются монотонными и соответствуют photos.map((p)=>p.src) [web:41]
  }, [direction, getLayoutParams]); // [web:41]

  useEffect(() => {
    if (visiblePhotos.length && direction === "row") setRowGroups(groupPhotosSmart(visiblePhotos)); // [web:41]
  }, [visiblePhotos, groupPhotosSmart, direction]); // [web:41]

  // ---------- COLUMN (masonry) ----------
  const getColumnCount = useCallback(() => {
    if (windowWidth < 768) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  }, [windowWidth]); // [web:41]
  const columnCount = direction === "column" ? getColumnCount() : 0; // [web:41]

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // [web:41]

  // ---------- Fade-in ----------
  useEffect(() => {
    visiblePhotos.forEach((photo, i) => {
      const photoIndex = typeof photo?.originalIndex === "number" ? photo.originalIndex : i;
      setTimeout(() => {
        setVisibleSet(prev => {
          const next = new Set(prev);
          next.add(photoIndex);
          return next;
        });
      }, i * 50);
    });
  }, [visiblePhotos]); // [web:41]

  // ---------- Подготовка полноразмерных sources (с единым сессионным bust) ----------
  const fullSources = useMemo(() => {
    const seed = sessionSeedRef.current;
    return (photos || []).map(p => addBustOnce(p?.src || "", seed)); // [web:41]
  }, [photos]); // [web:41]

  // Вычисление глобального 1-based индекса для FsLightbox (row режим)
  const calcGlobalSlideRow = useCallback(
    (rowIndex, photoIndex) =>
      rowGroups.slice(0, rowIndex).reduce((sum, row) => sum + (row.photos?.length || 0), 0) + photoIndex + 1,
    [rowGroups]
  ); // [web:26]

  // ---------- Открытие по клику: выставить slide → дождаться кадра → инвертировать toggler ----------
  const openWithSlide = useCallback(async (nextSlide) => {
    // clamp в диапазоне 1..N
    const n = fullSources.length || 1;
    const safe = Math.min(Math.max(nextSlide, 1), n);
    setSlide(safe); // сначала слайд [web:26]
    // дождаться применения пропов родителя до инициализации модалки
    await new Promise(r => requestAnimationFrame(r)); // [web:41]
    setToggler(t => !t); // затем запуск [web:26]
  }, [fullSources.length]); // [web:26][web:41]

  // ---------- Рендер ----------
  const { rowHeight, portraitRowHeight, containerWidth } = getLayoutParams();
  const galleryStyle = direction === "row"
    ? { display: "flex", flexDirection: "column", gap: `${ROW_GAP}px`, width: "100%", maxWidth: `${MAX_CONTAINER_WIDTH}px`, margin: "0 auto" }
    : { columnCount, columnGap: `${ROW_GAP}px`, width: "100%" }; // [web:41]

  return (
    <>
      <div className="gallery" style={galleryStyle}>
        {direction === "row"
          ? rowGroups.map((row, rowIndex) => {
              const currentRowHeight = row.hasPortrait ? portraitRowHeight : rowHeight;
              const totalWidthOriginal = (row.photos || []).reduce((sum, p) => sum + (p.ratio || 1) * currentRowHeight, 0) || 1;
              const availableWidth = Math.max(1, containerWidth - ((row.photos?.length || 0) - 1) * ROW_GAP);
              const scaleFactor = isFinite(availableWidth / totalWidthOriginal) ? availableWidth / totalWidthOriginal : 1;

              return (
                <div
                  key={rowIndex}
                  style={{ display: "flex", flexWrap: "nowrap", gap: `${ROW_GAP}px`, justifyContent: "center", width: "100%" }}
                >
                  {(row.photos || []).map((photo, i) => {
                    const photoIndex = typeof photo?.originalIndex === "number" ? photo.originalIndex : i;
                    const width = (photo.ratio || 1) * currentRowHeight * scaleFactor;
                    const height = currentRowHeight * scaleFactor;
                    return (
                      <div
                        key={photo.src || `${rowIndex}-${i}`}
                        style={{
                          width: `${Number.isFinite(width) ? width : currentRowHeight}px`,
                          height: `${Number.isFinite(height) ? height : currentRowHeight}px`,
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                          backgroundColor: "#000",
                          flexShrink: 0,
                          flexGrow: 0,
                          transition: "width 0.3s ease, height 0.3s ease, opacity 0.5s ease",
                          opacity: visibleSet.has(photoIndex) ? 1 : 0
                        }}
                        onClick={() => {
                          const globalSlide = calcGlobalSlideRow(rowIndex, i);
                          void openWithSlide(globalSlide);
                        }}
                      >
                        <img
                          src={photo.thumbnail || photo.src}
                          alt={photo.alt || ""}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transition: "width 0.3s ease, height 0.3s ease, opacity 0.5s ease",
                            opacity: visibleSet.has(photoIndex) ? 1 : 0
                          }}
                          loading="lazy"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })
          : visiblePhotos.map((photo, i) => (
              <div
                key={i}
                style={{
                  breakInside: "avoid",
                  marginBottom: `${ROW_GAP}px`,
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "pointer",
                  opacity: visibleSet.has(typeof photo?.originalIndex === "number" ? photo.originalIndex : i) ? 1 : 0,
                  transition: "opacity 0.5s ease"
                }}
                onClick={() => { void openWithSlide(i + 1); }}
              >
                <img
                  src={photo.thumbnail || photo.src}
                  alt={photo.alt || ""}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    opacity: visibleSet.has(typeof photo?.originalIndex === "number" ? photo.originalIndex : i) ? 1 : 0,
                    transition: "opacity 0.5s ease"
                  }}
                  loading="lazy"
                />
              </div>
            ))}
      </div>

      {Array.isArray(photos) && photos.length > 0 && (
        <FsLightbox
          // Источники — стабильный порядок исходного списка, но с единым сессионным bust для Safari‑кэша
          sources={fullSources} // [web:41]
          type="image"          // фикс типа стабилизирует инициализацию [web:26]
          toggler={toggler}     // запуск по инверсии [web:26]
          slide={slide}         // 1-based индекс, предварительно установлен по клику [web:26]
          onClose={handleClose} // обычное закрытие без инверсий [web:26]
        />
      )}
    </>
  );
}
