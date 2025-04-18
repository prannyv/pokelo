// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ComparisonView from './components/ComparisonView';
import CardListView from './components/CardListView';
import './App.css';

// NavLink component to highlight active route
const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <li>
      <Link to={to} className={isActive ? 'active-link' : ''}>
        {children}
      </Link>
    </li>
  );
};

const AppContent = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Pokémon Card Elo Ranker</h1>
        <nav>
          <ul>
            <NavLink to="/">Compare Cards</NavLink>
            <NavLink to="/rankings">View Rankings</NavLink>
          </ul>
        </nav>
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<ComparisonView />} />
          <Route path="/rankings" element={<CardListView />} />
        </Routes>
      </main>
      
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;