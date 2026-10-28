"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Save } from "lucide-react";
import { SafetyDialog } from "./safety-dialog";

const warning = "มีข้อมูลที่ยังไม่ได้บันทึก ต้องการทิ้งการเปลี่ยนแปลงหรือไม่?";
type Entry = {
  form: HTMLFormElement;
  title: string;
  dirty: boolean;
  busy: boolean;
  saving: boolean;
};
type Guard = {
  update: (id: string, entry: Entry | null) => void;
  confirmOthers: (id: string) => boolean | Promise<boolean>;
  confirm: () => Promise<boolean>;
};
const UnsavedContext = createContext<Guard | null>(null);

export function AdminUnsavedChanges({ children }: { children: ReactNode }) {
  const entries = useRef(new Map<string, Entry>());
  const leaving = useRef(false);
  const [pending, setPending] = useState<[string, Entry][]>([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const answer = useRef<((accepted: boolean) => void) | null>(null);
  const ask = useCallback((text: string) => {
    if (answer.current) return Promise.resolve(false);
    setMessage(text);
    return new Promise<boolean>((resolve) => {
      answer.current = resolve;
    });
  }, []);
  useEffect(
    () => () => {
      answer.current?.(false);
      answer.current = null;
    },
    [],
  );
  function respond(accepted: boolean) {
    const resolve = answer.current;
    answer.current = null;
    setMessage("");
    resolve?.(accepted);
  }
  const update = useCallback((id: string, entry: Entry | null) => {
    leaving.current = false;
    if (entry) entries.current.set(id, entry);
    else entries.current.delete(id);
    setPending([...entries.current].filter(([, item]) => item.dirty));
  }, []);
  const confirmOthers = useCallback(
    (id: string) => {
      const others = [...entries.current].filter(([key, item]) => key !== id && item.dirty);
      if (!others.length) return true;
      return ask(
        `ยังมีอีก ${others.length} ฟอร์มที่ไม่ได้บันทึก การบันทึกนี้อาจเปลี่ยนหน้าและทิ้งการแก้ไขในฟอร์มเหล่านั้น ต้องการดำเนินการต่อหรือไม่?`,
      );
    },
    [ask],
  );

  useEffect(() => {
    function blocked() {
      return [...entries.current.values()].some((entry) => entry.dirty);
    }
    async function leave() {
      if (!blocked()) return true;
      if ([...entries.current.values()].some((entry) => entry.busy)) return false;
      return ask(warning);
    }
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!leaving.current && blocked()) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    function click(event: MouseEvent) {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.download ||
        link.hasAttribute("data-admin-detail")
      )
        return;
      const next = new URL(link.href);
      if (
        next.origin === location.origin &&
        next.pathname === location.pathname &&
        next.search === location.search &&
        next.hash
      )
        return;
      if (!blocked() || leaving.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void leave().then((accepted) => {
        if (!accepted || !link.isConnected) return;
        leaving.current = true;
        link.click();
        window.setTimeout(() => {
          leaving.current = false;
        }, 0);
      });
    }
    function submit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.hasAttribute("data-unsaved-form")) return;
      if (!blocked() || leaving.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void leave().then((accepted) => {
        if (!accepted || !form.isConnected) return;
        leaving.current = true;
        form.requestSubmit();
        window.setTimeout(() => {
          leaving.current = false;
        }, 0);
      });
    }
    const navigation = (
      window as unknown as {
        navigation?: EventTarget & { traverseTo: (key: string) => unknown };
      }
    ).navigation;
    function navigate(event: Event) {
      const navigationEvent = event as Event & {
        navigationType: string;
        destination: { sameDocument: boolean; key: string };
      };
      if (
        navigationEvent.navigationType === "traverse" &&
        navigationEvent.destination.sameDocument &&
        event.cancelable &&
        blocked() &&
        !retrying
      ) {
        event.preventDefault();
        void leave().then((accepted) => {
          if (!accepted) return;
          retrying = true;
          navigation?.traverseTo(navigationEvent.destination.key);
        });
      } else retrying = false;
    }
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    let index = Number(history.state?.adminHistoryIndex ?? 0);
    let restoring = false;
    let retrying = false;
    if (!navigation) {
      originalReplace.call(history, { ...history.state, adminHistoryIndex: index }, "");
      history.pushState = function (state, unused, url) {
        index += 1;
        originalPush.call(this, { ...state, adminHistoryIndex: index }, unused, url);
      };
      history.replaceState = function (state, unused, url) {
        originalReplace.call(this, { ...state, adminHistoryIndex: index }, unused, url);
      };
    }
    function pop(event: PopStateEvent) {
      const destination = Number(event.state?.adminHistoryIndex ?? index - 1);
      const delta = destination - index;
      if (retrying) {
        retrying = false;
        index = destination;
        return;
      }
      if (restoring) {
        restoring = false;
        event.stopImmediatePropagation();
        void leave().then((accepted) => {
          if (accepted) {
            retrying = true;
            history.go(deltaToRetry);
          }
        });
        return;
      }
      if (delta && blocked()) {
        event.stopImmediatePropagation();
        restoring = true;
        deltaToRetry = delta;
        history.go(-delta);
      } else index = destination;
    }
    let deltaToRetry = 0;
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    document.addEventListener("submit", submit, true);
    navigation?.addEventListener("navigate", navigate);
    if (!navigation) window.addEventListener("popstate", pop, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
      document.removeEventListener("submit", submit, true);
      navigation?.removeEventListener("navigate", navigate);
      window.removeEventListener("popstate", pop, true);
      if (!navigation) {
        history.pushState = originalPush;
        history.replaceState = originalReplace;
      }
    };
  }, [ask]);

  const visible = pending.filter(([, item]) => !item.form.closest(".admin-editor-modal-content"));
  const active = visible.find(([id]) => id === selected) ?? visible.at(-1);
  return (
    <UnsavedContext.Provider value={{ update, confirmOthers, confirm: () => ask(warning) }}>
      {children}
      {active && (
        <section className="admin-unsaved-bar" aria-label="การแก้ไขที่ยังไม่บันทึก">
          <div>
            <p role="status">มีการแก้ไขที่ยังไม่ได้บันทึก</p>
            {visible.length > 1 ? (
              <select
                aria-label="เลือกฟอร์มที่จะบันทึก"
                value={active[0]}
                onChange={(event) => setSelected(event.target.value)}
              >
                {visible.map(([id, item]) => (
                  <option key={id} value={id}>
                    {item.title}
                  </option>
                ))}
              </select>
            ) : (
              <span>{active[1].title}</span>
            )}
          </div>
          <button
            type="button"
            className="button button-red"
            disabled={active[1].busy}
            onClick={() => active[1].form.requestSubmit()}
          >
            <Save size={16} /> {active[1].saving ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </section>
      )}
      <SafetyDialog open={!!message} title="ยังไม่ได้บันทึกการแก้ไข" onClose={() => respond(false)}>
        <p>{message}</p>
        <div className="admin-form-actions">
          <button type="button" className="admin-button-secondary" onClick={() => respond(false)}>
            แก้ไขต่อ
          </button>
          <button type="button" className="admin-button-danger" onClick={() => respond(true)}>
            ทิ้งการเปลี่ยนแปลง
          </button>
        </div>
      </SafetyDialog>
    </UnsavedContext.Provider>
  );
}

function snapshot(form: HTMLFormElement) {
  return JSON.stringify(
    Array.from(form.elements).flatMap((element) => {
      if (
        !(
          element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement
        ) ||
        !element.name ||
        (element instanceof HTMLInputElement && ["file", "submit", "button"].includes(element.type))
      )
        return [];
      if (element instanceof HTMLInputElement && ["checkbox", "radio"].includes(element.type))
        return [[element.name, element.checked]];
      return [[element.name, element.value]];
    }),
  );
}

export function useUnsavedForm({
  title,
  busy,
  saving,
  success = false,
  resetKey,
  onDirty,
}: {
  title: string;
  busy: boolean;
  saving: boolean;
  success?: unknown;
  resetKey?: string;
  onDirty?: (dirty: boolean) => void;
}) {
  const guard = useContext(UnsavedContext);
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const baseline = useRef<string | null>(null);
  const baselineKey = useRef(resetKey);
  const savedResult = useRef<unknown>(undefined);
  const submitAllowed = useRef(false);
  const dirty = useRef(false);
  const [changed, setChanged] = useState(false);
  const update = guard?.update;
  const check = useCallback(() => {
    if (!form.current) return;
    const value = snapshot(form.current);
    if (baselineKey.current !== resetKey) {
      baselineKey.current = resetKey;
      baseline.current = value;
    }
    baseline.current ??= value;
    if (success && savedResult.current !== success) {
      baseline.current = value;
      savedResult.current = success;
    }
    const next = value !== baseline.current;
    dirty.current = next;
    setChanged(next);
    onDirty?.(next);
  }, [onDirty, resetKey, success]);
  useEffect(() => {
    check();
  });
  useEffect(() => {
    if (form.current) update?.(id, { form: form.current, title, dirty: changed, busy, saving });
  }, [id, title, changed, success, busy, saving, update]);
  useEffect(() => () => update?.(id, null), [id, update]);
  async function discard() {
    if (busy || (dirty.current && !(guard ? await guard.confirm() : window.confirm(warning))))
      return false;
    dirty.current = false;
    if (form.current) baseline.current = snapshot(form.current);
    update?.(id, null);
    return true;
  }
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!guard || submitAllowed.current) {
      submitAllowed.current = false;
      return;
    }
    const decision = guard.confirmOthers(id);
    if (decision === true) return;
    event.preventDefault();
    const submittedForm = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    void Promise.resolve(decision).then((accepted) => {
      if (!accepted || !submittedForm.isConnected) return;
      submitAllowed.current = true;
      submittedForm.requestSubmit(submitter);
      submitAllowed.current = false;
    });
  }
  return {
    bindings: { ref: form, "data-unsaved-form": id, onInput: check, onChange: check, onSubmit },
    discard,
    dirty: changed,
  };
}
