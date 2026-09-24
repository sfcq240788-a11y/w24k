const sharp = require("sharp");
const fs = require("fs");
fs.mkdirSync("pruebas", { recursive: true });

const flat = (w, h) =>
  sharp({ create: { width: w, height: h, channels: 3, background: "#3a3a3a" } });

const pad = (src, dst, bytes) => {
  const b = fs.readFileSync(src);
  fs.writeFileSync(dst, Buffer.concat([b, Buffer.alloc(bytes - b.length)]));
};

(async () => {
  await flat(1200, 1500).jpeg().toFile("pruebas/ok-1200x1500.jpg");
  await flat(3427, 8000).jpeg().toFile("pruebas/rechazo-3427x8000.jpg");
  await flat(800, 1000).jpeg().toFile("pruebas/rechazo-800x1000.jpg");
  await flat(1500, 1200).jpeg().withMetadata({ orientation: 6 })
    .toFile("pruebas/orient6-ok.jpg");
  await flat(6400, 8000).jpeg().toFile("pruebas/rechazo-51MP.jpg");
  pad("pruebas/ok-1200x1500.jpg", "pruebas/peso-3.9MiB.jpg", Math.round(3.9 * 1048576));
  pad("pruebas/ok-1200x1500.jpg", "pruebas/peso-4.1MiB.jpg", Math.round(4.1 * 1048576));
  console.log("Listo: carpeta pruebas/");
})();
