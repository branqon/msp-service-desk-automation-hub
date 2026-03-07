# Screenshot Capture Notes

This folder now includes real product screenshots generated from the seeded local app. Refresh them whenever the UI changes materially.

Recommended captures:

1. `dashboard.png`
   Capture the main dashboard with metrics, charts, and recent high-risk tickets visible.
2. `tickets-workbench.png`
   Capture the queue workbench with the list on the left and a selected ticket detail panel on the right.
3. `approvals-center.png`
   Capture the approvals page with at least one pending approval card and one historical decision.
4. `automation-opportunities.png`
   Capture the opportunity matrix with the highest-fit category in view.

Refresh workflow:

1. Run `npm run setup`
2. Run `npm run build`
3. Run `npm run start -- --hostname 127.0.0.1 --port 3000`
4. Capture desktop screenshots at roughly `1440x1024`
5. Replace the PNGs in this folder and keep the README image paths aligned with the filenames above
