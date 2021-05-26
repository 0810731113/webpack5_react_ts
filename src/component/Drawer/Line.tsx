import { LineConfig } from "konva/types/shapes/Line";
import React from "react";
import { Group, KonvaNodeEvents, Line as KLine } from "react-konva";
import { useImmer } from "use-immer";

export interface LineProps extends LineConfig, KonvaNodeEvents {}

export interface State {}

export default function Line(props: LineProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});

  return (
    <Group>
      <KLine {...props} />
    </Group>
  );
}
