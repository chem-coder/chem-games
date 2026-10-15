// Storyboards: click-through frames before a level. Each frame: a text key (map locale) and
// an animation id drawn by map/js/storyboard.js in the bubble language.
export const STORYBOARDS = {
  "plus-minus": {
    skill: "charges",
    frames: [
      { text: "sb_pm_1", anim: "two-apart" },
      { text: "sb_pm_2", anim: "attract" },
      { text: "sb_pm_3", anim: "repel" },
      { text: "sb_pm_4", anim: "closer" },
      { text: "sb_pm_5", anim: "hydrogen" }
    ],
    next: { label: "sb_pm_go", href: "../atomic-structure/" }
  }
};
