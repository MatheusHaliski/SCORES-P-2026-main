export const motionDurations = {
  micro: 150,
  microFast: 120,
  microSlow: 180,
  panel: 300,
  panelFast: 250,
  panelSlow: 350,
} as const;

export const motionEasing = {
  easePremiumInOut: "cubic-bezier(0.22, 0.61, 0.36, 1)",
  easeQuickExit: "cubic-bezier(0.4, 0, 1, 1)",
  easeBroadcastSlide: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeStatPop: "cubic-bezier(0.2, 0.9, 0.3, 1.15)",
} as const;

export const motionTokens = {
  duration: motionDurations,
  easing: motionEasing,
} as const;
