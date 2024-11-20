import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";
import GlobalStyles from "./styles/global/globalStyles"; // Asegúrate de que la ruta sea correcta

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <GlobalStyles />
      <Provider store={store}>
        <App />
      </Provider>
      ,
    </ChakraProvider>
  </React.StrictMode>
);
