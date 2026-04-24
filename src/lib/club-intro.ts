/**
 * Public landing copy for `/` — edit this file to match your club or lab.
 * (LabLog stays the product name; the club block below is yours.)
 */

/** Browser tab / bookmark icon and in-app branding (place file under `public/`). */
export const clubBrandLogo = {
  src: "/brand/chem-e-car-ku-logo.png",
  alt: "Chem-E Car KU Jayhawks",
} as const;

export const clubIntro = {
  kicker: "About this club",
  clubName: "Chem-E Car Lab",
  tagline:
    "A student team that designs, tests, and races a small chemically powered vehicle for the AIChE Chem-E Car competition. We won the Mid American Regional Competition in 2026.",
  paragraphs: [
    "We won the Mid American Regional Competition in 2026. Between regionals and nationals we meet regularly to work on chemistry, controls, mechanical design, and safety. The goal is a reliable car that stops on target and teaches everyone something new each semester.",
    "New members are welcome whether you are focused on hands-on bench work, modeling, documentation, or logistics. We split work so competition deadlines stay manageable alongside classes.",
  ],
  focusAreas: [
    {
      title: "Chemistry & power",
      body: "Reaction timing, energy delivery, and testing so the car’s chemical system performs safely and predictably for the motor and stopping challenge.",
    },
    {
      title: "Mechanical & integration",
      body: "Chassis, stopping mechanism, and packaging so the whole system is safe and repeatable on race day.",
    },
    {
      title: "Operations & knowledge",
      body: "Shared lab notes, calendars, and weekly summaries so the team stays aligned when schedules get busy.",
    },
  ],
} as const;
