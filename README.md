# This is a proof of concept of a custom react reconciler for a Web Worker.

This is a technical demo of familiar react development workflow for UI but done in a Web Worker, which is achieved by implementing a custom react-reconciler.

## Why
### UI contributed by plugins
In apps like Figma, MS Teams and Slack there is a desire to have a plugin system that can contribute UI to the app. Example: 
![Screen shot of Zoom card in Slack](./images/slack+zoom.png?raw=true "Zoom card in Slack")

Historically these use-cases are solved with iframes, but recently more and more technologies emerge that focus on "safe" embedding with minimal overhead. One of my favorite projects in that space is [Adaptive Cards](https://adaptivecards.io/) done by microsoft.

But how to make this UI:
- Interactive: you can press a button or change the content over time
- Safe: don't run 3rd party (potentially unsafe) code in the same environment as the main app, which can compromise customer data or just have a buggy JS polyfill. Figma published an amazing [blog post](https://www.figma.com/blog/an-update-on-plugin-security/) about this problem. 
- Fast: regardless of 3rd party code your main app should feel smooth and responsive no matter what. Solutions like embedding `iframe` might not be the best for performance. Note that Safe & Fast is often achieved by outsourcing the compute to a separate sandboxed thread or even run it on a server.

But I think we can generally do better than iframe and [adaptive cards](https://adaptivecards.io/).

## Idea
"What if we can author adaptive cards like UI but in react using `useState` & `useEffect` for interactivity in a Worker (safety + non blocking main thread)"

```ts
// worker.ts  (Worker thread)
const Counter: React.FC = () => {
  const [counter, setCounter] = useState(0);

  return (
    <>
      <text type="header">Counter</text>
      <btn onClick={() => setCounter((c) => c - 1)}>-</btn>
      <text>count: {counter}</text>
      <btn onClick={() => setCounter((c) => c + 1)}>+</btn>
    </>
  );
};
```

which conceptually translates into
```ts
// main.ts (main thread)

const Counter: React.FC = () => {
  const { reportClick } = useContext(WorkerViewContext);

  return (
    <>
      <h1>Counter</h1>
      <button onClick={()=>reportClick('id(-)')}>-</button>
      <span>count: {counter}</span>
      <button onClick={() => reportClick('id(+)')}>+</button>
    </>
  );
};
```

Note that main thread doesn't have any state and essentially it is just a "view" on the state stored in the worker.

## Architecture 
![Architecture diagram](./images/worker-reconciler.png?raw=true "Architecture")

Note that custom react reconciler works **alongside** normal react-web framework. The goal is not a replace a UI framework but augment it with a small safe portal to where a plugin can contribute it's UI.

Note that this idea is not exactly new. ReactNative pioneered it in JS space and there is even a port of ReactNative to the web: https://github.com/vincentriemer/react-native-dom

But I think this architecture is under explored for use-cases like plugins.

## Use-case for plugins UI
![Plugins UI architecture diagram](./images/plugin-architecture.png?raw=true "plugins UI architecture")

## Conclusion
I think there is a power of having a familiar UI authoring experience but tailored towards specific application constraints. 

Benefits:
- Familiar experience of authoring UI
- Can be made interactive (it is up to you whether or not support any interactive elements)
- Plugin can update it's UI by simply using `useState` & `useEffect`
- Safe: there is no 3rd party code that executes in the main thread
- Fast: all virtual dom diffing is done by a worker thread, so main thread is free from heavy lifting
- It is up to you to either expose low level primitives such as `div` or only specific high level controls like `Tabs`. This architecture can accommodate both approaches

Note that you just can expose primitives from you design systems. In this case all styling, layout, accessibility, theming will "just work".
