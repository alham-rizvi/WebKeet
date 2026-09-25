# Expand WebKeet for production

## What will change
- Keep the existing WebKeet design and content, then expand the desktop and mobile navigation with Labs, Categories, Learn Paths, Guide, Hall of Fame, About, and Contact.
- Rework the signed-in dashboard into a responsive workspace with current streak, points, completion progress, category progress, recent activity, an active-lab panel, and personalized “Recommended today” labs based on unfinished beginner-friendly work.
- Add dedicated Guide, Categories, About, and Contact pages with useful, original copy and unique search/social metadata.
- Add an original secure-login 3D illustration to the right side of the home introduction. This avoids copying or hotlinking the referenced PNGTree artwork while preserving its visual idea and keeping the site safer to publish.
- Complete the production-facing footer and legal coverage, including the existing terms, privacy, cookies, acceptable-use, disclosure, disclaimer, and credits links.

## Dynamic behavior
- Calculate streak from real completion dates, including current and longest streak.
- Recommend unfinished labs, prioritizing approachable labs and categories the learner has already started.
- Show category completion from the live lab catalog and the learner’s verified completions.
- Keep all signed-in data protected and loaded from Lovable Cloud.

## Validation and readiness
- Check every public page and dashboard at desktop and mobile sizes.
- Verify sign-in state, dashboard loading, navigation, and key links.
- Run the project’s security/readiness checks and clearly report what is complete, what remains mocked, and whether the site is published.
- Real lab launch remains blocked until a provisioning service address and access token are supplied; no fake lab URL will be shown.
