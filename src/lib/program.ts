import type { Locale, ProgramWeek } from "@/lib/types";

type ProgramTranslation = {
  phaseAccumulation: string;
  phaseStrength: string;
  phaseTaper: string;
  phasePr: string;
  goalStrength: string;
  goalAccumulation: string;
  goalTaper: string;
  goalPr: string;
  mondayHeavySquat: string;
  tuesdayHeavyBench: string;
  wednesdayTechnique: string;
  thursdayHeavyDeadlift: string;
  saturdayBenchSpeed: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  deloadNotes: string;
  evaluationNotes: string;
};

const copy: Record<Locale, ProgramTranslation> = {
  es: {
    phaseAccumulation: "Acumulación y técnica",
    phaseStrength: "Intensificación",
    phaseTaper: "Descarga",
    phasePr: "Taper / evaluación controlada",
    goalAccumulation: "Acumular trabajo técnico a RPE 6–7.5 y mantener repeticiones en reserva.",
    goalStrength: "Reducir repeticiones y practicar cargas más altas a RPE 7–8.5.",
    goalTaper: "Reducir volumen y esfuerzo para disipar fatiga, conservando la técnica.",
    goalPr: "Reducir fatiga y evaluar la técnica; una prueba controlada es opcional.",
    mondayHeavySquat: "Sentadilla + accesorios",
    tuesdayHeavyBench: "Press banca + tren superior",
    wednesdayTechnique: "Técnica de pierna + movilidad",
    thursdayHeavyDeadlift: "Peso muerto sumo",
    saturdayBenchSpeed: "Press banca explosivo",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    deloadNotes: "RPE 5–6. Bajar el volumen general, conservar técnica y evitar el fallo.",
    evaluationNotes: "Calienta de forma gradual y realiza el trabajo técnico previsto. Si te sientes recuperado, puedes elegir y confirmar manualmente sustituirlo por una sola repetición controlada a RPE 8 como máximo. No se programa un intento máximo ni un aumento automático de carga.",
  },
  en: {
    phaseAccumulation: "Accumulation and technique",
    phaseStrength: "Intensification",
    phaseTaper: "Deload",
    phasePr: "Taper / controlled assessment",
    goalAccumulation: "Build technical volume at RPE 6–7.5, leaving repetitions in reserve.",
    goalStrength: "Reduce repetitions and practice heavier loads at RPE 7–8.5.",
    goalTaper: "Reduce volume and effort to manage fatigue while maintaining technique.",
    goalPr: "Reduce fatigue and assess technique; a controlled test is optional.",
    mondayHeavySquat: "Squat + accessories",
    tuesdayHeavyBench: "Bench + upper body",
    wednesdayTechnique: "Lower body technique + mobility",
    thursdayHeavyDeadlift: "Sumo deadlift",
    saturdayBenchSpeed: "Explosive bench press",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    deloadNotes: "RPE 5–6. Reduce overall volume, maintain technique and avoid failure.",
    evaluationNotes: "Warm up gradually and complete the planned technique work. If recovered, you may manually choose and confirm replacing it with one controlled single at no more than RPE 8. No maximal attempt or automatic load increase is prescribed.",
  },
  de: {
    phaseAccumulation: "Akkumulation und Technik",
    phaseStrength: "Intensivierung",
    phaseTaper: "Entlastung",
    phasePr: "Taper / kontrollierte Bewertung",
    goalAccumulation: "Technisches Volumen bei RPE 6–7.5 aufbauen und Wiederholungen in Reserve lassen.",
    goalStrength: "Wiederholungen reduzieren und hoehere Lasten bei RPE 7–8.5 ueben.",
    goalTaper: "Volumen und Anstrengung reduzieren, Ermuedung abbauen und Technik erhalten.",
    goalPr: "Ermuedung reduzieren und Technik bewerten; ein kontrollierter Test ist optional.",
    mondayHeavySquat: "Kniebeuge + Zubehoer",
    tuesdayHeavyBench: "Bankdruecken + Oberkoerper",
    wednesdayTechnique: "Beintechnik + Mobilitaet",
    thursdayHeavyDeadlift: "Sumo-Kreuzheben",
    saturdayBenchSpeed: "Explosives Bankdruecken",
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    deloadNotes: "RPE 5–6. Gesamtvolumen reduzieren, Technik erhalten und Muskelversagen vermeiden.",
    evaluationNotes: "Schrittweise aufwaermen und die geplante Technikarbeit ausfuehren. Bei guter Erholung kann nach eigener manueller Wahl und Bestaetigung eine kontrollierte Einzelwiederholung mit maximal RPE 8 stattdessen erfolgen. Kein Maximalversuch und keine automatische Laststeigerung.",
  },
};

function strengthSessions(locale: Locale, accumulation: boolean) {
  const t = copy[locale];
  const main = accumulation ? "4x5 · RPE 6–7.5" : "4x3 · RPE 7–8.5";
  const secondary = accumulation ? "3x5 · RPE 6–7" : "3x4 · RPE 7";

  return [
    {
      day_label: t.monday,
      focus: t.mondayHeavySquat,
      exercises: [
        { name: "Sentadilla con barra", prescription: main },
        { name: "Sentadilla con pausa", prescription: secondary },
        { name: "Peso muerto rumano", prescription: "4x8" },
        { name: "Hip thrust o sentadilla búlgara", prescription: "3x12" },
        { name: "Abdominales con carga", prescription: "3x15" },
      ],
    },
    {
      day_label: t.tuesday,
      focus: t.tuesdayHeavyBench,
      exercises: [
        { name: "Press banca", prescription: main },
        { name: "Press banca con pausa", prescription: secondary },
        { name: "Remo con barra", prescription: "4x8" },
        { name: "Press militar", prescription: "4x6-8" },
        { name: "Dominadas", prescription: "3x8-10" },
        { name: "Fondos", prescription: "3x10" },
      ],
    },
    {
      day_label: t.wednesday,
      focus: t.wednesdayTechnique,
      exercises: [
        { name: "Sentadilla técnica", prescription: "3x4 · RPE 6" },
        { name: "Peso muerto sumo con pausa", prescription: "3x4 · RPE 6" },
        { name: "Gemelos", prescription: "4x15" },
        { name: "Movilidad", prescription: "15-20 min" },
      ],
    },
    {
      day_label: t.thursday,
      focus: t.thursdayHeavyDeadlift,
      exercises: [
        { name: "Peso muerto sumo", prescription: main },
        { name: "Peso muerto sumo con pausa", prescription: secondary },
        { name: "Sentadilla frontal o goblet squat", prescription: "4x6-8" },
        { name: "Hiperextensiones", prescription: "3x12-15" },
        { name: "Curl con barra", prescription: "3x10-12" },
      ],
    },
    {
      day_label: t.saturday,
      focus: t.saturdayBenchSpeed,
      exercises: [
        { name: "Press banca explosivo", prescription: "4x3 · RPE 6" },
        { name: "Press militar ligero", prescription: "4x6" },
        { name: "Remo", prescription: "3x10" },
        { name: "Face pulls", prescription: "3x15" },
        { name: "Extensión de tríceps", prescription: "3x12-15" },
        { name: "Movilidad y estabilidad", prescription: "10-15 min" },
      ],
    },
  ];
}

function taperSessions(locale: Locale) {
  const t = copy[locale];

  return [
    {
      day_label: t.monday,
      focus: t.mondayHeavySquat,
      notes: t.deloadNotes,
      exercises: [
        { name: "Sentadilla con barra", prescription: "2x3 · RPE 5–6" },
        { name: "Sentadilla con pausa", prescription: "2x3 · RPE 5–6" },
        { name: "Peso muerto rumano", prescription: "2x6" },
      ],
    },
    {
      day_label: t.tuesday,
      focus: t.tuesdayHeavyBench,
      notes: t.deloadNotes,
      exercises: [
        { name: "Press banca", prescription: "2x3 · RPE 5–6" },
        { name: "Press banca con pausa", prescription: "2x3 · RPE 5–6" },
        { name: "Remo con barra", prescription: "2x8" },
      ],
    },
    {
      day_label: t.thursday,
      focus: t.thursdayHeavyDeadlift,
      notes: t.deloadNotes,
      exercises: [
        { name: "Peso muerto sumo", prescription: "2x3 · RPE 5–6" },
        { name: "Peso muerto sumo con pausa", prescription: "2x3 · RPE 5–6" },
        { name: "Hiperextensiones", prescription: "2x10" },
      ],
    },
  ];
}

function evaluationSessions(locale: Locale) {
  const t = copy[locale];

  return [
    {
      day_label: t.monday,
      focus: t.mondayHeavySquat,
      notes: t.evaluationNotes,
      exercises: [{ name: "Sentadilla con barra", prescription: "3x2 · RPE 6–7" }],
    },
    {
      day_label: t.wednesday,
      focus: t.tuesdayHeavyBench,
      notes: t.evaluationNotes,
      exercises: [{ name: "Press banca", prescription: "3x2 · RPE 6–7" }],
    },
    {
      day_label: t.friday,
      focus: t.thursdayHeavyDeadlift,
      notes: t.evaluationNotes,
      exercises: [{ name: "Peso muerto sumo", prescription: "3x2 · RPE 6–7" }],
    },
  ];
}

export function createCycleTemplate(locale: Locale): ProgramWeek[] {
  const t = copy[locale];
  const weeks: ProgramWeek[] = Array.from({ length: 6 }, (_, index) => ({
    week_number: index + 1,
    phase: index < 3 ? t.phaseAccumulation : t.phaseStrength,
    goal: index < 3 ? t.goalAccumulation : t.goalStrength,
    sessions: strengthSessions(locale, index < 3),
  }));

  weeks.push({
    week_number: 7,
    phase: t.phaseTaper,
    goal: t.goalTaper,
    sessions: taperSessions(locale),
  });

  weeks.push({
    week_number: 8,
    phase: t.phasePr,
    goal: t.goalPr,
    sessions: evaluationSessions(locale),
  });

  return weeks;
}
