import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

function authorize(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret');
  return secret === process.env.ADMIN_TOOLS_SECRET;
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) return unauthorized();

  const body = await req.json();
  const { action, table, id, data, filters, select, order, limit } = body;

  if (!action) return badRequest('Missing action');

  try {
    switch (action) {
      // ── Generic CRUD ──────────────────────────────────────

      case 'list': {
        if (!table) return badRequest('Missing table');
        let query = supabase.from(table).select(select || '*');
        if (filters) {
          for (const [key, value] of Object.entries(filters)) {
            query = query.eq(key, value);
          }
        }
        if (order) {
          const [col, dir] = Array.isArray(order) ? order : [order, 'asc'];
          query = query.order(col, { ascending: dir !== 'desc' });
        }
        if (limit) query = query.limit(limit);
        const { data: rows, error } = await query;
        if (error) throw error;
        return NextResponse.json({ data: rows });
      }

      case 'get': {
        if (!table || !id) return badRequest('Missing table or id');
        const { data: row, error } = await supabase
          .from(table)
          .select(select || '*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return NextResponse.json({ data: row });
      }

      case 'insert': {
        if (!table || !data) return badRequest('Missing table or data');
        const { data: inserted, error } = await supabase
          .from(table)
          .insert(data)
          .select();
        if (error) throw error;
        return NextResponse.json({ data: inserted });
      }

      case 'update': {
        if (!table || !id || !data) return badRequest('Missing table, id, or data');
        const { data: updated, error } = await supabase
          .from(table)
          .update(data)
          .eq('id', id)
          .select();
        if (error) throw error;
        return NextResponse.json({ data: updated });
      }

      case 'upsert': {
        if (!table || !data) return badRequest('Missing table or data');
        const { data: upserted, error } = await supabase
          .from(table)
          .upsert(data)
          .select();
        if (error) throw error;
        return NextResponse.json({ data: upserted });
      }

      case 'delete': {
        if (!table || !id) return badRequest('Missing table or id');
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // ── Raw SQL (for complex queries) ─────────────────────

      case 'sql': {
        const { query: sql, params } = body;
        if (!sql) return badRequest('Missing query');
        const { data: result, error } = await supabase.rpc('exec_sql', {
          query: sql,
          params: params || [],
        });
        if (error) {
          // Fallback: try direct Supabase REST if RPC not available
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ data: result });
      }

      // ── Bulk operations ───────────────────────────────────

      case 'bulk_update': {
        if (!table || !filters || !data) return badRequest('Missing table, filters, or data');
        let query = supabase.from(table).update(data);
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value as string);
        }
        const { data: updated, error } = await query.select();
        if (error) throw error;
        return NextResponse.json({ data: updated });
      }

      case 'bulk_delete': {
        if (!table || !filters) return badRequest('Missing table or filters');
        let query = supabase.from(table).delete();
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value as string);
        }
        const { error } = await query;
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // ── Count ─────────────────────────────────────────────

      case 'count': {
        if (!table) return badRequest('Missing table');
        let query = supabase.from(table).select('*', { count: 'exact', head: true });
        if (filters) {
          for (const [key, value] of Object.entries(filters)) {
            query = query.eq(key, value);
          }
        }
        const { count, error } = await query;
        if (error) throw error;
        return NextResponse.json({ count });
      }

      // ── Storage ───────────────────────────────────────────

      case 'list_storage': {
        const { bucket, path: folder } = body;
        const { data: files, error } = await supabase.storage
          .from(bucket || 'vehicles')
          .list(folder || '');
        if (error) throw error;
        return NextResponse.json({ data: files });
      }

      case 'delete_storage': {
        const { bucket, paths } = body;
        if (!paths) return badRequest('Missing paths');
        const { error } = await supabase.storage
          .from(bucket || 'vehicles')
          .remove(paths);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      default:
        return badRequest(`Unknown action: ${action}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
