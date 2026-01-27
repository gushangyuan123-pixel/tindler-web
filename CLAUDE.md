# About Me

- **Name:** Darwin
- **Role:** Student at UC Berkeley
- **Currently Taking:** CS61A
- **Current Project:** Tindler - a cross between Tinder and LinkedIn (professional networking meets matching/swiping)

# Project: tindler-web

- **Repo:** https://github.com/gushangyuan123-pixel/tindler-web
- **Branch:** master

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Deployment:** Netlify (frontend), Railway (backend)

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Build for production (runs tsc + vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

# Preferences

<!-- Add any coding style preferences or conventions here -->

---

# BC Coffee Chat Module

## Overview
A matching system for Berkeley Consulting where applicants can connect with BC members for coffee chats. Each applicant gets one coffee chat opportunity.

## Backend Stack
- **Framework:** Django 5 + Django REST Framework
- **Database:** PostgreSQL
- **Auth:** Google OAuth via django-allauth (restricted to @berkeley.edu)
- **Location:** `tindler-web/backend/`

## Backend Commands
```bash
cd backend
venv\Scripts\activate
python manage.py runserver    # Start server on port 8000
python manage.py makemigrations
python manage.py migrate
```

## Production URLs
- **Frontend:** https://icelatte.co (Netlify)
- **Backend API:** https://api.icelatte.co (Railway)
- **Django Admin:** https://api.icelatte.co/admin/
- **Frontend Admin Panel:** https://icelatte.co/admin

## Admin Access
- **Django Admin:** https://api.icelatte.co/admin/
- **Superuser:** garv.agarwal.in@berkeley.edu
- To make someone admin: set `is_staff=True` in Django admin

## BC Member Invite System
- **Invite URL:** `https://icelatte.co/bc/join?code=garvisawesome`
- **Env var:** `BC_INVITE_CODE` in Railway (default: `garvisawesome`)
- Share this link ONLY with actual BC members (it's the secret registration link)

## Key Features
- Google OAuth restricted to @berkeley.edu emails
- Login auto-redirects to Google (no role selection needed)
- BC members self-register via secret invite link
- Applicants: Freshman, Sophomore, Junior, Senior only
- Matches require admin confirmation before messaging is enabled
- Applicants can only have one confirmed match

---

# BC Coffee Chat - Status & Remaining Tasks

## Completed
- [x] Google OAuth setup (restricted to @berkeley.edu)
- [x] Frontend deployed to Netlify (icelatte.co)
- [x] Backend deployed to Railway (api.icelatte.co)
- [x] Domain configured (icelatte.co + api.icelatte.co)
- [x] SSL certificates provisioned
- [x] BC member invite code system working
- [x] Login auto-redirects to Google
- [x] Profile page scroll fixes for smaller screens

## Remaining Tasks

### High Priority
1. **Set up Garv as admin** - Set `is_staff=True` in Django admin so he can access admin panel

### Nice to Have
- Email notifications on match confirmation & new messages
- Photo upload to cloud storage (currently uses URL)
- Password reset, profile editing, analytics
