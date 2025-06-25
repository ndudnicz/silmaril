# 🔐 Silmaril

**Silmaril** is a zero-knowledge, open-source password manager. Security is at the heart of its design: your data remains **encrypted locally**, and **nothing is ever stored in plaintext** on any remote server.

---

## 🚀 Features

- **Zero-knowledge encryption**: only the user with the master password can decrypt the data.
- **Secure password generator**: create strong, customizable passwords.
- **Import/export feature**: import / export data from a csv file (**coming soon**)

---

## ⚙️ Stack

- Front: Angular 19 / Material
- Api: .net 8 / Entity Framework
- Database: MariaDB

---

## 📦 Installation & Run

Dockerization **coming soon**

```bash
# setup local database (⚠️ for test and dev purpose, do not use it as production database ⚠️)
# requirement : docker
./api/Api/Database/create.sh
./api/Api/Database/run.sh

# front
cd front
npm install
npm start
# running on http://localhost:4200

# api
cd api/Api
export Jwt__SecretKeyBase64='your-jwt-secret-key-base64'
export Jwt__ValidIssuer='valid-issuer'
export Jwt__ValidAudience='valid-audience'
dotnet run
# running on http://localhost:5000
```

---

## 🧱 Architecture & Security

- User password hashed using Argon2id [https://en.wikipedia.org/wiki/Argon2](https://en.wikipedia.org/wiki/Argon2)
- Authentication using JWT signed with HS256
- The master password never leaves your device
- Keys derived from master password on client side using PBKDF2
- The backend can only see the encrypted data
- AES-256-GCM encryption for data entries

---

## 📚 Contributing

#### Contributions are welcome!
- Fork the repo
- Create a feature/bug branch
- Submit a Pull Request
- Follow code style and security best practices

---

## 🧾 License

This project is released under the [MIT License](LICENSE).

---
## 🧠 Roadmap
- 🎨 Desktop & mobile GUI
- 🌍 Import/export to other managers (KeePass, Bitwarden…)
- 🧑‍🤝‍🧑 Multi-user collaboration with encrypted sharing