# Decisions

- 2026-10-03: User acts as relay to Antigravity. Controller saves verbatim reports,
  verifies them, updates CURRENT STATE and commits docs automatically while executor
  is idle. Reason: remove manual project bookkeeping from the user.
- 2026-10-03: User saying "đạt" authorizes the phase acceptance tag p<N>-ok;
  "tiếp" authorizes the next phase prompt after verification. An executor PASS alone
  authorizes neither. Reason: keep acceptance and advancement explicit.
- 2026-10-03: Record P0 only as user-reported PASS at dd7f391 because its full report
  was not supplied. Keep the original P1 report separate from controller findings.