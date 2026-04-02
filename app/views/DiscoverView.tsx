'use client';

import { useState } from 'react';
import CategoryCard from '@/app/components/cards/CategoryCard';
import ContextSectionMenu from '@/app/components/navigation/ContextSectionMenu';
import PageHeader from '@/app/components/shell/PageHeader';
import SectionBlock from '@/app/components/shared/SectionBlock';
import OutfitCard from '@/app/components/cards/OutfitCard';

const sections = ['League Filters', 'Playstyles', 'Defense', 'Transition', 'Half-Court'];

const categories = [
  { name: 'Defense First', description: 'Clubs that prioritize paint control, switch timing, and low opponent efficiency.' },
  { name: 'Fast Break', description: 'High-tempo systems focused on transition speed and early shot creation.' },
  { name: 'Perimeter Heavy', description: 'Three-point volume, spacing discipline, and off-ball movement.' },
  { name: 'Balanced', description: 'Strong two-way structure with stable possession and bench production.' },
  { name: 'Youth Focus', description: 'High-upside development pipelines and long-term roster planning.' },
];

const looksByCategory: Record<string, { title: string; category: string; rating: string; username: string }[]> = {
  'Defense First': [
    { title: 'Zone Lock Sequence', category: 'Defense First', rating: '9.1', username: 'coach_blitz' },
    { title: 'Paint Denial Drill', category: 'Defense First', rating: '9.0', username: 'gm_anchor' },
  ],
  'Fast Break': [{ title: 'Transition Wave', category: 'Fast Break', rating: '9.8', username: 'coach_dash' }],
  'Perimeter Heavy': [{ title: 'Corner Rain System', category: 'Perimeter Heavy', rating: '9.3', username: 'analyst_arc' }],
  Balanced: [{ title: 'Dual Threat Framework', category: 'Balanced', rating: '8.9', username: 'coach_sync' }],
  'Youth Focus': [{ title: 'Prospect Minutes Plan', category: 'Youth Focus', rating: '9.2', username: 'gm_future' }],
};

export default function DiscoverView() {
  const [selectedCategory, setSelectedCategory] = useState('Defense First');

  return (
    <div className="grid gap-6 lg:grid-col">
      <PageHeader title="Discover Clubs" subtitle="Explore team identities and compare tactical archetypes." />
      <ContextSectionMenu title="Discover Sections" sections={sections} />
      <div className="space-y-6">
        <SectionBlock title="Playstyle Categories" subtitle="Select a playstyle to filter clubs and tactical snapshots.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.name}
                name={category.name}
                description={category.description}
                onExplore={() => setSelectedCategory(category.name)}
              />
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title={`${selectedCategory} Insights`} subtitle="Category-driven recommendations.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(looksByCategory[selectedCategory] ?? []).map((look) => (
              <OutfitCard key={look.title} {...look} />
            ))}
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
