import React from 'react';
import Header from 'Components/Header';
import './index.scss';
import {Route,Switch,withRouter} from 'react-router-dom';
import { useRouteMatch } from "react-router";

interface IProps {
  name: string;
  age: number;
}

// const Index = () => <h1>Index</h1>
const A = () => <h1>AAAAA</h1>
const B = () => <h1>BBBB</h1>
const C = () => <h1>CCCC</h1>

function Index(props: IProps) {
  const {
    url,
    path,
    isExact,
    params: { projectId },
  } = useRouteMatch();
  const { name, age } = props;
  return (
    <div className='app'>
     <h2>我是mainPage</h2>
      <Switch>
        <Route path={`${path}/1`} component={A}/>
        <Route path={`${path}/2`} component={B}/>
        <Route path={`${path}/3`} component={C}/>
      </Switch>
    </div>
  );
}

export default Index;
