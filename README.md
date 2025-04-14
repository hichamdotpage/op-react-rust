# Openprovider Domain Management System

A comprehensive domain management system built with React (TypeScript) and Rust, utilizing the Openprovider API.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=flat&logo=rust&logoColor=white)

## Overview

This project provides a complete domain management solution for resellers using the Openprovider platform. It features a modern, user-friendly React frontend and a powerful Rust backend that communicates with the Openprovider API.

## Features

- **Customer Management**
  - Create and manage customer handles
  - Search and filter customers
  - Handle TLD-specific additional data requirements

- **Domain Management**
  - Check domain availability across multiple TLDs
  - Register domains with all necessary contact data
  - Transfer domains with authentication codes
  - Manage domain settings (nameservers, contacts, etc.)
  - Renew domains and retrieve/reset auth codes

- **DNS Management**
  - Create and delete DNS zones
  - Add, edit, and remove DNS records
  - Support for all record types (A, AAAA, MX, CNAME, TXT, etc.)
  - DNSSEC support

## Architecture

The system follows a client-server architecture:

- **Frontend**: React with TypeScript, Chakra UI for components, and React Router for navigation
- **Backend**: Rust with Actix Web for the HTTP server, communicating with the Openprovider API

## Screenshots

*Coming soon*

## Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Rust 1.60+ and Cargo
- An Openprovider reseller account

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/hichamelhafedhh/openprovider-domain-management.git
   cd openprovider-domain-management/backend
   ```

2. Create a `.env` file with your Openprovider credentials:
   ```
   OPENPROVIDER_API_URL=https://api.openprovider.eu/v1beta
   OPENPROVIDER_USERNAME=your_username
   OPENPROVIDER_PASSWORD=your_password
   SERVER_HOST=127.0.0.1
   SERVER_PORT=8080
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```

3. Build and run the backend:
   ```bash
   cargo build --release
   cargo run --release
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file to configure the API endpoint:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Log in with your Openprovider credentials
3. Navigate through the interface to manage customers, domains, and DNS settings

## Development

### Frontend Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Shared components
│   │   ├── customers/    # Customer management components
│   │   ├── domains/      # Domain management components
│   │   └── dns/          # DNS management components
│   ├── pages/            # Page components
│   ├── api/              # API client
│   ├── context/          # React context for state management
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── index.tsx         # Application entry point
└── package.json          # Frontend dependencies
```

### Backend Structure

```
backend/
├── src/
│   ├── api/              # Openprovider API client
│   ├── handlers/         # Request handlers
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   └── main.rs           # Application entry point
└── Cargo.toml            # Rust dependencies
```

## API Endpoints

The backend provides the following API endpoints:

- **Authentication**
  - `POST /api/auth/login` - Authenticate with Openprovider credentials

- **Customers**
  - `GET /api/customers` - List customers with optional filtering
  - `POST /api/customers` - Create a new customer
  - `GET /api/customers/{handle}` - Get customer details
  - `PUT /api/customers/{handle}` - Update customer information
  - `DELETE /api/customers/{handle}` - Delete a customer

- **Domains**
  - `POST /api/domains/check` - Check domain availability
  - `GET /api/domains` - List domains with optional filtering
  - `POST /api/domains` - Register a new domain
  - `POST /api/domains/transfer` - Transfer a domain
  - `GET /api/domains/{id}` - Get domain details
  - `PUT /api/domains/{id}` - Update domain settings
  - `GET /api/domains/{id}/authcode` - Get domain auth code
  - `POST /api/domains/{id}/authcode/reset` - Reset domain auth code
  - `POST /api/domains/{id}/renew` - Renew a domain

- **DNS**
  - `GET /api/dns/zones` - List DNS zones
  - `POST /api/dns/zones` - Create a DNS zone
  - `GET /api/dns/zones/{name}` - Get DNS zone details
  - `PUT /api/dns/zones/{name}` - Update DNS zone records
  - `DELETE /api/dns/zones/{name}` - Delete a DNS zone

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Hicham El Hafed - [@hichamelhafedhh](https://github.com/hichamelhafedhh) - hicham.elhafed@example.com

Project Link: [https://github.com/hichamelhafedhh/openprovider-domain-management](https://github.com/hichamelhafedhh/openprovider-domain-management)

## Acknowledgements

- [Openprovider API Documentation](https://docs.openprovider.com/)
- [React](https://reactjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Rust](https://www.rust-lang.org/)
- [Actix Web](https://actix.rs/)
