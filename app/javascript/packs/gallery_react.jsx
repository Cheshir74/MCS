import React,{useState,useEffect, useCallback } from "react";
import { render } from "react-dom";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
import axios from "axios";

function App(node) {
    const [isLoading, setLoading] = useState(true);
    const [photos,setImages]=useState();
    const url = node.link;
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
    
    useEffect((id)=>{
        axios.get(url).then(response => {
            setImages(response.data)
            setLoading(false);
        });
    }, []);

    if (isLoading) {
        return <div className="App"> Loading... </div>;
    }
    console.log(photos);
    return (
        <div>
            
            <Gallery photos={photos} onClick={openLightbox} direction={"column"} />
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

$(document).on('turbolinks:load', function () {
    const node = document.getElementById('app')
    const link = node.getAttribute('data-url-path')
    const url = link+'.json';
    render(<App link={url} /> , document.getElementById("app"))
  })
