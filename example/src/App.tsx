import '@livekit/react-components/dist/index.css';
import React from 'react';
import { RoomPage } from './RoomPage';

const App = () => {
  return (
    <div className="container">
      <React.StrictMode>
        <RoomPage />
      </React.StrictMode>
    </div>
  );
};

export default App;
