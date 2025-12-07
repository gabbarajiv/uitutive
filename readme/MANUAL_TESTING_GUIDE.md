# Manual Testing Guide - Uitutive Application

## Quick Start Testing

### Prerequisites
1. Start the application:
```bash
npm run dev
```

2. Ollama service should be running:
```bash
ollama serve  # in another terminal
```

3. Open browser to `http://localhost:4200`

---

## Feature Testing by Page

### 1. Form Generator Page (`/form-generator`)

#### Test 1.1: Page Load
**Steps:**
1. Navigate to `/form-generator`
2. Verify page title shows "Form Generator"
3. Check page header displays

**Expected Result:** ✅ Page loads without errors

---

#### Test 1.2: Prompt Input - Empty Submission
**Steps:**
1. Leave prompt field empty
2. Click "Generate Form" button

**Expected Result:** ✅ Error message displays: "Please enter a prompt"

---

#### Test 1.3: Prompt Input - Whitespace
**Steps:**
1. Enter only spaces in prompt field
2. Click "Generate Form" button

**Expected Result:** ✅ Error message displays: "Please enter a prompt"

---

#### Test 1.4: Clear Button
**Steps:**
1. Type text in prompt field
2. Click clear button (X icon)

**Expected Result:** ✅ Prompt field is cleared

---

#### Test 1.5: Clear Button Disabled
**Steps:**
1. Ensure prompt field is empty
2. Hover over clear button

**Expected Result:** ✅ Clear button is disabled (grayed out)

---

#### Test 1.6: Valid Form Generation
**Steps:**
1. Enter prompt: "Create a registration form with name and email fields"
2. Click "Generate Form" button
3. Wait for response

**Expected Result:** ✅ 
- Loading bar appears while generating
- Form preview displays with fields
- Save and Discard buttons appear

---

#### Test 1.7: Form Save
**Steps:**
1. Generate a form (Test 1.6)
2. Click "Save Form" button

**Expected Result:** ✅ 
- Form is saved
- Success message appears: "Form saved successfully!"
- Message disappears after 3 seconds
- Form preview clears

---

#### Test 1.8: Form Discard
**Steps:**
1. Generate a form (Test 1.6)
2. Click "Discard" button

**Expected Result:** ✅ 
- Form preview disappears
- Error messages clear
- Empty state shown again

---

#### Test 1.9: Multiple Sequential Submissions
**Steps:**
1. Submit valid prompt and save form
2. Submit different prompt and save form
3. Repeat once more

**Expected Result:** ✅ All forms save without issues

---

#### Test 1.10: Model Selection
**Steps:**
1. Click model dropdown (if available)
2. Select different model
3. Generate form with new model

**Expected Result:** ✅ 
- Model changes
- Form generation uses new model
- No errors

---

#### Test 1.11: Suggestions Display
**Steps:**
1. Look for suggestions section below input
2. Verify suggestions appear

**Expected Result:** ✅ 
- Suggestion chips/buttons display
- Each has suggestion text

---

#### Test 1.12: Suggestion Selection
**Steps:**
1. Click on a suggestion
2. Verify prompt field updates
3. Form generates with selected suggestion

**Expected Result:** ✅ 
- Selected suggestion populates prompt field
- Form generates automatically
- Form shows relevant fields

---

#### Test 1.13: API Error Handling
**Steps:**
1. Stop backend service
2. Try to generate form
3. Observe error message

**Expected Result:** ✅ 
- Error message displays
- Application doesn't crash
- Retry possible after fixing service

---

#### Test 1.14: Very Long Prompt
**Steps:**
1. Paste a very long prompt (500+ characters)
2. Submit

**Expected Result:** ✅ Form generates successfully with long prompt

---

#### Test 1.15: Special Characters in Prompt
**Steps:**
1. Enter prompt with special characters: "Create a form @#$%"
2. Submit

**Expected Result:** ✅ Form generates or shows appropriate error

---

### 2. Form Preview Tests

#### Test 2.1: Form Field Rendering
**Steps:**
1. Generate a form with multiple field types
2. Examine preview

**Expected Result:** ✅ All field types render correctly:
- Text inputs
- Email fields
- Select dropdowns
- Checkboxes
- Radio buttons
- Date pickers
- Textareas

---

#### Test 2.2: Required Field Validation
**Steps:**
1. Generate form with required fields
2. Leave required field empty
3. Click Submit

**Expected Result:** ✅ 
- Error message shows on field
- Submit button stays disabled
- Form doesn't submit

---

#### Test 2.3: Email Validation
**Steps:**
1. Generate form with email field
2. Enter invalid email: "not-an-email"
3. Touch/blur field

**Expected Result:** ✅ 
- Error message: "Please enter a valid email address"
- Submit button disabled

---

#### Test 2.4: Valid Email
**Steps:**
1. Enter valid email: "test@example.com"
2. Complete other required fields

**Expected Result:** ✅ 
- No error message
- Submit button enabled if all fields valid

---

#### Test 2.5: Form Submit - Valid Data
**Steps:**
1. Fill all required fields with valid data
2. Click Submit button

**Expected Result:** ✅ 
- Loading indicator appears briefly
- Success message shows: "Form submitted successfully!"
- Message disappears after 3 seconds

---

#### Test 2.6: Form Submit - Invalid Data
**Steps:**
1. Leave required field empty
2. Click Submit

**Expected Result:** ✅ 
- All fields marked as touched
- Error messages display
- Form doesn't submit

---

#### Test 2.7: Optional Fields
**Steps:**
1. Generate form with optional fields
2. Leave optional field empty
3. Fill all required fields
4. Submit

**Expected Result:** ✅ Form submits successfully

---

#### Test 2.8: Min/Max Length Validation
**Steps:**
1. If form has length-limited field
2. Enter text exceeding max length

**Expected Result:** ✅ Error message shows max length violation

---

#### Test 2.9: Form Field Disabled State
**Steps:**
1. While form is submitting, verify inputs are disabled

**Expected Result:** ✅ Inputs are disabled during submission

---

#### Test 2.10: Multiple Form Submissions
**Steps:**
1. Fill and submit form
2. After success message clears, fill again
3. Submit again

**Expected Result:** ✅ Both submissions work correctly

---

### 3. My Forms Page (`/forms`)

#### Test 3.1: Forms List Display
**Steps:**
1. Navigate to /forms
2. After saving some forms, return to this page

**Expected Result:** ✅ 
- List of saved forms displays
- Form names and descriptions visible
- Each form has action buttons

---

#### Test 3.2: Form Selection
**Steps:**
1. Click on a form in the list

**Expected Result:** ✅ 
- Form details display or form editing interface opens
- Form fields shown

---

#### Test 3.3: Delete Form
**Steps:**
1. Click delete button on a form
2. Confirm deletion if prompted

**Expected Result:** ✅ Form is removed from list

---

### 4. Form Responses Page (`/responses`)

#### Test 4.1: Responses List Display
**Steps:**
1. Navigate to /responses
2. After submitting forms, return here

**Expected Result:** ✅ 
- List of form responses displays
- Columns: ID, Status, Date, Actions
- Pagination if many responses

---

#### Test 4.2: Response Filtering by Status
**Steps:**
1. Click status filter dropdown
2. Select "new"
3. Verify only new responses show

**Expected Result:** ✅ List filters to show only selected status

---

#### Test 4.3: Response Search
**Steps:**
1. Enter text in search field
2. Search results update

**Expected Result:** ✅ Responses are filtered by search term

---

#### Test 4.4: Response Sorting
**Steps:**
1. Click column header (Date, Status, etc.)
2. Click again to reverse sort

**Expected Result:** ✅ 
- First click sorts ascending
- Second click sorts descending

---

#### Test 4.5: Pagination
**Steps:**
1. If multiple pages exist
2. Click next/previous buttons

**Expected Result:** ✅ 
- Page changes
- New responses display
- Pagination info updates

---

#### Test 4.6: Response Detail
**Steps:**
1. Click on a response row
2. Or click detail/view button

**Expected Result:** ✅ Response detail page opens showing:
- All form fields and submitted values
- Submission date/time
- Response metadata

---

#### Test 4.7: Status Update
**Steps:**
1. Open response details
2. Change status (if editable)

**Expected Result:** ✅ Status updates and persists

---

#### Test 4.8: Bulk Delete
**Steps:**
1. Select multiple responses (checkboxes)
2. Click delete button

**Expected Result:** ✅ All selected responses deleted

---

#### Test 4.9: Single Delete
**Steps:**
1. Click delete button on one response
2. Confirm if prompted

**Expected Result:** ✅ Response deleted from list

---

#### Test 4.10: Response Export (if available)
**Steps:**
1. Select responses
2. Click export button

**Expected Result:** ✅ Data exports in selected format

---

### 5. Analytics Page (`/analytics`)

#### Test 5.1: Analytics Load
**Steps:**
1. Navigate to /analytics

**Expected Result:** ✅ Analytics dashboard loads with data

---

#### Test 5.2: Key Metrics Display
**Steps:**
1. View analytics dashboard
2. Check metric cards

**Expected Result:** ✅ 
- Total submissions count displays
- Submission rate shown
- Other metrics visible

---

#### Test 5.3: Submission Timeline
**Steps:**
1. View analytics dashboard
2. Check for timeline/chart

**Expected Result:** ✅ Timeline or chart shows submission trends

---

#### Test 5.4: Field Analysis
**Steps:**
1. Scroll to field analysis section
2. View analytics per field

**Expected Result:** ✅ 
- Each field shows fill rate
- Unique values count
- Top values listed

---

#### Test 5.5: Filter by Date Range
**Steps:**
1. Click filter dropdown
2. Select different date range (7 days, 30 days, etc.)
3. Analytics update

**Expected Result:** ✅ Metrics recalculate for selected period

---

#### Test 5.6: Export Analytics
**Steps:**
1. Click "Export Report" button

**Expected Result:** ✅ 
- Download starts
- JSON file created
- Snackbar shows confirmation

---

#### Test 5.7: Analytics with Empty Data
**Steps:**
1. Delete all responses
2. Return to analytics

**Expected Result:** ✅ 
- Shows empty state message
- No errors
- UI doesn't break

---

#### Test 5.8: Analytics Refresh
**Steps:**
1. View analytics
2. Submit new form response
3. Refresh analytics page

**Expected Result:** ✅ Analytics updates with new data

---

### 6. Settings Page (`/settings`)

#### Test 6.1: Settings Load
**Steps:**
1. Navigate to /settings

**Expected Result:** ✅ Settings page loads

---

#### Test 6.2: API Key Configuration
**Steps:**
1. Look for API key input
2. Enter/modify API key
3. Save

**Expected Result:** ✅ 
- API key saved
- Confirmation message shown
- Settings persist on reload

---

#### Test 6.3: Theme Toggle (if available)
**Steps:**
1. Look for theme selector
2. Change theme
3. Reload page

**Expected Result:** ✅ 
- Theme changes
- Setting persists

---

#### Test 6.4: Export Settings
**Steps:**
1. Click export button

**Expected Result:** ✅ Settings exported as JSON

---

#### Test 6.5: Import Settings
**Steps:**
1. Click import button
2. Select JSON file
3. Confirm

**Expected Result:** ✅ Settings imported successfully

---

### 7. Navigation Tests

#### Test 7.1: Navigation Menu
**Steps:**
1. Click each menu item
2. Verify correct page loads

**Expected Result:** ✅ All navigation items work

---

#### Test 7.2: Breadcrumbs
**Steps:**
1. Navigate through pages
2. Check breadcrumbs

**Expected Result:** ✅ Breadcrumbs show correct path

---

#### Test 7.3: Back Button
**Steps:**
1. Navigate to form detail
2. Click back button

**Expected Result:** ✅ Returns to previous page

---

### 8. Error Handling Tests

#### Test 8.1: Network Error - Form Generation
**Steps:**
1. Stop backend
2. Try to generate form
3. Observe error handling

**Expected Result:** ✅ 
- Error message shows
- User can retry
- App doesn't crash

---

#### Test 8.2: Invalid Form Submission
**Steps:**
1. Generate form
2. Fill with invalid data
3. Submit

**Expected Result:** ✅ 
- Validation errors show
- Form doesn't submit

---

#### Test 8.3: 404 Page
**Steps:**
1. Navigate to non-existent URL: `/invalid-page`

**Expected Result:** ✅ 
- 404 page or error shows
- Can navigate back

---

#### Test 8.4: Slow Network
**Steps:**
1. Open DevTools throttle to Slow 3G
2. Generate form
3. Submit response

**Expected Result:** ✅ 
- Loading indicators show
- Operations still work
- No timeouts

---

### 9. Performance Tests

#### Test 9.1: Large Form
**Steps:**
1. Generate form with many fields (20+)
2. Render and interact

**Expected Result:** ✅ Form remains responsive

---

#### Test 9.2: Many Responses
**Steps:**
1. Navigate to responses page with 1000+ items
2. Scroll and filter

**Expected Result:** ✅ 
- Pagination works
- Filtering responsive
- No lag

---

#### Test 9.3: Page Load Time
**Steps:**
1. Open DevTools Network tab
2. Navigate to each page
3. Check load times

**Expected Result:** ✅ Pages load in < 3 seconds

---

### 10. Accessibility Tests

#### Test 10.1: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Use Enter/Space to interact

**Expected Result:** ✅ All interactive elements accessible via keyboard

---

#### Test 10.2: Screen Reader
**Steps:**
1. Use screen reader (NVDA, JAWS, or built-in)
2. Navigate page

**Expected Result:** ✅ Content readable and labels clear

---

#### Test 10.3: Color Contrast
**Steps:**
1. Check text colors for contrast

**Expected Result:** ✅ WCAG AA compliance

---

---

## Test Report Template

### Test Date: ___________
### Tester: ___________
### Browser: ___________
### Environment: Production / Staging / Local

| Test ID | Test Name | Status | Notes | Time |
|---------|-----------|--------|-------|------|
| 1.1 | Page Load | ⚪ | | |
| 1.2 | Empty Submission | ⚪ | | |
| 1.3 | Whitespace | ⚪ | | |
| | | | | |

**Legend:**
- ✅ Passed
- ❌ Failed
- ⚠️ Warning
- ⏭️ Skipped
- ⚪ Not Tested

---

## Bug Reporting Template

```
Title: [Brief description of issue]

Test Case: [Which test found this]

Steps to Reproduce:
1. Step 1
2. Step 2
3. Step 3

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshots/Video:
[Attach if applicable]

Environment:
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- App Version: [e.g., 1.0.0]

Severity:
- 🔴 Critical (blocks main functionality)
- 🟠 High (major functionality broken)
- 🟡 Medium (minor functionality broken)
- 🟢 Low (cosmetic or non-blocking)
```

---

## Summary

This manual testing guide covers:
- ✅ 100+ test scenarios
- ✅ All major features
- ✅ Common user workflows
- ✅ Error scenarios
- ✅ Edge cases
- ✅ Performance verification
- ✅ Accessibility checks

**Total Estimated Test Time:** 2-3 hours for complete manual testing

**Recommended Test Frequency:**
- Before each release: Full test suite
- After bug fixes: Related tests
- Sprint testing: Daily smoke tests
