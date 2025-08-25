import React, { useState, useEffect, useCallback } from "react";
import FsLightbox from "fslightbox-react";

// --- Глобальный кэш ---
const imageCache = {}; // { src: { width, height, ratio, orientation } }

function exitFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
}

export default function GalleryApp({ photos, direction = "row", batchSize = 20 }) {
  const [toggler, setToggler] = useState(false);
  const [slide, setSlide] = useState(1);
  const [photoData, setPhotoData] = useState([]);
  const [visiblePhotos, setVisiblePhotos] = useState([]);
  const [rowGroups, setRowGroups] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  const MAX_CONTAINER_WIDTH = 1320;
  const ROW_GAP = 10;

  const handleClose = () => setTimeout(exitFullscreen, 100);

  // ---------------- Preload images с кэшем ----------------
  const preloadImages = useCallback(() => {
    if (!photos || !photos.length) return;
    let loaded = 0;
    const data = [];

    photos.forEach((p, idx) => {
      if (!p.src) { loaded++; return; }

      if (imageCache[p.src]) {
        data[idx] = { ...p, ...imageCache[p.src] };
        loaded++;
        if (loaded === photos.length) setPhotoData(data.filter(Boolean));
        return;
      }

      const img = new Image();
      img.src = p.src;
      img.onload = () => {
        const info = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          ratio: img.naturalWidth / img.naturalHeight,
          orientation: img.naturalWidth > img.naturalHeight ? "landscape" : "portrait",
        };
        imageCache[p.src] = info;
        data[idx] = { ...p, ...info };
        loaded++;
        if (loaded === photos.length) setPhotoData(data.filter(Boolean));
      };
      img.onerror = () => {
        loaded++;
        if (loaded === photos.length) setPhotoData(data.filter(Boolean));
      };
    });
  }, [photos]);

  useEffect(() => { preloadImages(); }, [preloadImages]);

  // ---------------- Batch loading ----------------
  useEffect(() => {
    if (!photoData.length) return;
    setVisiblePhotos(photoData.slice(0, batchSize));
  }, [photoData, batchSize]);

  const loadMore = () => {
    setVisiblePhotos(prev => photoData.slice(0, prev.length + batchSize));
  };

  // ------------------ ROW ------------------
  const getLayoutParams = useCallback(() => ({
    rowHeight: 250,
    portraitRowHeight: 215,
    containerWidth: Math.min(windowWidth, MAX_CONTAINER_WIDTH) - 80
  }), [windowWidth]);

  const groupPhotosSmart = useCallback((photosToGroup) => {
    if (!photosToGroup.length || direction !== "row") return [];

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

    // Перераспределяем одиночные фото
    const balancedRows = [];
    let buffer = [];
    rows.forEach(row => {
      row.photos.forEach(p => buffer.push(p));
      while (buffer.length >= 2) {
        const maxPerRow = row.photos.some(p => p.orientation === "portrait") ? 4 : 3;
        balancedRows.push({ photos: buffer.splice(0, Math.min(buffer.length, maxPerRow)) });
      }
    });
    if (buffer.length) {
      if (balancedRows.length) balancedRows[balancedRows.length - 1].photos.push(...buffer);
      else balancedRows.push({ photos: buffer });
    }

    return balancedRows;
  }, [direction, getLayoutParams]);

  useEffect(() => {
    if (visiblePhotos.length && direction === "row") setRowGroups(groupPhotosSmart(visiblePhotos));
  }, [visiblePhotos, groupPhotosSmart, direction]);

  // ------------------ COLUMN (Pinterest style) ------------------
  const getColumnCount = useCallback(() => {
    if (windowWidth < 768) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  }, [windowWidth]);

  const columnCount = direction === "column" ? getColumnCount() : 0;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const calculateLightboxIndex = useCallback(
    (rowIndex, photoIndex) =>
      rowGroups.slice(0, rowIndex).reduce((sum, row) => sum + row.photos.length, 0) + photoIndex + 1,
    [rowGroups]
  );

  const { rowHeight, portraitRowHeight, containerWidth } = getLayoutParams();

  const galleryStyle = direction === "row"
    ? { display: "flex", flexDirection: "column", gap: `${ROW_GAP}px`, width: "100%", maxWidth: `${MAX_CONTAINER_WIDTH}px`, margin: "0 auto" }
    : { columnCount: columnCount, columnGap: `${ROW_GAP}px`, width: "100%" };

  return (
    <>
      <div className="gallery" style={galleryStyle}>
        {direction === "row"
          ? rowGroups.map((row, rowIndex) => {
              const currentRowHeight = row.hasPortrait ? portraitRowHeight : rowHeight;
              const totalRowWidth = row.photos.reduce((sum, p) => sum + p.ratio * currentRowHeight, 0);
              const availableWidth = containerWidth - (row.photos.length - 1) * ROW_GAP;
              const scaleFactor = Math.min(availableWidth / totalRowWidth, 1);

              return (
                <div key={rowIndex} style={{ display: "flex", flexWrap: "nowrap", gap: `${ROW_GAP}px`, justifyContent: "center", width: "100%" }}>
                  {row.photos.map((photo, i) => {
                    const width = photo.ratio * currentRowHeight * scaleFactor;
                    const height = currentRowHeight * scaleFactor;
                    return (
                      <div key={i} style={{ width: `${width}px`, height: `${height}px`, borderRadius: "8px", overflow: "hidden", cursor: "pointer", backgroundColor: "#000", flexShrink: 0, flexGrow: 0 }}
                        onClick={() => { setSlide(calculateLightboxIndex(rowIndex, i)); setToggler(t => !t); }}
                      >
                        <img src={photo.thumbnail || photo.src} alt={photo.alt || ""} style={{ width: "100%", height: "100%", objectFit: "contain" }} loading="lazy" />
                      </div>
                    );
                  })}
                </div>
              );
            })
          : visiblePhotos.map((photo, i) => (
              <div key={i} style={{ breakInside: "avoid", marginBottom: `${ROW_GAP}px`, borderRadius: "8px", overflow: "hidden", cursor: "pointer" }}
                onClick={() => { setSlide(i + 1); setToggler(t => !t); }}
              >
                <img src={photo.thumbnail || photo.src} alt={photo.alt || ""} style={{ width: "100%", height: "auto", objectFit: "contain" }} loading="lazy" />
              </div>
            ))}
      </div>

      {visiblePhotos.length < photoData.length &&
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <button onClick={loadMore} style={{ padding: "8px 16px", cursor: "pointer" }}>Загрузить ещё</button>
        </div>
      }

      {photos.length > 0 && <FsLightbox toggler={toggler} sources={photos.map(p => p.src)} slide={slide} onClose={handleClose} />}
    </>
  );
}
