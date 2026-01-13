# Debug Guide for Record Update Issue

## Steps to Debug the 422 Error

1. **Open Browser DevTools** (F12 or Right Click → Inspect)
   - Go to the **Console** tab

2. **Try to Update a Record**
   - Click on the blue edit button
   - Without changing anything, click "更新記錄"

3. **Check Console Logs**

You should see logs like:
```
提交的數據: {
  "semester": "113-1",
  "date": "2024-03-15",
  "location_id": 1,
  "account_id": 2
}
```

And if there's an error:
```
更新記錄 API 錯誤響應: {
  "detail": [
    {
      "loc": ["body", "date"],
      "msg": "value is not a valid date",
      "type": "value_error.date"
    }
  ]
}
```

## Common Issues & Fixes

### Issue 1: Invalid Date Format
**Error**: `body.date: value is not a valid date`

**Cause**: The date format sent doesn't match what the API expects

**Check**: Look at the console log for "提交的數據" and verify the date format is `YYYY-MM-DD` (e.g., "2024-03-15")

### Issue 2: Invalid Field Types
**Error**: `body.location_id: value is not a valid integer`

**Cause**: Field is being sent as a string instead of number

**Check**: Verify that `location_id` and `account_id` are numbers, not strings

### Issue 3: Missing Required Fields (for CREATE only)
**Error**: `body.semester: field required`

**Cause**: A required field is missing from the request

## What to Share

If the error persists, please share:
1. The console log showing "提交的數據"
2. The console log showing "更新記錄 API 錯誤響應"
3. The exact error message shown in the UI

This will help identify the exact issue!
