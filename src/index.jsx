import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import Store from "./store";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext"

ReactDOM.render(
  <Provider store={Store}>
    <AppContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppContextProvider>
  </Provider>,
  document.getElementById("root")
);

reportWebVitals();
