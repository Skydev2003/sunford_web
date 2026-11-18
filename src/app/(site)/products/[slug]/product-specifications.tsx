"use client";

import { useId, useSyncExternalStore } from "react";
import { useReturnState } from "@/features/site/history/return-state";
import { Minus, Plus } from "lucide-react";
import styles from "./product-detail.module.css";

type SpecificationGroup = {
  id: string;
  title: string;
  rows: { label: string; html: string }[];
};

const subscribe = () => () => {};

export function ProductSpecifications({ groups }: { groups: SpecificationGroup[] }) {
  const prefix = useId();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const weighing = groups.find((group) => group.id === "weighing");
  const [expanded, setExpanded] = useReturnState<string | null>(
    "product-specifications.expanded",
    weighing?.id ?? null,
  );
  const orderedGroups = weighing
    ? [weighing, ...groups.filter((group) => group !== weighing)]
    : groups;

  return (
    <div className="product-spec-groups">
      {orderedGroups.map((group) => {
        const open = expanded === group.id;
        const panelId = `${prefix}-${group.id}`;

        return (
          <article key={group.id} className={styles.specCard}>
            <button
              className={styles.specCardButton}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              disabled={!hydrated}
              onClick={() => setExpanded(open ? null : group.id)}
            >
              <span>{group.title}</span>
              {open ? (
                <Minus size={18} aria-hidden="true" />
              ) : (
                <Plus size={18} aria-hidden="true" />
              )}
            </button>
            <div id={panelId} className={styles.specPanel} data-open={open} inert={!open}>
              <div className={styles.specPanelClip}>
                <dl className={styles.specValues}>
                  {group.rows.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd
                        className="product-attribute-content"
                        dangerouslySetInnerHTML={{ __html: row.html }}
                      />
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
