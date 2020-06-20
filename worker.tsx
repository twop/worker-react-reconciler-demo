// (window as any) = globalThis;

import {
  NodeType,
  WorkerReconciler,
  HostContext,
  BtnNodeInstance,
  AnyInstance,
} from "./reconciler/reconciler";
import React, { useEffect, useState } from "react";
import { prepareToTransfer } from "./contract";

self.postMessage("hi");

const TickingText: React.FC<{ interval: number }> = ({ interval }) => {
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const handle = setInterval(() => setCounter((c) => c + 1), interval * 1000);
    return () => clearTimeout(handle);
  }, []);
  return (
    <>
      <text type="header">Ticking</text>
      <text type="paragraph">this increments every {interval} sec</text>
      <text type="paragraph">counter: {counter}</text>
    </>
  );
};

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

const App: React.FC = () => (
  <>
    <text type="header">Nothing to see here</text>
    <text type="paragraph">
      just a UI powered by custom react reconciler in a Web Worker
    </text>
    <Counter />
    <TickingText interval={1} />
  </>
);

const host: HostContext = {
  onCommit: (c) => {
    console.log("W: commit", c);
    self.postMessage(prepareToTransfer(c));
  },
  generateId: (() => {
    let id = 0;
    return () => id++;
  })(),
};

const container = WorkerReconciler.render(<App></App>, host, () => {});

self.onmessage = (msg: any) => {
  const { click } = msg.data as { click: number };
  if (typeof click !== "number") {
    throw new Error("wrong worker msg");
  }

  const btn = findButton(container.children, click);
  if (btn !== null) {
    btn.onClick();
  }
};

const findButton = (
  children: AnyInstance[],
  id: number
): BtnNodeInstance | null => {
  for (let child of children) {
    if (child.tag === NodeType.btn && child.id === id) {
      return child;
    }

    if (child.tag !== "raw") {
      const innerSearch = findButton(child.children, id);
      if (innerSearch !== null) return innerSearch;
    }
  }
  return null;
};
