import { Global } from "@emotion/react"; // Si estás usando Chakra UI para CSS global

const GlobalStyles = () => (
  <Global
    styles={`
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #DDD2B5; /* El color de fondo */
      }

      #root {
        height: 100%;
      }
    `}
  />
);

export default GlobalStyles;
