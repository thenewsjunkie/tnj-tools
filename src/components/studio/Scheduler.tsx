import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  useSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useScheduleExecutor,
  ACTION_TYPES,
  SCHEDULE_TYPES,
  DAYS_OF_WEEK,
  TIMEZONES,
  type ScheduleInsert,
  type StudioSchedule,
} from "@/hooks/useScheduler";
import type { StudioModule } from "@/hooks/useOutputConfig";

const FULL_SCREEN_MODULES: { value: StudioModule; label: string }[] = [
  { value: "leaderboard", label: "Secret Shows Gifts" },
  { value: "hall-of-frame", label: "Hall of Frame" },
  { value: "live-chat", label: "Live Chat" },
  { value: "ads", label: "Ads" },
  { value: "teleprompter", label: "TelePrompter" },
  { value: "art-mode", label: "Art Mode" },
];

interface ScheduleFormState {
  label: string;
  action_type: string;
  action_payload: Record<string, any>;
  schedule_type: string;
  scheduled_time: string;
  scheduled_date: string;
  day_of_week: number;
  day_of_month: number;
  timezone: string;
  is_active: boolean;
}

const defaultForm: ScheduleFormState = {
  label: "",
  action_type: "set_full_screen",
  action_payload: { module: "art-mode" },
  schedule_type: "daily",
  scheduled_time: "12:00",
  scheduled_date: "",
  day_of_week: 1,
  day_of_month: 1,
  timezone: "America/New_York",
  is_active: true,
};

const Scheduler = () => {
  const { data: schedules, isLoading } = useSchedules();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  useScheduleExecutor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ScheduleFormState>(defaultForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (s: StudioSchedule) => {
    setEditingId(s.id);
    setForm({
      label: s.label ?? "",
      action_type: s.action_type,
      action_payload: s.action_payload,
      schedule_type: s.schedule_type,
      scheduled_time: s.scheduled_time?.slice(0, 5) ?? "12:00",
      scheduled_date: s.scheduled_date ?? "",
      day_of_week: s.day_of_week ?? 1,
      day_of_month: s.day_of_month ?? 1,
      timezone: s.timezone,
      is_active: s.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload: ScheduleInsert = {
      label: form.label || null,
      action_type: form.action_type,
      action_payload: form.action_payload,
      schedule_type: form.schedule_type,
      scheduled_time: form.scheduled_time,
      scheduled_date: form.schedule_type === "one_time" ? form.scheduled_date || null : null,
      day_of_week: form.schedule_type === "weekly" ? form.day_of_week : null,
      day_of_month: form.schedule_type === "monthly" ? form.day_of_month : null,
      timezone: form.timezone,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await updateSchedule.mutateAsync({ id: editingId, ...payload });
        toast.success("Schedule updated");
      } else {
        await createSchedule.mutateAsync(payload);
        toast.success("Schedule created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule.mutateAsync(id);
      toast.success("Schedule deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleActive = async (s: StudioSchedule) => {
    try {
      await updateSchedule.mutateAsync({ id: s.id, is_active: !s.is_active });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getActionLabel = (s: StudioSchedule) => {
    const base = ACTION_TYPES.find((a) => a.value === s.action_type)?.label ?? s.action_type;
    if (s.action_type === "set_full_screen") {
      const mod = FULL_SCREEN_MODULES.find((m) => m.value === s.action_payload?.module);
      return `${base}: ${mod?.label ?? s.action_payload?.module}`;
    }
    if (["toggle_art_mode", "toggle_ads", "toggle_teleprompter"].includes(s.action_type)) {
      return `${base.replace(" On/Off", "")}: ${s.action_payload?.enable ? "On" : "Off"}`;
    }
    return base;
  };

  const getScheduleLabel = (s: StudioSchedule) => {
    const time = s.scheduled_time?.slice(0, 5) ?? "";
    switch (s.schedule_type) {
      case "daily": return `Daily @ ${time}`;
      case "weekly": return `${DAYS_OF_WEEK[s.day_of_week ?? 0]}s @ ${time}`;
      case "monthly": return `${s.day_of_month}${ordinal(s.day_of_month ?? 1)} @ ${time}`;
      case "one_time": return `${s.scheduled_date} @ ${time}`;
      default: return time;
    }
  };

  // Update action_payload when action_type changes
  const setActionType = (type: string) => {
    let payload: Record<string, any> = {};
    if (type === "set_full_screen") payload = { module: "art-mode" };
    if (["toggle_art_mode", "toggle_ads", "toggle_teleprompter"].includes(type)) payload = { enable: true };
    setForm((f) => ({ ...f, action_type: type, action_payload: payload }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Schedule studio actions to run automatically.
        </p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !schedules?.length ? (
        <p className="text-sm text-muted-foreground text-center py-6">No schedules yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead className="w-16">Active</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((s) => (
              <TableRow key={s.id} className={!s.is_active ? "opacity-50" : ""}>
                <TableCell className="font-medium">{s.label || "—"}</TableCell>
                <TableCell className="text-sm">{getActionLabel(s)}</TableCell>
                <TableCell className="text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getScheduleLabel(s)}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Schedule" : "New Schedule"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Label */}
            <div className="space-y-1">
              <Label>Label (optional)</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Start Art Mode"
              />
            </div>

            {/* Action Type */}
            <div className="space-y-1">
              <Label>Action</Label>
              <Select value={form.action_type} onValueChange={setActionType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Details */}
            {form.action_type === "set_full_screen" && (
              <div className="space-y-1">
                <Label>Module</Label>
                <Select
                  value={form.action_payload.module ?? "art-mode"}
                  onValueChange={(v) => setForm((f) => ({ ...f, action_payload: { module: v } }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FULL_SCREEN_MODULES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {["toggle_art_mode", "toggle_ads", "toggle_teleprompter"].includes(form.action_type) && (
              <div className="flex items-center gap-2">
                <Label>Enable</Label>
                <Switch
                  checked={form.action_payload.enable ?? true}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, action_payload: { enable: v } }))}
                />
              </div>
            )}

            {/* Schedule Type */}
            <div className="space-y-1">
              <Label>Frequency</Label>
              <Select value={form.schedule_type} onValueChange={(v) => setForm((f) => ({ ...f, schedule_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SCHEDULE_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time */}
            <div className="space-y-1">
              <Label>Time</Label>
              <Input
                type="time"
                value={form.scheduled_time}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_time: e.target.value }))}
              />
            </div>

            {/* Conditional day/date */}
            {form.schedule_type === "one_time" && (
              <div className="space-y-1">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                />
              </div>
            )}

            {form.schedule_type === "weekly" && (
              <div className="space-y-1">
                <Label>Day of Week</Label>
                <Select
                  value={String(form.day_of_week)}
                  onValueChange={(v) => setForm((f) => ({ ...f, day_of_week: Number(v) }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.schedule_type === "monthly" && (
              <div className="space-y-1">
                <Label>Day of Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={form.day_of_month}
                  onChange={(e) => setForm((f) => ({ ...f, day_of_month: Number(e.target.value) }))}
                />
              </div>
            )}

            {/* Timezone */}
            <div className="space-y-1">
              <Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => setForm((f) => ({ ...f, timezone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <Label>Active</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default Scheduler;
