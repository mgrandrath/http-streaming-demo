import { FC, Suspense, use } from "react";

// Helper function for simulation async data fetching. It returns a promise that
// resolves to the given text value after a random timeout between 1 and 5
// seconds.
const simulateFetchData = (text: string): Promise<string> =>
  new Promise((resolve) => {
    setTimeout(
      () => {
        resolve(text);
      },
      Math.random() * 4000 + 1000,
    );
  });

// Component that renders the value of a promise once it resolves utilizing the
// `use` hook. See https://react.dev/reference/react/use
const AsyncText: FC<{ textPromise: Promise<string> }> = ({ textPromise }) => {
  const text = use(textPromise);
  return <p>{text}</p>;
};

export const App = () => {
  // Creating 5 promises that will resolve in a random order
  const textPromise1 = simulateFetchData("✅ Hello");
  const textPromise2 = simulateFetchData("✅ from");
  const textPromise3 = simulateFetchData("✅ the");
  const textPromise4 = simulateFetchData("✅ other");
  const textPromise5 = simulateFetchData("✅ side");

  return (
    <html>
      <head>
        <title>Hello, React App</title>
      </head>
      <body>
        {/*
         * Each Suspense boundary will render the fallback until the promise
         * inside resolves. Then it replaces the fallback with the respective
         * AsyncText element.
         */}
        <Suspense fallback={<p>⏳️ Waiting for promise 1 to resolve…</p>}>
          <AsyncText textPromise={textPromise1} />
        </Suspense>
        <Suspense fallback={<p>⏳️ Waiting for promise 2 to resolve…</p>}>
          <AsyncText textPromise={textPromise2} />
        </Suspense>
        <Suspense fallback={<p>⏳️ Waiting for promise 3 to resolve…</p>}>
          <AsyncText textPromise={textPromise3} />
        </Suspense>
        <Suspense fallback={<p>⏳️ Waiting for promise 4 to resolve…</p>}>
          <AsyncText textPromise={textPromise4} />
        </Suspense>
        <Suspense fallback={<p>⏳️ Waiting for promise 5 to resolve…</p>}>
          <AsyncText textPromise={textPromise5} />
        </Suspense>
        <p>This content comes after all the async texts</p>
      </body>
    </html>
  );
};
