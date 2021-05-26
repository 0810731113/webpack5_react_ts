import { CircleConfig } from "konva/types/shapes/Circle";
import React from "react";
import { Circle as KCircle, Group, KonvaNodeEvents } from "react-konva";
import { useImmer } from "use-immer";

export interface CircleProps extends CircleConfig, KonvaNodeEvents {}

export interface State {}

export default function Circle(props: CircleProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});

  return (
    <Group>
      <KCircle {...props} />
    </Group>
  );
}
