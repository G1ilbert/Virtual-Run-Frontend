"use client";

import { useEffect } from "react";
import { useProvinces, useDistricts, useSubDistricts } from "@/hooks/useApi";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeographyPickerProps {
  provinceId?: number;
  districtId?: number;
  subDistrictId?: number;
  onProvinceChange: (id: number | undefined) => void;
  onDistrictChange: (id: number | undefined) => void;
  onSubDistrictChange: (id: number | undefined) => void;
  disabled?: boolean;
}

export function GeographyPicker({
  provinceId,
  districtId,
  subDistrictId,
  onProvinceChange,
  onDistrictChange,
  onSubDistrictChange,
  disabled = false,
}: GeographyPickerProps) {
  const { data: provinces } = useProvinces();
  const { data: districts } = useDistricts(provinceId);
  const { data: subDistricts } = useSubDistricts(districtId);

  // Reset cascading when parent changes
  useEffect(() => {
    if (provinceId && districts && districtId) {
      const valid = districts.some((d) => d.id === districtId);
      if (!valid) {
        onDistrictChange(undefined);
        onSubDistrictChange(undefined);
      }
    }
  }, [provinceId, districts]);

  useEffect(() => {
    if (districtId && subDistricts && subDistrictId) {
      const valid = subDistricts.some((s) => s.id === subDistrictId);
      if (!valid) {
        onSubDistrictChange(undefined);
      }
    }
  }, [districtId, subDistricts]);

  const postalCode = subDistricts?.find((s) => s.id === subDistrictId)?.postalCode;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>จังหวัด</Label>
        <Select
          value={provinceId?.toString() ?? ""}
          onValueChange={(v) => {
            onProvinceChange(v ? Number(v) : undefined);
            onDistrictChange(undefined);
            onSubDistrictChange(undefined);
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกจังหวัด..." />
          </SelectTrigger>
          <SelectContent>
            {provinces?.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.nameTh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>อำเภอ / เขต</Label>
        <Select
          value={districtId?.toString() ?? ""}
          onValueChange={(v) => {
            onDistrictChange(v ? Number(v) : undefined);
            onSubDistrictChange(undefined);
          }}
          disabled={disabled || !provinceId}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกอำเภอ / เขต..." />
          </SelectTrigger>
          <SelectContent>
            {districts?.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.nameTh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>ตำบล / แขวง</Label>
        <Select
          value={subDistrictId?.toString() ?? ""}
          onValueChange={(v) => onSubDistrictChange(v ? Number(v) : undefined)}
          disabled={disabled || !districtId}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกตำบล / แขวง..." />
          </SelectTrigger>
          <SelectContent>
            {subDistricts?.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.nameTh}
                {s.postalCode && ` (${s.postalCode})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {postalCode && (
        <p className="text-sm text-muted-foreground">
          รหัสไปรษณีย์: {postalCode}
        </p>
      )}
    </div>
  );
}
