'use client';

import { useState } from 'react';
import ContextSectionMenu from '@/app/components/navigation/ContextSectionMenu';
import PageHeader from '@/app/components/shell/PageHeader';
import SectionBlock from '@/app/components/shared/SectionBlock';

const sections = ['New Tactic', 'System Name', 'Rotation Setup', 'Preview', 'Save'];

const tacticOptions = ['High Press', '5-Out Motion', 'Drop Coverage', 'Switch All', 'Zone 2-3'];

export default function CreateSchemeView() {
  const [title, setTitle] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (item: string) => {
    setSelectedItems((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <ContextSectionMenu title="Tactics Flow" sections={sections} />
      <div className="space-y-6">
        <PageHeader title="Tactics Board" subtitle="Design your basketball system before matchday." />

        <SectionBlock title="System Name" subtitle="Name your next tactical setup.">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Playoff Pressure v1"
            className="sa-premium-gradient-surface-soft w-full rounded-xl border border-black/25 px-4 py-3 text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </SectionBlock>

        <SectionBlock title="Rotation Setup" subtitle="Select tactical principles for this system.">
          <div className="grid gap-3 sm:grid-cols-2">
            {tacticOptions.map((item) => {
              const active = selectedItems.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-white bg-white text-black'
                      : 'sa-premium-gradient-surface-soft border-white/25 text-white/90 hover:border-white/50'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </SectionBlock>

        <SectionBlock title="Tactical Preview" subtitle="Live summary before saving.">
          <div className="sa-premium-gradient-surface-soft rounded-xl border border-dashed border-white/35 p-4">
            <p className="text-sm text-white/60">System</p>
            <p className="text-lg font-semibold text-white">{title || 'Untitled tactic'}</p>
            <p className="mt-3 text-sm text-white/60">Selected principles</p>
            <ul className="mt-2 list-inside list-disc text-sm text-white/85">
              {(selectedItems.length ? selectedItems : ['No principles selected']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <button className="rounded-xl border border-white/35 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
            Save tactic
          </button>
        </SectionBlock>
      </div>
    </div>
  );
}
