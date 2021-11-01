import React from "react";
import { render } from "react-dom";
import Gallery from "react-photo-gallery";
import photos from "./images.json"
import axios from "axios";

class TodoApp extends React.Component {

    getTodoItems() {
        axios
        .get("/api/v1/todo_items")
        .then(response => {
            const todoItems = response.data;
            this.setState({ todoItems });
        })
        .catch(error => {
            console.log(error);
        });
    }
    
}
/* popout the browser and maximize to see more columns! -> */
const App = () => <Gallery photos={photos} direction={"column"} />;
render(<App />, document.getElementById("app"));