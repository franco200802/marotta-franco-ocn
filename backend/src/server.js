import { createApp } from "./app.js";
import { config } from "./utils/config.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Servidor escuchando en el puerto ${config.port}`);
});
