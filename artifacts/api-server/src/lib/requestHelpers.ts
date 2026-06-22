/** A user shape sufficient for access-scope decisions. */
export interface ScopeUser {
  id: number;
  role: string;
}

/**
 * Resolve which studentId a request is allowed to read.
 * Students are always scoped to their own id (a requested studentId is ignored —
 * this closes the IDOR on grades/attendance). Staff may filter by any studentId,
 * or `undefined` to read across all students.
 */
export function resolveStudentScope(
  user: ScopeUser,
  requestedStudentId?: number | null,
): number | undefined {
  if (user.role === "student") return user.id;
  return requestedStudentId ?? undefined;
}

/** Parse a route :id param to a base-10 integer, or null when not numeric. */
export function parseId(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
}
