# AION 2K26 Website

Frontend repository for **AION 2K26**, an inter-collegiate technical symposium organized by the Department of Artificial Intelligence, St. Joseph's College (Autonomous), Tiruchirappalli.

## Tech Stack
- HTML5
- CSS3 + Tailwind CSS (CDN)
- Vanilla JavaScript
- SweetAlert2 (CDN)

## Main Pages
- `index.html` – Landing page
- `about.html` – About page
- `register.html` – Registration status/page
- `login.html` – Student leader login
- `dashboard.html` – Team dashboard
- `brochure.html` – Brochure placeholder

## Admin Pages
- `/admin/loginAdmin.html`
- `/admin/moderateAdmin.html`
- `/admin/superAdmin.html`

## Project Structure
```text
/AION
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

## Notes
- Registrations are currently shown as closed in the UI.
- No repository-level lint/build/test scripts are currently configured.
