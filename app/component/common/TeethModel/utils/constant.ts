export interface ToothData {
  number: number;
  name: string;
  type: string;
  quadrant: string;
  description: string;
  years: string;
  condition?: string;
}

export   const legend = [
    { years: "7-8", type: "Central Incisor" },
    { years: "8-9", type: "Lateral Incisor" },
    { years: "11-12", type: "Cuspid" },
    { years: "10-11", type: "1st Premolar" },
    { years: "10-12", type: "2nd Premolar" },
    { years: "6-7", type: "1st Molar" },
    { years: "12-13", type: "2nd Molar" },
    { years: "17-21", type: "3rd Molar" },
  ];

  export const getToothName = (n: number) => {
  if ([8, 9, 24, 25].includes(n)) return "Central Incisor";
  if ([7, 10, 23, 26].includes(n)) return "Lateral Incisor";
  if ([6, 11, 22, 27].includes(n)) return "Cuspid (Canine)";
  if ([5, 12, 21, 28].includes(n)) return "1st Premolar";
  if ([4, 13, 20, 29].includes(n)) return "2nd Premolar";
  if ([3, 14, 19, 30].includes(n)) return "1st Molar";
  if ([2, 15, 18, 31].includes(n)) return "2nd Molar";
  if ([1, 16, 17, 32].includes(n)) return "3rd Molar";
  return "Unknown";
};



export const teethData: ToothData[] = [
  // ---- (same data you had, unchanged) ----
  // Upper Right (Quadrant 1)
  { number: 1, name: "Upper Right Third Molar", type: "3rd Molar", quadrant: "Upper Right", description: "Wisdom tooth", years: "17-21",condition: "cavity" },
  { number: 2, name: "Upper Right Second Molar", type: "2nd Molar", quadrant: "Upper Right", description: "12-year molar", years: "12-13" },
  { number: 3, name: "Upper Right First Molar", type: "1st Molar", quadrant: "Upper Right", description: "6-year molar", years: "6-7" },
  { number: 4, name: "Upper Right Second Premolar", type: "2nd Premolar", quadrant: "Upper Right", description: "Bicuspid", years: "10-12" },
  { number: 5, name: "Upper Right First Premolar", type: "1st Premolar", quadrant: "Upper Right", description: "Bicuspid", years: "10-11" },
  { number: 6, name: "Upper Right Canine", type: "Cuspid", quadrant: "Upper Right", description: "Eye tooth", years: "11-12" },
  { number: 7, name: "Upper Right Lateral Incisor", type: "Lateral Incisor", quadrant: "Upper Right", description: "Front tooth", years: "8-9" },
  { number: 8, name: "Upper Right Central Incisor", type: "Central Incisor", quadrant: "Upper Right", description: "Front tooth", years: "7-8" },

  // Upper Left (Quadrant 2)
  { number: 9, name: "Upper Left Central Incisor", type: "Central Incisor", quadrant: "Upper Left", description: "Front tooth", years: "7-8" },
  { number: 10, name: "Upper Left Lateral Incisor", type: "Lateral Incisor", quadrant: "Upper Left", description: "Front tooth", years: "8-9" },
  { number: 11, name: "Upper Left Canine", type: "Cuspid", quadrant: "Upper Left", description: "Eye tooth", years: "11-12" },
  { number: 12, name: "Upper Left First Premolar", type: "1st Premolar", quadrant: "Upper Left", description: "Bicuspid", years: "10-11" },
  { number: 13, name: "Upper Left Second Premolar", type: "2nd Premolar", quadrant: "Upper Left", description: "Bicuspid", years: "10-12" },
  { number: 14, name: "Upper Left First Molar", type: "1st Molar", quadrant: "Upper Left", description: "6-year molar", years: "6-7" },
  { number: 15, name: "Upper Left Second Molar", type: "2nd Molar", quadrant: "Upper Left", description: "12-year molar", years: "12-13" },
  { number: 16, name: "Upper Left Third Molar", type: "3rd Molar", quadrant: "Upper Left", description: "Wisdom tooth", years: "17-21" },

  // Lower Left (Quadrant 3)
  { number: 17, name: "Lower Left Third Molar", type: "3rd Molar", quadrant: "Lower Left", description: "Wisdom tooth", years: "17-21" },
  { number: 18, name: "Lower Left Second Molar", type: "2nd Molar", quadrant: "Lower Left", description: "12-year molar", years: "11-13" },
  { number: 19, name: "Lower Left First Molar", type: "1st Molar", quadrant: "Lower Left", description: "6-year molar", years: "6-7",condition: "filling" },
  { number: 20, name: "Lower Left Second Premolar", type: "2nd Premolar", quadrant: "Lower Left", description: "Bicuspid", years: "11-12" },
  { number: 21, name: "Lower Left First Premolar", type: "1st Premolar", quadrant: "Lower Left", description: "Bicuspid", years: "10-12" },
  { number: 22, name: "Lower Left Canine", type: "Cuspid", quadrant: "Lower Left", description: "Eye tooth", years: "9-10" },
  { number: 23, name: "Lower Left Lateral Incisor", type: "Lateral Incisor", quadrant: "Lower Left", description: "Front tooth", years: "7-8" },
  { number: 24, name: "Lower Left Central Incisor", type: "Central Incisor", quadrant: "Lower Left", description: "Front tooth", years: "6-7" },

  // Lower Right (Quadrant 4)
  { number: 25, name: "Lower Right Central Incisor", type: "Central Incisor", quadrant: "Lower Right", description: "Front tooth", years: "6-7",condition:"rct" },
  { number: 26, name: "Lower Right Lateral Incisor", type: "Lateral Incisor", quadrant: "Lower Right", description: "Front tooth", years: "7-8" },
  { number: 27, name: "Lower Right Canine", type: "Cuspid", quadrant: "Lower Right", description: "Eye tooth", years: "9-10" },
  { number: 28, name: "Lower Right First Premolar", type: "1st Premolar", quadrant: "Lower Right", description: "Bicuspid", years: "10-12" },
  { number: 29, name: "Lower Right Second Premolar", type: "2nd Premolar", quadrant: "Lower Right", description: "Bicuspid", years: "11-12" },
  { number: 30, name: "Lower Right First Molar", type: "1st Molar", quadrant: "Lower Right", description: "6-year molar", years: "6-7" },
  { number: 31, name: "Lower Right Second Molar", type: "2nd Molar", quadrant: "Lower Right", description: "12-year molar", years: "11-13" },
  { number: 32, name: "Lower Right Third Molar", type: "3rd Molar", quadrant: "Lower Right", description: "Wisdom tooth", years: "17-21" },
];