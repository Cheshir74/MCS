import React, { useState } from "react";
import FsLightbox from "fslightbox-react";

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

export default function GalleryApp({ photos }) {
  const [toggler, setToggler] = useState(false);
  const [slide, setSlide] = useState(1);

  const hasPhotos = Array.isArray(photos) && photos.length > 0;

  const handleClose = () => {
    setTimeout(exitFullscreen, 100);
  };

  return (
    <>
      <div
        className="gallery"
        style={{
          columns: 3,
          columnGap: "10px",
          width: "100%"
        }}
      >
        {hasPhotos && photos.map((photo, i) => (
          <div 
            key={i} 
            style={{ 
              breakInside: "avoid",
              marginBottom: "10px",
              borderRadius: "8px",
              overflow: "hidden"
            }}
          >
            <img
              src={photo.src}
              alt={photo.alt || ""}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                cursor: "pointer"
              }}
              onClick={() => {
                setSlide(i + 1);
                setToggler(t => !t);
              }}
            />
          </div>
        ))}
      </div>
      {hasPhotos && (
        <FsLightbox
          toggler={toggler}
          sources={photos.map(photo => photo.src)}
          slide={slide}
          onClose={handleClose}
        />
      )}
    </>
  );
}