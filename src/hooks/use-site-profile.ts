import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/profile.functions";
import { DEFAULT_PROFILE } from "@/lib/profile-types";

/** Live bio for chrome (footer, contact aside). About page uses its loader for SSR. */
export function useSiteProfile() {
  const fetchProfile = useServerFn(getProfile);
  return useQuery({
    queryKey: ["site-profile"],
    queryFn: () => fetchProfile({}),
    staleTime: Infinity,
    placeholderData: DEFAULT_PROFILE,
  });
}
