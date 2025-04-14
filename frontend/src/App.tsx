import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, CSSReset, theme } from '@chakra-ui/react';

// Layout components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';

// Pages
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import DomainsPage from './pages/DomainsPage';
import DomainDetailsPage from './pages/DomainDetailsPage';
import DNSManagementPage from './pages/DNSManagementPage';
import DNSRecordsPage from './pages/DNSRecordsPage';
import LoginPage from './pages/LoginPage';

// Context
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <AuthenticatedApp />
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

const AuthenticatedApp: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="content-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailsPage />} />
            <Route path="/domains" element={<DomainsPage />} />
            <Route path="/domains/:id" element={<DomainDetailsPage />} />
            <Route path="/dns" element={<DNSManagementPage />} />
            <Route path="/dns/:zoneName" element={<DNSRecordsPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default App;
