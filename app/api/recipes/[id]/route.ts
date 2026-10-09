import { db } from '@/lib/db';

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.execute({ sql: 'DELETE FROM recipes WHERE id = ?', args: [id] });
  return Response.json({ ok: true });
}
