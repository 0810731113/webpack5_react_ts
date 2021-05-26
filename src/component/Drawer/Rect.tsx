import { RectConfig } from "konva/types/shapes/Rect";
import React from "react";
import { Group, KonvaNodeEvents, Rect as KRect } from "react-konva";
import { useImmer } from "use-immer";

export interface RectProps extends RectConfig, KonvaNodeEvents {}

export interface State {}

export default function Rect(props: RectProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});

  return (
    <Group>
      <KRect {...props} />
    </Group>
  );
}
