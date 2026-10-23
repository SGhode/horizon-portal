export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }

  try {
    const target = new URL(value, "https://peopleportal.invalid");
    return target.origin === "https://peopleportal.invalid"
      ? `${target.pathname}${target.search}${target.hash}`
      : "/dashboard";
  } catch {
    return "/dashboard";
  }
}
