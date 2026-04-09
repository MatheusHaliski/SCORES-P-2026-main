export const SHELL_BACKGROUND_KEY = 'scores.shellBackground';
export const SHELL_BACKGROUND_CUSTOM_STYLE_KEY = 'scores.shellBackground.customStyle';
export const SHELL_BACKGROUND_CUSTOM_OPTION_ID = 'studio-custom';

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

export type ShellBackgroundStyle = ShellBackgroundOption["style"];

export const SHELL_BACKGROUND_OPTIONS: ShellBackgroundOption[] = [
  {
    id: 'classic',
    label: 'Classic Arena',
    description: 'Tema clássico da interface SCORES.',
    style: {
      backgroundColor: '#5b4a2d',
      backgroundImage:
        "linear-gradient(rgba(44, 34, 18, 0.46), rgba(44, 34, 18, 0.46)), repeating-linear-gradient(90deg, #d2be74 0 12.5%, #5b4a2d 12.5% 25%), url('/scores_bg_2.png')",
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
  {
    id: SHELL_BACKGROUND_CUSTOM_OPTION_ID,
    label: 'Studio Custom',
    description: 'Aplicado automaticamente pelo Background Studio.',
    style: {
      backgroundColor: '#020617',
      backgroundImage: "linear-gradient(145deg, #0f172a 0%, #020617 100%)",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    },
  },
];

function isValidStyle(value: unknown): value is ShellBackgroundStyle {
  if (!value || typeof value !== 'object') return false;
  const maybeStyle = value as Record<string, unknown>;
  return typeof maybeStyle.backgroundImage === 'string';
}

export function resolveShellBackgroundStyle(customStyleRaw: string | null | undefined): ShellBackgroundStyle | null {
  if (!customStyleRaw) return null;
  try {
    const parsed = JSON.parse(customStyleRaw) as unknown;
    if (!isValidStyle(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getShellBackgroundOption(
  optionId: string | null | undefined,
  customStyleRaw?: string | null,
): ShellBackgroundOption {
  if (optionId === SHELL_BACKGROUND_CUSTOM_OPTION_ID) {
    const resolvedCustomStyle = resolveShellBackgroundStyle(customStyleRaw);
    if (resolvedCustomStyle) {
      return {
        id: SHELL_BACKGROUND_CUSTOM_OPTION_ID,
        label: 'Studio Custom',
        description: 'Tema personalizado via Background Studio.',
        style: resolvedCustomStyle,
      };
    }
  }
  if (!optionId) return SHELL_BACKGROUND_OPTIONS[0];
  return SHELL_BACKGROUND_OPTIONS.find((option) => option.id === optionId) ?? SHELL_BACKGROUND_OPTIONS[0];
}
