export const motionTokens = {
  duration: {
    micro: 150,
    microFast: 120,
    microSlow: 180,
    panel: 300,
    panelFast: 250,
    panelSlow: 350,
  },
  easing: {
    easePremiumInOut: "cubic-bezier(0.22, 0.61, 0.36, 1)",
    easeQuickExit: "cubic-bezier(0.4, 0, 1, 1)",
    easeStatPop: "cubic-bezier(0.2, 0.9, 0.3, 1.15)",
    easeBroadcastSlide: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;

export type MotionTokens = typeof motionTokens;
