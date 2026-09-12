import { useId, useState } from 'react';
import { cx } from '@/lib/cx';
import { asset } from '@/lib/content';
import { blankFrom, type Field } from './schema';

/* -------------------------------------------------------------------------- */
/* Shared input chrome                                                        */
/* -------------------------------------------------------------------------- */

const INPUT =
  'w-full rounded-[3px] border border-[var(--color-rule)] bg-[var(--color-surface)] px-3 py-2 text-[0.875rem] text-[var(--color-ink)] transition-colors placeholder:text-[var(--color-ink-3)] focus:border-[var(--color-accent)] focus:outline-none focus-visible:outline-none';

function Labelled({
  label,
  help,
  htmlFor,
  children,
}: {
  label: string;
  help?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[0.8125rem] font-medium text-[var(--color-ink)]"
      >
        {label}
      </label>
      {children}
      {help ? <p className="mt-1.5 text-[0.75rem] leading-snug text-[var(--color-ink-3)]">{help}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field dispatcher                                                           */
/* -------------------------------------------------------------------------- */

export interface FieldProps {
  field: Field;
  value: unknown;
  onChange: (next: unknown) => void;
  /** Opens the media picker; resolves to a repo-relative path. */
  onPickMedia: (kind: 'image' | 'file') => Promise<string | null>;
}

export function FieldControl({ field, value, onChange, onPickMedia }: FieldProps) {
  switch (field.type) {
    case 'textarea':
      return <TextAreaField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    case 'number':
      return <NumberField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    case 'select':
      return <SelectField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    case 'boolean':
      return <BooleanField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    case 'tags':
      return <TagsField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    case 'paragraphs':
      return <ParagraphsField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    case 'image':
    case 'file':
      return <MediaField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    case 'group':
      return <GroupField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    case 'objectList':
      return <ObjectListField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    case 'toggleMap':
      return <ToggleMapField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
    default:
      return <TextField field={field} value={value} onChange={onChange} onPickMedia={onPickMedia} />;
  }
}

/* -------------------------------------------------------------------------- */

function TextField({ field, value, onChange }: FieldProps) {
  const id = useId();
  const type = field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text';
  return (
    <Labelled label={field.label} help={field.help} htmlFor={id}>
      <input
        id={id}
        type={type}
        className={INPUT}
        value={String(value ?? '')}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Labelled>
  );
}

function TextAreaField({ field, value, onChange }: FieldProps) {
  const id = useId();
  return (
    <Labelled label={field.label} help={field.help} htmlFor={id}>
      <textarea
        id={id}
        rows={field.rows ?? 3}
        className={cx(INPUT, 'resize-y leading-[1.6]', field.key === 'bibtex' && 'font-mono text-[0.8125rem]')}
        value={String(value ?? '')}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Labelled>
  );
}

function NumberField({ field, value, onChange }: FieldProps) {
  const id = useId();
  return (
    <Labelled label={field.label} help={field.help} htmlFor={id}>
      <input
        id={id}
        type="number"
        className={INPUT}
        value={Number(value ?? 0)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </Labelled>
  );
}

function SelectField({ field, value, onChange }: FieldProps) {
  const id = useId();
  return (
    <Labelled label={field.label} help={field.help} htmlFor={id}>
      <select id={id} className={INPUT} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)}>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Labelled>
  );
}

function BooleanField({ field, value, onChange }: FieldProps) {
  const id = useId();
  const checked = Boolean(value);
  return (
    <div className="flex items-start gap-3 py-1">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
      />
      <div>
        <label htmlFor={id} className="text-[0.8125rem] font-medium text-[var(--color-ink)]">
          {field.label}
        </label>
        {field.help ? (
          <p className="mt-1 text-[0.75rem] leading-snug text-[var(--color-ink-3)]">{field.help}</p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** A list of short strings — technologies, keywords, authors. */
function TagsField({ field, value, onChange }: FieldProps) {
  const items = Array.isArray(value) ? (value as string[]) : [];
  const [draft, setDraft] = useState('');
  const id = useId();

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft('');
  };

  return (
    <Labelled label={field.label} help={field.help} htmlFor={id}>
      {items.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-[2px] border border-[var(--color-rule)] bg-[var(--color-surface-2)] py-1 pl-2.5 pr-1 text-[0.75rem] text-[var(--color-ink-2)]"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label={`Remove ${item}`}
                className="flex h-4 w-4 items-center justify-center rounded-[2px] text-[var(--color-ink-3)] transition-colors hover:bg-[var(--color-rule)] hover:text-[var(--color-ink)]"
              >
                <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="m2 2 6 6M8 2l-6 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          className={INPUT}
          value={draft}
          placeholder="Type and press Enter"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-[3px] border border-[var(--color-rule)] px-3 text-[0.8125rem] text-[var(--color-ink-2)] transition-colors hover:border-[var(--color-rule-strong)] hover:text-[var(--color-ink)]"
        >
          Add
        </button>
      </div>
    </Labelled>
  );
}

/** A list of long strings — biography paragraphs, bullet details. */
function ParagraphsField({ field, value, onChange }: FieldProps) {
  const items = Array.isArray(value) ? (value as string[]) : [];

  return (
    <div>
      <p className="mb-1.5 text-[0.8125rem] font-medium text-[var(--color-ink)]">{field.label}</p>
      {field.help ? <p className="mb-2 text-[0.75rem] text-[var(--color-ink-3)]">{field.help}</p> : null}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              rows={3}
              className={cx(INPUT, 'resize-y leading-[1.6]')}
              value={item}
              aria-label={`${field.label} ${index + 1}`}
              onChange={(event) => {
                const next = [...items];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <div className="flex shrink-0 flex-col gap-1">
              <MoveButton
                direction="up"
                disabled={index === 0}
                onClick={() => onChange(move(items, index, index - 1))}
              />
              <MoveButton
                direction="down"
                disabled={index === items.length - 1}
                onClick={() => onChange(move(items, index, index + 1))}
              />
              <RemoveButton onClick={() => onChange(items.filter((_, i) => i !== index))} label={`Remove paragraph ${index + 1}`} />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="mt-2 rounded-[3px] border border-[var(--color-rule)] px-3 py-1.5 text-[0.8125rem] text-[var(--color-ink-2)] transition-colors hover:border-[var(--color-rule-strong)] hover:text-[var(--color-ink)]"
      >
        Add paragraph
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function MediaField({ field, value, onChange, onPickMedia }: FieldProps) {
  const current = String(value ?? '');
  const isImage = field.type === 'image';

  return (
    <Labelled label={field.label} help={field.help}>
      <div className="flex flex-wrap items-start gap-3">
        {current && isImage ? (
          <img
            src={asset(current)}
            alt=""
            className="h-20 w-20 shrink-0 rounded-[3px] border border-[var(--color-rule)] object-cover"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <input
            type="text"
            className={INPUT}
            value={current}
            placeholder={isImage ? 'media/figure.png' : 'docs/paper.pdf'}
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={async () => {
                const path = await onPickMedia(isImage ? 'image' : 'file');
                if (path) onChange(path);
              }}
              className="rounded-[3px] border border-[var(--color-rule)] px-3 py-1.5 text-[0.8125rem] text-[var(--color-ink-2)] transition-colors hover:border-[var(--color-rule-strong)] hover:text-[var(--color-ink)]"
            >
              Upload…
            </button>
            {current ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="rounded-[3px] px-3 py-1.5 text-[0.8125rem] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Labelled>
  );
}

/* -------------------------------------------------------------------------- */

function GroupField({ field, value, onChange, onPickMedia }: FieldProps) {
  const record = (value ?? {}) as Record<string, unknown>;

  return (
    <fieldset className="rounded-[3px] border border-[var(--color-rule)] p-4">
      <legend className="px-1.5 text-[0.75rem] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
        {field.label}
      </legend>
      <div className="space-y-4">
        {(field.fields ?? []).map((sub) => (
          <FieldControl
            key={sub.key}
            field={sub}
            value={record[sub.key]}
            onPickMedia={onPickMedia}
            onChange={(next) => onChange({ ...record, [sub.key]: next })}
          />
        ))}
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */

function ObjectListField({ field, value, onChange, onPickMedia }: FieldProps) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);

  const update = (index: number, next: Record<string, unknown>) => {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-[0.8125rem] font-medium text-[var(--color-ink)]">
          {field.label}
          <span className="ml-2 font-mono text-[0.75rem] font-normal text-[var(--color-ink-3)]">
            {items.length}
          </span>
        </h3>
        <button
          type="button"
          onClick={() => {
            onChange([...items, blankFrom(field.fields ?? [])]);
            setOpenIndex(items.length);
          }}
          className="rounded-[3px] border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-1.5 text-[0.8125rem] text-[var(--color-paper)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Add
        </button>
      </div>

      {field.help ? <p className="mb-3 text-[0.75rem] text-[var(--color-ink-3)]">{field.help}</p> : null}

      {items.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-[var(--color-rule)] px-4 py-6 text-center text-[0.8125rem] text-[var(--color-ink-3)]">
          Nothing here yet.
        </p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => {
            const open = openIndex === index;
            const title = String(item[field.titleKey ?? 'title'] ?? `Item ${index + 1}`) || `Item ${index + 1}`;
            const subtitle = field.subtitleKey ? String(item[field.subtitleKey] ?? '') : '';

            return (
              <li key={index} className="rounded-[3px] border border-[var(--color-rule)] bg-[var(--color-surface)]">
                <div className="flex items-center gap-2 p-2.5">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="font-mono text-[0.6875rem] text-[var(--color-ink-3)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] text-[var(--color-ink)]">{title}</span>
                      {subtitle ? (
                        <span className="block truncate text-[0.75rem] text-[var(--color-ink-3)]">{subtitle}</span>
                      ) : null}
                    </span>
                    <svg
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                      className={cx('h-3 w-3 shrink-0 text-[var(--color-ink-3)] transition-transform', open && 'rotate-180')}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
                    </svg>
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    <MoveButton direction="up" disabled={index === 0} onClick={() => onChange(move(items, index, index - 1))} />
                    <MoveButton
                      direction="down"
                      disabled={index === items.length - 1}
                      onClick={() => onChange(move(items, index, index + 1))}
                    />
                    <RemoveButton onClick={() => setConfirmIndex(index)} label={`Delete ${title}`} />
                  </div>
                </div>

                {confirmIndex === index ? (
                  <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-rule)] bg-[var(--color-surface-2)] px-3 py-2.5">
                    <p className="text-[0.8125rem] text-[var(--color-ink-2)]">
                      Delete “{title}”? This cannot be undone once published.
                    </p>
                    <div className="ml-auto flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmIndex(null)}
                        className="rounded-[3px] px-3 py-1 text-[0.8125rem] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(items.filter((_, i) => i !== index));
                          setConfirmIndex(null);
                          setOpenIndex(null);
                        }}
                        className="rounded-[3px] border border-[#a33] bg-[#a33] px-3 py-1 text-[0.8125rem] text-white hover:bg-[#8c2a2a]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}

                {open ? (
                  <div className="space-y-4 border-t border-[var(--color-rule)] bg-[var(--color-surface-2)] p-4">
                    {(field.fields ?? []).map((sub) => (
                      <FieldControl
                        key={sub.key}
                        field={sub}
                        value={item[sub.key]}
                        onPickMedia={onPickMedia}
                        onChange={(next) => update(index, { ...item, [sub.key]: next })}
                      />
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/** A record of boolean flags, rendered as a checklist (section visibility). */
function ToggleMapField({ field, value, onChange }: FieldProps) {
  const record = (value ?? {}) as Record<string, boolean>;
  const keys = Object.keys(record);

  return (
    <fieldset className="rounded-[3px] border border-[var(--color-rule)] p-4">
      <legend className="px-1.5 text-[0.75rem] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
        {field.label}
      </legend>
      {field.help ? <p className="mb-3 text-[0.75rem] text-[var(--color-ink-3)]">{field.help}</p> : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {keys.map((key) => (
          <label key={key} className="flex items-center gap-2 text-[0.8125rem] text-[var(--color-ink-2)]">
            <input
              type="checkbox"
              checked={Boolean(record[key])}
              onChange={(event) => onChange({ ...record, [key]: event.target.checked })}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            <span className="capitalize">{key}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Small controls                                                             */
/* -------------------------------------------------------------------------- */

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function MoveButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'up' | 'down';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Move ${direction}`}
      className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-[var(--color-rule)] text-[var(--color-ink-3)] transition-colors hover:border-[var(--color-rule-strong)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[var(--color-rule)]"
    >
      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className={cx('h-3 w-3', direction === 'down' && 'rotate-180')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9.5v-7M3 5.5 6 2.5l3 3" />
      </svg>
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-[var(--color-rule)] text-[var(--color-ink-3)] transition-colors hover:border-[#a33] hover:text-[#a33]"
    >
      <svg viewBox="0 0 12 12" aria-hidden="true" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2.5 3.5h7M5 3.5V2.5h2v1M4 3.5l.4 6h3.2l.4-6" />
      </svg>
    </button>
  );
}
