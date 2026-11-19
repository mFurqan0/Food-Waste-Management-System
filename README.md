# Smart Mess

A web app for hostel and college messes. Students mark whether they will eat or skip each meal before the cutoff. Admins see how many people are expected, plan the menu, and log food waste. The goal is to cook closer to real demand and reduce food waste.

It is built with free tools and runs on a free hosting tier (Vercel and Neon).

## Features

### Student side (mobile-first)

- **Today's meals:** breakfast, lunch and dinner, with the menu for each.
- **Going or Skipping:** one tap per meal. Changes lock automatically at the cutoff time.
- **Logging streak:** how many days in a row you answered every meal.
- **Impact:** estimated food saved and points earned from meals you skipped, for the last 7 days.
- **Leaderboard:** the top 10 students by points over the last 7 days, with your rank always visible.

### Admin side (desktop dashboard)

- **Dashboard:** key numbers for today, live headcount for each meal, today's menu, and a 14-day waste chart.
- **Daily menu:** edit the menu for any date and meal. Enter one item per line.
- **Waste log:** record waste in kg for each meal, with an optional "prepared kg" to calculate waste percentage. Recent entries can be deleted.
- **Analytics:** waste trends over 7, 14 or 30 days, a share-by-meal chart, and a daily total chart.
- **Light and dark themes** throughout.

## Tech stack

| Part | Tool |
|---|---|
| Framework | Next.js 14 (App Router) with TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide |
| Validation | Zod |
| Database | PostgreSQL |
| ORM | Prisma |
| Passwords | bcryptjs |
| Tests | Vitest |
| Hosting | Vercel (app) and Neon (database) |

## Project structure

```
prisma/
  schema.prisma          database tables
  migrations/            database change history
  seed.ts                demo users, menus, attendance and waste data
middleware.ts            sends visitors without a session to /login
src/
  app/
    page.tsx             home page
    login/               sign-in page
    (student)/student/   student app
    (admin)/admin/       admin dashboard, menu, waste log, analytics
  components/
    admin/               admin cards, charts, forms, sidebar
    student/             meal cards, streak, impact, leaderboard, bottom nav
    auth/                login form and sign-out button
    charts/              Recharts components
    ui/                  shared buttons, fields, cards
  lib/                   rules and helpers: cutoff time, dates, streak, validation, tokens
  server/
    actions/             server actions (save menu, log waste, set attendance, login)
    services/            business logic and database queries
    db.ts                database connection
    session.ts           login sessions and role checks
  styles/globals.css     colour theme tokens
```

The code is split into layers. Pages and components never run database queries directly. They call server actions or services, and services are the only code that talks to the database.

## Running it on your computer

You need Node.js 18.17 or newer (20 LTS recommended), npm, and Docker (for the local database).

```bash
# 1. Install packages
npm install

# 2. Create a local .env file from the example, then edit it
cp .env.example .env
#    Generate a session secret and put it in SESSION_SECRET:
#    openssl rand -base64 32

# 3. Start PostgreSQL in Docker
npm run db:up

# 4. Create the tables
npx prisma migrate dev

# 5. Load demo data
npm run db:seed

# 6. Start the app
npm run dev
```

Then open http://localhost:3000.

## Environment variables

| Name | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Local: the Docker URL. Production: the Neon connection string. |
| `SESSION_SECRET` | Yes | Signs login sessions. Must be at least 32 characters. |
| `MESS_TIMEZONE` | No | Timezone for meal times and "today". Default: `Asia/Karachi`. |

Never commit `.env`. It is excluded in `.gitignore`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm start` | Run the production build |
| `npm run test` | Run unit tests |
| `npm run typecheck` | Check TypeScript types without building |
| `npm run db:up` | Start PostgreSQL in Docker |
| `npm run db:migrate` | Apply schema changes in development |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Open Prisma Studio to browse the database |

## Demo logins

After seeding, all accounts use the password `password123`.

| Role | Email |
|---|---|
| Admin | `admin@mess.local` |
| Student | `ali@mess.local` (also `sara@mess.local`, `ahmed@mess.local`, `hina@mess.local`) |

Change these passwords before using the app with real people.

## How the main rules work

**Cutoff.** Each meal has a start time and a cutoff, set in the `MealSetting` table. For example, lunch starts at 12:30 with a 90-minute cutoff, so changes lock at 11:00. The server checks the cutoff on every change, so editing the page cannot bypass it.

**Headcount prediction.** Expected people = going + pending × the going rate. The going rate is calculated from people who have already answered. For example, 30 going, 10 skipping and 10 pending gives 30 + 10 × 0.75 ≈ 38. If nobody has answered yet, the app assumes 80%.

**Impact and points.** A skipped meal counts toward impact only after its cutoff passes. Each skipped meal earns a fixed estimate of food saved and points. These values are set in `src/lib/impact.ts`. They are estimates, not measured weights.

**Streak.** Counts days in a row where every meal was answered. If today is not finished yet, the streak carries over from yesterday.

**Leaderboard.** Ranks students by points over the last 7 days.

**Waste log.** Saving the same date and meal again updates the existing entry instead of creating a duplicate.

## Login and security

- Passwords are hashed with bcrypt.
- Sessions are stored in a signed, httpOnly cookie that expires after 7 days.
- Each request checks the user's role in the database. Students cannot open admin pages or run admin actions, and admins cannot open the student app.
- A wrong email and a wrong password return the same message and take the same time to reject.

## Deployment (free)

1. **Database:** create a project at neon.tech and copy the pooled and direct connection strings.
2. **Tables and demo data:** with `DATABASE_URL` set to the direct Neon string, run `npx prisma migrate deploy` and then `npm run db:seed`.
3. **Code:** push to GitHub. `.env` is not uploaded.
4. **Hosting:** import the repo in Vercel. Set `DATABASE_URL` (use the pooled string), `SESSION_SECRET` and `MESS_TIMEZONE`, then deploy.

Migrations are not run automatically on deploy. Run `npx prisma migrate deploy` against Neon whenever the schema changes.

## Known limitations

- **Demo passwords** are public in this README. Change them before real use.
- **No password reset or account creation screens.** Admins add students through the database or a seed script for now.
- **No login rate limiting.** Repeated wrong passwords are not blocked.
- **Sign-out only clears the browser cookie.** A copied cookie stays valid until it expires.
- **Impact values are estimates.** The kg and points per skipped meal are fixed numbers, not measured waste.
- **Students can only set meals up to 7 days ahead.** Only today's meals appear on the student home page.
- **Neon's free database sleeps when idle.** The first load after a quiet period can take a few seconds.
- **Vercel's Hobby plan is for personal, non-commercial use.**

## Possible next steps

- Admin screens to create students and reset passwords.
- Tomorrow's meals on the student home page.
- Rate limiting on login.
- Measured waste per student instead of fixed estimates.
- Export of waste and headcount reports as CSV.

## License

Add a license before sharing the repository publicly.