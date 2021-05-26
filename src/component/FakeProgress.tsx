import { Progress } from "antd";
import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import { ProgressProps } from "antd/es/progress";

export interface FakeProgressProps extends ProgressProps {
  step?: number;
  completed: boolean;
  onCompleted: () => void;
}

export interface State {
  percent: number;
}

export default function FakeProgress(props: FakeProgressProps) {
  const { step, completed, onCompleted, ...rest } = props;
  const [{ percent }, updateState] = useImmer<State>({
    percent: 0,
  });

  useEffect(() => {
    if (completed) {
      updateState((draft) => {
        draft.percent = 100;
      });
      setTimeout(() => {
        onCompleted();
      }, 2000);
    }
  }, [completed]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateState((draft) => {
        if (draft.percent < 90) {
          draft.percent += (step ?? 2);
        } else {
          onCompleted();
        }
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Progress
      type="circle"
      format={(percent) => <span>{percent}</span>}
      width={20}
      strokeWidth={50}
      strokeLinecap="butt"
      showInfo
      percent={percent}
      {...rest}
    />
  );
}
