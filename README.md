# 💬 Customer Assistant Chat Demo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-000?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-38b2ac?logo=tailwind-css)](https://tailwindcss.com/)
[![Coze API](https://img.shields.io/badge/API-Coze-blue?logo=coze)](https://www.coze.cn)

> A modern, responsive web chat app using the Coze API – with real-time messaging, streaming replies, and persistent conversation history.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [⚙️ Configuration](#️-configuration)
- [💡 Usage](#-usage)
- [🔌 API Endpoints](#-api-endpoints)
- [❓ FAQ](#-faq)
- [🛠️ Tech Stack](#️-tech-stack)
- [📄 License](#-license)

---

## ✨ Features

- ⚡ Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- 🧠 Chat with Coze agents using real-time streaming responses
- 💾 Auto-saves conversations for seamless chat continuity
- 🔐 Securely stores API credentials in-browser
- 📱 Responsive UI for mobile, tablet, and desktop
- 🌍 Supports static export & deployment

---

## 🚀 Installation

### Requirements

- Node.js ≥ 18.0.0

### Steps

```bash
git clone https://github.com/KyoTranKMA/customer-support-ui-demo.git
cd customer-support-ui-demo

pnpm install
pnpm dev         # Start development
pnpm build       # Build for production (static files in /out)
```

## 🔌 API Endpoints

This app uses the following Coze API endpoints:

| Endpoint                                  | Description                            |
|-------------------------------------------|----------------------------------------|
| `POST /v3/chat`                           | Send message & receive streaming reply |
| `GET /v1/conversation/retrieve`           | Get session metadata                   |
| `GET /v1/conversation/message/list`       | Fetch session message history          |

📚 See full API documentation at [Coze Developer Docs](https://www.coze.cn/docs)

---

## ❓ FAQ

### ❌ Can't connect to Coze API?
- Check if your API Key is correct and has required permissions
- Ensure your network connection is stable

### 📩 Message sending failed?
- Double-check your Agent ID
- Make sure the agent is active and your key hasn't expired

### 🕓 Message history not loading?
- Ensure you have `Conversation Management` and `Messages` permissions
- Confirm session ID is valid
- Try refreshing or reconfiguring API credentials

---

## 🛠️ Tech Stack

- **[Next.js](https://nextjs.org/)** – React Framework
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** – Accessible UI Components
- **[Lucide Icons](https://lucide.dev/)** – Clean SVG Icon Set

---

## 📄 License

MIT © [KyoTranKMA](https://github.com/KyoTranKMA)
