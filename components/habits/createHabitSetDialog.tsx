"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createHabitSet } from "@/app/(app)/habits/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/auth/fieldError";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { habitSetColors } from "./habitSetColors";

export default function CreateHabitSetDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [nameError, setNameError] = useState("");


function handleSubmit(formData: FormData) {
  setServerError("");
  setNameError("");

  startTransition(async () => {
    const res = await createHabitSet(formData);

    if (!res.ok) {
      if (res.fieldErrors?.name) setNameError(res.fieldErrors.name);

      setServerError(res.message || "Please fix the errors and try again.");
      return;
    }

    setSelectedColor("");
    setOpen(false);
    router.push(`/habits/new?setId=${res.habitSetId}`);
  });
}
useEffect(() => {
    if (!open) {
      setNameError("");
      setServerError("");
      setSelectedColor("");
    }
  }, [open]);


  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setServerError("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Add Habit Set</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Habit Set</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Set Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Fitness"
              disabled={isPending}
            />
            <FieldError message={nameError} />
          </div>

          <div className="space-y-1">
            <Label>Color</Label>

            {/* hidden input for server action */}
            <input type="hidden" name="color" value={selectedColor} />

            <Select
              value={selectedColor}
              onValueChange={setSelectedColor}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a color" />
              </SelectTrigger>

              <SelectContent>
                {habitSetColors.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full border"
                        style={{ backgroundColor: c.value }}
                      />
                      <span>{c.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FieldError message={serverError} />

          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
