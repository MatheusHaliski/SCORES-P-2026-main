import ProfileSummaryCard from '@/app/components/cards/ProfileSummaryCard';
import ContextSectionMenu from '@/app/components/navigation/ContextSectionMenu';
import PageHeader from '@/app/components/shell/PageHeader';
import SectionBlock from '@/app/components/shared/SectionBlock';

const sections = ['Manager Info', 'Saved Tactics', 'Roster Plans', 'Scouting Notes', 'Settings'];

const schemes = ['Half-Court Control', 'Transition Blitz', 'Bench Pressure Unit'];

export default function ProfileView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <ContextSectionMenu title="Manager Menu" sections={sections} />
      <div className="space-y-6">
        <PageHeader title="Profile" subtitle="Manage your SCORES identity, saves, and tactical assets." />

        <ProfileSummaryCard username="coach_aria" followers="12.4K" following="914" score="9.6" />

        <SectionBlock title="Saved Tactics" subtitle="Recently edited tactical setups.">
          <ul className="grid gap-x-3 gap-y-3 sm:grid-cols-2">
            {schemes.map((scheme) => (
              <li key={scheme} className="sa-premium-gradient-surface-soft rounded-xl border border-white/25 px-4 py-3 text-sm text-white/90">
                {scheme}
              </li>
            ))}
          </ul>
        </SectionBlock>
      </div>
    </div>
  );
}
