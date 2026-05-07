export type CalendarEvent = {
  id: string;
  dayIndex: number; // 0=Mon ... 4=Fri
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  title: string;
  speakers?: string[];
  location?: string;
  variant?: "Short Tutorial" | "Long Tutorial" | "Lunch and Posters" | "Lunch" | "Break" | "Excursion" | "Goodbye" | "Breakfast";
};