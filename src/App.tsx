import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./routes/login";
import Contents from "./routes/contents";
import { Provider } from "react-redux";
import { store } from "./store";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}

export default App;
