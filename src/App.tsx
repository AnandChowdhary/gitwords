import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Login from "./routes/login";
import "./App.css";

function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/contents/README.md">Contents</Link>
          </li>
        </ul>
        <hr />
        <Switch>
          <Route exact path="/">
            <Login />
          </Route>
          <Route path="/contents">
            <About />
          </Route>
          <Route path="/contents/:path">
            <About />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function About() {
  return (
    <div>
      <h2>About</h2>
    </div>
  );
}

export default App;
