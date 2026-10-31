import assert from "node:assert/strict";
import {
  resetLeaveDatabase,
  getLeaveTypes,
  getLeaveBalancesForEmployee,
  getLeaveRequestsForEmployee,
  getHolidays,
  getLatestMonthlyAttendanceForEmployee,
  createLeaveRequestForEmployee,
  calculateWorkingDays,
} from "../src/mocks/data/leave";

console.log("\n=======================================================");
console.log(" Aura Workforce - Task 6: Leave & Attendance Test Suite ");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    resetLeaveDatabase();
    const res = fn();
    if (res instanceof Promise) {
      throw new Error("Async test not awaited in runner");
    }
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Test 1: Successful application
// An authenticated employee with sufficient leave balance submits a valid leave request.
// Expected: The request is created with the correct initial status (PENDING).
// ---------------------------------------------------------------------------
runTest("Test 1: Successful application creates request with PENDING status", () => {
  const employeeId = "emp-001";
  const employeeName = "Shivraj Ghode";

  // Check initial balance: Casual leave has 8 available days
  const initialBalances = getLeaveBalancesForEmployee(employeeId);
  const casualBefore = initialBalances.find((b) => b.leaveTypeCode === "CASUAL");
  assert.ok(casualBefore, "Casual balance must exist");
  assert.strictEqual(casualBefore.availableDays, 8);

  // Submit valid 2-day casual leave in December 2026
  const input = {
    leaveTypeId: "lt-casual",
    startDate: "2026-12-07", // Mon
    endDate: "2026-12-08",   // Tue
    reason: "Doctor appointment and personal consultation",
  };

  const result = createLeaveRequestForEmployee(employeeId, employeeName, input);

  assert.ok(result.request, "Request object must be returned");
  assert.strictEqual(result.request.status, "PENDING", "Initial status must strictly be PENDING");
  assert.strictEqual(result.request.employeeId, employeeId, "Employee ID must match authenticated user");
  assert.strictEqual(result.request.daysCount, 2, "Requested working days count must be 2");
  assert.strictEqual(result.request.reason, input.reason);

  // Verify request appears in employee's request history
  const requests = getLeaveRequestsForEmployee(employeeId);
  const found = requests.find((r) => r.id === result.request.id);
  assert.ok(found, "Newly created request must appear in employee requests list");
  assert.strictEqual(found.status, "PENDING");
});

// ---------------------------------------------------------------------------
// Test 2: Invalid date range
// The employee submits a request whose start date is after the end date.
// Expected: The server rejects the request with a clear validation error.
// ---------------------------------------------------------------------------
runTest("Test 2: Invalid date range (start date after end date) is rejected", () => {
  const employeeId = "emp-001";
  const employeeName = "Shivraj Ghode";

  const input = {
    leaveTypeId: "lt-casual",
    startDate: "2026-12-15",
    endDate: "2026-12-10", // 5 days BEFORE start date
    reason: "Invalid chronological interval",
  };

  assert.throws(
    () => {
      createLeaveRequestForEmployee(employeeId, employeeName, input);
    },
    (err: any) => {
      assert.strictEqual(err.statusCode, 400);
      assert.strictEqual(err.code, "INVALID_DATE_RANGE");
      assert.match(err.message, /start date cannot be after end date/i);
      return true;
    }
  );
});

// ---------------------------------------------------------------------------
// Test 3: Insufficient balance
// The employee requests more leave than their available eligible balance.
// Expected: The server rejects the request.
// ---------------------------------------------------------------------------
runTest("Test 3: Insufficient balance is rejected by the server", () => {
  const employeeId = "emp-001";
  const employeeName = "Shivraj Ghode";

  // Sick leave has 8 available days
  // Request 14 working days (e.g. 2026-12-01 to 2026-12-18)
  const input = {
    leaveTypeId: "lt-sick",
    startDate: "2026-12-01",
    endDate: "2026-12-18",
    reason: "Elective surgery recovery",
  };

  const requestedDays = calculateWorkingDays(input.startDate, input.endDate);
  assert.ok(requestedDays > 8, `Requested days (${requestedDays}) should exceed 8 days`);

  assert.throws(
    () => {
      createLeaveRequestForEmployee(employeeId, employeeName, input);
    },
    (err: any) => {
      assert.strictEqual(err.statusCode, 400);
      assert.strictEqual(err.code, "INSUFFICIENT_BALANCE");
      assert.match(err.message, /insufficient leave balance/i);
      return true;
    }
  );
});

// ---------------------------------------------------------------------------
// Test 4: Overlapping dates
// The employee submits a request overlapping an existing request that is
// considered blocking by the business rules.
// Expected: The server rejects the request.
// ---------------------------------------------------------------------------
runTest("Test 4: Overlapping dates with existing active request is rejected", () => {
  const employeeId = "emp-001";
  const employeeName = "Shivraj Ghode";

  // In seed data, emp-001 already has an APPROVED request lr-101 from 2026-10-14 to 2026-10-15
  // Attempt to submit a new request overlapping 2026-10-15 to 2026-10-16
  const input = {
    leaveTypeId: "lt-casual",
    startDate: "2026-10-15",
    endDate: "2026-10-16",
    reason: "Overlap with approved wedding leave",
  };

  assert.throws(
    () => {
      createLeaveRequestForEmployee(employeeId, employeeName, input);
    },
    (err: any) => {
      assert.strictEqual(err.statusCode, 409);
      assert.strictEqual(err.code, "OVERLAPPING_REQUEST");
      assert.match(err.message, /overlapping/i);
      return true;
    }
  );

  // Also verify overlapping with PENDING request (lr-103 is 2026-11-20 to 2026-11-20)
  const pendingOverlapInput = {
    leaveTypeId: "lt-casual",
    startDate: "2026-11-19",
    endDate: "2026-11-21",
    reason: "Overlap with pending dental appointment",
  };

  assert.throws(
    () => {
      createLeaveRequestForEmployee(employeeId, employeeName, pendingOverlapInput);
    },
    (err: any) => {
      assert.strictEqual(err.statusCode, 409);
      assert.strictEqual(err.code, "OVERLAPPING_REQUEST");
      return true;
    }
  );
});

// ---------------------------------------------------------------------------
// Test 5: Employee data isolation
// Employee A attempts to access Employee B's leave balances or requests.
// Expected: The server does not expose Employee B's data.
// ---------------------------------------------------------------------------
runTest("Test 5: Employee data isolation strictly enforces per-user boundary", () => {
  const empA = "emp-001"; // Shivraj Ghode
  const empB = "emp-002"; // Marcus Vance

  // 1. Balances Isolation
  const balancesA = getLeaveBalancesForEmployee(empA);
  const balancesB = getLeaveBalancesForEmployee(empB);

  assert.ok(balancesA.length > 0, "Employee A must have balances");
  assert.ok(balancesB.length > 0, "Employee B must have balances");

  // Verify none of employee B's balances appear in employee A's query
  for (const b of balancesA) {
    assert.strictEqual(b.employeeId, empA, `Balance ${b.id} must belong strictly to empA`);
    assert.notStrictEqual(b.employeeId, empB, `Balance ${b.id} must NOT belong to empB`);
  }

  // 2. Requests Isolation
  const requestsA = getLeaveRequestsForEmployee(empA);
  const requestsB = getLeaveRequestsForEmployee(empB);

  assert.ok(requestsA.length > 0, "Employee A has requests");
  assert.ok(requestsB.length > 0, "Employee B has requests");

  for (const r of requestsA) {
    assert.strictEqual(r.employeeId, empA, `Request ${r.id} must belong strictly to empA`);
    assert.notStrictEqual(r.employeeId, empB, `Request ${r.id} must NOT belong to empB`);
  }

  // Verify specific request belonging to empB is NOT in empA's list
  const empBRequest = requestsB.find((r) => r.id === "lr-201");
  assert.ok(empBRequest, "lr-201 belongs to Marcus Vance (emp-002)");
  const leakedInA = requestsA.find((r) => r.id === "lr-201");
  assert.strictEqual(leakedInA, undefined, "Employee B's request lr-201 must never leak to Employee A");
});

// ---------------------------------------------------------------------------
// Test 6: Attendance summary
// The employee requests their attendance summary.
// Expected: The endpoint returns the correct latest available monthly record.
// ---------------------------------------------------------------------------
runTest("Test 6: Attendance summary returns correct latest available monthly record", () => {
  const empA = "emp-001";
  const empB = "emp-002";

  const attendanceA = getLatestMonthlyAttendanceForEmployee(empA);
  assert.ok(attendanceA, "Attendance for emp-001 must exist");
  assert.strictEqual(attendanceA.employeeId, empA);
  assert.strictEqual(attendanceA.month, "2026-10", "Latest month must be October 2026");
  assert.strictEqual(attendanceA.totalWorkingDays, 22);
  assert.strictEqual(attendanceA.presentDays, 19);
  assert.strictEqual(attendanceA.onLeaveDays, 2);
  assert.strictEqual(attendanceA.attendancePercentage, 93.18);

  // Isolation check on attendance
  const attendanceB = getLatestMonthlyAttendanceForEmployee(empB);
  assert.ok(attendanceB, "Attendance for emp-002 must exist");
  assert.strictEqual(attendanceB.employeeId, empB);
  assert.strictEqual(attendanceB.attendancePercentage, 97.73);
  assert.notStrictEqual(attendanceA.attendancePercentage, attendanceB.attendancePercentage);
});

// ---------------------------------------------------------------------------
// Test 7: Balance integrity
// Verify that submitting a request does not cause leave days to be deducted
// twice or incorrectly.
// ---------------------------------------------------------------------------
runTest("Test 7: Balance integrity prevents double deductions", () => {
  const employeeId = "emp-001";
  const employeeName = "Shivraj Ghode";

  // Initial Casual balance: allocated=12, used=3, pending=1 -> available=8
  const initial = getLeaveBalancesForEmployee(employeeId).find(
    (b) => b.leaveTypeCode === "CASUAL"
  )!;
  assert.strictEqual(initial.allocatedDays, 12);
  assert.strictEqual(initial.usedDays, 3);
  assert.strictEqual(initial.pendingDays, 1);
  assert.strictEqual(initial.availableDays, 8);

  // Submit request for 2 days
  const input = {
    leaveTypeId: "lt-casual",
    startDate: "2026-12-14", // Mon
    endDate: "2026-12-15",   // Tue
    reason: "Personal family matter",
  };

  const { balance: updated } = createLeaveRequestForEmployee(employeeId, employeeName, input);

  // Verify:
  // 1. allocated remains exactly 12
  // 2. usedDays remains exactly 3 (NOT deducted yet, since request is pending!)
  // 3. pendingDays increments from 1 to 3
  // 4. availableDays becomes 12 - 3 - 3 = 6
  // 5. Invariant holds: allocatedDays == usedDays + pendingDays + availableDays
  assert.strictEqual(updated.allocatedDays, 12, "Allocated days must not change");
  assert.strictEqual(updated.usedDays, 3, "Used days must NOT be deducted before approval");
  assert.strictEqual(updated.pendingDays, 3, "Pending days must increment by requested days");
  assert.strictEqual(updated.availableDays, 6, "Available days must decrease by pending days");
  assert.strictEqual(
    updated.allocatedDays,
    updated.usedDays + updated.pendingDays + updated.availableDays,
    "Mathematical balance invariant must strictly hold (allocated == used + pending + available)"
  );
});

console.log("\n=======================================================");
console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
