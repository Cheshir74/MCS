import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import FsLightbox from 'fslightbox-react';

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

export default function GalleryApp({ photos, direction = 'column' }) {
  const [toggler, setToggler] = useState(false);
  const [slide, setSlide] = useState(1);
  const [photoData, setPhotoData] = useState([]);
  const [columns, setColumns] = useState(3);
  const [rowGroups, setRowGroups] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const hasPhotos = Array.isArray(photos) && photos.length > 0;
  const handleClose = () => setTimeout(exitFullscreen, 100);
  const MAX_CONTAINER_WIDTH = 1320;
  const ROW_GAP = 10;
  const MOBILE_BREAKPOINT = 768;
  const TABLET_BREAKPOINT = 1024;
  const DESKTOP_BREAKPOINT = 1200;

  // Параметры для разных устройств
  const getLayoutParams = useCallback(() => {
    if (windowWidth < MOBILE_BREAKPOINT) {
      return {
        maxPhotosPerRow: 2,
        rowHeight: 180,
        portraitRowHeight: 150,
        containerWidth: windowWidth - 40,
      };
    } else if (windowWidth < TABLET_BREAKPOINT) {
      return {
        maxPhotosPerRow: 3,
        rowHeight: 200,
        portraitRowHeight: 170,
        containerWidth: windowWidth - 80,
      };
    } else if (windowWidth < DESKTOP_BREAKPOINT) {
      return {
        maxPhotosPerRow: 3,
        rowHeight: 220,
        portraitRowHeight: 190,
        containerWidth: windowWidth - 80,
      };
    } else {
      return {
        maxPhotosPerRow: 3,
        rowHeight: 250,
        portraitRowHeight: 215,
        containerWidth: Math.min(windowWidth, MAX_CONTAINER_WIDTH) - 80,
      };
    }
  }, [windowWidth]);

  const getColumnsForWidth = useCallback(
    (width) => {
      if (direction === 'row') return 3;
      if (width < MOBILE_BREAKPOINT) return 1;
      if (width < TABLET_BREAKPOINT) return 2;
      return 3;
    },
    [direction]
  );

  const groupPhotosIntoRows = useCallback(
    (photos) => {
      if (direction !== 'row') return [];

      const { maxPhotosPerRow } = getLayoutParams();
      const rows = [];
      let currentRow = [];
      let rowHasPortrait = false;

      photos.forEach((photo) => {
        const shouldCloseRow =
          (!rowHasPortrait && currentRow.length >= maxPhotosPerRow) ||
          (rowHasPortrait && currentRow.length >= maxPhotosPerRow + 1);

        if (shouldCloseRow) {
          rows.push({ photos: currentRow, hasPortrait: rowHasPortrait });
          currentRow = [];
          rowHasPortrait = false;
        }

        currentRow.push(photo);
        if (photo.orientation === 'portrait') rowHasPortrait = true;
      });

      if (currentRow.length > 0) {
        rows.push({ photos: currentRow, hasPortrait: rowHasPortrait });
      }

      return rows;
    },
    [direction, getLayoutParams]
  );

  const preloadImages = useCallback(() => {
    if (!hasPhotos) return;

    let loaded = 0;
    const data = [];

    photos.forEach((p, idx) => {
      if (!p.src) {
        loaded++;
        return;
      }

      const img = new Image();
      img.src = p.src;
      img.onload = () => {
        data[idx] = {
          ...p,
          width: img.naturalWidth,
          height: img.naturalHeight,
          ratio: img.naturalWidth / img.naturalHeight,
          orientation: img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait',
        };
        loaded++;
        if (loaded === photos.length) {
          setPhotoData(data.filter(Boolean));
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === photos.length) {
          setPhotoData(data.filter(Boolean));
        }
      };
    });
  }, [photos, hasPhotos]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  useEffect(() => {
    if (photoData.length > 0) {
      setRowGroups(groupPhotosIntoRows(photoData));
    }
  }, [photoData, groupPhotosIntoRows]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setColumns(getColumnsForWidth(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getColumnsForWidth]);

  const calculateLightboxIndex = useCallback(
    (rowIndex, photoIndex) => {
      return rowGroups.slice(0, rowIndex).reduce((sum, row) => sum + row.photos.length, photoIndex) + 1;
    },
    [rowGroups]
  );

  const galleryStyle =
    direction === 'row'
      ? {
          display: 'flex',
          flexDirection: 'column',
          gap: `${ROW_GAP}px`,
          width: '100%',
          maxWidth: `${MAX_CONTAINER_WIDTH}px`,
          margin: '0 auto',
        }
      : {
          columns: columns,
          columnGap: `${ROW_GAP}px`,
          width: '100%',
        };

  return (
    <>
      <div className="gallery" style={galleryStyle}>
        {direction === 'row' ? (
          rowGroups.map((row, rowIndex) => {
            const { rowHeight, portraitRowHeight, containerWidth } = getLayoutParams();
            const currentRowHeight = row.hasPortrait ? portraitRowHeight : rowHeight;
            const totalRowWidth = row.photos.reduce((sum, photo) => sum + photo.ratio * currentRowHeight, 0);
            const availableWidth = containerWidth - (row.photos.length - 1) * ROW_GAP;
            const scaleFactor = Math.min(availableWidth / totalRowWidth, 1);

            return (
              <div
                key={rowIndex}
                style={{
                  display: 'flex',
                  gap: `${ROW_GAP}px`,
                  width: '100%',
                  maxWidth: `${containerWidth}px`,
                  margin: '0 auto',
                  justifyContent: 'flex-start',
                  overflowX: 'hidden',
                }}
              >
                {row.photos.map((photo, photoIndex) => {
                  const width = photo.ratio * currentRowHeight * scaleFactor;

                  return (
                    <div
                      key={`${rowIndex}-${photoIndex}`}
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                        height: `${currentRowHeight}px`,
                        width: `${width}px`,
                        flexShrink: 0,
                        flexGrow: 0,
                      }}
                      onClick={() => {
                        setSlide(calculateLightboxIndex(rowIndex, photoIndex));
                        setToggler((t) => !t);
                      }}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt || ''}
                        style={{
                          height: '100%',
                          width: '100%',
                          objectFit: 'contain',
                          maxWidth: '100%',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          photoData.map((photo, i) => (
            <div
              key={i}
              style={{
                breakInside: 'avoid',
                marginBottom: `${ROW_GAP}px`,
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => {
                setSlide(i + 1);
                setToggler((t) => !t);
              }}
            >
              <img
                src={photo.src}
                alt={photo.alt || ''}
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          ))
        )}
      </div>

      {hasPhotos && (
        <FsLightbox
          toggler={toggler}
          sources={photos.map((p) => p.src)}
          slide={slide}
          onClose={handleClose}
        />
      )}
    </>
  );
}

GalleryApp.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string,
    })
  ).isRequired,
  direction: PropTypes.oneOf(['column', 'row']),
};