class Effect {
  constructor(container, canvas, onDrawComplete) {
    this.onDrawComplete = onDrawComplete;
    this.container = container;
    this.canvas = canvas;
    this.mirror = false;
    this.length = 200;
    this.maxLevel = 3;
    this.branches = 2;
    this.spread = 0.2;
    this.scale = 0.9;
    this.sides = 5;
    this.shadows = false;
    this.disconnect = -2;

    this.count = 0;

    this.color = `hsl(${Math.random() * 360}, 100%, 50%)`
  }

  drawBranch(x1, y1, length, startAngle, level) {
    if (level > this.maxLevel || length <= 1) {
      return;
    } else {
      this.count++;
    }

    // Calculate end point
    let x2 = x1 + (length - this.disconnect) * Math.cos(startAngle);
    let y2 = y1 + (length - this.disconnect) * Math.sin(startAngle);

    // Create a new path for each branch
    let branch = new Path2D();

    // Add line to path
    branch.moveTo(x1, y1);
    branch.lineTo(x2, y2);

    // Save this branch for later drawing
    this.branchesToDraw.push({
      path: branch,
      lineWidth: this.maxLevel - level + 1,  // Vary the line width according to the level
    });

    // Create a new path for the arc
    let arc = new Path2D();
    arc.arc(x2, y2, length * 0.1, 0, Math.PI * 2);

    // Save this arc for later drawing
    this.branchesToDraw.push({
      path: arc,
      lineWidth: this.maxLevel - level + 1,
    });

    // Recursively draw the next level of branches
    for (let i = 0; i < this.branches; i++) {
      // Calculate next branch length and angle
      let nextLength = length * this.scale;
      let nextAngle = startAngle + this.spread;

      let x2 = x1 + (length - (length / this.branches) * i) * Math.cos(startAngle);
      let y2 = y1 + (length - (length / this.branches) * i) * Math.sin(startAngle);

      this.drawBranch(x2, y2, nextLength, nextAngle, level + 1);


      if (this.mirror) {

        let nextLength = length * this.scale;
        let nextAngle = startAngle - this.spread;

        let x2 = x1 + (length - (length / this.branches) * i) * Math.cos(startAngle);
        let y2 = y1 + (length - (length / this.branches) * i) * Math.sin(startAngle);

        this.drawBranch(x2, y2, nextLength, nextAngle, level + 1);

      }
    }
}


  drawFractal(ctx) {
    this.branchesToDraw = [];
    this.drawBranch(0, 0, this.length, 0, 0);
    if (this.shadows) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
    }
    // Stroke all paths with the set line width
    for (let i = 0; i < this.sides; i++) {
      ctx.rotate(Math.PI * 2 / this.sides);
      for (let { path, lineWidth } of this.branchesToDraw) {

        
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = this.color;
        ctx.stroke(path);
      }
    }


    this.onDrawComplete?.();

  }

  update() {
    this.spread += 0.001;
  }
}

export default Effect;

let mediaRecorder;
let recordedChunks = [];

export function startRecording(canvas) {
  recordedChunks = [];
  const stream = canvas.captureStream();

  mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.start();
}


export function stopRecordingAndDownload(canvas, filename) {
  console.log("recording stopped");
  if (recordedChunks.length > 0 && recordedChunks[0] instanceof ImageData) {
    const stream = canvas.captureStream();
    mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    mediaRecorder.start();

    const targetFrameDuration = 1000 / 30; // 30 fps
    recordedChunks.forEach((imageData, index) => {
      const ctx = canvas.getContext("2d");
      ctx.putImageData(imageData, 0, 0);
      setTimeout(() => {
        mediaRecorder.requestData();
        if (index === recordedChunks.length - 1) {
          mediaRecorder.stop();
        }
      }, targetFrameDuration * index);
    });
  } else {
    if (mediaRecorder) {
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      };

      mediaRecorder.stop();
    }
  }
}


