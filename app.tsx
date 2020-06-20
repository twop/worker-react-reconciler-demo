import React, { useContext } from "react";
import { render } from "react-dom";
import {
  TransferViewData,
  ViewElement,
  ElementType,
  ViewElementText,
} from "./contract";

type WorkerViewContext = {
  reportClick: (id: number) => void;
};

const WorkerViewContext = React.createContext<WorkerViewContext>({
  reportClick: () => {},
});

const Button: React.FC<{ id: number }> = ({ id, children }) => {
  const { reportClick } = useContext(WorkerViewContext);
  return <button onClick={() => reportClick(id)}> {children}</button>;
};

const Text: React.FC<{ el: ViewElementText }> = ({
  el: { type = "span", text, children },
}) => {
  const lookup = {
    header: "h2",
    paragraph: "p",
    span: "span",
  };

  return React.createElement(lookup[type], {}, text, renderIntances(children));
};

const ElementView: React.FC<{ el: ViewElement }> = ({ el }) => {
  switch (el.tag) {
    case ElementType.view:
      return <div>{renderIntances(el.children)}</div>;
    case ElementType.btn:
      return <Button id={el.id}>{renderIntances(el.children)}</Button>;
    case ElementType.text:
      return <Text el={el} />;
    case ElementType.raw:
      return <span>{el.text}</span>;
  }
};

const RootView: React.FC<{ data: TransferViewData }> = ({ data }) => (
  <>{renderIntances(data.elements)}</>
);

const reactRoot = document.createElement("div");
document.body.appendChild(reactRoot);

const el = document.createElement("pre");
document.body.appendChild(el);

function renderIntances(elements?: ViewElement[]) {
  return elements?.map((el, i) => <ElementView el={el} key={i} />);
}

const worker = new Worker("./worker.tsx");
const ctx: WorkerViewContext = {
  reportClick: (id) => worker.postMessage({ click: id }),
};

worker.onmessage = (msg) => {
  const data: "hi" | TransferViewData = msg.data;

  if (data === "hi") {
    console.log("worker handshake");
    return;
  }
  el.innerText = JSON.stringify(data, null, 2);

  render(
    <WorkerViewContext.Provider value={ctx}>
      <RootView data={data} />
    </WorkerViewContext.Provider>,
    reactRoot
  );
};
