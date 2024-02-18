# HTTP streaming playground

Since the early days of the web, browsers are capable of processing and
rendering HTML pages while they are still being transmitted over the network.
This helps improving a site's perceived performance drastically since the user
can start interacting with a page even before the server is done rendering it.

Recently I read this deep dive on [the new SSR architecture in React
18](https://github.com/reactwg/react-18/discussions/37) which explains React's
support for SSR and HTTP streaming using `<Suspense>` boundaries. I want to take
a closer look at how this works.

## 01 Basic streaming

Before bringing in React I want to start with a basic example that demonstrates
HTTP streaming in general. The following command starts an express server that
responds with a small HTML page. The response is spread across 10 chunks with a
delay of one second before each chunk. The server is implemented in
[./src/01_basic_streaming/server.ts](./src/01_basic_streaming/server.ts)

```
yarn 01_basic_streaming
```

You can see the response coming in using `curl`. The `--no-buffer` option
ensures that every chunk received is printed to the console immediately.

```
curl --no-buffer -i http://localhost:3000
```

The final response looks like this:

```
HTTP/1.1 200 OK
X-Powered-By: Express
Date: Sun, 18 Feb 2024 09:52:29 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

<head>
  <title>Hello HTTP Streams</title>
</head>
<body>
  <p>1</p>
  <p>2</p>
  <p>3</p>
  <p>4</p>
  <p>5</p>
</body>
```

Notice when you open the URL in a browser it updates the tab's title as soon as
the `<title>` tag arrives, i.e. after the first second. Then it continues to
render the page's content as it arrives, one `<p>` at a time.
