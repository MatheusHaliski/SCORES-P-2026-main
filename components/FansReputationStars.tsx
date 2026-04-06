import { ManagerReputationStars } from "@/components/ManagerReputationStars";

export function FansReputationStars({ stars }: { stars: number }) {
  return <ManagerReputationStars label="Torcida" stars={stars} />;
}
