import "./App.css";
import { QueryClientProvider } from '@tanstack/react-query';
import {BrowserRouter} from "react-router";
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home.js';
import Login from './components/Login/Login.js';
import Signup from './components/Signup/Signup.js'
import Setting from './components/Setting/Setting.jsx';
import Chat from './components/Chat/Chat.jsx';
import { queryClient } from "./hooks/util.js";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>

  );
}

export default App;
