import React from 'react';
import { Global } from '@emotion/react';

const GlobalStyles: React.FC = () => (
  <Global
    styles={`
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #F7FAFC; 
      }

      #root {
        height: 100%;
      }
    `}
  />
);

export default GlobalStyles;
