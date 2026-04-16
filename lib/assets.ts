export type AssetRef = {
  id: string;
  type: "logo" | "jersey" | "arena" | "fx";
  fallback: string;
};

export const buildTeamPlaceholderAsset = (teamName: string, type: AssetRef["type"] = "logo"): AssetRef => {
  const fallback = teamName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("") || "TM";

  return {
    id: `${type}-${teamName.toLowerCase().replace(/\s+/g, "-")}`,
    type,
    fallback,
  };
};
