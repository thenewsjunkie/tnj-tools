

## Scheduler Module for Studio Screen

Add a new "Scheduler" collapsible module to the Studio Screen that lets you schedule studio actions (switching output layouts, enabling art mode, toggling ads, etc.) on a one-time, daily, weekly, monthly, or recurring basis.

### What You Can Schedule

- **Output layout changes** (switch full-screen module, toggle columns)
- **Art Mode** on/off
- **Ads** on/off
- **TelePrompter** on/off
- Any other studio module toggle

Each scheduled event has: a target action, a schedule type (one-time / daily / weekly / monthly), a time, and an optional label.

### New Database Table: `studio_schedules`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto |
| label | text | Optional friendly name |
| action_type | text | e.g. "set_full_screen", "toggle_art_mode", "toggle_ads" |
| action_payload | jsonb | Parameters for the action (e.g. `{"module": "art-mode"}`) |
| schedule_type | text | "one_time", "daily", "weekly", "monthly" |
| scheduled_time | time | Time of day (HH:MM) |
| scheduled_date | date | For one-time events |
| day_of_week | integer | 0-6, for weekly |
| day_of_month | integer | 1-31, for monthly |
| timezone | text | IANA timezone, default "America/New_York" |
| is_active | boolean | Enable/disable without deleting |
| last_triggered_at | timestamptz | Track last execution |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

RLS: public read, authenticated insert/update/delete (matches existing patterns).

### New Files

1. **`src/components/studio/Scheduler.tsx`** -- The main manager UI
   - Lists all scheduled events in a compact table/list
   - Add/edit dialog with fields for action type, schedule, time, timezone
   - Toggle active/inactive per schedule
   - Delete schedules
   - Uses the same Card + dark gradient styling as other studio modules

2. **`src/hooks/useScheduler.ts`** -- Data hook
   - `useSchedules()` -- fetches from `studio_schedules` with realtime subscription
   - `useCreateSchedule()`, `useUpdateSchedule()`, `useDeleteSchedule()` mutations
   - `useScheduleExecutor()` -- runs on a 1-minute interval, checks if any active schedules match the current time, triggers the corresponding action by updating `system_settings` (same pattern used by Output Control, Ads, Art Mode)

### Integration into Studio Screen

Add a new `CollapsibleModule` in `StudioScreen.tsx`:
```text
<CollapsibleModule id="studio-scheduler" title="Scheduler" defaultOpen={false}>
  <Scheduler />
</CollapsibleModule>
```

### How Scheduled Actions Execute

The `useScheduleExecutor` hook (running in the browser on the Studio Screen page) checks every 60 seconds:
1. Gets all active schedules
2. For each, checks if current time/day matches and hasn't been triggered yet today
3. If matched, performs the action by calling the same mutation hooks (e.g. `useUpdateOutputConfig`, `useUpdateAdsConfig`, `useUpdateArtModeConfig`)
4. Updates `last_triggered_at` to prevent duplicate triggers

This keeps execution client-side (no edge function needed) and reuses all existing config update patterns.

### UI Layout

The add/edit form will include:
- **Label** -- text input
- **Action** -- dropdown (Full Screen Module, Art Mode On/Off, Ads On/Off, Layout Change)
- **Action Details** -- conditional fields based on action type
- **Schedule Type** -- radio/select (One-time, Daily, Weekly, Monthly)
- **Time** -- time picker
- **Date/Day** -- conditional: date picker for one-time, day-of-week for weekly, day-of-month for monthly
- **Timezone** -- select with common timezones
- **Active** -- switch toggle

### Files Changed

| File | Change |
|------|--------|
| `src/components/studio/Scheduler.tsx` | New -- scheduler manager UI |
| `src/hooks/useScheduler.ts` | New -- data hooks + executor |
| `src/pages/Admin/StudioScreen.tsx` | Add Scheduler CollapsibleModule |
| Migration | New `studio_schedules` table with RLS |

