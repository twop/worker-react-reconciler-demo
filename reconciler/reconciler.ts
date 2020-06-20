import ReactReconciler, { HostConfig, OpaqueHandle } from "react-reconciler";
// import { createNode, NodeType, VirtualNode, ReadWriteAttribute } from ".";

// import { BaseNode } from "./base";
// import { BoxNode } from "./box";
// import { TextNode } from "./text";

// const rootHostContext = {};
// const childHostContext = {};

function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

const { now } = Date;

export enum NodeType {
  view = "view",
  text = "text",
  btn = "btn",
}

type TextProps = {
  color?: string;
  type?: "header" | "paragraph" | "span";
  children?: string | number;
};

type ViewProps = {
  border: number;
};

type ButtonProps = {
  onClick: () => void;
};

type ViewNodeInstance = {
  tag: NodeType.view;
  border?: number;
  children: AnyInstance[];
};

export type BtnNodeInstance = {
  tag: NodeType.btn;
  id: number;
  onClick: () => void;
  children: AnyInstance[];
};

type TextNodeInstance = {
  tag: NodeType.text;
  color?: string;
  type?: "header" | "paragraph" | "span";
  text: string | number | undefined;
  children: AnyInstance[];
};

export type TextInstance = {
  tag: "raw";
  text: string | number;
};

export type Instance = ViewNodeInstance | TextNodeInstance | BtnNodeInstance;

// let's make them the same for now
type PublicInstance = Instance | TextInstance;

export type AnyInstance = Instance | TextInstance;

export type Container = {
  hostContext: HostContext;
  children: (Instance | TextInstance)[];
};

export type HostContext = {
  onCommit: (container: Container) => void;
  generateId: () => number;
};

type Props = TextProps | ViewProps | ButtonProps;

type UpdatePayload = {
  old: Props;
  new: Props;
};

const noTimeout = -1;
type NoTimeout = typeof noTimeout;
type TimeoutHandle = number;

type HydratableInstance = never;
type ChildSet = never;

type MyConfig = HostConfig<
  NodeType,
  Props,
  Container,
  Instance,
  TextInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
>;

const getPublicInstance: MyConfig["getPublicInstance"] = (
  instance: Instance | TextInstance
): PublicInstance => {
  //   assert(instance.tag !== "lingering text", "no support for random text yet");
  return instance;
};

const getRootHostContext: MyConfig["getRootHostContext"] = (
  container: Container
): HostContext => container.hostContext;

const getChildHostContext: MyConfig["getChildHostContext"] = (
  parentHostContext: HostContext,
  type: NodeType,
  rootContainerInstance: Container
): HostContext => parentHostContext;

const prepareForCommit: MyConfig["prepareForCommit"] = (
  container: Container
): void => {
  //   console.log("prepareForCommit", JSON.stringify(container, null, 2));
};

const resetAfterCommit: MyConfig["resetAfterCommit"] = (
  container: Container
): void => {
  // console.log("resetAfterCommit", JSON.stringify(container, null, 2));
  container.hostContext.onCommit(container);
};

const shouldSetTextContent: MyConfig["shouldSetTextContent"] = (
  type: NodeType,
  props: Props
): boolean =>
  // false;
  type === NodeType.text && typeof (props as TextProps).children === "string";

const createInstance: MyConfig["createInstance"] = (
  type: NodeType,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: OpaqueHandle
): Instance => {
  switch (type) {
    case NodeType.view: {
      // TODO check props
      const { border } = props as ViewProps;
      const view: ViewNodeInstance = { tag: type, border, children: [] };
      return view;
    }
    case NodeType.btn: {
      // TODO check props
      const { onClick } = props as ButtonProps;
      const btn: BtnNodeInstance = {
        tag: type,
        onClick,
        id: hostContext.generateId(),
        children: [],
      };
      return btn;
    }
    case NodeType.text: {
      // TODO check props
      const { children, color, type: textType } = props as TextProps;
      //   console.log("createInstance", children);
      //   assert(
      //     typeof children === "string" ||
      //       typeof children === "number" ||
      //       typeof children === "undefined",
      //     "why did we get non literals in here?"
      //   );
      const text: TextNodeInstance = {
        tag: type,
        type: textType,
        color,
        text:
          typeof children === "string" || typeof children === "number"
            ? children
            : undefined,
        children: [],
      };
      return text;
    }
  }
};

const createTextInstance: MyConfig["createTextInstance"] = (
  text: string,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: OpaqueHandle
): TextInstance => {
  return { tag: "raw", text };
};

const appendInitialChild: MyConfig["appendInitialChild"] = (
  parentInstance: Instance,
  child: Instance | TextInstance
): void => {
  //   assert(
  //     parentInstance.tag === NodeType.view,
  //     "cannot add children to text yet"
  //   );
  //   assert(child.tag !== "lingering text", "no free form text yet");
  parentInstance.children.push(child);
};

const finalizeInitialChildren: MyConfig["finalizeInitialChildren"] = (
  parentInstance: Instance,
  type: NodeType,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext
): boolean => {
  return false;
};

const prepareUpdate: MyConfig["prepareUpdate"] = (
  instance: Instance,
  type: NodeType,
  oldProps: Props,
  newProps: Props,
  rootContainerInstance: Container,
  hostContext: HostContext
): null | UpdatePayload => {
  // null if nothing changed
  // here we will return a non null object to always commit a diff
  // TODO actually check that per node type
  return { old: oldProps, new: newProps };
};

const scheduleTimeout: MyConfig["scheduleTimeout"] = setTimeout;
const cancelTimeout: MyConfig["cancelTimeout"] = clearTimeout;

// --------- Mutation ----------------
const appendChild: MyConfig["appendChild"] = (
  parentInstance: Instance,
  child: Instance | TextInstance
): void => {
  parentInstance.children.push(child);
};

const appendChildToContainer: MyConfig["appendChildToContainer"] = (
  container: Container,
  child: Instance | TextInstance
): void => {
  //   assert(child.tag !== "lingering text", "no free form text yet");
  container.children.push(child);
};

const commitUpdate: MyConfig["commitUpdate"] = (
  instance: Instance,
  updatePayload: UpdatePayload,
  type: NodeType,
  oldProps: Props,
  newProps: Props,
  internalInstanceHandle: OpaqueHandle
) => {
  // copy pasted from create instance
  switch (type) {
    case NodeType.btn: {
      // TODO check props
      const { onClick } = newProps as ButtonProps;
      assert(instance.tag === NodeType.btn);
      instance.onClick = onClick;
      break;
    }
    case NodeType.view: {
      // TODO check props
      const { border } = newProps as ViewProps;
      assert(instance.tag === NodeType.view);
      instance.border = border;
      break;
    }
    case NodeType.text: {
      // TODO check props
      const { children, color, type: textType } = newProps as TextProps;

      assert(instance.tag === NodeType.text);

      if (typeof children === "string" || typeof children === "number") {
        instance.text = children;
      }

      instance.color = color;
      instance.type = textType;
      break;
    }
  }
};

const commitTextUpdate: MyConfig["commitTextUpdate"] = (
  textInstance: TextInstance,
  oldText: string,
  newText: string
): void => {
  textInstance.text = newText;
};

const removeChild: MyConfig["removeChild"] = (
  parentInstance: Instance,
  child: Instance | TextInstance
): void => {
  //   assert(
  //     parentInstance.tag === NodeType.view,
  //     "cannot add children to text yet"
  //   );
  //   assert(child.tag !== "lingering text", "no free form text yet");
  parentInstance.children = parentInstance.children.filter((c) => c !== child);
};

const removeChildFromContainer: MyConfig["removeChildFromContainer"] = (
  container: Container,
  child: Instance | TextInstance
): void => {
  //   assert(child.tag !== "lingering text", "no free form text yet");
  container.children = container.children.filter((c) => c !== child);
};
// -------

const config: MyConfig = {
  now,
  getPublicInstance,
  getRootHostContext,
  prepareForCommit,
  resetAfterCommit,
  getChildHostContext,
  shouldSetTextContent,
  createInstance,
  createTextInstance,
  appendChild,
  appendInitialChild,
  appendChildToContainer,
  finalizeInitialChildren,
  prepareUpdate,
  commitUpdate,
  commitTextUpdate,
  removeChild,
  removeChildFromContainer,
  isPrimaryRenderer: true,
  supportsMutation: true,
  supportsHydration: false,
  supportsPersistence: false,
  cancelTimeout,
  scheduleTimeout,
  noTimeout,
};

const reconciler = ReactReconciler(config);

export const WorkerReconciler = {
  render: (
    node: React.ReactNode,
    host: HostContext,
    callback: () => void
  ): Container => {
    const container: Container = {
      hostContext: host,
      children: [],
    };
    const rootFiber = reconciler.createContainer(container, false, false);

    reconciler.updateContainer(node, rootFiber, null, callback);
    return container;
  },
};

// Reconciler.injectIntoDevTools({
//   bundleType: process.env.NODE_ENV === "production" ? 0 : 1,
//   version: "0.1.0",
//   rendererPackageName: "react-like",
// });
