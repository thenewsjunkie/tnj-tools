

## Bulk Import Secret Shows Gifter Data

Import all 107 gifters from the provided CSV into the `secret_shows_gifters` database table.

### Approach

Use the Supabase insert tool to run a single SQL statement that inserts all rows from the CSV. Since usernames may already exist in the table, the query will use `ON CONFLICT (username)` to update existing entries with the CSV totals.

### Data Summary
- 107 unique gifters
- Top gifter: SunState Jon with 225 gifts
- Range: 1 to 225 gifts
- Special characters in some usernames (e.g. `Sean Patrick's Day`) will be properly escaped

### Steps

1. Run a bulk INSERT into `secret_shows_gifters` with all 107 rows, setting `total_gifts` from the CSV and `monthly_gifts` to `{}` (since we don't have monthly breakdowns from this historical data)
2. Use `ON CONFLICT (username) DO UPDATE` to handle any duplicates, replacing the total with the CSV value
3. Verify the data was inserted correctly

### Technical Details

The SQL will look like:
```sql
INSERT INTO secret_shows_gifters (username, total_gifts, monthly_gifts, last_gift_date)
VALUES
  ('SunState Jon', 225, '{}', now()),
  ('Dj Rage', 24, '{}', now()),
  ... (all 107 rows)
ON CONFLICT (username) DO UPDATE SET
  total_gifts = EXCLUDED.total_gifts,
  updated_at = now();
```

No code file changes are needed -- this is purely a data import operation.

