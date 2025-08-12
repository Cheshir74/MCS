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
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          width: "100%",
          margin: 0
        }}
      >
        {hasPhotos &&
          photos.map((photo, i) => (
            <img
              key={i}
              src={photo.src}
              alt={photo.alt !== undefined ? photo.alt : ""}
              style={{ width: "100%", cursor: "pointer", display: "block" }}
              onClick={() => {
                setSlide(i + 1);
                setToggler(t => !t); // Меняем на противоположное
              }}
            />
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