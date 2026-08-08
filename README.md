💬 FreePrivateChat

«A modern, responsive private chat application built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, and Supabase.»

FreePrivateChat is a web-based private communication platform designed with a clean and responsive user interface. The project demonstrates modern frontend development practices, component-based architecture, TypeScript development, and backend/database integration using Supabase.

---

🚀 Features

- 💬 Private Chat Interface
  Provides a clean interface for private communication.

- 📱 Responsive Design
  Designed to work across desktop, tablet, and mobile screen sizes.

- ⚛️ React-Based Architecture
  Uses reusable React components for better maintainability.

- 🔷 TypeScript Support
  Provides type safety and improved developer experience.

- ⚡ Fast Development with Vite
  Uses Vite for fast development and optimized builds.

- 🎨 Modern UI
  Built with Tailwind CSS and shadcn/ui components.

- ☁️ Supabase Integration
  Uses Supabase for backend and database-related functionality.

- 🧩 Reusable Components
  UI elements are organized into reusable components to simplify development and maintenance.

---

🛠️ Tech Stack

Technology| Purpose
React.js| Frontend UI development
TypeScript| Type-safe application development
Vite| Development server and build tool
Tailwind CSS| Responsive styling
shadcn/ui| Reusable UI components
Supabase| Backend and database services
Git| Version control
GitHub| Source code hosting

---

🏗️ Project Architecture

The application follows a component-based frontend architecture with Supabase providing backend/database services.

                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │                     │
                    │  UI Components      │
                    │  Pages              │
                    │  Chat Interface     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Supabase       │
                    │                     │
                    │  Database           │
                    │  Backend Services   │
                    └─────────────────────┘

High-Level Structure

FreePrivateChat/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── ...
│
├── supabase/
│
├── package.json
├── vite.config.*
├── tailwind.config.*
├── tsconfig.json
└── README.md

---

📸 Screenshots

Add screenshots of your application here to help recruiters quickly understand the project.

Chat Interface

"Chat Interface" (./screenshots/chat-interface.png)

Home / Login Page

"Home Page" (./screenshots/home-page.png)

Mobile View

"Mobile View" (./screenshots/mobile-view.png)

«Note: Create a "screenshots" folder in the repository and place your actual screenshots inside it using the filenames above.»

---

⚙️ Installation & Setup

1. Clone the Repository

git clone https://github.com/krishnatejanagarajupalli1976-debug/FreePrivatechat.git

2. Navigate to the Project

cd FreePrivatechat

3. Install Dependencies

Using npm:

npm install

4. Configure Environment Variables

Create a ".env" file in the project root.

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Replace the values with the credentials from your Supabase project.

«Never commit secret keys or sensitive credentials to GitHub.»

5. Start the Development Server

npm run dev

The application will normally be available at:

http://localhost:5173

---

🔧 Available Scripts

# Start development server
npm run dev

# Create production build
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

---

🔐 Security Considerations

FreePrivateChat is designed with privacy in mind.

For production deployment, additional security measures should be implemented and reviewed, including:

- Proper authentication and authorization
- Supabase Row Level Security (RLS)
- Secure environment-variable management
- Input validation and sanitization
- Protection against unauthorized database access
- Appropriate access policies for chat data

---

📈 Future Enhancements

The project can be extended with additional communication and collaboration features.

Planned Features

- 🔐 User authentication and registration
- 👤 User profiles and profile pictures
- 🟢 Online/offline user status
- ⌨️ Typing indicators
- ✔️ Message delivery and read receipts
- 📨 Message notifications
- 🖼️ Image and file sharing
- 🔎 Message search
- 🗑️ Delete/edit messages
- 🌙 Dark/light theme customization
- 👥 Group conversations
- 🔒 End-to-end encryption
- 📱 Progressive Web App (PWA) support
- 🔔 Real-time push notifications

---

🎯 Learning Outcomes

This project helped develop practical experience with:

- React component development
- TypeScript
- Modern frontend architecture
- Responsive web design
- Tailwind CSS
- Reusable UI components
- Supabase integration
- Database-driven applications
- Environment configuration
- Git and GitHub workflow
- Modern JavaScript/TypeScript tooling

---

🌐 Live Demo

«Add your deployed application URL here after deployment.»

Live Demo: "Coming Soon"

---

📂 Repository

GitHub:
https://github.com/krishnatejanagarajupalli1976-debug/FreePrivatechat

---

👨‍💻 Author

Krishna Teja Nagarajupalli

Computer Science / Engineering Student | Software Developer

---

⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

📄 License

This project is intended for educational and development purposes. Add an appropriate open-source license such as MIT if you want others to freely use, modify, and distribute the project.# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
