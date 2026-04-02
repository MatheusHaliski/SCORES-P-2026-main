import ClothingItemCard from '@/app/components/cards/ClothingItemCard';
import ContextSectionMenu from '@/app/components/navigation/ContextSectionMenu';
import PageHeader from '@/app/components/shell/PageHeader';
import SectionBlock from '@/app/components/shared/SectionBlock';

const sections = ['Top Prospects', 'Free Agents', 'Trade Targets', 'Contracts', 'Best Value'];

const items = [
  { itemName: 'A. Freeman (PG)', brand: 'Velocity Hawks', price: '$12.5M' },
  { itemName: 'R. Costa (SF)', brand: 'Iron Giants', price: '$9.1M' },
  { itemName: 'M. Hall (C)', brand: 'River Blaze', price: '$14.8M' },
  { itemName: 'J. Adams (SG)', brand: 'North Wolves', price: '$8.2M' },
];

export default function MarketView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <ContextSectionMenu title="Transfer Center" sections={sections} />
      <div className="space-y-6">
        <PageHeader title="Transfer Market" subtitle="Evaluate players, salary impact, and roster fit." />
        <SectionBlock title="Hot Targets" subtitle="Most viewed transfer opportunities this week.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ClothingItemCard key={item.itemName} {...item} />
            ))}
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
