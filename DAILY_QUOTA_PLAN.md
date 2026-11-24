# Plan: show the daily summary quota in the UI

Scope: UI only (`ui/`). The API side is finished and deployed separately. Do not change anything in `api/`.

## What the API already does

`POST /summaries` (see `api/src/types/api.ts`, `CreateSummaryResponse`) now returns:

```json
{ "jobId": "...", "documentId": "...", "status": "queued", "dailyLimit": 5, "dailyUsed": 1, "dailyRemaining": 4 }
```

- Limits: 5 per day for normal users, 50 for users in the Cognito `admin` group. The server decides this; the UI never sends or computes the limit.
- The quota day is the **UTC** calendar day, so it resets at 00:00 UTC (05:30 IST).
- When the user is already at the limit, the API answers **HTTP 429** with
  `{ "message": "Daily summary limit reached.", "code": "DAILY_SUMMARY_LIMIT_REACHED" }`. No job is created.
- A repeat request for a job that is already running returns that job and the current quota **without** using up another summary, so `dailyUsed` may stay the same.
- **There is no `GET` endpoint for the quota.** The UI only learns it from a `POST /summaries` response or a 429. Before the first summary in a session, the quota is unknown. Don't invent a number; show nothing until it's known.

## Files involved

- `src/lib/api/types.ts`: API shapes
- `src/lib/api/client.ts`: `createSummary` (line ~58) and `getErrorMessage` (line ~75)
- `src/components/document-ai/document-ai-app.tsx`: `handleGenerate`, the "Generate summary" button, and the `ErrorAlert` for job errors
- `src/components/document-ai/error-alert.tsx`: reused as is

## Steps

### 1. Types (`src/lib/api/types.ts`)
Add:
```ts
/** Daily summary quota returned by POST /summaries (UTC day). */
export interface DailyQuota {
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
}

/** Response of POST /summaries */
export interface CreateSummaryResponse extends DailyQuota {
  jobId: string;
  documentId: string;
  status: JobStatus;
}
```

### 2. API client (`src/lib/api/client.ts`)
- Change `createSummary` to return the whole `CreateSummaryResponse` instead of only `jobId`.
- Add an exported helper that detects the limit error:
  ```ts
  export const DAILY_LIMIT_CODE = "DAILY_SUMMARY_LIMIT_REACHED";
  export function isDailyLimitError(error: unknown): boolean {
    return axios.isAxiosError(error)
      && error.response?.status === 429
      && (error.response.data as { code?: string } | undefined)?.code === DAILY_LIMIT_CODE;
  }
  ```
- Leave `getErrorMessage` unchanged.

### 3. Reset-time helper (new file `src/lib/quota.ts`)
- `utcDay(now = new Date())` returns `now.toISOString().slice(0, 10)`, the same day key the API uses.
- `nextQuotaReset(now = new Date())` returns a `Date` for the next 00:00 UTC.
- `formatQuotaReset(now = new Date())` formats that time in the **user's local timezone** with `toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })`. In India this shows "5:30 AM". Don't hard-code IST.

### 4. State in `document-ai-app.tsx`
- Add `const [quota, setQuota] = useState<DailyQuota | null>(null);`
- Add `const [limitReachedOn, setLimitReachedOn] = useState<string | null>(null);`, the UTC day on which a 429 was received.
- Derive `const limitReached = limitReachedOn === utcDay() || (quota?.dailyRemaining === 0 && quotaDay === utcDay());`. Store the UTC day alongside `quota` (for example `quotaDay` state set in the same place) so a quota from yesterday doesn't block today.
- In `handleGenerate`:
  - On success: `const res = await createSummary(documentId, style); setQuota(res); setQuotaDay(utcDay()); setJobId(res.jobId); await waitForResult(res.jobId);`
  - In `catch`: if `isDailyLimitError(error)`, call `setLimitReachedOn(utcDay())`, set `quota` to `{ ...quota, dailyUsed: quota.dailyLimit, dailyRemaining: 0 }` if a quota is known, set `quotaDay`, and set `jobError` to a **limit-specific message** (step 6). Otherwise keep the existing `setJobError(getErrorMessage(error))`.
- Update `canGenerate`: `uploadStatus === "uploaded" && !isProcessing && !limitReached`.

### 5. Quota line under the button
Below the "Generate summary" button, next to the existing "Upload a document to get started." hint, show one small muted line (`text-center text-xs text-muted-foreground`, matching the existing hint):
- If quota is known and not at the limit: **"3 of 5 summaries left today"** (`dailyRemaining` of `dailyLimit`; write "1 summary" for one).
- At the limit: **"Daily limit reached. Resets at 5:30 AM."** using `formatQuotaReset()`.
- If quota is unknown: render nothing.
Keep it plain text; don't add a progress bar or a new component unless it stays this small.

### 6. "Limit reached" error state
When the 429 happens, show the existing `ErrorAlert` with:
- title: `"Daily limit reached"`
- message: ``You've used all ${limit ?? ""} summaries for today. You can create more after ${formatQuotaReset()}.`` (drop the number when the limit is unknown)
- **No "Try again" action.** It would just return 429 again. No "Check again" either, because no job was created.

The normal error path keeps its current title and actions. Pass `actions` conditionally rather than making a second alert component.

### 7. Reset when the day or user changes
- `limitReached` is computed from today's UTC day on every render, so it clears after 00:00 UTC once the component re-renders (any interaction). A timer isn't needed.
- On sign-out or user change, clear `quota`, `quotaDay` and `limitReachedOn`. Check `src/components/auth/auth-provider.tsx` for how the current user is exposed. If the app already remounts on sign-out, nothing extra is needed. Verify which.

## Out of scope (don't do)
- No changes in `api/`.
- No `localStorage` for the quota. The server is the source of truth, and a stale cached count is worse than none.
- Don't send `isAdmin`, `dailyLimit` or `userId` from the UI. The API ignores them anyway.

## Verification
1. `npm run lint` and `npm run build` must pass. The UI has no test runner, so don't add one for this.
2. Manual test against the local API (`api/`: `npm run offline`, port 4000) as a normal user:
   - Generate a summary: the line shows "4 of 5 summaries left today".
   - Hit the limit quickly by running, in the local Postgres:
     `UPDATE user_summary_usage SET summary_count = 5 WHERE usage_date = CURRENT_DATE;`
     (`usage_date` is a UTC day. Run this after the first summary so the row exists, and make sure the DB session's `CURRENT_DATE` matches the UTC day, or use the literal date.)
   - Generate again: the "Daily limit reached" alert appears with the local reset time and no Try again button, the Generate button is disabled, and the line says "Daily limit reached. Resets at …".
   - Reload the page: the quota line is gone (unknown) and the button is enabled. Clicking it returns the 429 state again. This is expected, since there's no GET endpoint.
3. Optional: an `admin`-group user sees "49 of 50" after one summary.

## Delete this file before committing.
