/**
 * The following line pulls in the canary type declarations from @types/react.
 * This includes type information for the `use` hook.
 *
 * - https://react.dev/reference/react/use
 * - https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/canary.d.ts
 */
/// <reference types="react/canary" />

import express from "express";
import {
  renderToPipeableStream,
  renderToStaticNodeStream,
  renderToString,
} from "react-dom/server";
import { App } from "./app";

const PORT = 3000;
const server = express();

server.get("/renderToString", async (request, response) => {
  response.type("text/html");
  response.send("<!DOCTYPE html>" + renderToString(<App />));
});

server.get("/renderToStaticNodeStream", async (request, response) => {
  response.type("text/html");
  response.write("<!DOCTYPE html>");
  renderToStaticNodeStream(<App />).pipe(response);
});

server.get("/renderToPipeableStream", async (request, response) => {
  const stream = renderToPipeableStream(<App />, {
    onShellReady() {
      response.type("text/html");
      stream.pipe(response);
    },
  });
});

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log("");
  console.log(`1. http://localhost:${PORT}/renderToString`);
  console.log("   This endpoint returns immediately, rendering only the");
  console.log("   fallbacks.");
  console.log("");
  console.log(`2. http://localhost:${PORT}/renderToStaticNodeStream`);
  console.log("   This endpoint waits for all promises to be resolved before");
  console.log("   sending a response.");
  console.log("");
  console.log(`3. http://localhost:${PORT}/renderToPipeableStream`);
  console.log("   This endpoint returns immediately, replacing the fallbacks");
  console.log("   dynamically as more and more data is available.");
  console.log("");
});
