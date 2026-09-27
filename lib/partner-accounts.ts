import { dbOrThrow } from "./supabase";

/**
 * Which player accounts belong to our own sub-admins.
 *
 * A partner signs up to the platform with the same phone number they play on,
 * so the phone is what ties the two records together. Matching is done on the
 * bare digits: one side may carry the dial code, a leading zero, or neither.
 */
function digits(phone: string | null | undefined): string {
  return String(phone ?? "").replace(/\D/g, "").replace(/^0+/, "");
}

/** Every sub-admin phone, as bare digits, for membership tests. */
export async function partnerPhones(): Promise<Set<string>> {
  const supabase = dbOrThrow();
  const { data } = await supabase.from("sub_admins").select("phone");
  const set = new Set<string>();
  for (const row of data ?? []) {
    const d = digits(row.phone);
    if (d) set.add(d);
  }
  return set;
}

/** True when this phone belongs to a sub-admin. */
export function isPartnerPhone(phone: string | null | undefined, phones: Set<string>): boolean {
  const d = digits(phone);
  return d !== "" && phones.has(d);
}
