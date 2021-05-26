import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";

interface IframeProps {
  scrolling: "no" | "auto" | "yes";
  onLoad: () => void;
  src: string;
}

interface State {}

export default function Iframe(props: IframeProps) {
  // const {} = props;
  const [{}, updateState] = useImmer<State>({});

  return <iframe {...props} />;
}
