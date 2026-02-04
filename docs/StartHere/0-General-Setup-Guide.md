# 🚀 Engineering Onboarding: Start Here

Welcome to the team! This document will help you get your local environment running and explain how we build software using **React, Node, Mantine, TypeScript, Storybook, Postgres, and pnpm.**
This is meant to act as a Guide and General overview of getting started with web develop.
---

## 📺 1. Required Training Videos
Watch these in order to understand our specific workflow. If you can't fit them all in then watch
* How to use Chrome
* React, Node, Postgress
* Postgres and SQL Basics

### Phase 1: The Basics
* **[How to use Chrome DevTools](https://www.youtube.com/watch?v=hJxVi0BDMxM)** (Essential for debugging React and Network requests)
* **[VS Code Setup for Productive Devs](https://www.youtube.com/watch?v=1qCAd3pOHNE)** (Settings and extensions we use)

### Phase 2: The Stack
* **[The React, Node, Postgres](http://www.youtube.com/watch?v=gTD8b5Yxuuo)** - The complete guide to connecting Postgres, Express, React, and Node.
* **[pnpm & Monorepos Explained](https://www.youtube.com/watch?v=KIgPJT806D0)** (Why we don't use `npm` and how folders are linked)
* **[Mantine UI Crash Course](https://www.youtube.com/watch?v=ndSshXG6H-8)** (How to use our component library)
* **[Storybook in 6 Minutes](https://www.youtube.com/watch?v=1vS2S_vA3B4)** (Building UI in isolation)
* **[TypeScript for React Developers](https://www.youtube.com/watch?v=GGli3uBqUts)** (Understanding types in a monorepo)

### Phase 3: The Data
* **[Postgres & SQL Basics](https://www.youtube.com/watch?v=SpfIwlAYaKk)** (How to view your data using a GUI)

---

## 🏗 2. The Monorepo Structure
We use a monorepo, which means our entire stack lives in this single repository.

* **/apps/web**: The React frontend (Mantine + Vite).
* **/apps/api**: The Node.js backend (Express/Fastify + Postgres).
* **/packages/ui**: Shared Mantine components & custom theme.
* **/packages/types**: Shared TypeScript interfaces used by both Frontend and Backend.



---

## 📦 3. pnpm: Our Package Manager
We use `pnpm` because it is faster and more disk-efficient than npm. 

### ⚠️ The Golden Rules
1. **Never use `npm install`**. It will break the `pnpm-lock.yaml` file.
2. **Run commands from the root**. Use the `--filter` flag to target specific apps.

### Common Commands
| Command | What it does |
| :--- | :--- |
| `pnpm install` | Installs all dependencies for the whole repo. |
| `pnpm dev` | Starts the dev server for everything (Web, API, Storybook). |
| `pnpm add <pkg> --filter web` | Adds a library specifically to the React app. |
| `pnpm add <pkg> --filter api` | Adds a library specifically to the Node backend. |

---

## 🛠 4. Tooling & Setup

### VS Code Recommended Extensions
* **Error Lens**: Displays TypeScript errors inline (essential for catching bugs early).
* **Prettier**: Ensures your code matches our style.
* **ESLint**: Catches syntax and logical errors.
* **Console Ninja**: Shows `console.log` output directly in your editor.

---

## 🆘 5. Troubleshooting (Read this before panicking!)

### "I have red squiggly lines everywhere in VS Code"
* **Fix**: Press `Cmd/Ctrl + Shift + P` and select **"TypeScript: Restart TS Server"**. This usually fixes 90% of "fake" errors in a monorepo.

### "pnpm install is failing / Lockfile conflicts"
* **Fix**: If you have a git merge conflict in `pnpm-lock.yaml`:
  1. Accept whatever changes are there (Incoming or Current).
  2. Run `pnpm install` at the root. pnpm will automatically "heal" the file.

### "I changed code in /packages/types but the Frontend doesn't see it"
* **Fix**: Shared packages often need to be built. Run `pnpm build` from the root or restart your dev server so the symlinks update.

### "Module not found: Can't resolve '...'"
* **Fix**: You likely installed a package in the root but tried to use it in `apps/web`. You must install it specifically for that app: `pnpm add <package> --filter web`.

---

## 🏁 Next Steps
1. Run `pnpm install`.
2. Run `pnpm dev`.
3. Open `localhost:3000` (App) and `localhost:6006` (Storybook).
4. Check the `README.md` inside `apps/web` for your first task!
