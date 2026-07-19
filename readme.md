# AION 2K26 Website

Frontend repository for **AION 2K26**, an inter-collegiate technical symposium organized by the Department of Artificial Intelligence, St. Joseph's College (Autonomous), Tiruchirappalli.

## Tech Stack
- HTML5
- CSS3 + Tailwind CSS (CDN)
- Vanilla JavaScript
- SweetAlert2 (CDN)

## Main Pages
- `/home/runner/work/AION/AION/index.html` – Landing page
- `/home/runner/work/AION/AION/about.html` – About page
- `/home/runner/work/AION/AION/register.html` – Registration status/page
- `/home/runner/work/AION/AION/login.html` – Student leader login
- `/home/runner/work/AION/AION/dashboard.html` – Team dashboard
- `/home/runner/work/AION/AION/brochure.html` – Brochure placeholder

## Admin Pages
- `/home/runner/work/AION/AION/admin/loginAdmin.html`
- `/home/runner/work/AION/AION/admin/moderateAdmin.html`
- `/home/runner/work/AION/AION/admin/superAdmin.html`

## Project Structure
```text
/home/runner/work/AION/AION
├── index.html
├── about.html
├── register.html
├── login.html
├── dashboard.html
├── brochure.html
├── admin/
├── js/
├── CSS/
└── Images/
```

## Local Development
This is a static frontend project, so no build step is required.

1. Open the project folder in your editor.
2. Run a local static server from the repository root (example):
   - `python3 -m http.server 5500`
3. Visit:
   - `http://localhost:5500/index.html`

## API Integration
Frontend API calls are configured in JavaScript files (example: `/home/runner/work/AION/AION/js/loginApi.js`) and currently use:
- `https://sjcaisymposium.onrender.com`

Update API base URLs in `js/` files if backend endpoints change.

## Notes
- Registrations are currently shown as closed in the UI.
- No repository-level lint/build/test scripts are currently configured.
