export const siteTheme = {
  brand: {
    name: "PineCrest",
    wordmark:
      "bg-gradient-to-r from-foreground via-foreground/75 to-muted-foreground bg-clip-text text-transparent",
    primaryCta:
      "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
  },
  hero: {
    pill: "border border-border/60 bg-background/70 shadow-sm backdrop-blur",
    softCard: "border border-border/60 bg-background/70 shadow-sm backdrop-blur",
    imageOverlay: "bg-gradient-to-br from-primary/10 via-transparent to-accent/10",
    highlightText:
      "bg-gradient-to-b from-foreground via-foreground/70 to-muted-foreground bg-clip-text text-transparent",
  },
} as const;

