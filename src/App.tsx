import { useEffect, useRef, useState } from "react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "للنساء" | "للرجال" | "للأزواج" | "عناية" | "جل ومزلقات" | "صيدلية";
  image: string;
  badge?: string;
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
    name: "Durex Extended Pleasure – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي مع مزلق Performa يحتوي على 5% بنزوكايين. يُستخدم مرة واحدة فقط، مع قراءة النشرة والتحذيرات داخل العبوة.",
    price: 75,
    category: "للرجال",
    image: "https://cdn11.bigcommerce.com/s-g585yu857h/images/stencil/1280w/products/14683/25772/5052197036428_T1__26362.1783595686.png",
    badge: "12 قطعة",
  },
  {
    id: 2,
    name: "Durex Play Sensual Massage 2-in-1 – 200ml",
    description: "جل مائي للتدليك والترطيب الحميمي برائحة Ylang Ylang. متوافق مع الواقيات المصنوعة من اللاتكس الطبيعي وفق وصف الشركة؛ تجنّب ملامسة العينين وأوقف الاستخدام عند حدوث تهيّج.",
    price: 75,
    category: "جل ومزلقات",
    image: "https://static.polza.ru/iblock/3d3/3d3a8d3062c963981bd6484ef4f26240/71bb0a075680c19b7fc42acf8e46fc83.jpeg?fmt=avif&quality=100",
    badge: "200 مل",
  },
  {
    id: 3,
    name: "Carex Classic – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي بتصميم أملس كلاسيكي، عرض اسمي 52±2 مم وطول لا يقل عن 160 مم.",
    price: 75,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0017_Classic-600x600.jpg",
    badge: "12 قطعة",
  },
  {
    id: 4,
    name: "Carex Delay – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي يحتوي على بنزوكايين وفق وصف الشركة للمساعدة على إطالة فترة الاستمتاع. اتبع تعليمات العبوة وتوقف عند حدوث تهيّج أو خدر غير مرغوب.",
    price: 75,
    category: "للرجال",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0013_Delay-600x600.jpg",
    badge: "تأخير – 12 قطعة",
  },
  {
    id: 5,
    name: "Carex Classic Comfort – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي بتصميم مريح ومنتفخ الرأس، عرض اسمي 52±2 مم وطول لا يقل عن 160 مم.",
    price: 75,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0016_Classic-Comfort-600x600.jpg",
    badge: "12 قطعة",
  },
  {
    id: 6,
    name: "Carex Classic Extra Lube – 12 قطعة",
    description: "واقي ذكري أملس من اللاتكس الطبيعي مع كمية مزلق أكثر بنسبة 50% مقارنة بالواقي الكلاسيكي حسب وصف الشركة المصنّعة.",
    price: 75,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0015_Classic-Extra-Lube-600x600.jpg",
    badge: "مزلق إضافي – 12 قطعة",
  },
  {
    id: 7,
    name: "Carex Assorted Flavours – 12 قطعة",
    description: "واقيات ذكريّة من اللاتكس الطبيعي بنكهات فواكه متنوعة تشمل الفراولة والموز والعنب والبرتقال والتفاح والكشمش الأسود.",
    price: 75,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0018_Assorted-Flavours-600x600.jpg",
    badge: "نكهات متنوعة – 12 قطعة",
  },
  {
    id: 8,
    name: "Carex Multi Pleasure – 12 قطعة",
    description: "عبوة متنوعة من الواقيات الذكرية بالأنواع الأملس والمضلع والمنقط والرقيق، مع نكهات الفراولة والموز والشوكولاتة وفق وصف الشركة.",
    price: 75,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0009_Multi-Pleasure-600x600.jpg",
    badge: "تشكيلة متنوعة – 12 قطعة",
  },
  {
    id: 9,
    name: "Carex Colours – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي بألوان متعددة، عرض اسمي 52±2 مم وطول لا يقل عن 160 مم، بتصميم أملس.",
    price: 100,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0014_Colours-600x600.jpg",
    badge: "ألوان متنوعة – 12 قطعة",
  },
  {
    id: 10,
    name: "Carex Dotted – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي بسطح منقّط، عرض اسمي 52±2 مم وطول لا يقل عن 160 مم.",
    price: 100,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0012_Dotted-600x600.jpg",
    badge: "منقّط – 12 قطعة",
  },
  {
    id: 11,
    name: "Carex Ribbed – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي بسطح مضلّع، عرض اسمي 52±2 مم وطول لا يقل عن 160 مم.",
    price: 100,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0008_Ribbed-600x600.jpg",
    badge: "مضلّع – 12 قطعة",
  },
  {
    id: 12,
    name: "Carex Zero Thin – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي أرق بنسبة 30% من الواقي الكلاسيكي حسب وصف الشركة، عرض اسمي 52±2 مم وطول لا يقل عن 160 مم.",
    price: 100,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0004_Zero-Thin-600x600.jpg",
    badge: "رقيق جدًا – 12 قطعة",
  },
  {
    id: 13,
    name: "Carex Extra Large – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي بمقاس أكبر، عرض اسمي 56±2 مم وطول لا يقل عن 180 مم.",
    price: 100,
    category: "للرجال",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0010_Extra-Large-600x600.jpg",
    badge: "مقاس كبير – 12 قطعة",
  },
  {
    id: 14,
    name: "Carex Ecstasy – 12 قطعة",
    description: "واقي ذكري من اللاتكس الطبيعي بتصميم منقّط مخصص لتحفيز إضافي، عرض اسمي 52±2 مم وطول لا يقل عن 160 مم.",
    price: 100,
    category: "للأزواج",
    image: "https://carexcondoms.com/wp-content/uploads/2018/07/Products_0011_Ecstasy-600x600.jpg",
    badge: "منقّط – 12 قطعة",
  },
  {
    id: 15,
    name: "Astroglide Liquid Personal Lubricant – 73.9ml",
    description: "مزلق شخصي سائل بقاعدة مائية، سهل التنظيف وغير لزج وفق وصف الشركة المصنّعة. متوافق مع واقيات اللاتكس الطبيعي فقط؛ راجع تعليمات العبوة قبل الاستخدام.",
    price: 100,
    category: "جل ومزلقات",
    image: "https://a.lifecarepharmacykw.com/assets/f/ws/637960786525788246.jpg",
    badge: "مائي – 73.9 مل",
  },
  {
    id: 16,
    name: "Avalon K-Jelly Lubricating Gel – 115g",
    description: "جل مزلق شفاف قابل للذوبان في الماء وغير دهني، بتركيبة هيدروكسي إيثيل سيلولوز وماء منقّى. للاستعمال الخارجي فقط.",
    price: 100,
    category: "جل ومزلقات",
    image: "https://cdn.salla.sa/onqKZz/0c2b84c3-f4ab-4506-8ff0-b6efd90274f2-1000x1000-cu0g6KbWNehKV9Ij3MGlYZEsuZz1MSDwonNhlepT.jpg",
    badge: "115 جم",
  },
  {
    id: 17,
    name: "Durex Play Massage 2-in-1 Aloe Vera – 200ml",
    description: "جل مائي للتدليك والترطيب الحميمي بالألوفيرا، سهل الغسل ومناسب للاستخدام مع واقيات Durex وفق وصف المنتج. أوقف الاستخدام عند حدوث تهيّج.",
    price: 100,
    category: "جل ومزلقات",
    image: "https://pharmazone.com/cdn/shop/files/16481-DUREXPLAY2x1MASSAGE200ML_JPG.webp?v=1746616194",
    badge: "ألوفيرا – 200 مل",
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
    <div className={`product-visual ${large ? "h-[430px]" : "aspect-square h-auto sm:aspect-auto sm:h-[285px]"}`}>
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full object-contain p-3 sm:p-5"
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "الكل" || product.category === category;
    const query = searchQuery.trim().toLocaleLowerCase("ar");
    const matchesSearch = !query || `${product.name} ${product.description} ${product.category}`.toLocaleLowerCase("ar").includes(query);
    return matchesCategory && matchesSearch;
  });
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 399 || subtotal === 0 ? 0 : 25;
  const total = subtotal + shipping;
  const paypalTotalUsd = (total / 3.75).toFixed(2);

  const addToCart = (product: Product) => {
    if (product.price <= 0) return;
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

      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#fbf8f5]/95 shadow-[0_4px_18px_rgba(55,35,32,.035)] backdrop-blur-xl">
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <a href="#" className="text-[1.65rem] font-bold tracking-tight sm:text-2xl">سِتر<span className="text-[#a56c68]">.</span></a>
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            <a href="#products" className="transition hover:text-[#8f4f52]">المتجر</a>
            <a href="#privacy" className="transition hover:text-[#8f4f52]">الخصوصية</a>
            <a href="#about" className="transition hover:text-[#8f4f52]">لماذا سِتر؟</a>
            <a href="#faq" className="transition hover:text-[#8f4f52]">الأسئلة الشائعة</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#products" className="hidden rounded-full border border-[#d8cbc7] px-4 py-2 text-xs font-semibold sm:inline-flex">تصفّح المنتجات</a>
            <button className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2d2524] px-4 text-sm font-semibold text-white transition hover:bg-[#6e3940]" onClick={() => setCartOpen(true)} aria-label="فتح سلة المشتريات">
              <Icon name="bag" className="h-4 w-4" /> <span>السلة</span>
              {cartCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] text-[#6e3940]">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[#211b1c] text-white">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#8e5053]/30 blur-3xl sm:h-[34rem] sm:w-[34rem]" />
          <div className="pointer-events-none absolute -bottom-40 left-[12%] h-80 w-80 rounded-full bg-[#b87972]/15 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-9 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:px-8 lg:py-20">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3.5 py-2 text-[11px] font-semibold text-[#e2b9b0] sm:mb-6 sm:text-xs">
                <Icon name="shield" className="h-4 w-4" /> خصوصية وراحة من أول خطوة
              </div>
              <h1 className="text-balance text-[2.55rem] font-bold leading-[1.2] tracking-tight sm:text-6xl lg:text-7xl">
                عنايتك الخاصة،
                <span className="block text-[#d39b91]">بكل راحة وخصوصية.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:mt-6 sm:text-lg sm:leading-8">
                اكتشف منتجات مختارة للبالغين، وتسوّق بتجربة بسيطة وواضحة وتغليف محايد يحترم خصوصيتك.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
                <a href="#products" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-[#d5a097] px-7 py-3.5 text-sm font-bold text-[#2c2021] shadow-lg shadow-black/15 transition hover:bg-[#e5b7ae] sm:rounded-full sm:text-base">
                  تسوّق الآن <Icon name="arrow" className="h-4 w-4 rotate-180" />
                </a>
                <a href="#privacy" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white/85 transition hover:bg-white/10 sm:rounded-full sm:text-base">
                  تعرّف على سياسة الخصوصية
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-5 text-[11px] text-white/60 sm:mt-9 sm:gap-x-7 sm:text-xs">
                <span className="flex items-center gap-2"><Icon name="lock" className="h-4 w-4 text-[#d39b91]" /> خصوصية الطلب</span>
                <span className="flex items-center gap-2"><Icon name="truck" className="h-4 w-4 text-[#d39b91]" /> تغليف محايد</span>
                <span className="flex items-center gap-2"><Icon name="shield" className="h-4 w-4 text-[#d39b91]" /> خيارات واضحة</span>
              </div>
            </div>
            <div className="relative mx-auto flex min-h-[235px] w-full max-w-xl items-center justify-center overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-br from-[#493236] via-[#38272a] to-[#282021] p-5 shadow-2xl shadow-black/30 sm:min-h-[420px] sm:rounded-[2.4rem] sm:p-8">
              <div className="absolute inset-4 rounded-[1.3rem] border border-white/10 sm:inset-6 sm:rounded-[1.8rem]" />
              <div className="absolute -left-8 top-6 h-32 w-32 rounded-full border border-[#d7a39a]/20 sm:left-5 sm:top-10 sm:h-56 sm:w-56" />
              <div className="absolute -left-1 top-12 h-20 w-20 rounded-full border border-[#d7a39a]/15 sm:left-12 sm:top-20 sm:h-40 sm:w-40" />
              <div className="absolute right-[27%] top-[18%] h-[55%] w-[25%] rotate-[9deg] rounded-[2rem_2rem_1.4rem_1.4rem] border border-white/20 bg-gradient-to-b from-[#d9b4a7] via-[#a56f6b] to-[#70464a] shadow-[0_28px_65px_rgba(0,0,0,.35)] sm:rounded-[3rem_3rem_2rem_2rem]">
                <div className="absolute left-1/2 top-[-8%] h-[13%] w-[40%] -translate-x-1/2 rounded-t-xl bg-[#d4b4a8]" />
                <div className="absolute inset-x-2 top-[42%] rounded-lg border-y border-white/25 py-2 text-center text-[7px] font-bold tracking-[.18em] text-white/85 sm:inset-x-3 sm:py-5 sm:text-[10px]">SITR • PRIVATE CARE</div>
              </div>
              <div className="absolute bottom-4 right-4 rounded-xl border border-white/10 bg-[#211b1c]/75 px-3 py-2.5 backdrop-blur-md sm:bottom-8 sm:right-8 sm:rounded-2xl sm:px-5 sm:py-4">
                <p className="text-[9px] text-white/55 sm:text-xs">سِتر — مساحتك الخاصة</p>
                <p className="mt-1 text-xs font-semibold text-white sm:text-base">تجربة أهدأ. اختيار أوضح.</p>
              </div>
              <span className="absolute left-6 top-6 text-[8px] font-semibold tracking-[.25em] text-[#d7a39a]/75 sm:left-10 sm:top-10 sm:text-[11px]">PRIVATE BY DESIGN</span>
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

        <section id="products" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-11 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="mb-6 flex flex-col justify-between gap-5 sm:mb-10 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold tracking-[.2em] text-[#9a625f]">اختيارات سِتر</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                اختياراتك بكل سهولة
              </h2>
            </div>
            <div className="category-scroll -mx-4 flex max-w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:max-w-full sm:px-0">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`min-h-10 shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition sm:px-5 sm:text-sm ${category === item ? "bg-[#2d2524] text-white shadow-md shadow-black/10" : "border border-[#d8cbc7] bg-white/70 text-[#5e5050] hover:bg-white"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <label className="mb-5 flex min-h-12 items-center gap-3 rounded-2xl border border-[#e2d6d1] bg-white px-4 shadow-sm sm:mb-7 sm:max-w-md">
            <span className="text-lg text-[#9a7772]" aria-hidden="true">⌕</span>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ابحث عن منتج أو تصنيف..." className="w-full bg-transparent text-sm outline-none placeholder:text-[#a59691]" aria-label="ابحث عن المنتجات" />
            {searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="text-xs font-semibold text-[#8f4f52]">مسح</button>}
          </label>
          <div className="grid grid-cols-2 gap-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article key={product.id} className="group flex min-w-0 flex-col overflow-hidden rounded-[1.2rem] border border-[#e9dfda] bg-white p-2.5 shadow-[0_5px_20px_rgba(66,43,39,.045)] transition duration-300 sm:rounded-[1.75rem] sm:p-4 sm:hover:-translate-y-1 sm:hover:shadow-[0_18px_42px_rgba(66,43,39,.10)]">
                <div className="relative overflow-hidden rounded-[1rem] sm:rounded-[1.5rem]">
                  <ProductVisual product={product} />
                  {product.badge && (
                    <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-semibold shadow-sm sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[11px]">
                      {product.badge}
                    </span>
                  )}
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.price <= 0}
                    className="absolute bottom-4 left-4 right-4 hidden translate-y-3 rounded-full bg-[#2c2423]/95 px-5 py-3.5 text-sm font-semibold text-white opacity-0 shadow-lg transition duration-300 hover:bg-[#6e3940] group-hover:translate-y-0 group-hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-[#766967] sm:block"
                  >
                    {product.price > 0 ? "أضف إلى السلة" : "بانتظار تحديد السعر"}
                  </button>
                </div>
                <div className="mt-3 flex min-w-0 flex-1 flex-col gap-1 px-0.5 sm:mt-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-1">
                  <div>
                    <p className="mb-1 text-[9px] font-semibold text-[#9a6a65] sm:mb-1.5 sm:text-[11px]">
                      {product.category}
                    </p>
                    <h3 className="line-clamp-2 min-h-[2.6em] text-[12px] font-semibold leading-5 sm:text-lg sm:leading-7">{product.name}</h3>
                    <p className="mt-1 hidden max-w-xs text-sm leading-6 text-[#7a6d6b] sm:mt-2 sm:block">
                      {product.description}
                    </p>
                  </div>
                  <p className="pt-1 text-right text-sm font-bold sm:shrink-0 sm:pt-5 sm:text-left">
                    {product.price > 0 ? (
                      <>{product.price} <span className="text-xs font-medium">ر.س</span></>
                    ) : (
                      <span className="text-xs font-semibold text-[#9a625f]">السعر يحدد لاحقًا</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.price <= 0}
                  className="mt-2 min-h-10 w-full rounded-xl bg-[#6e3940] py-2 text-[11px] font-semibold text-white transition hover:bg-[#572c32] disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
                >
                  {product.price > 0 ? "أضف إلى السلة" : "بانتظار تحديد السعر"}
                </button>
              </article>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="mt-8 rounded-[2rem] border border-[#dfd0ca] bg-white/70 px-6 py-14 text-center">
              <h3 className="text-xl font-semibold">نعيد تجهيز قائمة المنتجات</h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#786b68]">
                أزلنا المنتجات السابقة. ستظهر هنا المنتجات الجديدة بعد التحقق من بياناتها وصورها وأسعارها والسماح بتداولها.
              </p>
            </div>
          )}
        </section>

        <section id="privacy" className="scroll-mt-20 bg-[#2d2524] text-white">
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

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 gap-1 rounded-2xl border border-white/70 bg-[#fffdfa]/95 p-2 shadow-[0_12px_40px_rgba(44,30,28,.18)] backdrop-blur-xl lg:hidden" aria-label="التنقل السريع">
        <a href="#" className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold text-[#6e3940]"><span className="text-base">⌂</span>الرئيسية</a>
        <a href="#products" className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold text-[#6e3940]"><span className="text-base">▦</span>المنتجات</a>
        <button onClick={() => setCartOpen(true)} className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold text-[#6e3940]"><span className="relative text-base">♧{cartCount > 0 && <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#6e3940] px-1 text-[9px] text-white">{cartCount}</span>}</span>السلة</button>
      </nav>

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
