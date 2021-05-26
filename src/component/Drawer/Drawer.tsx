import { Button, Radio } from "antd";
import React, { useRef } from "react";
import { Image, Layer, Stage } from "react-konva";
import useImage from "use-image";
import { useImmer } from "use-immer";
import Circle from "./Circle";
import {
  CanvasCircle,
  CanvasElement,
  CanvasElementType,
  CanvasRect,
} from "./model";
import Rect from "./Rect";
import Text from "./Text";

export interface DrawerProps {}

export interface State {
  elements: CanvasElement[];
  drawingElementId: string;
  selectedElementId: string;
  selectedElementType: CanvasElementType;
}

export default function Drawer(props: DrawerProps) {
  const {} = props;
  const [
    { elements, drawingElementId, selectedElementId, selectedElementType },
    updateState,
  ] = useImmer<State>({
    elements: [],
    drawingElementId: "",
    selectedElementId: "",
    selectedElementType: CanvasElementType.circle,
  });
  const stageRef = useRef<any>(null);
  const [image] = useImage(
    "https://img13.360buyimg.com/n1/s450x450_jfs/t1/109767/14/2766/381310/5e0af390Eaf72e06b/8fe872c0a173bfd5.jpg",
  );

  function updateSelectedElementId(id: string) {
    updateState((draft) => {
      draft.selectedElementId = id;
    });
  }

  function downloadURI(uri: any, name: any) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <h1>Drawer{selectedElementId}</h1>

      <div>
        <Radio.Group
          onChange={(e) => {
            updateState((draft) => {
              draft.selectedElementType = e.target.value;
            });
          }}
          value={selectedElementType}
        >
          <Radio value={CanvasElementType.none}>点选</Radio>
          <Radio value={CanvasElementType.circle}>圆形</Radio>
          <Radio value={CanvasElementType.rect}>方形</Radio>
          <Radio value={CanvasElementType.text}>文字</Radio>
        </Radio.Group>
        <Button
          onClick={() => {
            const dataURL = stageRef.current!.toDataURL();
            console.log(dataURL);
            downloadURI(dataURL, "drawer");
          }}
        >
          保存
        </Button>
        <Button
          onClick={() => {
            const text = window.prompt("text")!;
            updateState((draft) => {
              draft.elements.push({
                id: "111",
                type: CanvasElementType.text,
                config: {
                  text,
                  fontSize: 25,
                  fill: "red",
                },
              });
            });
          }}
        >
          增加文字
        </Button>
        {!!selectedElementId && (
          <Button
            type="primary"
            danger
            onClick={() => {
              updateState((draft) => {
                draft.elements = draft.elements.filter(
                  (e) => e.id !== selectedElementId,
                );
                draft.selectedElementId = "";
              });
            }}
          >
            删除选中元素
          </Button>
        )}
      </div>
      <Stage
        ref={stageRef}
        x={0}
        y={0}
        width={450}
        height={450}
        onClick={() => updateSelectedElementId("")}
      >
        <Layer
          x={0}
          y={0}
          width={450}
          height={450}
          onMouseDown={(e: any) => {
            updateState((draft) => {
              const id = `${new Date().getTime()  }`;
              if (selectedElementType === CanvasElementType.circle) {
                draft.elements.push({
                  id,
                  type: CanvasElementType.circle,
                  config: {
                    isSelected: false,
                    x: e.evt.layerX,
                    y: e.evt.layerY,
                    radius: 0,
                    stroke: "red",
                    strokeHitEnabled: true,
                  },
                });
                draft.drawingElementId = id;
              } else if (selectedElementType === CanvasElementType.rect) {
                draft.elements.push({
                  id,
                  type: CanvasElementType.rect,
                  config: {
                    x: e.evt.layerX,
                    y: e.evt.layerY,
                    stroke: "red",
                  },
                });
                draft.drawingElementId = id;
              } else if (selectedElementType === CanvasElementType.text) {
              }
            });
          }}
          onMouseMove={(e: any) => {
            updateState((draft) => {
              const props = draft.elements.find(
                (e) => e.id === draft.drawingElementId,
              );
              if (props) {
                if (props.type === CanvasElementType.circle) {
                  props.config.radius = Math.abs(
                    e.evt.layerX - props.config.x!,
                  );
                }
                if (props.type === CanvasElementType.rect) {
                  props.config.width = e.evt.layerX - props.config.x!;
                  props.config.height = e.evt.layerY - props.config.y!;
                }
              }
            });
          }}
          onMouseUp={(e) => {
            updateState((draft) => {
              draft.drawingElementId = "";
              draft.selectedElementType = CanvasElementType.none;
            });
          }}
        >
          {/* <Image image={image} /> */}
          <Rect width={450} height={450} />
          {elements
            .filter((e) => e.type === CanvasElementType.circle)
            .map((d) => (
              <Circle
                id={d.id}
                {...(d as CanvasCircle).config}
                draggable
                strokeWidth={selectedElementId === d.id ? 5 : 2}
                onClick={(e) => {
                  if (selectedElementId === d.id) {
                    updateSelectedElementId("");
                  } else {
                    updateSelectedElementId(d.id);
                  }
                  e.cancelBubble = true;
                }}
              />
            ))}
          {elements
            .filter((e) => e.type === CanvasElementType.rect)
            .map((d) => (
              <Rect
                {...(d as CanvasRect).config}
                draggable
                strokeWidth={selectedElementId === d.id ? 5 : 2}
                onClick={(e) => {
                  if (selectedElementId === d.id) {
                    updateSelectedElementId("");
                  } else {
                    updateSelectedElementId(d.id);
                  }
                  e.cancelBubble = true;
                }}
              />
            ))}
          {elements
            .filter((e) => e.type === CanvasElementType.text)
            .map((d) => (
              <Text
                {...(d as CanvasRect).config}
                draggable
                strokeWidth={selectedElementId === d.id ? 5 : 2}
                onClick={(e) => {
                  if (selectedElementId === d.id) {
                    updateSelectedElementId("");
                  } else {
                    updateSelectedElementId(d.id);
                  }
                  e.cancelBubble = true;
                }}
              />
            ))}
        </Layer>
      </Stage>
    </div>
  );
}
