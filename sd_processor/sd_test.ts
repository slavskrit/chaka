import { Buffer } from "buffer";
import { writeFileSync } from "fs";
import os from "os";
import path from "path";

const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
  body: '{"prompt": "pretty xeg","steps": 50,"cfg_scale": 7,"sampler_index": "Euler a","width": 512,"height": 512}',
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  method: "POST",
});

const base64image = (await response.json()).images[0];

const buffer = Buffer.from(base64image, "base64");

const tempDir = os.tmpdir();
const tempFile = path.join(tempDir, "output.png");

// Save the image to the temporary file
writeFileSync(tempFile, buffer);

console.log("Image saved as", tempFile);
