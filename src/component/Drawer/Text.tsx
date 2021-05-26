import { TextConfig } from "konva/types/shapes/Text";
import React from "react";
import { Group, KonvaNodeEvents, Text as KText } from "react-konva";
import { useImmer } from "use-immer";

export interface TextProps extends TextConfig, KonvaNodeEvents {}

export interface State {}

export default function Text(props: TextProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});

  return (
    <Group>
      <KText {...props} />
    </Group>
  );
}
