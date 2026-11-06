import { useEffect, useRef, useState } from "react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "للنساء" | "للرجال" | "للأزواج" | "عناية" | "جل ومزلقات" | "صيدلية";
  image: string;
  badge?: string;
  sourceUrl?: string;
  reviewNote?: string;
};

type CartItem = Product & { quantity: number };

const STORE_CONFIG = {
  // PayPal Client ID عام ومسموح استخدامه في الواجهة الأمامية.
  paypalClientId:
    "BAAJU-CXWcRZ-GoF4F6T3NQ_-0RHAAGzQ2zVRvfpPsVg9cxptTh5L4j8jv2HrrF8JkGKemxInbiyZia0AI",
  // ضع عنوان محفظة USDT هنا، وحدد الشبكة التي تستقبل عليها.
  usdtAddress: "TKjV6zduE3pFEiBFQQoxCoQCEp823KtMGx",
  usdtNetwork: "TRC20",
  whatsappNumber: "966500000000",
};

type PayPalButtonsInstance = {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => Promise<void>;
};

type PayPalSdk = {
  Buttons: (options: {
    style: { layout: string; shape: string; label: string; height: number };
    createOrder: (
      data: unknown,
      actions: {
        order: {
          create: (order: {
            purchase_units: Array<{
              amount: { currency_code: string; value: string };
              description: string;
            }>;
          }) => Promise<string>;
        };
      },
    ) => Promise<string>;
    onApprove: (
      data: { orderID?: string },
      actions: { order: { capture: () => Promise<{ id?: string; status?: string }> } },
    ) => Promise<void>;
    onCancel: () => void;
    onError: () => void;
  }) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalSdk;
  }
}

const products: Product[] = [
  {
    id: 1,
    name: "LELO SONA 2",
    description: "تقنية نبضات صوتية، 12 مستوى، سيليكون ناعم ومقاوم للماء بالكامل.",
    price: 649,
    category: "للنساء",
    image: "/products/lelo-sona-2.jpg",
    badge: "الأكثر طلبًا",
  },
  {
    id: 2,
    name: "Womanizer Premium 2",
    description: "تقنية Pleasure Air، 14 مستوى مع Smart Silence ووضع Autopilot.",
    price: 749,
    category: "للنساء",
    image: "/products/womanizer-premium-2.jpg",
    badge: "فئة فاخرة",
  },
  {
    id: 3,
    name: "We-Vibe Chorus",
    description: "جهاز مرن للأزواج، تحكم عن بُعد وعبر التطبيق ومقاوم للماء.",
    price: 699,
    category: "للأزواج",
    image: "/products/we-vibe-chorus.jpg",
    badge: "للأزواج",
  },
  {
    id: 4,
    name: "Fleshlight Quickshot Vantage",
    description: "موديل أصلي مدمج ومفتوح من الطرفين، بخامة Real Feel Super Skin وسهل التنظيف.",
    price: 159,
    category: "للرجال",
    image: "/products/fleshlight-quickshot-vantage.jpg",
    badge: "اختيار GQ",
    sourceUrl: "https://www.fleshlight.com/products/quickshot-vantage",
    reviewNote: "4.7/5 من 499 مراجعة رسمية؛ راجعته GQ وMen’s Health بالاسم.",
  },
  {
    id: 5,
    name: "Durex Play 2 in 1",
    description: "جل مساج ومزلق مائي لطيف على البشرة، عبوة عملية بحجم 200 مل.",
    price: 79,
    category: "جل ومزلقات",
    image: "/products/durex-play.jpg",
    badge: "200 مل",
  },
  {
    id: 6,
    name: "Satisfyer Pro 2 Gen 3",
    description: "تقنية Air Pulse مع 11 مستوى، تشغيل هادئ ومقاومة كاملة للماء.",
    price: 279,
    category: "للنساء",
    image: "/products/satisfyer-pro-2.jpg",
    badge: "قيمة ممتازة",
  },
  {
    id: 7,
    name: "Durex Extra Safe — 12",
    description: "واقيات لاتكس بسماكة إضافية ومزلق أكثر، عبوة تحتوي على 12 قطعة.",
    price: 49,
    category: "صيدلية",
    image: "/products/durex-extra-safe.jpg",
    badge: "12 قطعة",
  },
  {
    id: 8,
    name: "K-Y Jelly — 100g",
    description: "مزلق شخصي مائي شفاف، غير دهني وسهل الغسل للاستخدام الحميم.",
    price: 45,
    category: "جل ومزلقات",
    image: "/products/ky-jelly.jpg",
  },
  {
    id: 9,
    name: "Vagisil pH Balance Wash",
    description: "غسول خارجي لطيف للعناية اليومية بالمنطقة الحساسة وتوازن الحموضة.",
    price: 69,
    category: "عناية",
    image: "/products/vagisil-ph-balance.jpg",
    badge: "عناية يومية",
  },
  {
    id: 10,
    name: "Canesten 1% Cream — 20g",
    description:
      "كريم كلوتريمازول مضاد للفطريات للاستخدام الخارجي؛ يُستخدم حسب النشرة وإرشاد الصيدلي.",
    price: 39,
    category: "صيدلية",
    image: "/products/canesten-cream.jpg",
    badge: "دواء بدون وصفة*",
  },
  {
    id: 11,
    name: "Clearblue Pregnancy Test",
    description:
      "اختبار حمل منزلي سريع وسهل القراءة؛ اتبعي التعليمات المرفقة للحصول على نتيجة دقيقة.",
    price: 59,
    category: "صيدلية",
    image: "/products/clearblue-test.jpg",
  },
  {
    id: 12,
    name: "STUD 100 Delay Spray",
    description:
      "بخاخ موضعي للرجال يحتوي على ليدوكايين؛ استخدم أقل كمية وفق النشرة وبعد استشارة الصيدلي.",
    price: 89,
    category: "صيدلية",
    image: "/products/stud-delay-spray.jpg",
    badge: "استخدام موضعي",
  },
  {
    id: 13,
    name: "Arcwave Ion 2",
    description:
      "تقنية Pleasure Air للرجال، سيليكون CleanTech ناعم، مقاومة IPX7 وتشغيل Smart Silence.",
    price: 549,
    category: "للرجال",
    image: "/products/arcwave-ion-2.jpg",
    badge: "تقنية Pleasure Air",
    sourceUrl: "https://www.arcwave.com/us/ion-2",
    reviewNote: "موديل Ion 2 الحالي موثّق من Arcwave؛ السعر الرسمي وقت المراجعة 135 دولارًا.",
  },
  {
    id: 14,
    name: "TENGA FLIP ZERO Black",
    description:
      "خامة داخلية أكثر صلابة وملمس مكثّف مع تحكم بالضغط، يفتح بالكامل لتسهيل الغسل والتجفيف.",
    price: 449,
    category: "للرجال",
    image: "/products/tenga-flip-zero-black.jpg",
    badge: "142 مراجعة",
    sourceUrl: "https://usstore.tenga.co/products/tfz-002",
    reviewNote: "3.99/5 من 142 مراجعة على متجر TENGA الرسمي.",
  },
  {
    id: 15,
    name: "LELO F1S V3",
    description:
      "الإصدار الثالث بتفاعل مدعوم بالذكاء الاصطناعي، سيليكون Real‑Feel واتصال بتطبيق LELO.",
    price: 749,
    category: "للرجال",
    image: "/products/lelo-f1s-v3.webp",
    badge: "تقنية متقدمة",
    sourceUrl: "https://www.lelo.com/f1s-v3",
    reviewNote: "4.22/5 من 236 مراجعة على صفحة LELO الرسمية للموديل نفسه.",
  },
  {
    id: 16,
    name: "Lovense MAX 2",
    description: "تحكم عبر التطبيق مع اهتزاز مزدوج وانقباض بمضخة هواء، ويدعم التحكم عن بُعد.",
    price: 369,
    category: "للرجال",
    image: "/products/lovense-max-2.jpg",
    badge: "تحكم بالتطبيق",
    sourceUrl: "https://www.lovense.com/male-masturbators",
    reviewNote: "4.6/5 من 316 مراجعة على صفحة Lovense الرسمية.",
  },
  {
    id: 17,
    name: "Durex Massage Soothing 2 in 1 — 200ml",
    description: "جل مساج ومزلق مائي مع الألوفيرا وفيتامين E؛ يذكر المصنع أنه مناسب للاستخدام مع الواقيات الذكرية.",
    price: 69,
    category: "جل ومزلقات",
    image: "/products/durex-soothing-illustration.svg",
    badge: "200 مل",
    sourceUrl: "https://durexme.com/ar/all-products/lubes/durex-massage-soothing-2-in-1",
    reviewNote: "صورة توضيحية وليست صورة العبوة الأصلية. اتبع تعليمات العبوة وتوقف عند حدوث تهيّج.",
  },
  {
    id: 18,
    name: "pjur ORIGINAL — 100ml",
    description: "مزلق سيليكوني طويل الأمد مناسب للمساج ومتوافق مع الواقيات المصنوعة من اللاتكس وفق الشركة المصنّعة.",
    price: 119,
    category: "جل ومزلقات",
    image: "/products/pjur-original-illustration.svg",
    badge: "100 مل",
    sourceUrl: "https://www.pjur.com/en/product/pjur-original/",
    reviewNote: "صورة توضيحية وليست صورة العبوة الأصلية. قد لا يناسب بعض الألعاب المصنوعة من السيليكون؛ راجع تعليمات الشركة.",
  },
];

const categories = ["الكل", "للنساء", "للرجال", "للأزواج", "عناية", "جل ومزلقات", "صيدلية"] as const;

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "bag"
    | "shield"
    | "truck"
    | "lock"
    | "plus"
    | "minus"
    | "x"
    | "copy"
    | "check"
    | "arrow"
    | "menu";
  className?: string;
}) {
  const paths = {
    bag: (
      <>
        <path d="M6.7 8.5h10.6l.8 11H5.9l.8-11Z" />
        <path d="M9 9V6.8a3 3 0 0 1 6 0V9" />
      </>
    ),
    shield: <path d="M12 3 5 6v5c0 4.7 2.8 8.1 7 10 4.2-1.9 7-5.3 7-10V6l-7-3Z" />,
    truck: (
      <>
        <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    x: <path d="m6 6 12 12M18 6 6 18" />,
    copy: (
      <>
        <rect x="8" y="8" width="11" height="12" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function ProductVisual({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div className={`product-visual ${large ? "h-[430px]" : "h-[285px]"}`}>
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

function PayPalButtons({
  amount,
  onStatus,
}: {
  amount: string;
  onStatus: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let buttons: PayPalButtonsInstance | undefined;
    let cancelled = false;

    const renderButtons = async () => {
      if (!window.paypal || !containerRef.current || containerRef.current.childElementCount > 0) {
        return;
      }

      buttons = window.paypal.Buttons({
        style: { layout: "vertical", shape: "pill", label: "paypal", height: 45 },
        createOrder: (_data, actions) =>
          actions.order.create({
            purchase_units: [
              {
                amount: { currency_code: "USD", value: amount },
                description: "Sitr store order",
              },
            ],
          }),
        onApprove: async (data, actions) => {
          const capture = await actions.order.capture();
          const transactionId = capture.id || data.orderID || "";
          onStatus(
            `تم الدفع بنجاح عبر PayPal${transactionId ? ` — رقم العملية: ${transactionId}` : ""}. سنراجع الطلب ونتواصل معك للتوصيل.`,
          );
        },
        onCancel: () => onStatus("تم إلغاء عملية PayPal، ولم يتم خصم المبلغ."),
        onError: () => onStatus("تعذر فتح PayPal حاليًا. حاول مرة أخرى أو اختر الدفع عبر USDT."),
      });

      try {
        await buttons.render(containerRef.current);
      } catch {
        if (!cancelled) {
          onStatus("تعذر تحميل زر PayPal. تحقق من الاتصال وحاول مرة أخرى.");
        }
      }
    };

    const scriptId = "paypal-js-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const handleLoad = () => void renderButtons();
    const handleError = () => onStatus("تعذر الاتصال بخدمة PayPal حاليًا.");

    if (window.paypal) {
      void renderButtons();
    } else if (script) {
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);
    } else {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(STORE_CONFIG.paypalClientId)}&currency=USD&intent=capture`;
      script.async = true;
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
      if (buttons?.close) void buttons.close();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [amount, onStatus]);

  return <div ref={containerRef} className="min-h-[45px]" />;
}

export default function App() {
  const [ageConfirmed, setAgeConfirmed] = useState(
    () => sessionStorage.getItem("sitr-age") === "yes",
  );
  const [category, setCategory] = useState<(typeof categories)[number]>("الكل");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "payment">("cart");
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "usdt" | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("sitr-cart");
    if (stored) {
      try {
        const savedItems = JSON.parse(stored) as CartItem[];
        setCart(
          savedItems.flatMap((item) => {
            const currentProduct = products.find((product) => product.id === item.id);
            return currentProduct ? [{ ...currentProduct, quantity: item.quantity }] : [];
          }),
        );
      } catch {
        /* ignore invalid local data */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sitr-cart", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts =
    category === "الكل" ? products : products.filter((p) => p.category === category);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 399 || subtotal === 0 ? 0 : 25;
  const total = subtotal + shipping;
  const paypalTotalUsd = (total / 3.75).toFixed(2);

  const addToCart = (product: Product) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      return existing
        ? items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...items, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (id: number, change: number) => {
    setCart((items) =>
      items
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + change } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const copyAddress = async () => {
    if (STORE_CONFIG.usdtAddress.includes("ضع_عنوان")) {
      alert("أضف عنوان محفظة USDT في STORE_CONFIG داخل ملف src/App.tsx");
      return;
    }
    await navigator.clipboard.writeText(STORE_CONFIG.usdtAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const confirmUsdtOrder = async () => {
    if (!customerPhone.trim()) {
      setCheckoutMessage("أدخل رقم التواصل أولًا حتى نتمكن من تأكيد الطلب.");
      return;
    }

    const summary = cart.map((item) => `${item.name} × ${item.quantity}`).join("، ");
    const orderMessage = [
      "مرحبًا، أريد تأكيد طلب USDT.",
      `الاسم: ${customerName.trim() || "غير مذكور"}`,
      `رقم التواصل: ${customerPhone.trim()}`,
      `الطلب: ${summary}`,
      `الإجمالي: ${total} ر.س.`,
    ].join("\n");

    if (STORE_CONFIG.whatsappNumber === "966500000000") {
      await navigator.clipboard.writeText(orderMessage);
      setCheckoutMessage("تم نسخ تفاصيل الطلب. أرسلها إلى رقم خدمة العملاء لتأكيد التحويل.");
      return;
    }

    setCheckoutMessage("");
    window.open(
      `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(orderMessage)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f5f1] text-[#27201f]">
      {!ageConfirmed && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#21191a]/95 p-5 backdrop-blur-md">
          <div className="age-card w-full max-w-lg rounded-[2rem] bg-[#f8f5f1] p-8 text-center shadow-2xl sm:p-12">
            <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-full border border-[#d6c2bd] text-lg font-semibold text-[#8f4f52]">
              +18
            </div>
            <p className="mb-3 text-xs font-semibold tracking-[.22em] text-[#9a6965]">
              خصوصية • عناية • ثقة
            </p>
            <h2 className="mb-4 text-3xl font-semibold">أهلًا بك في سِتر</h2>
            <p className="mx-auto mb-8 max-w-sm leading-7 text-[#766967]">
              هذا المتجر مخصص للبالغين فقط. بدخولك تؤكد أن عمرك 18 عامًا أو أكثر، وأن الشراء مسموح
              وفق أنظمة بلدك.
            </p>
            <button
              className="w-full rounded-full bg-[#6e3940] px-6 py-4 font-semibold text-white transition hover:bg-[#572c32]"
              onClick={() => {
                sessionStorage.setItem("sitr-age", "yes");
                setAgeConfirmed(true);
              }}
            >
              نعم، عمري 18 عامًا أو أكثر
            </button>
            <button
              className="mt-4 text-sm text-[#766967] underline underline-offset-4"
              onClick={() => window.history.back()}
            >
              مغادرة الموقع
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#6e3940] px-4 py-2.5 text-center text-xs font-medium text-white sm:text-sm">
        تغليف محايد 100% — لا اسم للمتجر ولا وصف للمحتوى على الشحنة
      </div>

      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f8f5f1]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button
            className="lg:hidden"
            aria-label="فتح القائمة"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Icon name={mobileMenu ? "x" : "menu"} />
          </button>
          <a href="#" className="text-2xl font-bold tracking-tight">
            سِتر<span className="text-[#a56c68]">.</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            <a href="#products" className="transition hover:text-[#8f4f52]">
              المتجر
            </a>
            <a href="#privacy" className="transition hover:text-[#8f4f52]">
              الخصوصية
            </a>
            <a href="#about" className="transition hover:text-[#8f4f52]">
              لماذا سِتر؟
            </a>
            <a href="#faq" className="transition hover:text-[#8f4f52]">
              الأسئلة الشائعة
            </a>
          </nav>
          <button
            className="relative flex items-center gap-2"
            onClick={() => setCartOpen(true)}
            aria-label="فتح سلة المشتريات"
          >
            <Icon name="bag" />
            <span className="hidden text-sm sm:inline">السلة</span>
            {cartCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#8f4f52] px-1 text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        {mobileMenu && (
          <nav className="grid gap-4 border-t border-black/5 px-6 py-5 text-sm lg:hidden">
            <a href="#products" onClick={() => setMobileMenu(false)}>
              المتجر
            </a>
            <a href="#privacy" onClick={() => setMobileMenu(false)}>
              الخصوصية
            </a>
            <a href="#about" onClick={() => setMobileMenu(false)}>
              لماذا سِتر؟
            </a>
            <a href="#faq" onClick={() => setMobileMenu(false)}>
              الأسئلة الشائعة
            </a>
          </nav>
        )}
      </header>

      <main>
        <section className="overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9c8c3] bg-white/60 px-4 py-2 text-xs font-semibold text-[#75464a]">
                <Icon name="shield" className="h-4 w-4" />
                خصوصيتك أولويتنا، دائمًا
              </div>
              <h1 className="text-balance text-5xl font-semibold leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl">
                لحظاتك الخاصة،
                <br />
                <span className="text-[#95615d]">بطريقتك أنت.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#746866] sm:text-lg">
                منتجات عناية حميمة مختارة بعناية للبالغين، بجودة موثوقة وتوصيل سري إلى دول الخليج
                وفق الأنظمة المحلية.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center gap-3 rounded-full bg-[#2d2524] px-7 py-4 font-semibold text-white transition hover:bg-[#6e3940]"
                >
                  اكتشف المنتجات <Icon name="arrow" className="h-4 w-4 rotate-180" />
                </a>
                <a
                  href="#privacy"
                  className="rounded-full border border-[#bfaeaa] px-7 py-4 font-semibold transition hover:bg-white"
                >
                  كيف نحمي خصوصيتك؟
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-[#6f6260]">
                <span className="flex items-center gap-2">
                  <Icon name="lock" className="h-4 w-4" /> دفع آمن
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="truck" className="h-4 w-4" /> شحن سري
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="shield" className="h-4 w-4" /> بيانات محمية
                </span>
              </div>
            </div>
            <div className="hero-art relative min-h-[470px] rounded-[2.5rem] bg-[#e8dbd5] p-7 sm:min-h-[580px]">
              <div className="absolute inset-7 rounded-[2rem] border border-white/50" />
              <div className="absolute right-[18%] top-[15%] h-[56%] w-[32%] rotate-[11deg] rounded-[5rem] bg-gradient-to-br from-[#7d474b] to-[#3d262a] shadow-[0_35px_70px_rgba(86,49,52,.28)]">
                <span className="absolute left-1/2 top-[11%] h-2 w-2 -translate-x-1/2 rounded-full bg-[#d9aaa1]" />
                <span className="absolute bottom-[18%] left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border border-white/20" />
              </div>
              <div className="absolute bottom-[16%] left-[15%] h-[39%] w-[25%] -rotate-[14deg] rounded-[4rem_4rem_2.5rem_2.5rem] bg-gradient-to-br from-[#cda39a] to-[#aa716d] shadow-[0_30px_60px_rgba(86,49,52,.2)]" />
              <div className="absolute bottom-7 left-7 rounded-2xl bg-white/85 p-4 shadow-lg backdrop-blur">
                <p className="text-xs text-[#7f706e]">الشحن إلى الخليج</p>
                <p className="mt-1 font-semibold">بعلبة محايدة بلا تفاصيل</p>
              </div>
              <span className="absolute left-[14%] top-[18%] text-xs font-semibold tracking-[.2em] text-[#8c6662]">
                PRIVATE CARE
              </span>
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-black/5 bg-white/55">
          <div className="mx-auto grid max-w-7xl divide-y divide-black/5 px-5 sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-y-0 lg:px-8">
            {[
              ["shield", "مختار بعناية", "خامات آمنة وجودة نثق بها"],
              ["truck", "توصيل بخصوصية", "شحنة محايدة لا تكشف محتواها"],
              ["lock", "دفع مرن وآمن", "PayPal أو USDT حسب تفضيلك"],
            ].map(([icon, title, text]) => (
              <div
                key={title}
                className="flex items-center gap-4 px-2 py-7 sm:justify-center sm:px-6"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eee3df] text-[#7c474a]">
                  <Icon name={icon as "shield" | "truck" | "lock"} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-xs text-[#7a6d6b]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="mb-10 flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold tracking-[.2em] text-[#9a625f]">اختيارات سِتر</p>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                مساحتك، اختياراتك
              </h2>
            </div>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm transition ${category === item ? "bg-[#2d2524] text-white" : "border border-[#d8cbc7] hover:bg-white"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-[1.75rem] border border-[#e9dfda] bg-white/80 p-3 shadow-[0_8px_30px_rgba(66,43,39,.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(66,43,39,.10)] sm:p-4">
                <div className="relative overflow-hidden rounded-[1.75rem]">
                  <ProductVisual product={product} />
                  {product.badge && (
                    <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold shadow-sm">
                      {product.badge}
                    </span>
                  )}
                  <button
                    onClick={() => addToCart(product)}
                    className="absolute bottom-4 left-4 right-4 rounded-full bg-[#2c2423]/95 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition duration-300 hover:bg-[#6e3940] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    أضف إلى السلة
                  </button>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4 px-1">
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold text-[#9a6a65]">
                      {product.category}
                    </p>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-[#7a6d6b]">
                      {product.description}
                    </p>
                    {product.reviewNote && (
                      <p className="mt-3 max-w-xs border-r-2 border-[#b98a84] pr-3 text-xs leading-5 text-[#655a58]">
                        {product.reviewNote}
                      </p>
                    )}
                    {product.sourceUrl && (
                      <a
                        href={product.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#865156] underline decoration-[#c5a5a1] underline-offset-4"
                      >
                        صفحة المنتج الرسمية
                        <Icon name="arrow" className="h-3 w-3 rotate-180" />
                      </a>
                    )}
                  </div>
                  <p className="shrink-0 pt-5 font-bold">
                    {product.price} <span className="text-xs font-medium">ر.س</span>
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-4 w-full rounded-full border border-[#cfc0bc] py-3 text-sm font-semibold transition hover:border-[#6e3940] hover:bg-[#f8f1ee] sm:hidden"
                >
                  أضف إلى السلة
                </button>
              </article>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#d8cbc7] bg-white/60 px-5 py-4 text-center text-[11px] leading-6 text-[#786b68]">
            المنتجات التي تحمل رابط «صفحة المنتج الرسمية» موثقة من الشركة المصنّعة وتستخدم صورة
            المنتج الفعلية؛ الأسعار بالريال تقديرية للبيع محليًا وقد تتغير. المنتجات الدوائية تُباع فقط
            حيث يسمح النظام المحلي، ولا تغني المعلومات عن استشارة الطبيب أو الصيدلي.
          </div>
          <section className="mt-12 rounded-[2rem] border border-[#dfd0ca] bg-[#f1e8e3] p-6 sm:p-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[.18em] text-[#9a625f]">قريبًا إلى سِتر</p>
                <h3 className="text-2xl font-semibold">أصناف نعمل على التحقق منها</h3>
              </div>
              <p className="max-w-lg text-xs leading-6 text-[#786b68]">لن تظهر هذه الأصناف للبيع قبل التحقق من المكونات والمصدر والتسجيل والسماح بالتداول في بلد الشحن.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["حبوب مقوية للرجال", "قيد التحقق من التسجيل والمكونات ومصدر التوريد."],
                ["جل وكريمات تأخير القذف", "تُضاف بعد التأكد من التركيبة والترخيص وتعليمات الاستخدام."],
                ["حبوب مخصصة للنساء", "لا تُعرض قبل التحقق من السلامة والتسجيل والادعاءات المسموح بها."],
                ["علكة جنسية", "قيد مراجعة المكونات والمصدر والاشتراطات المحلية."],
                ["قطرات مخصصة للنساء", "قيد التحقق؛ لا توجد حالياً منتجات مفعّلة للشراء ضمن هذا الصنف."],
              ].map(([name, detail]) => (
                <div key={name} className="rounded-2xl border border-[#e2d5d0] bg-white/75 p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="font-semibold">{name}</h4>
                    <span className="shrink-0 rounded-full bg-[#eee3df] px-3 py-1 text-[10px] font-semibold text-[#815054]">قريبًا</span>
                  </div>
                  <p className="text-xs leading-6 text-[#786b68]">{detail}</p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section id="privacy" className="bg-[#2d2524] text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
            <div>
              <p className="mb-4 text-xs font-bold tracking-[.2em] text-[#d0a39c]">
                خصوصيتك ليست تفصيلًا
              </p>
              <h2 className="max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
                من لحظة الطلب حتى بابك، كل شيء يبقى سريًا.
              </h2>
              <p className="mt-6 max-w-xl leading-8 text-[#c7bcba]">
                نستخدم وصفًا محايدًا للطلب وتغليفًا خارجيًا بسيطًا من دون شعار أو تفاصيل تدل على المحتوى.
                لا نشارك معلوماتك لأغراض تسويقية.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["01", "تغليف محايد", "صندوق خارجي بسيط بلا شعارات أو وصف للمحتوى."],
                ["02", "فاتورة خاصة", "تفاصيل مختصرة ومحايدة في مراسلات الطلب."],
                ["03", "بيانات محمية", "نطلب فقط البيانات الضرورية لإتمام التوصيل."],
                ["04", "تأكيد مباشر", "نتواصل معك فقط بالطريقة التي تختارها."],
              ].map(([num, title, text]) => (
                <div key={num} className="rounded-3xl border border-white/10 bg-white/[.045] p-6">
                  <span className="text-xs font-semibold text-[#c99b94]">{num}</span>
                  <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#b7aaa8]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-5 py-20 lg:py-28">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-bold tracking-[.2em] text-[#9a625f]">قبل أن تطلب</p>
            <h2 className="text-4xl font-semibold">أسئلة تتكرر</h2>
          </div>
          <div className="divide-y divide-[#d8ccc8] border-y border-[#d8ccc8]">
            {[
              [
                "هل يظهر اسم المتجر على الشحنة؟",
                "لا. تصل الشحنة في تغليف خارجي محايد من دون شعار المتجر أو أي وصف للمحتوى.",
              ],
              [
                "إلى أي دول يتم التوصيل؟",
                "نوصل إلى دول الخليج المتاحة لدى شركة الشحن، مع مراعاة الأنظمة المحلية لكل دولة. يتم تأكيد إمكانية الشحن قبل إتمام الطلب.",
              ],
              [
                "كيف أدفع عبر USDT؟",
                `اختر USDT وتواصل معنا لتأكيد قيمة التحويل حسب السعر الحالي، ثم حوّلها إلى العنوان الموضح على شبكة ${STORE_CONFIG.usdtNetwork} وأرسل رقم العملية.`,
              ],
              [
                "هل المنتجات مناسبة للجميع؟",
                "كل منتج يحتوي على وصف واضح. اقرأ تعليمات الاستخدام والعناية، وتوقف عن الاستخدام عند حدوث أي تهيّج.",
              ],
            ].map(([question, answer]) => (
              <FaqItem key={question} question={question} answer={answer} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-[#efe8e4]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-3 lg:px-8">
          <div>
            <p className="text-2xl font-bold">
              سِتر<span className="text-[#a56c68]">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#766967]">
              متجر عناية خاصة للبالغين، يجمع بين الجودة والخصوصية والتجربة الراقية.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">روابط مهمة</h3>
            <div className="mt-4 grid gap-3 text-sm text-[#766967]">
              <a href="#products">المنتجات</a>
              <a href="#privacy">سياسة الخصوصية</a>
              <a href="#faq">الشحن والدفع</a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">الدفع المتاح</h3>
            <div className="mt-4 flex gap-2">
              <span className="rounded-lg border border-[#cbbdb8] bg-white/50 px-4 py-2 text-xs font-bold">
                PayPal
              </span>
              <span className="rounded-lg border border-[#cbbdb8] bg-white/50 px-4 py-2 text-xs font-bold">
                USDT
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-black/5 px-5 py-5 text-center text-xs text-[#857774]">
          للبالغين +18 فقط — جميع الطلبات خاضعة للأنظمة المحلية في بلد التوصيل
        </div>
      </footer>

      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-[#21191a]/45 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
            aria-label="إغلاق السلة"
          />
          <aside className="absolute bottom-0 left-0 top-0 flex w-full max-w-md flex-col bg-[#faf8f5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold">
                  {checkoutStep === "cart" ? "سلة المشتريات" : "اختيار طريقة الدفع"}
                </h2>
                <p className="mt-1 text-xs text-[#7c706d]">
                  {cartCount} {cartCount === 1 ? "منتج" : "منتجات"}
                </p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-full bg-[#eee7e3]"
                onClick={() => setCartOpen(false)}
                aria-label="إغلاق"
              >
                <Icon name="x" />
              </button>
            </div>

            {checkoutStep === "cart" ? (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {cart.length === 0 ? (
                    <div className="grid h-full place-items-center text-center">
                      <div>
                        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#eee5e1]">
                          <Icon name="bag" />
                        </div>
                        <h3 className="font-semibold">سلتك فارغة</h3>
                        <p className="mt-2 text-sm text-[#7c706d]">
                          اكتشف اختياراتنا وأضف ما يناسبك.
                        </p>
                      </div>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 border-b border-black/5 py-5 first:pt-0"
                      >
                        <div className="mini-product">
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div className="flex justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold">{item.name}</h3>
                              <p className="mt-1 text-xs text-[#857875]">{item.price} ر.س</p>
                            </div>
                            <button
                              onClick={() => changeQuantity(item.id, -item.quantity)}
                              aria-label="حذف المنتج"
                            >
                              <Icon name="x" className="h-4 w-4 text-[#958784]" />
                            </button>
                          </div>
                          <div className="flex w-fit items-center rounded-full border border-[#d8cbc7]">
                            <button
                              className="p-2"
                              onClick={() => changeQuantity(item.id, -1)}
                              aria-label="إنقاص الكمية"
                            >
                              <Icon name="minus" className="h-3 w-3" />
                            </button>
                            <span className="min-w-7 text-center text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              className="p-2"
                              onClick={() => changeQuantity(item.id, 1)}
                              aria-label="زيادة الكمية"
                            >
                              <Icon name="plus" className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="border-t border-black/5 bg-white px-6 py-5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-[#766a67]">المجموع الفرعي</span>
                      <span>{subtotal} ر.س</span>
                    </div>
                    <div className="mb-5 flex justify-between text-sm">
                      <span className="text-[#766a67]">التوصيل</span>
                      <span>{shipping ? `${shipping} ر.س` : "مجاني"}</span>
                    </div>
                    <div className="mb-5 flex justify-between border-t border-black/5 pt-4 text-lg font-bold">
                      <span>الإجمالي</span>
                      <span>{total} ر.س</span>
                    </div>
                    <button
                      onClick={() => setCheckoutStep("payment")}
                      className="w-full rounded-full bg-[#6e3940] py-4 font-semibold text-white transition hover:bg-[#572c32]"
                    >
                      متابعة إلى الدفع
                    </button>
                    <p className="mt-3 text-center text-[11px] text-[#857875]">
                      الشحن مجاني للطلبات فوق 399 ر.س
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
                <button
                  onClick={() => setCheckoutStep("cart")}
                  className="mb-6 text-sm font-semibold text-[#815054]"
                >
                  → العودة إلى السلة
                </button>
                <div className="mb-7 rounded-2xl bg-[#eee7e3] p-5">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#766a67]">المبلغ المطلوب</span>
                    <strong>{total} ر.س</strong>
                  </div>
                </div>
                <div className="mb-5 rounded-2xl border border-[#d9cdca] bg-white p-5">
                  <h3 className="font-bold">بيانات التواصل</h3>
                  <p className="mt-1 text-xs text-[#7d706d]">
                    نستخدمها فقط لتأكيد الطلب والتوصيل بسرية.
                  </p>
                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[#655a58]">
                        الاسم <span className="font-normal text-[#998b88]">(اختياري)</span>
                      </span>
                      <input
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                        placeholder="الاسم الأول"
                        autoComplete="name"
                        className="w-full rounded-xl border border-[#d8cbc7] bg-[#faf8f5] px-4 py-3 text-sm outline-none transition focus:border-[#8f4f52] focus:ring-2 focus:ring-[#8f4f52]/10"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-[#655a58]">
                        رقم التواصل <span className="text-[#9a4e51]">*</span>
                      </span>
                      <input
                        dir="ltr"
                        value={customerPhone}
                        onChange={(event) => {
                          setCustomerPhone(event.target.value);
                          setCheckoutMessage("");
                        }}
                        placeholder="+966 5X XXX XXXX"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className="w-full rounded-xl border border-[#d8cbc7] bg-[#faf8f5] px-4 py-3 text-left text-sm outline-none transition focus:border-[#8f4f52] focus:ring-2 focus:ring-[#8f4f52]/10"
                      />
                    </label>
                  </div>
                </div>

                <h3 className="mb-3 text-sm font-bold">اختر طريقة الدفع</h3>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setPaymentMethod("paypal");
                      setCheckoutMessage("");
                    }}
                    className={`rounded-2xl border p-4 text-right transition ${
                      paymentMethod === "paypal"
                        ? "border-[#172d55] bg-[#f1f5ff] ring-1 ring-[#172d55]"
                        : "border-[#d9cdca] bg-white"
                    }`}
                  >
                    <span className="block text-sm font-bold text-[#173b7a]">PayPal</span>
                    <span className="mt-1 block text-[10px] text-[#7d706d]">
                      بطاقة أو حساب PayPal
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMethod("usdt");
                      setCheckoutMessage("");
                    }}
                    className={`rounded-2xl border p-4 text-right transition ${
                      paymentMethod === "usdt"
                        ? "border-[#188a68] bg-[#e8f8f3] ring-1 ring-[#188a68]"
                        : "border-[#d9cdca] bg-white"
                    }`}
                  >
                    <span className="block text-sm font-bold text-[#188a68]">USDT</span>
                    <span className="mt-1 block text-[10px] text-[#7d706d]">
                      شبكة {STORE_CONFIG.usdtNetwork}
                    </span>
                  </button>
                </div>

                {paymentMethod === "paypal" && (
                  <div className="rounded-2xl border border-[#d9cdca] bg-white p-5">
                    <h3 className="font-bold">الدفع عبر PayPal</h3>
                    <p className="mt-1 text-xs leading-5 text-[#7d706d]">
                      الإجمالي عبر PayPal هو{" "}
                      <strong dir="ltr" className="text-[#2d2524]">
                        ${paypalTotalUsd} USD
                      </strong>{" "}
                      بسعر تحويل ثابت 1 دولار = 3.75 ر.س.
                    </p>
                    {customerPhone.trim() ? (
                      <div className="mt-5">
                        <PayPalButtons amount={paypalTotalUsd} onStatus={setCheckoutMessage} />
                      </div>
                    ) : (
                      <p className="mt-5 rounded-xl bg-[#f4eee9] px-4 py-3 text-xs leading-5 text-[#6e5250]">
                        أدخل رقم التواصل في الأعلى ليظهر زر PayPal الرسمي.
                      </p>
                    )}
                  </div>
                )}

                {paymentMethod === "usdt" && (
                  <div className="rounded-2xl border border-[#d9cdca] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">الدفع عبر USDT</h3>
                        <p className="mt-1 text-xs text-[#7d706d]">
                          التحويل على شبكة {STORE_CONFIG.usdtNetwork}
                        </p>
                      </div>
                      <span className="rounded-lg bg-[#e8f8f3] px-3 py-2 text-xs font-bold text-[#188a68]">
                        ₮ USDT
                      </span>
                    </div>
                    <p className="mt-4 rounded-xl bg-[#f4eee9] px-3 py-2.5 text-[11px] leading-5 text-[#756663]">
                      قبل التحويل، اطلب منا قيمة USDT المطلوبة حسب سعر الصرف الحالي. أرسل فقط عبر
                      شبكة {STORE_CONFIG.usdtNetwork}.
                    </p>
                    <div className="mt-5 rounded-xl bg-[#f5f2ef] p-3">
                      <p className="mb-2 text-[10px] text-[#8a7d79]">عنوان المحفظة</p>
                      <p dir="ltr" className="break-all text-left font-mono text-xs">
                        {STORE_CONFIG.usdtAddress}
                      </p>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#cfc1bd] py-3 text-sm font-semibold"
                    >
                      <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />{" "}
                      {copied ? "تم نسخ العنوان" : "نسخ عنوان المحفظة"}
                    </button>
                    <button
                      onClick={confirmUsdtOrder}
                      className="mt-3 w-full rounded-full bg-[#2d2524] py-3.5 text-center text-sm font-semibold text-white"
                    >
                      أرسلت التحويل — تأكيد الطلب
                    </button>
                  </div>
                )}

                {checkoutMessage && (
                  <p
                    role="status"
                    className="mt-4 rounded-xl border border-[#d8cbc7] bg-[#f4eee9] px-4 py-3 text-xs leading-5 text-[#6e5250]"
                  >
                    {checkoutMessage}
                  </p>
                )}
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f2e9e5] p-4 text-xs leading-5 text-[#756663]">
                  <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0" />
                  بعد الدفع نؤكد تفاصيل التوصيل معك بشكل خاص. لا ترسل بيانات شخصية في وصف التحويل.
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="flex w-full items-center justify-between gap-6 py-6 text-right"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold">{question}</span>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#cfc1bd] transition ${open ? "rotate-45 bg-[#2d2524] text-white" : ""}`}
        >
          <Icon name="plus" className="h-4 w-4" />
        </span>
      </button>
      {open && <p className="max-w-2xl pb-6 text-sm leading-7 text-[#746866]">{answer}</p>}
    </div>
  );
}
