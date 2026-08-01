import './game-id';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { WhosThat } from './WhosThat/WhosThat';
import './WhosThat/WhosThat.less';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><WhosThat /></React.StrictMode>,
);
