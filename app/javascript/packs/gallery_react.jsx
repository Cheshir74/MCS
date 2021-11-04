import React,{useState,useEffect, useCallback } from "react";
import { render } from "react-dom";
import Gallery from "react-photo-gallery";
import photos from "./images.json"
import Carousel, { Modal, ModalGateway } from "react-images";
import axios from "axios";

function App() {
    const [isLoading, setLoading] = useState(true);
    const [images,setImages]=useState();
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
    
    useEffect(()=>{
        axios.get("2.json").then(response => {
            setImages(response.data)
            setLoading(false);
        });
    }, []);

    if (isLoading) {
        return <div className="App"> Loading... </div>;
    }

    return (
        <div>
            
            <Gallery photos={images} onClick={openLightbox} direction={"column"} />
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


/* popout the browser and maximize to see more columns! -> */
render(<App />, document.getElementById("app"));