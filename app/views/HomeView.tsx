import OutfitCard from '@/app/components/cards/OutfitCard';
import ContextSectionMenu from '@/app/components/navigation/ContextSectionMenu';
import PageHeader from '@/app/components/shell/PageHeader';
import SectionBlock from '@/app/components/shared/SectionBlock';

const sections = ['Matchday Hub', 'League Trends', 'Club Form', 'Youth Reports', 'Scouting Radar'];

const highlights = [
  { title: 'West Conference Finals', category: 'Playoff Watch', rating: '9.4', username: 'coach_nova' },
  { title: 'Defensive Wall Rotation', category: 'Tactical Trend', rating: '9.7', username: 'analyst_court' },
  { title: 'Fast Break Efficiency', category: 'Performance Metric', rating: '9.2', username: 'data_arc' },
  { title: 'Bench Unit Impact', category: 'Squad Depth', rating: '9.5', username: 'gm_orion' },
];

export default function HomeView() {
  return (
    <div className="grid gap-6 lg:grid-col">
      <div className="col-span-full">
        <PageHeader title="League Center" subtitle="Track top clubs, tactical shifts, and hot streaks across SCORES." />
      </div>

      <ContextSectionMenu title="Home Overview" sections={sections} />

      <SectionBlock title="Basketball Pulse" subtitle="Daily insights from clubs, lineups, and season storylines.">
        <div className="mt-1.5 grid gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => (
            <OutfitCard key={item.title} {...item} />
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
