import { ManagerReputationStars } from "@/components/ManagerReputationStars";

export function BoardReputationStars({ stars }: { stars: number }) {
  return <ManagerReputationStars label="Diretoria" stars={stars} />;
}
