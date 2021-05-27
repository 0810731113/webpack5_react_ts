import React from 'react';
import Header from 'Components/Header';
import {Route} from 'react-router-dom';
import './App.scss';
import Main from './views/main';

interface IProps {
  name: string;
  age: number;
}

const Index = () => <h1>Index</h1>
// const Main = () => <h1>Main</h1>
const Home = () => <h1>Home</h1>
const About = () => <h1>About</h1>

function App(props: IProps) {
  const { name, age } = props;
  return (
    <div className='app'>
      {/*<Header />*/}
      <span>{`Hello! I'm ${name}, ${age} yearssss old.`}</span>
      <img src={'/web/enterpriseAccount.png'}/>
      <Route path={'/index'} component={Index}/>
      <Route path={'/main'} component={Main}/>
      <Route path={'/home'} component={Home}/>
      <Route path={'/about'} component={About}/>
    </div>
  );
}

export default App;
