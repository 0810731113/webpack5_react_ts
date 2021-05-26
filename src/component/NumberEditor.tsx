import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { InputNumber } from "antd";
import "./NumberEditor.scss";

interface NumberEditorProps {
  label?: string;
  value: number;
  onChange: (val: number) => void;
  onBlur?: (val: number) => void;
  step?: number;
  precision?: number;
  addonBefore?: string;
  addonAfter?: string;
  width?: number;
  disabled?: boolean;
}

interface State {}

export default function NumberEditor(props: NumberEditorProps) {
  const {
    value,
    onChange,
    onBlur,
    addonBefore,
    addonAfter,
    step,
    precision,
    label,
    width,
    disabled,
  } = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {}, []);

  const toNumber = (val: string | number | undefined): number => {
    if (val === undefined) return 0;
    return typeof val === "string" ? parseFloat(val) || 0 : val;
  };

  const renderEditor = () => (
    <div className="input-number-wrapper">
      {addonBefore && (
        <span className="ant-input-group-addon">{addonBefore}</span>
      )}

      <InputNumber
        step={step ?? 1}
        size="small"
        value={value}
        precision={precision}
        onChange={(val) => onChange(toNumber(val || undefined))}
        onBlur={(e) => {
          onBlur?.(toNumber(e.target.value));
        }}
        disabled={disabled}
      />

      {addonAfter && (
        <span className="ant-input-group-addon">{addonAfter}</span>
      )}
    </div>
  );

  if (label) {
    return (
      <div className="num-editor">
        <div className="attr-name">{label}</div>
        <div className="attr-value" style={{ width: width ?? 100 }}>
          {renderEditor()}
        </div>
      </div>
    );
  }
  return renderEditor();
}
