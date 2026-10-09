import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const EXAMPLE_RECIPES = [
  {
    name: 'Ensalada César Clásica',
    ingredients: 'Lechuga romana\nCroutons\nQueso parmesano\nHuevo\nAnchoas\nSalsa César casera',
    instructions: 'Lavar la lechuga y cortar en trozos medianos.\nTostar pan casero para los croutons.\nMezclar todo con la salsa César.\nServir frío.',
  },
  {
    name: 'Brownies de Chocolate',
    ingredients: '200g chocolate amargo\n150g mantequilla\n3 huevos\n100g azúcar\n80g harina\nPizca de sal\nVainilla',
    instructions: 'Derretir el chocolate con la mantequilla a baño maría.\nBatir los huevos con el azúcar hasta que estén espumosos.\nMezclar con el chocolate derretido.\nAgregar la harina, sal y vainilla.\nVerter en un molde engrasado.\nHornear 25 minutos a 180°C.',
  },
];

export async function GET() {
  // Create tables atomically
  await db.batch([
    `CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS _init_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    )`
  ], 'write');

  // Atomic idempotent initialization using transaction
  const tx = await db.transaction('write');
  try {
    const { rows } = await tx.execute("SELECT value FROM _init_meta WHERE key = 'recipes_seeded'");
    if (rows.length === 0) {
      for (const recipe of EXAMPLE_RECIPES) {
        await tx.execute({
          sql: 'INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)',
          args: [recipe.name, recipe.ingredients, recipe.instructions],
        });
      }
      await tx.execute("INSERT INTO _init_meta (key, value) VALUES ('recipes_seeded', '1')");
    }
    await tx.commit();
  } catch {
    await tx.rollback();
  }

  const result = await db.execute('SELECT * FROM recipes ORDER BY created_at DESC');
  return Response.json(result.rows);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name || !body.ingredients || !body.instructions) {
    return Response.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute({
    sql: 'INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)',
    args: [body.name, body.ingredients, body.instructions],
  });

  return Response.json({ ok: true });
}
