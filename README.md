# Passy - Secure Local Password Manager

<div align="center">

![Passy Logo](https://img.shields.io/badge/Passy-Password%20Manager-blue?style=for-the-badge&logo=key&logoColor=white)

**A modern, secure, and completely offline password manager built with Electron and React.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-40.0.0-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Features](#features) • [Installation](#installation) • [Security](#security) • [Usage](#usage) • [Development](#development)

</div>

---

## Why Passy?

In an era where password breaches are commonplace and cloud-based password managers can be targets for attacks, **Passy** offers a refreshingly simple approach: **your passwords never leave your computer**.

- **100% Offline** - No cloud sync, no servers, no accounts to create
- **Zero Knowledge** - Your master password is never stored anywhere
- **Local Encryption** - Military-grade AES-256-GCM encryption
- **Open Source** - Fully auditable codebase

---

## Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Password Storage** | Store website credentials with URL, username, and password |
| **SSH Keys** | Securely store SSH private/public key pairs with passphrases |
| **Server Credentials** | Save server access details (SSH, RDP, VNC, FTP) with auto-generated SSH commands |
| **Secure Notes** | Encrypted notes for sensitive information |
| **API Keys** | Store API credentials with service name, key, secret, and endpoint |

### Security Features

- **AES-256-GCM Encryption** - Industry-standard authenticated encryption
- **Argon2id Key Derivation** - Memory-hard password hashing resistant to GPU attacks
- **Auto-Lock** - Automatically locks after 5 minutes of inactivity
- **Clipboard Auto-Clear** - Sensitive data cleared from clipboard after 30 seconds
- **No Telemetry** - Zero data collection or tracking

### User Experience

- **Modern UI** - Clean, intuitive interface built with React and Tailwind CSS
- **Dark/Light/System Themes** - Choose your preferred appearance
- **Collapsible Sidebar** - Maximize your workspace
- **Quick Search** - Instantly find any credential
- **Password Generator** - Create strong passwords with customizable options
- **Categories** - Organize secrets into custom folders
- **Favorites** - Quick access to frequently used items
- **One-Click Copy** - Copy any field to clipboard instantly

---

## Installation

### Download

Download the latest release for your platform:

| Platform | Download |
|----------|----------|
| Windows | [Passy 1.0.0.exe](https://github.com/avihaymenahem/Passy/releases/latest) |

### System Requirements

- **Windows** 10 or later (64-bit)
- **RAM** 4GB minimum
- **Storage** 200MB free space

---

## Security

### Encryption Details

Passy uses a multi-layered security approach:

```
Master Password
      ↓
   Argon2id (memory-hard KDF)
      ↓
   256-bit Encryption Key
      ↓
   AES-256-GCM Encryption
      ↓
   Encrypted SQLite Database
```

#### Key Derivation (Argon2id)
- **Memory Cost**: 64 MB
- **Time Cost**: 3 iterations
- **Parallelism**: 4 threads
- **Salt**: 16 bytes (cryptographically random)

#### Encryption (AES-256-GCM)
- **Key Size**: 256 bits
- **IV/Nonce**: 12 bytes (unique per encryption)
- **Authentication Tag**: 128 bits

### What's Stored?

| Data | Storage Method |
|------|---------------|
| Master Password | **Never stored** - only used to derive encryption key |
| Encryption Salt | Stored in plain text (safe - useless without master password) |
| Secrets | Encrypted with AES-256-GCM |
| Categories | Encrypted with AES-256-GCM |

### Data Location

All data is stored locally in your user data directory:
- **Windows**: `%APPDATA%\passy\`

---

## Usage

### First Launch

1. **Create Master Password** - Choose a strong master password (minimum 12 characters)
   - Must include: uppercase, lowercase, numbers, and special characters
   - This password cannot be recovered if forgotten!

2. **Start Adding Secrets** - Click "New" to add your first credential

### Adding Credentials

#### Passwords
Store website login credentials with:
- Name (required)
- Website URL
- Username/Email
- Password (use the generator for strong passwords!)
- Notes

#### SSH Keys
Store SSH key pairs with:
- Name (required)
- Key Type (RSA, ED25519, ECDSA, DSA)
- Private Key (required)
- Public Key
- Passphrase
- Notes

#### Servers
Store server access details with:
- Name (required)
- Hostname (required)
- Port
- Protocol (SSH, RDP, VNC, FTP, Other)
- Username
- Password
- Notes
- Auto-generated SSH command for quick copying!

#### Secure Notes
Store any sensitive text:
- Name (required)
- Content (required)

#### API Keys
Store API credentials with:
- Name (required)
- Service Name
- API Key (required)
- API Secret
- Endpoint URL
- Notes

### Organizing Secrets

- **Categories** - Create custom folders to organize secrets
- **Favorites** - Star important items for quick access
- **Search** - Use the search bar to find any secret instantly
- **Filter by Type** - Click on sidebar items to filter by secret type

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | Focus search bar and start typing |
| Lock Vault | Click lock button in sidebar |

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or later
- [npm](https://www.npmjs.com/) 9.x or later

### Setup

```bash
# Clone the repository
git clone https://github.com/avihaymenahem/Passy.git
cd passy

# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, start Electron
npm run electron:dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run electron:dev` | Start Electron in development mode |
| `npm run electron:build` | Build and package for distribution |
| `npm run lint` | Run ESLint |

### Tech Stack

| Technology | Purpose |
|------------|---------|
| [Electron](https://www.electronjs.org/) | Desktop application framework |
| [React](https://reactjs.org/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Vite](https://vitejs.dev/) | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | SQLite database |
| [Lucide React](https://lucide.dev/) | Icon library |

### Project Structure

```
passy/
├── electron/              # Electron main process
│   ├── main.ts           # Main entry point
│   ├── preload.ts        # Preload script (IPC bridge)
│   ├── database.ts       # SQLite database operations
│   └── crypto.ts         # Encryption/decryption utilities
├── src/                   # React frontend
│   ├── components/       # React components
│   │   ├── auth/        # Authentication screens
│   │   ├── layout/      # Layout components
│   │   ├── secrets/     # Secret management
│   │   ├── shared/      # Shared components
│   │   └── ui/          # UI components
│   ├── stores/          # Zustand state stores
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
├── scripts/              # Build scripts
└── release/             # Built executables
```

---

## Roadmap

- [ ] macOS support
- [ ] Linux support
- [ ] Import from other password managers
- [ ] Export functionality
- [ ] Browser extension
- [ ] Biometric unlock (Windows Hello)
- [ ] Multiple vaults
- [ ] Password health check
- [ ] Breach detection (Have I Been Pwned integration)

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Electron](https://www.electronjs.org/) for making cross-platform desktop apps possible
- [Tailwind CSS](https://tailwindcss.com/) for the amazing utility-first CSS framework
- [Lucide](https://lucide.dev/) for the beautiful icons
- The open-source community for inspiration and tools

---

<div align="center">

**Made with security in mind**

If you find Passy useful, please consider giving it a star on GitHub!

</div>
