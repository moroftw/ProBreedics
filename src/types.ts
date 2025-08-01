export type Sex = 'M' | 'F';

export interface Dog {
  id?: number;
  name: string;
  sex: Sex;
  breed?: string;
  birthdate?: string; // YYYY-MM-DD
  color?: string;
  microchip?: string;
  notes?: string;
  imageUri?: string;
}

export interface GeneticTest {
  id?: number;
  dogId: number;
  testName: string;
  result?: string;
  lab?: string;
  date?: string;    // YYYY-MM-DD
  notes?: string;
}

export type VetType = 'VACCINATION' | 'DEWORMING' | 'EXAM' | 'SURGERY' | 'OTHER';

export interface VetRecord {
  id?: number;
  dogId: number;
  type: VetType;
  title: string;
  date: string;        // YYYY-MM-DD
  nextDueDate?: string; // optional reminder
  notes?: string;
}
