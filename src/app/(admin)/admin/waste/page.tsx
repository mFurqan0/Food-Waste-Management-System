import { Trash2 } from "lucide-react";
import { WasteForm } from "@/components/admin/WasteForm";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { MEAL_LABEL } from "@/lib/constants";
import { formatShort, todayIso } from "@/lib/date";
import { deleteWasteAction } from "@/server/actions/waste";
import { listRecentWaste } from "@/server/services/waste";

export const dynamic = "force-dynamic";
export const metadata = { title: "Waste Log" };

export default async function WastePage() {
  const today = todayIso();
  const rows = await listRecentWaste(14);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Waste log</h2>
        <p className="text-sm text-muted">Record leftover food after each meal, in kilograms.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <WasteForm today={today} />

        <Card className="xl:col-span-2">
          <CardHeader title="Recent entries" subtitle="Latest 14 logs" />
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Nothing logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Meal</th>
                    <th className="pb-3 text-right font-medium">Waste</th>
                    <th className="pb-3 text-right font-medium">Prepared</th>
                    <th className="pb-3 text-right font-medium">Waste %</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3">{formatShort(r.iso)}</td>
                      <td className="py-3">{MEAL_LABEL[r.meal]}</td>
                      <td className="py-3 text-right font-medium">{r.wasteKg.toFixed(1)} kg</td>
                      <td className="py-3 text-right text-muted">{r.preparedKg == null ? "–" : `${r.preparedKg.toFixed(1)} kg`}</td>
                      <td className="py-3 text-right text-muted">{r.wastePct == null ? "–" : `${r.wastePct.toFixed(1)}%`}</td>
                      <td className="py-3 text-right">
                        <form action={deleteWasteAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <Button type="submit" variant="danger" className="px-2.5 py-1.5" aria-label={`Delete ${MEAL_LABEL[r.meal]} log for ${formatShort(r.iso)}`}>
                            <Trash2 size={16} />
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
