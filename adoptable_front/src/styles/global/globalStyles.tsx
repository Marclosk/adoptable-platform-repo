// src/styles/GlobalStyles.tsx

import { Global } from "@emotion/react";

const GlobalStyles = () => (
  <Global
    styles={`
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #F7FAFC; /* now matches the app’s light gray background */
      }

      #root {
        height: 100%;
      }
    `}
  />
);

export default GlobalStyles;
