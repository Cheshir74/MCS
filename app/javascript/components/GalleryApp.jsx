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
  const [galleryWidth, setGalleryWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200); // фактическая ширина DOM-контейнера
  const [visibleSet, setVisibleSet] = useState(new Set()); // fade-in [web:41]

  // Окружение/refs
  const isSafari = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent); // [web:41]
  const sessionSeedRef = useRef(Math.floor(Date.now() / 30000)); // единый bust ~30с для полноразмерных [web:41]
  const galleryRef = useRef(null);

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
      if (!p || (!p.src && !p.src_webp)) { loaded++; if (loaded === photos.length) setPhotoData(data.filter(Boolean)); return; } // [web:41]

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
        const baseKey = p.src || p.src_webp;
        if (baseKey) imageCache[baseKey] = infoFromProps;
        data[idx] = wrapWithIndex(infoFromProps);
        loaded++;
        if (loaded === photos.length) setPhotoData(data.filter(Boolean));
        return;
      }

      // есть кэш — используем сразу
      const cacheKey = p.src || p.src_webp;
      if (cacheKey && imageCache[cacheKey]) {
        data[idx] = wrapWithIndex(imageCache[cacheKey]);
        loaded++;
        if (loaded === photos.length) setPhotoData(data.filter(Boolean));
        return;
      }

      // грузим «легкий» источник (thumbnail), чтобы не трогать полноразмерный файл
      const previewSrc = p.thumbnail_webp || p.thumbnail || p.src_webp || p.src;
      const img = new Image();
      try { if (isCrossOrigin(previewSrc)) img.crossOrigin = "anonymous"; } catch {}
      img.onload = () => {
        const info = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          ratio: img.naturalWidth / img.naturalHeight,
          orientation: img.naturalWidth > img.naturalHeight ? "landscape" : "portrait"
        }; // [web:41]
        const baseKey = p.src || p.src_webp || previewSrc;
        imageCache[baseKey] = info;
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
    const buildRow = rowPhotos => ({
      photos: rowPhotos,
      hasPortrait: rowPhotos.some(item => item.orientation === "portrait")
    });

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

    const lastRow = rows[rows.length - 1];
    const previousRow = rows[rows.length - 2];

    if (!lastRow || !previousRow || lastRow.photos.length !== 1) return rows;

    // Rebalance the trailing widow so the legacy homepage does not end with
    // one oversized photo stretched across the full row.
    const combinedTail = [...previousRow.photos, ...lastRow.photos];
    if (combinedTail.length <= 3) {
      return [...rows.slice(0, -2), buildRow(combinedTail)];
    }

    const splitIndex = Math.ceil(combinedTail.length / 2);
    return [
      ...rows.slice(0, -2),
      buildRow(combinedTail.slice(0, splitIndex)),
      buildRow(combinedTail.slice(splitIndex))
    ];
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

  useEffect(() => {
    const node = galleryRef.current;
    if (!node) return;

    const updateGalleryWidth = () => {
      const nextWidth = node.getBoundingClientRect().width;
      if (nextWidth > 0) {
        setGalleryWidth(currentWidth => Math.abs(currentWidth - nextWidth) < 1 ? currentWidth : nextWidth);
      }
    };

    updateGalleryWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateGalleryWidth);
      return () => window.removeEventListener("resize", updateGalleryWidth);
    }

    const observer = new ResizeObserver(updateGalleryWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [direction]); // [web:41]

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
    return (photos || []).map(p => {
      const source = p?.src_webp || p?.src;
      return addBustOnce(source || "", seed);
    }); // [web:41]
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
  const columnContainerWidth = galleryWidth || windowWidth;
  const columnWidth = columnCount > 0
    ? Math.max(1, (columnContainerWidth - (columnCount - 1) * ROW_GAP) / columnCount)
    : 0;
  const landscapeHeights = visiblePhotos
    .filter(photo => photo?.orientation === "landscape" && Number.isFinite(photo.ratio) && photo.ratio > 0)
    .map(photo => columnWidth / photo.ratio)
    .sort((first, second) => first - second);
  const middleLandscapeIndex = Math.floor(landscapeHeights.length / 2);
  const medianLandscapeHeight = landscapeHeights.length
    ? (landscapeHeights.length % 2 === 0
        ? (landscapeHeights[middleLandscapeIndex - 1] + landscapeHeights[middleLandscapeIndex]) / 2
        : landscapeHeights[middleLandscapeIndex])
    : columnWidth / 1.5;
  const portraitColumnMaxHeight = columnCount > 1 && medianLandscapeHeight > 0
    ? Math.round(medianLandscapeHeight * 2 + ROW_GAP)
    : null;
  const galleryStyle = direction === "row"
    ? { display: "flex", flexDirection: "column", gap: `${ROW_GAP}px`, width: "100%", maxWidth: `${MAX_CONTAINER_WIDTH}px`, margin: "0 auto" }
    : { columnCount, columnGap: `${ROW_GAP}px`, width: "100%" }; // [web:41]

  return (
    <>
      <div className="gallery" ref={galleryRef} style={galleryStyle}>
        {direction === "row"
          ? rowGroups.map((row, rowIndex) => {
              const currentRowHeight = row.hasPortrait ? portraitRowHeight : rowHeight;
              const totalWidthOriginal = (row.photos || []).reduce((sum, p) => sum + (p.ratio || 1) * currentRowHeight, 0) || 1;
              const availableWidth = Math.max(1, containerWidth - ((row.photos?.length || 0) - 1) * ROW_GAP);
              const rawScaleFactor = isFinite(availableWidth / totalWidthOriginal) ? availableWidth / totalWidthOriginal : 1;
              const isSinglePhotoRow = (row.photos?.length || 0) === 1;
              const scaleFactor = isSinglePhotoRow ? Math.min(rawScaleFactor, 1.28) : rawScaleFactor;

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
                        key={photo.src || photo.src_webp || `${rowIndex}-${i}`}
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
                          src={photo.thumbnail_webp || photo.thumbnail || photo.src_webp || photo.src}
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
          : visiblePhotos.map((photo, i) => {
              const photoIndex = typeof photo?.originalIndex === "number" ? photo.originalIndex : i;
              const isPortrait = photo?.orientation === "portrait";
              const shouldCropPortrait = Boolean(isPortrait && portraitColumnMaxHeight);

              return (
                <div
                  key={i}
                  style={{
                    breakInside: "avoid",
                    marginBottom: `${ROW_GAP}px`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    cursor: "pointer",
                    height: shouldCropPortrait ? `${portraitColumnMaxHeight}px` : undefined,
                    backgroundColor: shouldCropPortrait ? "#000" : undefined,
                    opacity: visibleSet.has(photoIndex) ? 1 : 0,
                    transition: "opacity 0.5s ease"
                  }}
                  onClick={() => { void openWithSlide(i + 1); }}
                >
                  <img
                    src={photo.thumbnail_webp || photo.thumbnail || photo.src_webp || photo.src}
                    alt={photo.alt || ""}
                    style={{
                      display: "block",
                      width: "100%",
                      height: shouldCropPortrait ? "100%" : "auto",
                      objectFit: shouldCropPortrait ? "cover" : "contain",
                      objectPosition: "center",
                      opacity: visibleSet.has(photoIndex) ? 1 : 0,
                      transition: "opacity 0.5s ease"
                    }}
                    loading="lazy"
                  />
                </div>
              );
            })}
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
