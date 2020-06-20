declare namespace JSX {
  type TextProps = {
    color?: string;
    type?: "header" | "paragraph" | "span";
    children?: React.ReactNode;
  };

  type ViewProps = {
    border?: number;
    children?: React.ReactNode;
  };

  type ButtonProps = {
    onClick: () => void;
    children?: React.ReactNode;
  };

  interface IntrinsicElements {
    view: ViewProps;
    text: TextProps;
    btn: ButtonProps;
  }
}
