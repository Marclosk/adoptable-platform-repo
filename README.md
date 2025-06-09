# Adoptable Platform

[![Backend CI](https://github.com/Marclosk/adoptable-platform-repo/actions/workflows/ci.yml/badge.svg?branch=main&event=push&job=backend)](https://github.com/Marclosk/adoptable-platform-repo/actions/workflows/ci.yml?query=branch%3Amain)
[![codecov](https://codecov.io/gh/Marclosk/adoptable-platform-repo/graph/badge.svg?token=C7BFL33079)](https://codecov.io/gh/Marclosk/adoptable-platform-repo)

A platform designed to streamline and manage the pet adoption process through a robust and containerized web application.

---

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)
- [License](#license)

---

## Introduction

Adoptable Platform is a web-based solution for managing adoptable pets, built with containerized microservices architecture. This system aims to simplify the process of matching pets with adopters, ensuring a seamless and scalable experience.

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Marclosk/adoptable-platform-repo.git
   cd adoptable-platform-repo
   ```

2. **Edit your hosts file:**

   To ensure correct database resolution, add the following entry to your system's `hosts` file:

   ```
   127.0.0.1    db
   ```

   - On Windows: `C:\Windows\System32\drivers\etc\hosts`
   - On Linux/macOS: `/etc/hosts`

3. **Start the application using Docker:**
   From the root of the project, run:

   ```bash
   .\start.bat
   ```

---

## Usage

Once the services are up and running, the platform will be available locally. You can access the front-end and back-end APIs and begin development, testing, or contributing.

---

## Features

- Containerized deployment using Docker
- Modular services with clear separation
- Automated CI/CD with GitHub Actions
- Code coverage integrated via Codecov

---

## Configuration

Configuration variables are managed via the `.env` file at the root of the project. You can also use `envVars.ps1` for setting environment variables in PowerShell.

---

## Dependencies

- Docker & Docker Compose
- Git
- PowerShell (for Windows environments)
- `.env` configuration support

---

## Troubleshooting

- **Database not resolving:** Ensure you have correctly added `127.0.0.1    db` to your hosts file.
- **Docker startup issues:** Check Docker is installed and running. Run the batch file from PowerShell with administrative rights if needed.

---

## Contributors

- [Marclosk](https://github.com/Marclosk) - Maintainer

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.
