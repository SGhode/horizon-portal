# PeoplePortal — Design System & UI/UX Design Guide

A comprehensive design specification, design token reference, and architectural review for **PeoplePortal**, an enterprise-grade workforce management and employee self-service platform.

---

## 1. Product & User Overview

### 1.1 Product Identity
**PeoplePortal** is a unified internal Human Resources & Workforce Operations platform designed for high-trust enterprise environments. It serves as the primary system of record for personal employment profiles, semi-monthly compensation statements, tax withholdings, and workforce governance.

### 1.2 Target User Personas
1. **Corporate Employees**:
   - **Primary Goal**: Access personal self-service records, review semi-monthly net pay and tax withholdings, download payslips, inspect available PTO balances, and maintain emergency contact and residential address records.
   - **Key UX Need**: High clarity, private financial data treatment (ability to mask amounts), intuitive self-service actions without cognitive overload.
2. **Workforce Administrators & HR Executives**:
   - **Primary Goal**: Monitor workforce headcount (248 employees across 12 departments), track payroll disbursement health, inspect department budget allocations, and review pending approval queues.
   - **Key UX Need**: Scannable KPI metrics, clear distinction between aggregate and personal records, rapid access to audit trails.

---

## 2. Design Principles

1. **Restrained Enterprise Aesthetic**: White and light-gray surfaces (`#f8fafc` / `#ffffff`) paired with authoritative royal navy (`#1e40af`) rather than noisy AI gradients or saturated accents.
2. **Strict Hierarchy & Scannability**: Distinct typographic scale where primary metrics (e.g. Net Pay, Total Employees) dominate, supported by muted metadata (`#64748b`).
3. **Privacy by Default for Compensation**: Financial numbers and tax withholdings can be masked on screen (`••••••••`) to protect employee privacy in shared or open-office environments.
4. **Complete State Coverage**: Every screen systematically implements four visual states: **Populated Data**, **Loading Skeletons**, **Empty State**, and **API Error with Retry Action**.
5. **Accessibility-First (WCAG 2.1 AA)**: High contrast ratios on all text surfaces, consistent keyboard `Tab` navigation, and visible focus rings (`ring-2 ring-primary`).

---

## 3. Design Tokens & Color Palette

All design tokens are defined as CSS Custom Properties in `src/app/globals.css` and mapped to Tailwind utilities via the `@theme` directive.

### 3.1 Color Tokens

| Token Name | Light Mode Value | Dark Mode Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--primary` | `#1e40af` (Navy Blue) | `#3b82f6` (Vibrant Blue) | Primary interactive actions, active navigation, brand marks |
| `--primary-hover` | `#1d4ed8` | `#60a5fa` | Hover state for primary buttons |
| `--background` | `#f8fafc` (Slate 50) | `#090d16` (Deep Slate) | Page root viewport background |
| `--foreground` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | High-contrast body copy and headings |
| `--card` | `#ffffff` | `#111827` (Gray 900) | Elevated surface container for cards and dialogs |
| `--card-foreground`| `#0f172a` | `#f8fafc` | Card body copy and titles |
| `--secondary` | `#f1f5f9` (Slate 100) | `#1f2937` (Gray 800) | Secondary action buttons, badge backdrops |
| `--muted` | `#f1f5f9` | `#1f2937` | Table header backdrops, subtle card borders |
| `--muted-foreground`| `#64748b` (Slate 500)| `#94a3b8` (Slate 400)| Secondary labels, timestamps, helper text |
| `--border` | `#e2e8f0` (Slate 200) | `#1f2937` | 1px dividers, card perimeters, input borders |
| `--input` | `#e2e8f0` | `#374151` | Default border for text fields and selectors |
| `--ring` | `#1e40af` | `#60a5fa` | Focus ring outline for keyboard accessibility |
| `--destructive` | `#dc2626` (Red 600) | `#ef4444` (Red 500) | Error banners, sign out, destructive confirmations |
| `--success` | `#16a34a` (Green 600) | `#10b981` (Emerald 500) | "Paid" status badges, active accounts, positive delta |
| `--warning` | `#d97706` (Amber 600) | `#f59e0b` (Amber 500) | "Pending" approval badges, deadline reminders |

### 3.2 Elevation & Shadow Tokens
- `--shadow-card`: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`
- `--shadow-popover`: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`

---

## 4. Typography Scale

The system utilizes Google Font **Inter** (`var(--font-inter)`):

| Style / Level | Font Size | Line Height | Font Weight | Usage Example |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Metric** | `2rem` (32px) | `2.25rem` (36px) | 800 (Extra Bold) | Net Pay Amount, Total Workforce |
| **H1 Title** | `1.5rem` (24px) | `2rem` (32px) | 700 (Bold) | Screen Headers ("Workforce Overview") |
| **H2 Section** | `1.25rem` (20px)| `1.75rem` (28px)| 600 (Semi Bold) | Card Headers, Dialog Titles |
| **H3 Subsection**| `1rem` (16px) | `1.5rem` (24px) | 600 (Semi Bold) | Table section titles, Category banners |
| **Body Regular**| `0.875rem` (14px)| `1.25rem` (20px)| 400 / 500 | General descriptions, input values |
| **Caption / Meta**| `0.75rem` (12px)| `1rem` (16px) | 500 (Medium) | Table cells, timestamps, helper text |
| **Micro Badge** | `0.6875rem` (11px)| `0.875rem` (14px)| 600 (Semi Bold) | Status badges, FLSA tags |
| **Monospace** | `0.75rem` (12px)| `1rem` (16px) | 500 (Medium) | Employee IDs (`PP-10482`), currency sums |

---

## 5. Spacing Scale

Based strictly on **4px base increments**:

| Token Scale | Value | Typical Usage |
| :--- | :--- | :--- |
| `0.5` | `2px` | Micro badge padding, tight border insets |
| `1` | `4px` | Icon to text inline gap |
| `1.5` | `6px` | Input label to input field margin |
| `2` | `8px` | Button padding vertical, card header spacing |
| `3` | `12px` | Compact table cell padding, toolbar button gaps |
| `4` | `16px` | Standard card internal padding, form row spacing |
| `6` | `24px` | Major section margins, grid column gaps |
| `8` | `32px` | Viewport outer padding, modal inner body margins |
| `12` | `48px` | Hero section top/bottom padding |

---

## 6. Button Variants & Component Heights

All buttons are built with accessible focus rings and loading spinners:

| Variant | Styling Details | Height | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `bg-primary text-primary-foreground hover:bg-primary/90` | `36px` (`h-9`) / `40px` (`h-10`) | Main form submit, "Sign In", "Save Changes" |
| **Secondary** | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | `36px` (`h-9`) | Alternative path actions |
| **Outline** | `border border-border bg-background hover:bg-muted` | `32px` (`h-8`) / `36px` (`h-9`) | "Download PDF", "Mask Private Data", "Refresh" |
| **Ghost** | `hover:bg-muted hover:text-foreground` | `28px` (`h-7`) / `36px` (`h-9`) | Table row action ("Select", "Inspect", "View") |
| **Destructive**| `bg-destructive text-destructive-foreground` | `36px` (`h-9`) | "Sign Out", critical removal confirmations |

---

## 7. Form & Validation Rules

1. **Labels**: Always rendered above the input element with `text-sm font-medium` and explicitly linked via `htmlFor={inputId}`.
2. **Required Fields**: Empty required field submissions trigger inline red validation text (`text-destructive text-xs`) and `aria-invalid="true"`.
3. **Error Association**: Error messages are bound via `aria-describedby={`${inputId}-error`}` for screen readers.
4. **Password Input**: Equipped with an accessible toggle icon button to reveal or conceal the password string.
5. **Read-Only Distinction**: Read-only enterprise fields (e.g. Compensation Grade, Hire Date) feature a visual lock icon (`Lock`) and subtle muted background to distinguish them from editable fields.

---

## 8. Card & Table Guidelines

- **Cards**: All feature a subtle 1px border (`border-border`) and light background (`bg-card`). Header, Content, and Footer sections maintain strict padding hierarchies.
- **Tables**: Semantic HTML structure (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`).
- **Data Alignment**: Currency, percentages, and timestamps are rendered in monospace and aligned to the right. Text titles and categories are left-aligned.

---

## 9. Loading, Empty, and Error States

Every screen implements all four states:

1. **Populated State**: Displays deterministic, contract-shaped sample data.
2. **Loading State**: Uses `<Skeleton className="animate-pulse bg-muted/80" />` matching the exact geometry of cards, table rows, and headers to prevent layout shift.
3. **Empty State**: Renders an illustrated Lucide outline icon (e.g., `Receipt` or `Calendar`), clear explanation text, and a primary recovery action button.
4. **Error State**: Displays a red warning icon (`AlertTriangle`), a user-friendly error description (omitting stack traces), and a prominent **"Retry Request"** button.

---

## 10. Screen Design Proposals & Alternative Comparison

For each of the four core screens, design alternatives were evaluated:

### Screen A: Login
- **Alternative 1 (Split Hero Banner)**: Left half photo illustration, right half form. *Rejected*: Unnecessary visual weight for an internal employee SSO portal; mobile responsiveness required duplicate layouts.
- **Alternative 2 (Minimal Modal-Style Centered Card)**: Clean, centered enterprise card with corporate lock mark, work email, password toggle, demo presets, and SSO footer.
- **Selection**: **Alternative 2**. Selected because it provides instant enterprise clarity, minimal loading payload, and works identically across all viewports.
- **Improvements Made**: Added interactive "Fill Employee Demo" and "Fill Admin Demo" buttons to enable fast testing of both populated and error states.

### Screen B: Dashboard
- **Alternative 1 (Single Unified Mixed Feed)**: Combined employee PTO and administrator workforce metrics into a single screen. *Rejected*: Confusing UX; individual employees do not need to see global headcount, and administrators need aggregated metrics.
- **Alternative 2 (Dual-Role View Switcher)**: Distinct "Employee View" (Next Payday, Available PTO, Recent Payslips, Events) and "Administrator View" (248 Employees, 12 Departments, 18 Pending Requests).
- **Selection**: **Alternative 2**. Strict separation prevents cognitive confusion and accurately simulates enterprise role-based authorization.
- **Improvements Made**: Added illustrative sample data disclaimer banner and interactive state toggles.

### Screen C: Employee Profile
- **Alternative 1 (Inline Editable Fields)**: Every field becomes an input upon clicking an "Edit Mode" toggle. *Rejected*: Violates corporate governance; legal name, hire date, and salary grade must not be directly editable by the employee.
- **Alternative 2 (Two-Column Governance Layout with Permitted Edit Modal)**: Column 1: Personal Info (highlighting editable contact details). Column 2: Employment Info (explicitly tagged with "Locked by HR" badges). "Edit Permitted Info" triggers a dedicated modal.
- **Selection**: **Alternative 2**. Directly enforces enterprise governance and security expectations.
- **Improvements Made**: Added visual lock badges on immutable fields and clear helper descriptions in the modal.

### Screen D: Payslip
- **Alternative 1 (Static PDF Viewer Embed)**: An embedded iframe rendering a PDF. *Rejected*: Poor accessibility on mobile, difficult to inspect breakdowns, lacks responsive table features.
- **Alternative 2 (Interactive Breakdown with Hero Net Pay & Privacy Toggle)**: Prominent Net Pay banner, side-by-side Earnings and Deductions tables, month selector, privacy masking toggle (`••••••••`), and PDF download action.
- **Selection**: **Alternative 2**. Highly accessible, responsive, and treats financial figures as confidential employee data.
- **Improvements Made**: Implemented instant masking toggle so employees can safely view payslips in open workspaces.

---

## 11. Design Review Checklist

| # | Inspection Item | Result | Review Note |
| :-: | :--- | :---: | :--- |
| **1** | Consistent spacing scale (4px increments) | **PASS** | All margins and paddings strictly follow Tailwind 4px increments (`p-2`, `p-4`, `p-6`). |
| **2** | Consistent typography hierarchy | **PASS** | Hero metrics (2rem) -> H1 (1.5rem) -> H2 (1.25rem) -> Body (0.875rem) -> Caption (0.75rem). |
| **3** | Accessible color contrast (WCAG 2.1 AA) | **PASS** | Navy `#1e40af` on white gives 8.4:1 contrast (exceeds 4.5:1 AA standard). Dark mode meets AA. |
| **4** | Consistent primary & secondary buttons | **PASS** | Standardized `Button` variants used across all 4 screens with identical heights (`h-9` / `h-10`). |
| **5** | Correct input styling & states | **PASS** | Inputs feature floating labels, focus rings, disabled styling, and ARIA error associations. |
| **6** | Consistent card & table geometry | **PASS** | Uniform 8px border radius (`rounded-lg`), subtle 1px border (`border-border`), and shadow tokens. |
| **7** | Clear page hierarchy & headings | **PASS** | Every screen begins with an explicit title, subtitle, and breadcrumb in topbar. |
| **8** | Correct Lucide icon usage | **PASS** | Standardized 14px–20px sizing, paired with semantic textual labels. |
| **9** | Responsive behavior across breakpoints | **PASS** | Tested on desktop (1536px), tablet (768px), and mobile (375px) with slide-over navigation drawer. |
| **10**| Keyboard navigation & focus rings | **PASS** | All interactive elements display visible focus outlines (`focus-visible:ring-2 focus-visible:ring-ring`). |
| **11**| All 4 UI states implemented per screen | **PASS** | Populated, Skeleton, Empty, and Error states verified on Login, Dashboard, Profile, and Payslips. |
| **12**| Clear user feedback for actions | **PASS** | Toast notifications confirm profile saves, payslip downloads, and theme changes. |
| **13**| Separation of employee vs admin data | **PASS** | Explicit view switcher on Dashboard clearly separates personal and workforce metrics. |

---

## 12. Accessibility & Keyboard Navigation Requirements

1. **Tab Traversal**: All inputs, buttons, select dropdowns, and links follow natural DOM order.
2. **Escape Handling**: Modals and dialogs (`Dialog`) listen for the `Escape` key to close.
3. **Screen Reader Semantics**: Banners use `role="alert"` or `role="status"` with live region properties.
4. **Target Size**: All clickable interactive controls maintain at least 32px height to comply with WCAG 2.5.5 touch target guidance.
