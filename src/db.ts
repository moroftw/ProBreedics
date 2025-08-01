/* eslint-disable @typescript-eslint/no-explicit-any */
import * as SQLite from 'expo-sqlite';

/* —————————————————————————————————
   1.  SINGLETON DB HANDLE
   ————————————————————————————————— */
let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('probreedics.db');
  return _db;
}

/* —————————————————————————————————
   2.  INITIALISATION
   ————————————————————————————————— */
export async function initDb() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS dogs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT,
      sex         TEXT,
      breed       TEXT,
      birthdate   TEXT,
      color       TEXT,
      microchip   TEXT,
      notes       TEXT,
      imageUri    TEXT
    );

    CREATE TABLE IF NOT EXISTS matings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      maleDogId   INTEGER,
      femaleDogId INTEGER,
      date        TEXT,
      FOREIGN KEY (maleDogId)   REFERENCES dogs(id) ON DELETE CASCADE,
      FOREIGN KEY (femaleDogId) REFERENCES dogs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS genetic_tests (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      dogId       INTEGER,
      testName    TEXT,
      result      TEXT,
      lab         TEXT,
      date        TEXT,
      notes       TEXT,
      FOREIGN KEY (dogId) REFERENCES dogs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vet_records (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      dogId       INTEGER,
      type        TEXT,
      title       TEXT,
      date        TEXT,
      nextDueDate TEXT,
      notes       TEXT,
      FOREIGN KEY (dogId) REFERENCES dogs(id) ON DELETE CASCADE
    );
  `);
}

/* —————————————————————————————————
   3.  DOGS CRUD
   ————————————————————————————————— */
export async function getDogs() {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM dogs ORDER BY id;');
}

export async function getDogById(id: number) {
  const db = await getDb();
  return await db.getFirstAsync('SELECT * FROM dogs WHERE id=?;', [id]);
}

export async function insertDog(d: any) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO dogs (name,sex,breed,birthdate,color,microchip,notes,imageUri)
     VALUES (?,?,?,?,?,?,?,?)`,
    [d.name, d.sex, d.breed, d.birthdate, d.color, d.microchip, d.notes, d.imageUri]
  );
}

export async function updateDog(id: number, d: any) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE dogs SET
        name=?,sex=?,breed=?,birthdate=?,color=?,microchip=?,notes=?,imageUri=?
     WHERE id=?`,
    [d.name, d.sex, d.breed, d.birthdate, d.color, d.microchip, d.notes, d.imageUri, id]
  );
}

export async function deleteDog(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM dogs WHERE id=?;', [id]);
}

/* —————————————————————————————————
   4.  MATINGS CRUD
   ————————————————————————————————— */
export async function getMatings() {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM matings ORDER BY date DESC, id DESC;');
}

export async function insertMating(m: { maleDogId: number; femaleDogId: number; date: string }) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO matings (maleDogId,femaleDogId,date) VALUES (?,?,?)',
    [m.maleDogId, m.femaleDogId, m.date]
  );
}

export async function updateMating(id: number, m: { maleDogId: number; femaleDogId: number; date: string }) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE matings SET maleDogId=?, femaleDogId=?, date=? WHERE id=?',
    [m.maleDogId, m.femaleDogId, m.date, id]
  );
}

export async function deleteMating(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM matings WHERE id=?;', [id]);
}

/* —————————————————————————————————
   5.  GENETIC TESTS CRUD
   ————————————————————————————————— */
export async function insertGeneticTest(t: {
  dogId: number;
  testName: string;
  result?: string;
  lab?: string;
  date?: string;
  notes?: string;
}) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO genetic_tests (dogId,testName,result,lab,date,notes)
     VALUES (?,?,?,?,?,?)`,
    [t.dogId, t.testName, t.result, t.lab, t.date, t.notes]
  );
}

export async function getGeneticTests(dogId: number) {
  const db = await getDb();
  return await db.getAllAsync(
    `SELECT * FROM genetic_tests WHERE dogId=? ORDER BY date DESC, id DESC;`,
    [dogId]
  );
}

export async function deleteGeneticTest(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM genetic_tests WHERE id=?;', [id]);
}

/* —————————————————————————————————
   6.  VET RECORDS CRUD
   ————————————————————————————————— */
export async function insertVetRecord(r: {
  dogId: number;
  type: string;
  title: string;
  date: string;
  nextDueDate?: string;
  notes?: string;
}) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO vet_records (dogId,type,title,date,nextDueDate,notes)
     VALUES (?,?,?,?,?,?)`,
    [r.dogId, r.type, r.title, r.date, r.nextDueDate, r.notes]
  );
}

export async function getVetRecords(dogId: number) {
  const db = await getDb();
  return await db.getAllAsync(
    `SELECT * FROM vet_records WHERE dogId=? ORDER BY date DESC, id DESC;`,
    [dogId]
  );
}

export async function deleteVetRecord(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM vet_records WHERE id=?;', [id]);
}
