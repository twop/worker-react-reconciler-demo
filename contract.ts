import { AnyInstance, Container, NodeType } from "./reconciler/reconciler";

export enum ElementType {
  view = "view",
  text = "text",
  btn = "btn",
  raw = "raw",
}

export type TransferViewData = {
  elements: ViewElement[];
};

export type ViewElementText = {
  tag: ElementType.text;
  color?: string;
  type?: "header" | "paragraph" | "span";
  text: string | number | undefined;
  children?: ViewElement[];
};

export type ViewElement =
  | {
      tag: ElementType.view;
      border?: number;
      children?: ViewElement[];
    }
  | {
      tag: ElementType.btn;
      id: number;
      children?: ViewElement[];
    }
  | ViewElementText
  | {
      tag: ElementType.raw;
      text: string | number;
    };

const toElement = (instance: AnyInstance): ViewElement => {
  switch (instance.tag) {
    case NodeType.view: {
      const { children, border } = instance;
      return {
        tag: ElementType.view,
        border,
        children: children.length > 0 ? children.map(toElement) : undefined,
      };
    }

    case NodeType.text: {
      const { text, type, children } = instance;
      return {
        tag: ElementType.text,
        text,
        type,
        children: children.length > 0 ? children.map(toElement) : undefined,
      };
    }

    case NodeType.btn: {
      const { id, children } = instance;
      return {
        tag: ElementType.btn,
        id,
        children: children.length > 0 ? children.map(toElement) : undefined,
      };
    }
    case "raw": {
      const { text } = instance;
      return {
        tag: ElementType.raw,
        text,
      };
    }
  }
};

export const prepareToTransfer = (container: Container): TransferViewData => ({
  elements: container.children.map(toElement),
});
