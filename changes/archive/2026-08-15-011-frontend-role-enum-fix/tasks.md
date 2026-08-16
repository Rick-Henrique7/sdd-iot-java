# Change 011 — Tasks

- [ ] 1. Update `frontend-shell/src/types/auth.ts` so
  `UserRole` matches the backend enum literals
  (`ROLE_OPERADOR | ROLE_AGRONOMO | ROLE_GESTOR`).
- [ ] 2. Update `frontend-shell/src/components/auth/AuthForm.tsx`:
  rename `useState` + `as` cast and add the third Select option
  (`ROLE_GESTOR` → "Gestor").
- [ ] 3. Add `frontend-shell/src/lib/formatRole.ts` with the
  `formatRole` helper.
- [ ] 4. Wire `formatRole` into `Sidebar.tsx` and
  `ProfileCard.tsx` so the UI no longer renders `ROLE_*` literals.
- [ ] 5. Update fixtures in `authStore.test.ts` and `api.test.ts`
  to the new enum values.
- [ ] 6. Run `npm test` — must stay at 47/47.
- [ ] 7. Run `npm run build` — must succeed.
- [ ] 8. Commit, push, open PR via GitHub API, squash-merge.
- [ ] 9. Restart `agrio-frontend-shell` container so the new bundle
  is served at `http://localhost:3000`.
- [ ] 10. Smoke-test `/register` end-to-end for all three roles.
- [ ] 11. Archive change to
  `changes/archive/2026-08-15-011-frontend-role-enum-fix/`.
