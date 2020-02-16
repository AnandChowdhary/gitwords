import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./routes/login";
import Contents from "./routes/contents";
import "./App.css";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Login />
        </Route>
        <Route path="/contents">
          <Contents />
        </Route>
        <Route path="/contents/:path">
          <Contents />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
