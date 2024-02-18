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

## 02 React SSR

Now let's take a look at rendering on the server using React. There are two
parts to working with async data: `<Suspense>` and `use`. The former is part of
React for quite some time now. It was introduced in version 16.6.0 in 2018. The
`use` hook on the other hand is not yet part of React's stable branch (version
18.2.0). In order to use it we need to install the canary version of React
(`yarn add react@canary react-dom@canary`). The test server is implemented in
[./src/02_react_ssr/server.tsx](./src/02_react_ssr/server.tsx).

Start the server with

```
yarn 02_react_ssr
```

Send requests to the different endpoints using either curl or a browser to see
the different behaviors.

### /renderToString

`renderToString` does not wait for any suspended components. It renders the
fallbacks and returns immediately.

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 3095
ETag: W/"c17-4iUXPHdRVYL+Qzntykn2gmLTzeE"
Date: Sun, 18 Feb 2024 15:06:41 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<!DOCTYPE html><html><head><title>Hello, React App</title></head><body><!--$!--><template data-msg="The server did not finish this Suspense boundary: The server used &quot;renderToString&quot; which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to &quot;renderToPipeableStream&quot; which supports Suspense on the server" data-stck="
    at Suspense
    at body
    at html
    at App"></template><p>⏳️ Waiting for promise 1 to resolve…</p><!--/$--><!--$!--><template data-msg="The server did not finish this Suspense boundary: The server used &quot;renderToString&quot; which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to &quot;renderToPipeableStream&quot; which supports Suspense on the server" data-stck="
    at Suspense
    at body
    at html
    at App"></template><p>⏳️ Waiting for promise 2 to resolve…</p><!--/$--><!--$!--><template data-msg="The server did not finish this Suspense boundary: The server used &quot;renderToString&quot; which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to &quot;renderToPipeableStream&quot; which supports Suspense on the server" data-stck="
    at Suspense
    at body
    at html
    at App"></template><p>⏳️ Waiting for promise 3 to resolve…</p><!--/$--><!--$!--><template data-msg="The server did not finish this Suspense boundary: The server used &quot;renderToString&quot; which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to &quot;renderToPipeableStream&quot; which supports Suspense on the server" data-stck="
    at Suspense
    at body
    at html
    at App"></template><p>⏳️ Waiting for promise 4 to resolve…</p><!--/$--><!--$!--><template data-msg="The server did not finish this Suspense boundary: The server used &quot;renderToString&quot; which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to &quot;renderToPipeableStream&quot; which supports Suspense on the server" data-stck="
    at Suspense
    at body
    at html
    at App"></template><p>⏳️ Waiting for promise 5 to resolve…</p><!--/$--><p>This content comes after all the async texts</p></body></html>
```

Notice that it not only renders the fallbacks but also `<template>` elements
with `data-msg` and `data-stck` attributes explaining that `renderToString` is
not meant to be used with `<Suspense>`.

### /renderToStaticNodeStream

`renderToStaticNodeStream` waits for all promises to be resolved before sending
back a response. As a result this endpoint hangs for several seconds before any
data is rendered.

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Date: Sun, 18 Feb 2024 15:13:05 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

<!DOCTYPE html><html><head><title>Hello, React App</title></head><body><!--$--><p>✅ Hello</p><!--/$--><!--$--><p>✅ from</p><!--/$--><!--$--><p>✅ the</p><!--/$--><!--$--><p>✅ other</p><!--/$--><!--$--><p>✅ side</p><!--/$--><p>This content comes after all the async texts</p></body></html>
```

### /renderToPipeableStream

`renderToPipeableStream` renders the fallback content for any suspended
components immediately but then continues to add HTML and JavaScript to the
stream as data comes in and promises get resolved.

The immediate response looks like this:

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Date: Sun, 18 Feb 2024 15:15:39 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

<!DOCTYPE html><html><head><title>Hello, React App</title></head><body><!--$?--><template id="B:0"></template><p>⏳️ Waiting for promise 1 to resolve…</p><!--/$--><!--$?--><template id="B:1"></template><p>⏳️ Waiting for promise 2 to resolve…</p><!--/$--><!--$?--><template id="B:2"></template><p>⏳️ Waiting for promise 3 to resolve…</p><!--/$--><!--$?--><template id="B:3"></template><p>⏳️ Waiting for promise 4 to resolve…</p><!--/$--><!--$?--><template id="B:4"></template><p>⏳️ Waiting for promise 5 to resolve…</p><!--/$--><p>This content comes after all the async texts</p>
```

- Every placeholder is preceded by a `<template>` element with an `id` (`B:0`, `B:1`, …)
- All content _after_ the suspended elements is rendered. Only the closing
  `</body>` and `</html>` are not yet sent.

When the promises are resolved the server continues to stream data:

```
<div hidden id="S:3"><p>✅ other</p></div><script>$RC=function(b,c,e){c=document.getElementById(c);c.parentNode.removeChild(c);var a=document.getElementById(b);if(a){b=a.previousSibling;if(e)b.data="$!",a.setAttribute("data-dgst",e);else{e=b.parentNode;a=b.nextSibling;var f=0;do{if(a&&8===a.nodeType){var d=a.data;if("/$"===d)if(0===f)break;else f--;else"$"!==d&&"$?"!==d&&"$!"!==d||f++}d=a.nextSibling;e.removeChild(a);a=d}while(a);for(;c.firstChild;)e.insertBefore(c.firstChild,a);b.data="$"}b._reactRetry&&b._reactRetry()}};$RC("B:3","S:3")</script><div hidden id="S:1"><p>✅ from</p></div><script>$RC("B:1","S:1")</script><div hidden id="S:0"><p>✅ Hello</p></div><script>$RC("B:0","S:0")</script><div hidden id="S:4"><p>✅ side</p></div><script>$RC("B:4","S:4")</script><div hidden id="S:2"><p>✅ the</p></div><script>$RC("B:2","S:2")</script></body></html>
```

As soon as new data is available (i.e. one more promise has been resolved) the
server sends the content of the previously suspended component wrapped in a
hidden `<div>` with an id (`S:0`, `S:1`, …) followed by a `<script>` tag with
code that places the newly arrived content into the correct `<template>` slot.

Let's take a closer look at the `$RC` function:

```js
$RC = function (b, c, e) {
  c = document.getElementById(c);
  c.parentNode.removeChild(c);
  var a = document.getElementById(b);
  if (a) {
    b = a.previousSibling;
    if (e) (b.data = "$!"), a.setAttribute("data-dgst", e);
    else {
      e = b.parentNode;
      a = b.nextSibling;
      var f = 0;
      do {
        if (a && 8 === a.nodeType) {
          var d = a.data;
          if ("/$" === d)
            if (0 === f) break;
            else f--;
          else ("$" !== d && "$?" !== d && "$!" !== d) || f++;
        }
        d = a.nextSibling;
        e.removeChild(a);
        a = d;
      } while (a);
      for (; c.firstChild; ) e.insertBefore(c.firstChild, a);
      b.data = "$";
    }
    b._reactRetry && b._reactRetry();
  }
};
```

There is quite a bit of minification trickery going on, but the gist of it is
that it uses comment nodes (`<!--$?-->` and `<!--/$-->`) as boundaries to
identify where the new content has to be inserted into the existing DOM.

## Conclusion

The fact that React uses basic HTTP streaming together with a tiny snippet of
JavaScript to enable rendering on the client while data is still being loaded on
the server blows my mind 🤯. It makes React a powerful engine for rendering even
static content on the server.
