import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  title: string;
  description: string;
  type: "Урок" | "Презентация" | "Методичка" | "Тест" | "Проект" | "Курс";
  year: string;
  link?: string;
}

interface ProfileData {
  name: string;
  role: string;
  university: string;
  specialty: string;
  courseGroup: string;
  about: string;
  email: string;
  phone: string;
  telegram: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PRODUCT_TYPES: Product["type"][] = [
  "Урок", "Презентация", "Методичка", "Тест", "Проект", "Курс"
];

const TYPE_COLORS: Record<Product["type"], string> = {
  "Урок": "bg-indigo-100 text-indigo-700",
  "Презентация": "bg-amber-100 text-amber-700",
  "Методичка": "bg-emerald-100 text-emerald-700",
  "Тест": "bg-rose-100 text-rose-700",
  "Проект": "bg-purple-100 text-purple-700",
  "Курс": "bg-sky-100 text-sky-700",
};

const DEMO_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Основы физической культуры",
    description: "Вводный урок по теории и методике физического воспитания для студентов первого курса. Включает историю развития ФК в России.",
    type: "Урок",
    year: "2025",
  },
  {
    id: "2",
    title: "Здоровый образ жизни",
    description: "Интерактивная презентация с инфографикой о влиянии физической активности на здоровье человека.",
    type: "Презентация",
    year: "2025",
  },
  {
    id: "3",
    title: "Методика проведения зарядки",
    description: "Подробное методическое пособие по проведению утренней гимнастики в образовательных учреждениях.",
    type: "Методичка",
    year: "2025",
  },
  {
    id: "4",
    title: "Контрольный тест по анатомии",
    description: "Тест для проверки знаний анатомии опорно-двигательного аппарата — 25 вопросов с вариантами ответов.",
    type: "Тест",
    year: "2026",
  },
  {
    id: "5",
    title: "Спортивный праздник «День здоровья»",
    description: "Сценарий и организационный план проведения школьного спортивного мероприятия для 5–7 классов.",
    type: "Проект",
    year: "2026",
  },
  {
    id: "6",
    title: "Курс «Адаптивная физкультура»",
    description: "Авторский курс занятий для детей с ограниченными возможностями здоровья. 12 занятий, прогрессивная нагрузка.",
    type: "Курс",
    year: "2026",
  },
];

const STORAGE_KEY = "portfolio_data_v1";


function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data: object) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_e) {
    void _e;
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl font-golos text-sm font-medium animate-toast-in
            ${t.type === "success" ? "bg-[#4f46e5] text-white" : t.type === "error" ? "bg-rose-500 text-white" : "bg-gray-800 text-white"}`}
        >
          <Icon
            name={
              t.type === "success"
                ? "CheckCircle"
                : t.type === "error"
                ? "XCircle"
                : "Info"
            }
            size={16}
          />
          {t.message}
          <button
            onClick={() => removeToast(t.id)}
            className="ml-1 opacity-70 hover:opacity-100"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({
  product,
  onSave,
  onClose,
}: {
  product: Partial<Product> | null;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(
    product ?? { type: "Урок", year: new Date().getFullYear().toString() }
  );

  const set = (key: keyof Product, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.type) return;
    onSave({
      id: form.id ?? Date.now().toString(),
      title: form.title,
      description: form.description,
      type: form.type as Product["type"],
      year: form.year ?? new Date().getFullYear().toString(),
      link: form.link,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-golos font-bold text-xl text-gray-900">
            {form.id ? "Редактировать продукт" : "Добавить продукт"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Название *
            </label>
            <input
              value={form.title ?? ""}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="Название продукта"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-golos focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Описание *
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              required
              rows={3}
              placeholder="Краткое описание"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-golos focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Тип *
              </label>
              <select
                value={form.type ?? "Урок"}
                onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-golos focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition bg-white"
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Год
              </label>
              <input
                value={form.year ?? ""}
                onChange={(e) => set("year", e.target.value)}
                placeholder="2025"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-golos focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Ссылка (необязательно)
            </label>
            <input
              value={form.link ?? ""}
              onChange={(e) => set("link", e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-golos focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 font-golos font-medium text-sm hover:bg-gray-50 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#4f46e5] text-white rounded-xl py-2.5 font-golos font-medium text-sm hover:bg-[#4338ca] transition shadow-md shadow-indigo-200"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Editable field ───────────────────────────────────────────────────────────
function EditableField({
  value,
  onChange,
  tag: Tag = "p",
  className = "",
  editMode,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  tag?: "p" | "h1" | "h2" | "h3" | "span";
  className?: string;
  editMode: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <Tag
      contentEditable={editMode}
      suppressContentEditableWarning
      onBlur={(e) => onChange((e.target as HTMLElement).textContent ?? "")}
      className={`${className} ${editMode ? "outline-none ring-2 ring-[#4f46e5]/30 rounded-lg px-1 cursor-text" : ""}`}
      style={style}
    >
      {value}
    </Tag>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const stored = loadFromStorage();

  const [editMode, setEditMode] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const [profile, setProfile] = useState<ProfileData>(
    stored?.profile ?? {
      name: "Виниченко Артём Максимович",
      role: "Педагог физической культуры",
      university: "ТОГУ",
      specialty: "ПОФК",
      courseGroup: "1 курс, группа ПОФК(б)-51",
      about:
        "Студент первого курса по направлению «Педагогическое образование» со специализацией в области физической культуры. Увлечён спортом, здоровым образом жизни и современными методиками преподавания. Стремлюсь сделать физическую культуру доступной и интересной для каждого.",
      email: "vinichenko@example.com",
      phone: "+7 (914) 000-00-00",
      telegram: "@artem_vinichenko",
    }
  );

  const [products, setProducts] = useState<Product[]>(
    stored?.products ?? DEMO_PRODUCTS
  );
  const [filterType, setFilterType] = useState<Product["type"] | "Все">("Все");
  const [productModal, setProductModal] = useState<{
    open: boolean;
    product: Partial<Product> | null;
  }>({ open: false, product: null });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    saveToStorage({ profile, products });
  }, [profile, products]);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Date.now().toString();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        3500
      );
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const filteredProducts =
    filterType === "Все"
      ? products
      : products.filter((p) => p.type === filterType);

  const saveProduct = (p: Product) => {
    setProducts((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      if (exists) return prev.map((x) => (x.id === p.id ? p : x));
      return [...prev, p];
    });
    setProductModal({ open: false, product: null });
    addToast("Продукт сохранён!", "success");
  };

  const deleteProduct = (id: string) => {
    setProducts((p) => p.filter((x) => x.id !== id));
    setDeleteConfirm(null);
    addToast("Продукт удалён", "info");
  };

  const navLinks = [
    { href: "#about", label: "О себе" },
    { href: "#products", label: "Продукты" },
    { href: "#contacts", label: "Контакты" },
  ];

  const profileField = (key: keyof ProfileData) => ({
    value: profile[key],
    onChange: (v: string) => setProfile((p) => ({ ...p, [key]: v })),
    editMode,
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-golos">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-cormorant font-semibold text-xl text-[#4f46e5]">
            Виниченко А.М.
          </span>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-[#4f46e5] transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#4f46e5] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
          <button
            onClick={() => {
              setEditMode((v) => {
                if (!v) addToast("Режим редактирования включён", "info");
                else addToast("Изменения сохранены!", "success");
                return !v;
              });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              editMode
                ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-200"
                : "border border-gray-200 text-gray-600 hover:border-[#4f46e5] hover:text-[#4f46e5] bg-white"
            }`}
          >
            <Icon name={editMode ? "Save" : "Pencil"} size={15} />
            <span className="hidden sm:inline">
              {editMode ? "Сохранить" : "Редактировать"}
            </span>
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full translate-x-1/3 -translate-y-1/4 bg-gradient-to-br from-indigo-100/70 to-transparent" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full -translate-x-1/3 translate-y-1/4 bg-gradient-to-tr from-amber-100/60 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 flex items-center">
          {/* text */}
          <div className="w-full max-w-2xl">
            <div
              className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-[#4f46e5] text-xs font-medium px-3 py-1.5 rounded-full mb-6 animate-fade-in"
            >
              <span className="w-1.5 h-1.5 bg-[#4f46e5] rounded-full animate-pulse" />
              Портфолио педагога
            </div>

            <EditableField
              tag="h1"
              {...profileField("name")}
              className="font-cormorant font-semibold text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight mb-3 animate-fade-in"
              style={{ animationDelay: "0.1s", opacity: 0 }}
            />

            <EditableField
              tag="p"
              {...profileField("role")}
              className="font-cormorant italic text-xl sm:text-2xl text-[#4f46e5] mb-6 animate-fade-in"
              style={{ animationDelay: "0.2s", opacity: 0 }}
            />

            <div
              className="flex flex-wrap gap-2 mb-8 animate-fade-in"
              style={{ animationDelay: "0.3s", opacity: 0 }}
            >
              {[
                { icon: "GraduationCap", text: profile.university },
                { icon: "BookOpen", text: profile.specialty },
                { icon: "Users", text: profile.courseGroup },
              ].map((tag) => (
                <span
                  key={tag.text}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-sm px-3 py-1.5 rounded-full shadow-sm"
                >
                  <Icon
                    name={tag.icon as "GraduationCap"}
                    size={14}
                    className="text-[#4f46e5]"
                  />
                  {tag.text}
                </span>
              ))}
            </div>

            <div
              className="flex gap-3 animate-fade-in"
              style={{ animationDelay: "0.4s", opacity: 0 }}
            >
              <a
                href="#products"
                className="bg-[#4f46e5] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#4338ca] transition shadow-lg shadow-indigo-200 text-sm"
              >
                Мои продукты
              </a>
              <a
                href="#contacts"
                className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:border-[#4f46e5] hover:text-[#4f46e5] transition text-sm"
              >
                Связаться
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <Icon name="ChevronDown" size={24} className="text-gray-400" />
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-medium text-[#4f46e5] uppercase tracking-widest mb-3">
                01 — О себе
              </p>
              <h2 className="font-cormorant font-semibold text-3xl sm:text-4xl text-gray-900 mb-6">
                Кто я такой?
              </h2>
              <EditableField
                tag="p"
                {...profileField("about")}
                className="text-gray-600 leading-relaxed text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: "GraduationCap",
                  label: "Университет",
                  field: "university" as keyof ProfileData,
                  color: "bg-indigo-50 text-[#4f46e5]",
                },
                {
                  icon: "BookOpen",
                  label: "Специальность",
                  field: "specialty" as keyof ProfileData,
                  color: "bg-amber-50 text-amber-600",
                },
                {
                  icon: "Calendar",
                  label: "Курс и группа",
                  field: "courseGroup" as keyof ProfileData,
                  color: "bg-emerald-50 text-emerald-600",
                },
                {
                  icon: "Award",
                  label: "Направление",
                  field: "role" as keyof ProfileData,
                  color: "bg-purple-50 text-purple-600",
                },
              ].map((item) => (
                <div
                  key={item.field}
                  className="bg-[#f8fafc] rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center mb-3`}
                  >
                    <Icon name={item.icon as "GraduationCap"} size={16} />
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <EditableField
                    tag="p"
                    {...profileField(item.field)}
                    className="text-sm font-semibold text-gray-800"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ───────────────────────────────────────── */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-medium text-[#4f46e5] uppercase tracking-widest mb-3">
            03 — Продукты
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <h2 className="font-cormorant font-semibold text-3xl sm:text-4xl text-gray-900">
              Образовательные продукты
            </h2>
            {editMode && (
              <button
                onClick={() => setProductModal({ open: true, product: null })}
                className="flex items-center gap-2 bg-[#4f46e5] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4338ca] transition shadow-md shadow-indigo-100 shrink-0"
              >
                <Icon name="Plus" size={15} />
                Добавить продукт
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {(["Все", ...PRODUCT_TYPES] as const).map((type) => (
              <button
                key={type}
                onClick={() =>
                  setFilterType(type as Product["type"] | "Все")
                }
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterType === type
                    ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-200"
                    : "bg-[#f8fafc] border border-gray-200 text-gray-600 hover:border-[#4f46e5] hover:text-[#4f46e5]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product, i) => (
              <div
                key={product.id}
                className="bg-[#f8fafc] border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up flex flex-col"
                style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${TYPE_COLORS[product.type]}`}
                  >
                    {product.type}
                  </span>
                  <span className="text-xs text-gray-400">{product.year}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4">
                  {product.description}
                </p>
                <div className="flex items-center gap-2 mt-auto">
                  {product.link && (
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#4f46e5] hover:underline"
                    >
                      <Icon name="ExternalLink" size={12} />
                      Открыть
                    </a>
                  )}
                  {editMode && (
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() =>
                          setProductModal({ open: true, product })
                        }
                        className="text-gray-400 hover:text-[#4f46e5] transition-colors"
                      >
                        <Icon name="Pencil" size={14} />
                      </button>
                      {deleteConfirm === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-xs text-red-500 font-medium hover:text-red-700"
                          >
                            Удалить
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Отмена
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Icon
                name="FolderOpen"
                size={40}
                className="mx-auto mb-3 opacity-40"
              />
              <p className="text-sm">Продуктов пока нет</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Contacts ───────────────────────────────────────── */}
      <section id="contacts" className="py-20 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-medium text-[#4f46e5] uppercase tracking-widest mb-3">
            04 — Контакты
          </p>
          <h2 className="font-cormorant font-semibold text-3xl sm:text-4xl text-gray-900 mb-12">
            Связаться со мной
          </h2>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: "Mail",
                label: "Электронная почта",
                field: "email" as keyof ProfileData,
                color: "text-[#4f46e5] bg-indigo-50",
                href: `mailto:${profile.email}`,
              },
              {
                icon: "Phone",
                label: "Телефон",
                field: "phone" as keyof ProfileData,
                color: "text-amber-600 bg-amber-50",
                href: `tel:${profile.phone}`,
              },
              {
                icon: "Send",
                label: "Telegram",
                field: "telegram" as keyof ProfileData,
                color: "text-sky-600 bg-sky-50",
                href: `https://t.me/${profile.telegram.replace("@", "")}`,
              },
            ].map((item) => (
              <div
                key={item.field}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon name={item.icon as "Mail"} size={18} />
                </div>
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <EditableField
                  tag="p"
                  {...profileField(item.field)}
                  className="font-medium text-gray-800 text-sm mb-3"
                />
                {!editMode && (
                  <a
                    href={item.href}
                    className="text-xs text-[#4f46e5] hover:underline flex items-center gap-1"
                  >
                    <Icon name="ArrowRight" size={12} />
                    Написать
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-cormorant text-lg font-semibold text-gray-700">
            Виниченко Артём Максимович
          </span>
          <p className="text-xs text-gray-400">© 2026 · Портфолио педагога ТОГУ</p>
        </div>
      </footer>

      {/* ── Modal ──────────────────────────────────────────── */}
      {productModal.open && (
        <ProductModal
          product={productModal.product}
          onSave={saveProduct}
          onClose={() => setProductModal({ open: false, product: null })}
        />
      )}

      {/* ── Toasts ─────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}