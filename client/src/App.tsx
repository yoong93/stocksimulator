import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import * as d3 from 'd3';
import { BrowserRouter as Router, Routes, 
  Route, Link,} from "react-router-dom";
import './App.css';


import LineChart from './view/LineChart';
import Home from './view/Home'
import Chart from './view/Chart'


//import { drawLineProps, ChartDimension, StockChart } from "./view/Chart"
function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/stock" element={<Chart/>} />
        <Route path="/sample" element={<LineChart symbol='IBM'/>}/> 
      </Routes>
    </Router>
    
  );
}





  

export default App;
