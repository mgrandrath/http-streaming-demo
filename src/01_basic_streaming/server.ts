import express from "express";

const PORT = 3000;
const server = express();

const timeout = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

server.get("/", async (request, response) => {
  const htmlChunks = [
    "<head>",
    "  <title>Hello HTTP Streams</title>",
    "</head>",
    "<body>",
    "  <p>1</p>",
    "  <p>2</p>",
    "  <p>3</p>",
    "  <p>4</p>",
    "  <p>5</p>",
    "</body>",
  ];

  for (const chunk of htmlChunks) {
    await timeout(1000);
    response.write(chunk + "\n");
  }

  response.end();
});

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
