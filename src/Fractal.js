import React, { useEffect, useRef } from "react";
import Effect, { startRecording, stopRecordingAndDownload } from "./effect";
const FractalSketch = () => {
  const containerRef = useRef();
  const canvasRef = useRef();
  const recordingRef = useRef(false);
  const framesRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const effect = new Effect(container, canvas);

    function resizeCanvas() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }

    function draw() {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
     
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      effect.drawFractal(ctx);
      ctx.restore();
      effect.update();

      if (recordingRef.current) {
        framesRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
    }

    function mainLoop() {
      draw();
      requestAnimationFrame(mainLoop);
    }

    document.addEventListener("keydown", (event) => {
      if (event.code === "KeyS") {
        recordingRef.current = true;
        startRecording(canvasRef.current);
      } else if (event.code === "KeyD") {
        recordingRef.current = false;
        stopRecordingAndDownload(canvasRef.current, "canvasRecording.webm", framesRef.current);
        framesRef.current = [];
      }
    });

    container.appendChild(canvas);
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    mainLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);


  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default FractalSketch;
