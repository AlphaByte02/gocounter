import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import "@/styles/index.css";

import Index, { homePreload } from "@/routes/home";
import Feed, { feedPreload } from "@/routes/feed";

const root = document.getElementById("root");

if (!root) {
    throw new Error("Root div not found");
}

render(
    () => (
        <Router>
            <Route path="/" component={Index} preload={homePreload} />
            <Route path="/feed" component={Feed} preload={feedPreload} />
        </Router>
    ),
    root,
);
