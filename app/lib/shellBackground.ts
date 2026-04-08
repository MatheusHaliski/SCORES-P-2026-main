export const SHELL_BACKGROUND_KEY = 'scores.shellBackground';

export type ShellBackgroundOption = {
  id: string;
  label: string;
  description: string;
  style: {
    backgroundColor?: string;
    backgroundImage: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
    backgroundAttachment?: string;
    backgroundBlendMode?: string;
  };
};

export const SHELL_BACKGROUND_OPTIONS: ShellBackgroundOption[] = [
  {
    id: 'classic',
    label: 'Classic Arena',
    description: 'Tema clássico da interface SCORES.',
    style: {
      backgroundColor: '#5b4a2d',
      backgroundImage:
        "linear-gradient(rgba(44, 34, 18, 0.46), rgba(44, 34, 18, 0.46)), repeating-linear-gradient(90deg, #d2be74 0 12.5%, #5b4a2d 12.5% 25%), url('/3ACBE31C-208C-45C8-ABE6-0BB0DA3A9683.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      backgroundBlendMode: 'multiply, normal, normal',
    },
  },
  {
    id: 'night',
    label: 'Night Turf',
    description: 'Tonalidade escura com foco no conteúdo.',
    style: {
      backgroundColor: '#020617',
      backgroundImage:
        "radial-gradient(circle at 20% 15%, rgba(34, 197, 94, 0.26) 0%, transparent 40%), radial-gradient(circle at 80% 85%, rgba(56, 189, 248, 0.22) 0%, transparent 40%), linear-gradient(145deg, #0f172a 0%, #020617 100%)",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset Studio',
    description: 'Visual vibrante para customização de shell.',
    style: {
      backgroundColor: '#1f2937',
      backgroundImage:
        "radial-gradient(circle at 15% 25%, rgba(251, 146, 60, 0.35) 0%, transparent 36%), radial-gradient(circle at 85% 20%, rgba(236, 72, 153, 0.28) 0%, transparent 32%), linear-gradient(150deg, #111827 0%, #1d4ed8 45%, #0f766e 100%)",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    },
  },
];

export function getShellBackgroundOption(optionId: string | null | undefined): ShellBackgroundOption {
  if (!optionId) return SHELL_BACKGROUND_OPTIONS[0];
  return SHELL_BACKGROUND_OPTIONS.find((option) => option.id === optionId) ?? SHELL_BACKGROUND_OPTIONS[0];
}
