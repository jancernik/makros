<div align="center">

# Makros

**Self-hosted macro and nutrition tracker**

</div>

Yet another project I built for myself :).

I've been doing calisthenics for years, but I never really tracked my food properly, so I decided to give it a shot. Turns out it's kind of annoying ngl. Like a lot of my projects, this started as a spreadsheet, but once it got more complex I started running into its limits.

I briefly looked at some existing trackers, but I like things my own way and, well, I also like building stuff, so I quickly gave up on those and made this instead.

This project is meant to stay simple and flexible. It doesn't force you into a specific workflow, meal plan, or structure. A lot of it is inspired by the spreadsheet setup I was using before, just in a way that's much nicer to use.

**Demo:** [demo.makros.cuasar.cc](https://demo.makros.cuasar.cc) — resets daily, no login required.

> I use this almost exclusively on desktop and haven't really bothered making it look good on mobile. Maybe someday. No promises.

---

## Features

- Create foods with their calories and macros, then use them to build your daily plans.
- Edit, hide, delete, and duplicate foods.
- Set daily calorie and macro goals.
- Track intake in real time against your targets.
- Mark planned foods as eaten or partially eaten.
- Search, reorder, resize, and customize the layout.

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

Clone the repository:

```bash
git clone https://github.com/jancernik/makros.git
cd makros
```

Install dependencies:

```bash
pnpm install
```

Set up environment variables:

```bash
cp .env.example .env.local
```

Create the database and run migrations:

```bash
pnpm db:create
pnpm db:migrate
```

### Development

Start the development server:

```bash
pnpm dev
```

### Production

Build the app and start the production server:

```bash
pnpm build && pnpm start
```

## Database commands

| Command            | Description                             |
| ------------------ | --------------------------------------- |
| `pnpm db:create`   | Create the database                     |
| `pnpm db:drop`     | Drop the database                       |
| `pnpm db:reset`    | Truncate all tables                     |
| `pnpm db:migrate`  | Run migrations                          |
| `pnpm db:generate` | Generate migrations from schema changes |
| `pnpm db:studio`   | Run Drizzle Studio                      |
| `pnpm db:seed`     | Seed sample foods and plans             |
