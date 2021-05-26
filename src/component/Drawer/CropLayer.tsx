import {
  BorderOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteFilled,
  DragOutlined,
  FontSizeOutlined,
  LineOutlined,
  Loading3QuartersOutlined,
} from "@ant-design/icons";
import { Input, Popconfirm, Popover } from "antd";
import Konva from "konva";
import { KonvaEventObject } from "konva/types/Node";
import { trim } from "lodash";
import React, { useRef } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { useRecoilState } from "recoil";
import cropImageState from "state/crop-image.state";
import { useImmer } from "use-immer";
import Circle from "./Circle";
import "./CropLayer.scss";
import Line from "./Line";
import { GithubPicker } from "react-color";
import {
  CanvasCircle,
  CanvasElement,
  CanvasElementType,
  CanvasLine,
  CanvasRect,
  CanvasText,
} from "./model";
import GRect from "./Rect";
import Text from "./Text";

export interface CropLayerProps {
  width: number;
  height: number;
  onCrop: (
    position: {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    },
    drawLayer: string,
  ) => void;
}

export interface State {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  elements: CanvasElement[];
  drawingElementId: string;
  selectedElementId: string;
  selectedElementType: CanvasElementType;
  draggable: boolean;
  editingText: string;
  color: string;
  showColorPicker?: boolean;
}

const selectorBorderColor = "#13c2c2";
export default function CropLayer(props: CropLayerProps) {
  const { width, height, onCrop } = props;
  const [state, setState] = useRecoilState(cropImageState);
  const layerRef = useRef<Konva.Layer>(null);
  const [
    {
      startX,
      startY,
      endX,
      endY,
      elements,
      drawingElementId,
      selectedElementId,
      selectedElementType,
      draggable,
      editingText,
      showColorPicker,
      color,
    },
    updateState,
  ] = useImmer<State>({
    startX: 100,
    startY: 100,
    endX: width - 100,
    endY: height - 100,
    elements: [],
    drawingElementId: "",
    selectedElementId: "",
    selectedElementType: CanvasElementType.circle,
    draggable: false,
    editingText: "",
    color: "#DB3E00",
  });

  function setSelectedElementId(id: string) {
    updateState((draft) => {
      draft.selectedElementId = id;
    });
  }

  function setSelectedElementType(type: CanvasElementType) {
    updateState((draft) => {
      draft.selectedElementType = type;
    });
  }

  function className(type: CanvasElementType) {
    return selectedElementType === type ? `${type} active` : type;
  }

  function handleSelect(id: string) {
    return (e: KonvaEventObject<MouseEvent>) => {
      if (selectedElementId === id) {
        setSelectedElementId("");
      } else {
        setSelectedElementId(id);
      }
      e.cancelBubble = true;
    };
  }

  return (
    <div className="crop-layer">
      <Stage width={width} height={height}>
        <Layer
          clipFunc={(ctx) => {
            ctx.fillStyle = "grey";
            ctx.beginPath();
            ctx.rect(startX, startY, endX - startX, endY - startY);
            ctx.rect(width, 0, 0 - width, height);
            ctx.closePath();
          }}
        >
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="rgba(0,0,0,0.3)"
          />
        </Layer>
        <Layer>
          <Rect
            x={startX}
            y={startY}
            width={endX - startX}
            height={endY - startY}
            stroke={selectorBorderColor}
            strokeWidth={2}
          />
        </Layer>
        <Layer
          ref={layerRef}
          onMouseDown={(e: any) => {
            if (draggable) return;
            updateState((draft) => {
              const id = `${new Date().getTime()  }`;
              if (selectedElementType === CanvasElementType.circle) {
                console.log(e);
                draft.elements.push({
                  id,
                  type: CanvasElementType.circle,
                  config: {
                    isSelected: false,
                    x: e.evt.layerX,
                    y: e.evt.layerY,
                    radius: 0,
                    stroke: color,
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
                    stroke: color,
                  },
                });
                draft.drawingElementId = id;
              } else if (selectedElementType === CanvasElementType.line) {
                draft.elements.push({
                  id,
                  type: CanvasElementType.line,
                  config: {
                    points: [e.evt.layerX, e.evt.layerY],
                    stroke: color,
                  },
                });
                draft.drawingElementId = id;
              }
            });
          }}
          onMouseMove={(e: any) => {
            if (draggable) return;
            updateState((draft) => {
              const props = draft.elements.find(
                (e) => e.id === draft.drawingElementId,
              );
              if (props) {
                if (props.type === CanvasElementType.circle) {
                  props.config.radius = Math.abs(
                    e.evt.layerX - props.config.x!,
                  );
                } else if (props.type === CanvasElementType.rect) {
                  props.config.width = e.evt.layerX - props.config.x!;
                  props.config.height = e.evt.layerY - props.config.y!;
                } else if (props.type === CanvasElementType.line) {
                  const {points} = props.config;
                  if (points.length === 2) {
                    points.push(e.evt.layerX, e.evt.layerY);
                  } else {
                    points[2] = e.evt.layerX;
                    points[3] = e.evt.layerY;
                  }
                }
              }
            });
          }}
          onMouseUp={(e) => {
            if (draggable) return;
            updateState((draft) => {
              draft.drawingElementId = "";
              // draft.selectedElementType = CanvasElementType.none;
            });
          }}
        >
          <Rect
            x={startX}
            y={startY}
            width={endX - startX}
            height={endY - startY}
            fill="rgba(0,0,0,0)"
          />

          {elements.map((d) => {
            switch (d.type) {
              case CanvasElementType.line: {
                return (
                  <Line
                    {...(d as CanvasLine).config}
                    draggable={draggable}
                    onClick={handleSelect(d.id)}
                  />
                );
              }
              case CanvasElementType.rect: {
                return (
                  <GRect
                    {...(d as CanvasRect).config}
                    draggable={draggable}
                    strokeWidth={selectedElementId === d.id ? 5 : 2}
                    onClick={handleSelect(d.id)}
                  />
                );
              }
              case CanvasElementType.circle: {
                return (
                  <Circle
                    id={d.id}
                    {...(d as CanvasCircle).config}
                    draggable={draggable}
                    strokeWidth={selectedElementId === d.id ? 5 : 2}
                    onClick={handleSelect(d.id)}
                  />
                );
              }
              case CanvasElementType.text: {
                return (
                  <Text
                    {...(d as CanvasText).config}
                    draggable={draggable}
                    strokeWidth={selectedElementId === d.id ? 5 : 2}
                    onClick={handleSelect(d.id)}
                  />
                );
              }
              default:
                return null;
            }
          })}
        </Layer>
        <Layer>
          <Rect
            x={startX - 3}
            y={startY - 3}
            width={8}
            height={8}
            stroke={selectorBorderColor}
            fill="#fff"
            draggable
            onMouseDown={(e) => {
              e.cancelBubble = true;
            }}
            onDragMove={(e) => {
              e.cancelBubble = true;
              const evt = e.evt as any;
              updateState((draft) => {
                draft.startX = evt.layerX;
                draft.startY = evt.layerY;
              });
            }}
          />
          <Rect
            x={endX - 3}
            y={endY - 3}
            width={8}
            height={8}
            stroke={selectorBorderColor}
            fill="#fff"
            draggable
            onMouseDown={(e) => {
              e.cancelBubble = true;
            }}
            onDragMove={(e) => {
              e.cancelBubble = true;
              const evt = e.evt as any;
              updateState((draft) => {
                draft.endX = evt.layerX;
                draft.endY = evt.layerY;
              });
            }}
          />
        </Layer>
      </Stage>
      <div className="command">
        <span
          className={className(CanvasElementType.line)}
          onClick={() => setSelectedElementType(CanvasElementType.line)}
        >
          <span>
            <LineOutlined size={48} />
          </span>
        </span>
        <span
          className={className(CanvasElementType.rect)}
          onClick={() => setSelectedElementType(CanvasElementType.rect)}
        >
          <BorderOutlined size={48} />
        </span>
        <span
          className={className(CanvasElementType.circle)}
          onClick={() => setSelectedElementType(CanvasElementType.circle)}
        >
          <Loading3QuartersOutlined size={48} />
          <Loading3QuartersOutlined
            size={48}
            style={{ transform: "rotate(90deg)" }}
          />
        </span>
        <Popconfirm
          icon={<FontSizeOutlined />}
          title={
            <Input
              placeholder="请输入文字"
              value={editingText}
              onChange={(e) => {
                const text = e.target.value;
                updateState((draft) => {
                  draft.editingText = text;
                });
              }}
            />
          }
          onConfirm={() => {
            updateState((draft) => {
              draft.elements.push({
                id: `${new Date().getTime()  }`,
                type: CanvasElementType.text,
                config: {
                  x: startX,
                  y: startY,
                  text: trim(editingText),
                  fontSize: 22,
                  fill: color,
                },
              });
              draft.draggable = true;
            });
          }}
        >
          <span
          // className={className(CanvasElementType.text)}
          // onClick={() => setSelectedElementType(CanvasElementType.text)}
          >
            <FontSizeOutlined size={48} />
          </span>
        </Popconfirm>
        <span>
          <Popover
            overlayClassName="color-picker"
            visible={showColorPicker}
            content={
              <GithubPicker
                triangle="hide"
                styles={{ default: { card: { boxShadow: "none" } } }}
                onChange={(result) => {
                  updateState((draft) => {
                    draft.color = result.hex;
                    draft.showColorPicker = false;
                  });
                }}
              />
            }
          >
            <span
              style={{
                backgroundColor: color,
                width: 16,
                height: 16,
                borderRadius: 16,
              }}
              onClick={() => {
                updateState((draft) => {
                  draft.showColorPicker = true;
                });
              }}
             />
          </Popover>
        </span>
        <span
          className={draggable ? "active" : ""}
          onClick={() => {
            updateState((draft) => {
              draft.draggable = !draft.draggable;
            });
          }}
        >
          <DragOutlined size={48} />
        </span>
        <span
          onClick={() => {
            updateState((draft) => {
              draft.elements = draft.elements.filter(
                (e) => e.id !== selectedElementId,
              );
              draft.selectedElementId = "";
            });
          }}
        >
          <DeleteFilled size={48} />
        </span>
        <span
          onClick={() => {
            const dataURL = layerRef.current!.toDataURL({
              x: startX,
              y: startY,
              width: endX - startX,
              height: endY - startY,
            });
            onCrop({ startX, startY, endX, endY }, dataURL);
          }}
        >
          <CheckOutlined size={48} />
        </span>
        <span
          onClick={() => {
            setState((state) => ({
              ...state,
              cropping: false,
              // croppedDataURL: null,
            }));
          }}
        >
          <CloseOutlined size={48} />
        </span>
      </div>
    </div>
  );
}
