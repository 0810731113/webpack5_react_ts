import { CircleProps } from "./Circle";
import { RectProps } from "./Rect";
import { TextProps } from "./Text";
import { LineProps } from "./Line";

export interface CanvasElementBase {
  id: string;
  type: CanvasElementType;
}

export interface CanvasCircle extends CanvasElementBase {
  id: string;
  type: CanvasElementType.circle;
  config: CircleProps;
}

export interface CanvasRect extends CanvasElementBase {
  id: string;
  type: CanvasElementType.rect;
  config: RectProps;
}

export interface CanvasLine extends CanvasElementBase {
  id: string;
  type: CanvasElementType.line;
  config: LineProps;
}

export interface CanvasText extends CanvasElementBase {
  id: string;
  type: CanvasElementType.text;
  config: TextProps;
}

export enum CanvasElementType {
  none = "none",
  line = "line",
  circle = "circle",
  rect = "rect",
  text = "text",
}

export type CanvasElement = CanvasCircle | CanvasRect | CanvasLine | CanvasText;
