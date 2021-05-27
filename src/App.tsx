import React from 'react';
import Header from 'Components/Header';
import {Route} from 'react-router';
import './App.scss';

interface IProps {
  name: string;
  age: number;
}

const Index = () => <h1>Index</h1>
const Main = () => <h1>Main</h1>
const Home = () => <h1>Home</h1>
const About = () => <h1>About</h1>

function App(props: IProps) {
  const { name, age } = props;
  return (
    <div className='app'>
      {/*<Header />*/}
      <span>{`Hello! I'm ${name}, ${age} yearssss old.`}</span>
      <Route path={'/web/index'} component={Index}/>
      <Route path={'/web/main'} component={Main}/>
      <Route path={'/web/home'} component={Home}/>
      <Route path={'/web/about'} component={About}/>
    </div>
  );
}

export default App;
