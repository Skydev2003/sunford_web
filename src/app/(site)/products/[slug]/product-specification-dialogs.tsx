"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useReturnState } from "@/features/site/history/return-state";
import { ChevronDown, X } from "lucide-react";
import styles from "./product-detail.module.css";

type SpecificationGroup = {
  id: string;
  title: string;
  rows: { label: string; html: string }[];
};

const subscribe = () => () => {};

function SpecificationCard({ group }: { group: SpecificationGroup }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useReturnState(`product-specification.${group.id}`, false);
  useEffect(() => {
    const element = dialog.current;
    if (open) element?.showModal();
    else element?.close();
    return () => element?.close();
  }, [open]);
  const titleId = `product-specification-${group.id}`;

  return (
    <article className={styles.specCard}>
      <button
        className={styles.specCardButton}
        type="button"
        aria-haspopup="dialog"
        aria-labelledby={`${titleId}-card`}
        disabled={!hydrated}
        onClick={() => setOpen(true)}
      >
        <span id={`${titleId}-card`}>{group.title}</span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        className={styles.specDialog}
        aria-labelledby={titleId}
        data-return-scope={`specification-${group.id}`}
        onCancel={() => setOpen(false)}
      >
        <div className={styles.dialogHeader}>
          <h3 id={titleId}>{group.title}</h3>
          <button className={styles.dialogClose} type="button" onClick={() => setOpen(false)}>
            <X size={16} aria-hidden="true" /> ปิด
          </button>
        </div>
        <div className={styles.dialogContent}>
          <div className="product-attributes">
            <table aria-label={group.title}>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td
                      className="product-attribute-content"
                      dangerouslySetInnerHTML={{ __html: row.html }}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </dialog>
    </article>
  );
}

export function ProductSpecificationDialogs({ groups }: { groups: SpecificationGroup[] }) {
  return (
    <div className="product-spec-groups">
      {groups.map((group) => (
        <SpecificationCard key={group.id} group={group} />
      ))}
    </div>
  );
}
