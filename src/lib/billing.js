import { supabase } from "./supabase";

export const loadAccess = async (userId) => {
  if (!userId) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("has_lifetime_access")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("Access check error:", error);
    return false;
  }
  return data?.has_lifetime_access ?? false;
};
