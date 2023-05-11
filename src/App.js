import { ReactP5Wrapper } from 'react-p5-wrapper';

import Styled from 'styled-components';
import Fractal from './Fractal';
import React, { useRef } from 'react';

const Container = Styled.div`
width: 100%;
height: 100vh;
overflow: hidden;
background-color: #000;
`

function App() {
  const containerRef = useRef(null);

  return (
    <>
      <Container ref={containerRef}>
       <Fractal />

      </Container>
      <div style={{ height: "800px" }}>
        TESt
      </div>
    </>
  );
}

export default App;
