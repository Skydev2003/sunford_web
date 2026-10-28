export function CharacterCount({
  value,
  max,
  recommended,
  id,
}: {
  value: string;
  max: number;
  recommended?: number;
  id?: string;
}) {
  return (
    <small
      id={id}
      className={`admin-character-count ${value.length > (recommended ?? max) ? "is-long" : ""}`}
    >
      {value.length.toLocaleString("th-TH")} / {max.toLocaleString("th-TH")} ตัวอักษร
      {recommended &&
        ` · แนะนำไม่เกิน ${recommended} ตัวอักษร${value.length > recommended ? " (ยาวกว่าที่แนะนำ)" : ""}`}
    </small>
  );
}
