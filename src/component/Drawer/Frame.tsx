import React, { useState } from "react";
import { Group, Rect, Ellipse, Arrow } from "react-konva";
import { useImmer } from "use-immer";

export interface FrameProps {
  children: any;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface State {}

export default function Frame(props: FrameProps) {
  const { children, ...rest } = props;
  const { x, y, width, height } = rest;
  const [{}, updateState] = useImmer<State>({});

  const [resizing, setResizing] = useState(false);
  const [xx, setX] = useState(width - 2);
  const [yy, setY] = useState(height - 2);

  return (
    <Group {...rest} draggable>
      {React.cloneElement(children, { width: xx + 2, height: yy + 2 })}
      <Rect width={xx + 2} height={yy + 2} stroke="blue" opacity={0.5} />
      <Rect
        x={xx}
        y={yy}
        width={4}
        height={4}
        fill="red"
        draggable
        onDragStart={() => {
          setResizing(true);
        }}
        onDragMove={(e) => {
          console.log(e.evt);
          setX(e.target.x());
          setY(e.target.y());
        }}
      />
    </Group>
  );
}
