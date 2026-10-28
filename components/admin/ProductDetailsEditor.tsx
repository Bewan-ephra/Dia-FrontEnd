"use client";
import { Plus, Trash2 } from "lucide-react";
import type { ProductDetails } from "@/lib/api/products";

type Pair = { label: string; value: string };
type Benefit = { icon: string; title: string; description: string };

const ICONS = [
  { value: "droplet", label: "Goutte (respirant, léger)" },
  { value: "shirt", label: "Vêtement (coupe, confort)" },
  { value: "zap", label: "Éclair (énergie, liberté)" },
  { value: "heart", label: "Cœur (style, sobriété)" },
];

const field = "border rounded px-3 py-2 text-sm w-full";

// Retire les lignes vides avant l'envoi ; renvoie null si la fiche est entièrement vide
export function cleanDetails(d: ProductDetails): ProductDetails | null {
  const clean: ProductDetails = {};

  const summary = d.summary?.trim();
  if (summary) clean.summary = summary;

  const pairs = (list?: Pair[]) =>
    (list ?? [])
      .map((p) => ({ label: p.label.trim(), value: p.value.trim() }))
      .filter((p) => p.label && p.value);
  const strings = (list?: string[]) => (list ?? []).map((s) => s.trim()).filter(Boolean);

  const specs = pairs(d.specs);
  if (specs.length) clean.specs = specs;

  const features = strings(d.features);
  if (features.length) clean.features = features;

  const benefits = (d.benefits ?? [])
    .map((b) => ({ icon: b.icon, title: b.title.trim(), description: b.description.trim() }))
    .filter((b) => b.title && b.description);
  if (benefits.length) clean.benefits = benefits;

  const idealFor = strings(d.idealFor);
  if (idealFor.length) clean.idealFor = idealFor;

  const care = pairs(d.care);
  if (care.length) clean.care = care;

  return Object.keys(clean).length > 0 ? clean : null;
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 flex items-center gap-1 text-blue-600 text-sm"
    >
      <Plus size={14} /> {children}
    </button>
  );
}

function StringList({
  title, hint, items, onChange, placeholder, max,
}: {
  title: string; hint?: string; items: string[];
  onChange: (items: string[]) => void; placeholder: string; max: number;
}) {
  return (
    <div>
      <p className="font-medium text-sm">{title}</p>
      {hint && <p className="text-gray-500 text-xs mb-2">{hint}</p>}
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={item}
              maxLength={80}
              placeholder={placeholder}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              className={field}
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      {items.length < max && <AddButton onClick={() => onChange([...items, ""])}>Ajouter</AddButton>}
    </div>
  );
}

function PairList({
  title, hint, items, onChange, firstKey, firstPlaceholder, secondPlaceholder, max,
}: {
  title: string; hint?: string; items: Pair[]; onChange: (items: Pair[]) => void;
  firstKey: "label" | "value"; firstPlaceholder: string; secondPlaceholder: string; max: number;
}) {
  const secondKey = firstKey === "label" ? "value" : "label";
  const update = (i: number, key: keyof Pair, v: string) =>
    onChange(items.map((p, j) => (j === i ? { ...p, [key]: v } : p)));

  return (
    <div>
      <p className="font-medium text-sm">{title}</p>
      {hint && <p className="text-gray-500 text-xs mb-2">{hint}</p>}
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={item[firstKey]}
              maxLength={50}
              placeholder={firstPlaceholder}
              onChange={(e) => update(i, firstKey, e.target.value)}
              className={field}
            />
            <input
              value={item[secondKey]}
              maxLength={200}
              placeholder={secondPlaceholder}
              onChange={(e) => update(i, secondKey, e.target.value)}
              className={field}
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      {items.length < max && (
        <AddButton onClick={() => onChange([...items, { label: "", value: "" }])}>Ajouter</AddButton>
      )}
    </div>
  );
}

export default function ProductDetailsEditor({
  value,
  onChange,
}: {
  value: ProductDetails;
  onChange: (d: ProductDetails) => void;
}) {
  const set = (patch: Partial<ProductDetails>) => onChange({ ...value, ...patch });
  const benefits: Benefit[] = value.benefits ?? [];
  const updateBenefit = (i: number, patch: Partial<Benefit>) =>
    set({ benefits: benefits.map((b, j) => (j === i ? { ...b, ...patch } : b)) });

  return (
    <div className="flex flex-col gap-6 border-t pt-6 mt-2">
      <div>
        <h2 className="text-xl font-bold">Fiche détaillée</h2>
        <p className="text-gray-500 text-xs">
          Ces blocs s&apos;affichent sur la page du produit. Tout est facultatif : un bloc vide
          n&apos;apparaît pas.
        </p>
      </div>

      <div>
        <p className="font-medium text-sm mb-1">Résumé (encadré « En bref »)</p>
        <textarea
          value={value.summary ?? ""}
          maxLength={1000}
          rows={3}
          onChange={(e) => set({ summary: e.target.value })}
          className={field}
        />
      </div>

      <PairList
        title="Chiffres clés"
        hint="La valeur s'affiche en grand, le libellé dessous. Ex. : « 100 % » puis « coton »."
        items={value.specs ?? []}
        onChange={(specs) => set({ specs })}
        firstKey="value"
        firstPlaceholder="Valeur (ex. 100 %)"
        secondPlaceholder="Libellé (ex. coton)"
        max={8}
      />

      <StringList
        title="Points forts (pastilles)"
        items={value.features ?? []}
        onChange={(features) => set({ features })}
        placeholder="Ex. : Manches courtes"
        max={12}
      />

      <div>
        <p className="font-medium text-sm">Pourquoi vous allez l&apos;adopter</p>
        <p className="text-gray-500 text-xs mb-2">6 avantages au maximum.</p>
        <div className="flex flex-col gap-3">
          {benefits.map((b, i) => (
            <div key={i} className="border rounded-lg p-3 flex flex-col gap-2">
              <select
                value={b.icon}
                onChange={(e) => updateBenefit(i, { icon: e.target.value })}
                className={field}
              >
                {ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>{icon.label}</option>
                ))}
              </select>
              <input
                value={b.title}
                maxLength={80}
                placeholder="Titre (ex. Respirant)"
                onChange={(e) => updateBenefit(i, { title: e.target.value })}
                className={field}
              />
              <input
                value={b.description}
                maxLength={200}
                placeholder="Description courte"
                onChange={(e) => updateBenefit(i, { description: e.target.value })}
                className={field}
              />
              <button
                type="button"
                onClick={() => set({ benefits: benefits.filter((_, j) => j !== i) })}
                className="text-red-600 text-sm self-end flex items-center gap-1"
              >
                <Trash2 size={14} /> Retirer
              </button>
            </div>
          ))}
        </div>
        {benefits.length < 6 && (
          <AddButton
            onClick={() => set({ benefits: [...benefits, { icon: "heart", title: "", description: "" }] })}
          >
            Ajouter un avantage
          </AddButton>
        )}
      </div>

      <StringList
        title="Idéal pour"
        items={value.idealFor ?? []}
        onChange={(idealFor) => set({ idealFor })}
        placeholder="Ex. : Quotidien"
        max={12}
      />

      <PairList
        title="Matière et entretien"
        items={value.care ?? []}
        onChange={(care) => set({ care })}
        firstKey="label"
        firstPlaceholder="Libellé (ex. Entretien)"
        secondPlaceholder="Détail (ex. Lavage à 30 °C)"
        max={8}
      />
    </div>
  );
}