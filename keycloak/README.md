Tavl Keycloak Theme
====================

This directory contains a minimal custom Keycloak login theme that matches Tavl’s brand, while keeping the default behavior and security of the built‑in login flows.

What’s included
- Theme name: `Tavl` (login)
- Theme name: `Tavl Account` (account console v3)
- Inherits: `keycloak` (login), `keycloak.v3` (account v3)
- Files: `login/theme.properties`, `login/resources/css/tavl.css`, `account-v3/theme.properties`, `account-v3/resources/css/tavl-account.css`

How it works
- The docker-compose service `keycloak` mounts `./keycloak/themes` into `/opt/keycloak/themes` inside the container.
- Keycloak picks up the theme automatically; you only need to select it per realm.

Enable the theme
1) Deploy / restart keycloak via docker-compose so the volume is mounted.
2) In Admin Console → Realm Settings → Themes:
   - Login Theme: `Tavl`
   - Account Theme: `Tavl Account`
3) Save. Open the login page to verify styling.

Customization tips
- Adjust colors in `login/resources/css/tavl.css` and `account-v3/resources/css/tavl-account.css` to match your palette.
- For deeper login layout changes, copy templates (e.g. `login.ftl`) from the base into `login/` and edit.
- Account Console v3 is a React app; you typically customize via CSS variables and overrides. Heavy structural overrides are not recommended.

Troubleshooting
- If the theme doesn’t appear in the dropdown, confirm the volume is mounted:
  - Exec into the container and check `/opt/keycloak/themes/tavl/login/theme.properties` exists.
- Clear browser cache or do a hard refresh if updates don’t show immediately.
