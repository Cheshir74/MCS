import React,{useState,useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
import SelectedImage from "./SelectedImage";


import {
  Controller
} from "@hotwired/stimulus"

export default class extends Controller {
  connect() {

    function App() {
      const [selectAll, setSelectAll] = useState(false);

      const toggleSelectAll = () => {
        setSelectAll(!selectAll);
      };

        const node = document.getElementById('app_gallery')
        const url = node.getAttribute('data-url-path')+'.json';
        const direction = node.getAttribute('data-direction');
        const [error, setError] = useState(null);
        const [isLoaded, setIsLoaded] = useState(false);
        const [photos, setItems] = useState([]);
        const [currentImage, setCurrentImage] = useState(0);
        const [viewerIsOpen, setViewerIsOpen] = useState(false);

        const openLightbox = useCallback((event, { photo, index }) => {
          setCurrentImage(index);
          setViewerIsOpen(true);
        }, []);
        const closeLightbox = () => {
          setCurrentImage(0);
          setViewerIsOpen(false);
        };
        const imageRenderer = useCallback(
          ({ index, left, top, key, photo }) => (
            <SelectedImage
              selected={selectAll ? true : false}
              key={key}
              margin={"2px"}
              index={index}
              photo={photo}
              left={left}
              top={top}
            />
          ),
          [selectAll]
        );

        useEffect(() => {
          const controller = new AbortController();
          const signal = controller.signal;
          fetch(url, {
            signal: signal
          })
          .then(res => res.json())
          .then(
            (result) => {
              setIsLoaded(true);
              setItems(result);
            },
            (error) => {
              setIsLoaded(true);
              setError(error);
            }
          )
          return () => {
            controller.abort();
          };
        }, [])
      
        if (error) {
          return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
          return <div>Loading...</div>;
        } else {
          return (
            <div>
              <p>
                <button onClick={toggleSelectAll}>toggle select all</button>
              </p>
              <Gallery photos={photos} margin={10} onClick={openLightbox} direction={direction} />
                <ModalGateway>
                  {viewerIsOpen ? (
                    <Modal onClose={closeLightbox}>
                      <Carousel
                        currentIndex={currentImage}
                        views={photos.map(x => ({
                          ...x,
                          srcset: x.srcSet,
                          caption: x.title
                        }))}
                      />
                    </Modal>
                  ) : null}
                </ModalGateway>
            </div>
          );
        }
      }
      
    createRoot(document.getElementById("app_gallery")).render(<App />)
  }
}