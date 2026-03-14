import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import "@/styles/index.css";

import AllGraph, { allGraphPreload } from "@/routes/AllGraph";
import CounterDetail, { counterDetailPreload } from "@/routes/CounterDetail";
import Feed, { feedPreload } from "@/routes/Feed";
import Index, { homePreload } from "@/routes/Home";

const root = document.getElementById("root");

if (!root) {
    throw new Error("Root div not found");
}

render(
    () => (
        <Router>
            <Route path="/" component={Index} preload={homePreload} />
            <Route path="/feed" component={Feed} preload={feedPreload} />
            <Route path="/counters/:id" component={CounterDetail} preload={counterDetailPreload} />
            <Route path="/all" component={AllGraph} preload={allGraphPreload} />
        </Router>
    ),
    root,
);
