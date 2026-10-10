/* ===========================================================
   ⚙️  SETTINGS
   =========================================================== */
const WHATSAPP_NUMBER = "96877579391";   // country code, no + or spaces (Oman = 968)

/* Click-to-chat endpoint — device-aware, so the customer lands IN the chat
   instead of on a chooser page.

   The public web endpoints (`wa.me/<n>?text=` and `api.whatsapp.com/send?
   phone=<n>&text=`) are the same thing, and on desktop both stop at an
   "Open app / Continue to WhatsApp Web" interstitial: they cannot know which
   client you use, so they ask. That costs the customer a click on every order.
   We answer the question ourselves:

     mobile  -> whatsapp://send   the app's own URL scheme. No web page loads
                                  at all; the chat opens instantly. This is the
                                  path that matters — customers order by phone.
     desktop -> web.whatsapp.com  opens straight into the chat when WhatsApp Web
                                  is already logged in. When it isn't, they get
                                  the QR "link a device" wall — a hurdle, but a
                                  recoverable one: the prefilled chat is waiting
                                  behind the scan.

   Deliberately NOT `whatsapp://` on desktop: without WhatsApp Desktop installed
   Windows raises a "You'll need a new app to open this link" dialog and the
   customer is stuck with nothing. The QR wall is the softer failure.

   `wa.me` appears nowhere on purpose — the short domain does not resolve on this
   network (DNS_PROBE_FINISHED_NXDOMAIN) while web.whatsapp.com answers fine, so
   any customer whose ISP filters it the same way would hit a dead link.

   The <noscript> order link in index.html stays on api.whatsapp.com: with no JS
   there is no detection, and that fallback has to work for everyone. */
const isMobile = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent);
const waLink = (text) => {
  const q = `phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;
  return isMobile() ? `whatsapp://send?${q}` : `https://web.whatsapp.com/send?${q}`;
};
const CURRENCY = { en: "OMR", ar: "ر.ع." };

// Optional: paste the SAME Google Sheet Web App URL you put in money.html.
const SHEET_API = "";
const API_KEY   = "";
/* =========================================================== */


/* ===========================================================
   🌍  LANGUAGE
   Every string the customer reads lives here or in MENU below.
   Markup carries `data-i18n="key"` (text) or `data-i18n-aria="key"`
   (aria-label); applyI18n() walks those and swaps the copy, so a
   language change never has to touch the DOM structure.
   =========================================================== */
const I18N = {
  en: {
    "doc.title": "Sip & Crunch — Fresh Sips, Bold Crunch",

    "nav.menu": "Menu",
    "nav.build": "Build",
    "nav.find": "Find us",
    "nav.order": "Order",

    "a11y.lang": "التبديل إلى العربية",
    "a11y.theme": "Switch to dark mode",
    "a11y.themeOff": "Switch to light mode",
    "a11y.menu": "Toggle menu",

    "hero.eyebrow": "Fresh sips · bold crunch",
    "hero.sub": "Chips drowned in cheddar, ranch and 1000 island. Loaded with strips, beef or hot dog. Cold juice on the side.",
    "hero.cta1": "Build your box",
    "hero.cta2": "See the menu",

    "marquee.1": "DROWN IT",
    "marquee.2": "LOAD IT",
    "marquee.3": "CRUNCH IT",
    "marquee.4": "SIP IT",

    "menu.eyebrow": "The good stuff",
    "menu.title": "Menu",
    "menu.lead": "Pick a chip. Drown it. Load it up.",
    "menu.hint": "Prices in Omani Rial (OMR).",

    "builder.eyebrow": "Make it yours",
    "builder.title": "Build your box",
    "builder.lead": "Tap what you want. We total it and send it to WhatsApp.",

    "step1.title": "Pick your chip",
    "step1.sub": "Choose one base — required.",
    "step2.title": "Add sauces",
    "step2.sub": "Pick as many as you like.",
    "step3.title": "Load add-ons",
    "step3.sub": "Strips, beef, hot dog…",
    "step4.title": "Toppings",
    "step4.sub": "Tick what you want on top.",
    "step5.title": "Grab a sip",
    "step5.sub": "Optional — but recommended.",

    "cart.title": "Your box",
    "cart.empty": "Nothing yet — start picking 👆",
    "cart.total": "Total",
    "cart.order": "Order on WhatsApp",
    "cart.fine": "Opens WhatsApp with your order ready to send.",
    "cart.pickFirst": "Pick something first 👆",
    "cart.free": "Free",
    "nudge.meat": "We recommend adding more Beef 🥩",
    "cart.chipsLine": "Chips",

    "story.eyebrow": "Our story",
    "story.title": "Two things, done right.",
    "story.body": "A box of chips worth queuing for, and something cold to wash it down. No frozen leftovers, no shortcuts — made the moment you order.",
    "story.cta": "Follow @sip.crunch3",

    "order.eyebrow": "Hungry?",
    "order.title": "Order now",
    "order.waTitle": "WhatsApp",
    "order.waBody": "Send us your order directly.",
    "order.waCta": "Message us →",
    "order.igTitle": "Instagram",
    "order.igBody": "@sip.crunch3 — drops & specials.",
    "order.igCta": "Follow us →",

    "footer.tag": "Fresh sips, bold crunch.",
    "footer.ig": "Instagram",
    "sticky": "Build & order",

    "wa.greeting": "Hi Sip & Crunch! 🍟 I'd like to order:",
    "wa.building": "(— building my box —)",
    "wa.total": "Total",
    "wa.name": "Name:",
    "wa.toppings": "Toppings",
    "wa.short": "Hi Sip & Crunch! I'd like to order...",
  },

  ar: {
    "doc.title": "سِب آند كرنش — عصائر طازجة وقرمشة قوية",

    "nav.menu": "المنيو",
    "nav.build": "جهّز طلبك",
    "nav.find": "وين تلقانا",
    "nav.order": "اطلب",

    "a11y.lang": "Switch to English",
    "a11y.theme": "التبديل إلى الوضع الليلي",
    "a11y.themeOff": "التبديل إلى الوضع النهاري",
    "a11y.menu": "فتح القائمة",

    "hero.eyebrow": "عصائر طازجة · قرمشة قوية",
    "hero.sub": "شيبس مغرّق بالشيدر والرانش والألف جزيرة. محمّل بالستربس أو اللحم أو الهوت دوق. وعصير بارد على الجنب.",
    "hero.cta1": "جهّز صندوقك",
    "hero.cta2": "شوف المنيو",

    "marquee.1": "غرّقه",
    "marquee.2": "حمّله",
    "marquee.3": "قرمشه",
    "marquee.4": "اشربه",

    "menu.eyebrow": "الأشياء الحلوة",
    "menu.title": "المنيو",
    "menu.lead": "اختر الشيبس. غرّقه. حمّله.",
    "menu.hint": "الأسعار بالريال العماني.",

    "builder.eyebrow": "سوّه على ذوقك",
    "builder.title": "جهّز صندوقك",
    "builder.lead": "اضغط على اللي تبيه، ونحسب لك المجموع ونرسله على واتساب.",

    "step1.title": "اختر الشيبس",
    "step1.sub": "اختر نوعاً واحداً — إلزامي.",
    "step2.title": "أضف الصوصات",
    "step2.sub": "اختر اللي تبي، بدون حدود.",
    "step3.title": "حمّل الإضافات",
    "step3.sub": "ستربس، لحم، هوت دوق…",
    "step4.title": "توبينغ",
    "step4.sub": "اختر اللي تبيه فوق.",
    "step5.title": "خذ لك مشروب",
    "step5.sub": "اختياري — لكن ننصح فيه.",

    "cart.title": "صندوقك",
    "cart.empty": "ما فيه شي بعد — ابدأ الاختيار 👆",
    "cart.total": "المجموع",
    "cart.order": "اطلب عبر واتساب",
    "cart.fine": "يفتح واتساب وطلبك جاهز للإرسال.",
    "cart.pickFirst": "اختر شيئاً أولاً 👆",
    "cart.free": "مجاناً",
    "nudge.meat": "ننصح بإضافة المزيد من اللحم 🥩",
    "cart.chipsLine": "شيبس",

    "story.eyebrow": "قصتنا",
    "story.title": "شيئان، ومسوّيينهم صح.",
    "story.body": "صندوق شيبس يستاهل الوقوف في الطابور، وشي بارد ينزّله. ما فيه مجمّد ولا اختصارات — يتجهّز لحظة ما تطلب.",
    "story.cta": "تابعنا @sip.crunch3",

    "order.eyebrow": "جوعان؟",
    "order.title": "اطلب الحين",
    "order.waTitle": "واتساب",
    "order.waBody": "أرسل لنا طلبك مباشرة.",
    "order.waCta": "راسلنا ←",
    "order.igTitle": "إنستقرام",
    "order.igBody": "@sip.crunch3 — جديدنا وعروضنا.",
    "order.igCta": "تابعنا ←",

    "footer.tag": "عصائر طازجة، قرمشة قوية.",
    "footer.ig": "إنستقرام",
    "sticky": "جهّز واطلب",

    "wa.greeting": "مرحباً Sip & Crunch! 🍟 أبغى أطلب:",
    "wa.building": "(— أجهّز صندوقي —)",
    "wa.total": "المجموع",
    "wa.name": "الاسم:",
    "wa.toppings": "التوبينغ",
    "wa.short": "مرحباً Sip & Crunch! أبغى أطلب...",
  },
};

/* ---- MENU DATA (single source of truth) ----
   Each item has a stable `id`. The cart is keyed by id, never by the
   display name, so switching language re-labels the order instead of
   emptying it. */
const MENU = {
  chips: {
    emoji: "🍟", step: "step1",
    en: { title: "Chips", note: "Bold & crunchy. Pick your flavor." },
    ar: { title: "شيبس",  note: "قرمشة قوية. اختر النكهة." },
    items: [
      { id: "chili",   price: 0.8, en: "Chili",  ar: "حار" },
      /* `tag` is optional and shows as a small badge beside the name, on the
         menu card and in the builder. Only this item carries one so far. */
      { id: "protein", price: 0.8, en: "Protein BBQ", ar: "بروتين باربكيو",
        tag: { en: "8g protein", ar: "٨ غ بروتين" }, comingSoon: true },
    ],
  },
  sauces: {
    emoji: "🧀", step: "step2",
    en: { title: "Sauces",   note: "Poured on thick." },
    ar: { title: "الصوصات", note: "مسكوب بكثرة." },
    items: [
      { id: "cheddar", price: 0.3, en: "Cheddar",     ar: "شيدر" },
      { id: "ranch",   price: 0.3, en: "Ranch",       ar: "رانش" },
      { id: "island",  price: 0.3, en: "1000 Island", ar: "ألف جزيرة" },
    ],
  },
  addons: {
    emoji: "🍗", step: "step3",
    en: { title: "Add-ons",   note: "Load it up." },
    ar: { title: "الإضافات", note: "حمّله." },
    items: [
      { id: "strips", price: 0.4, en: "Strips",  ar: "ستربس" },
      { id: "beef",   price: 0.5, en: "Beef",    ar: "لحم" },
      { id: "hotdog", price: 0.3, en: "Hot Dog", ar: "هوت دوق" },
    ],
  },
  /* `free: true` suppresses the price everywhere — menu card, builder and the
     WhatsApp message. These are included with the box, and a row of "0.000 OMR"
     would draw attention to that instead of just quietly giving it away. */
  toppings: {
    emoji: "🌽", step: "step4", free: true, multi: true,
    en: { title: "Toppings",  note: "Tick what you want on top." },
    ar: { title: "توبينغ", note: "اختر اللي تبيه فوق." },
    items: [
      { id: "corn",     price: 0, en: "Corn",        ar: "ذرة" },
      { id: "jalapeno", price: 0, en: "Jalapeño",    ar: "هالابينو" },
      { id: "olive",    price: 0, en: "Black Olive", ar: "زيتون أسود" },
    ],
  },
  juices: {
    emoji: "🥤", step: "step5",
    en: { title: "Fresh Juices",  note: "Cold, fresh, made to order." },
    ar: { title: "عصائر طازجة", note: "بارد، طازج، ويتجهّز عند الطلب." },
    items: [
      { id: "juice", price: 1.0, en: "Fresh Juice", ar: "عصير طازج" },
    ],
  },
  /* Not food, so `menuHidden` keeps it off the Menu section. Pickup is the
     only option, so there is no builder step for it — every order is pickup,
     and it still shows in the cart and the WhatsApp message so nobody asks. */
  delivery: {
    menuHidden: true,
    items: [
      { id: "pickup", price: 0, en: "Pickup", ar: "استلام" },
    ],
  },
};

/* ---------- language helpers ---------- */
let LANG = document.documentElement.lang === "ar" ? "ar" : "en";

const t    = (key) => (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key;
const fmt  = (n) => `${n.toFixed(3)} ${CURRENCY[LANG]}`;
const name = (item) => item[LANG] || item.en;
const cat  = (key) => MENU[key][LANG] || MENU[key].en;
/* Optional per-item badge ("8g protein"). Returns "" for items without one,
   so it can be dropped into any template unconditionally. */
const badge = (item) =>
  item.tag ? `<span class="tag">${item.tag[LANG] || item.tag.en}</span>` : "";
const comingSoonLabel = () => LANG === "ar" ? "قريباً" : "Coming Soon";

/* ---------- render MENU cards ---------- */
function renderMenu() {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = Object.keys(MENU).filter((key) => !MENU[key].menuHidden).map((key) => {
    const c = MENU[key], label = cat(key);
    return `
    <div class="menu-card">
      <div class="menu-card__head">
        <span class="menu-card__emoji">${c.emoji}</span>
        <h3>${label.title}</h3>
      </div>
      <p class="menu-card__note">${label.note}</p>
      ${c.items.map((it) => `
        <div class="menu-card__item${it.comingSoon ? " menu-card__item--soon" : ""}">
          <span class="menu-card__name">${name(it)}${badge(it)}</span>
          ${it.comingSoon
            ? `<span class="tag tag--soon">${comingSoonLabel()}</span>`
            : c.free ? "" : `<span class="menu-card__price">${fmt(it.price)}</span>`}
        </div>`).join("")}
    </div>`;
  }).join("");
}

/* ---------- BUILD YOUR BOX ----------
   state.chips holds an item id; the qty groups map id → count. */
const state = { chips: null, sauces: {}, addons: {}, toppings: {}, juices: {}, delivery: "pickup" };

function renderBuilder() {
  const wrap = document.getElementById("builderSteps");
  wrap.innerHTML = `
    ${stepSingle("chips", "1")}
    ${stepQty("sauces", "2")}
    ${stepQty("addons", "3")}
    ${stepCheck("toppings", "4")}
    ${stepQty("juices", "5")}
  `;
  bindBuilder();
  updateCart();
}

/* One-of-many radio group. Reads state[key] rather than state.chips so the
   same renderer can serve any single-choice group. */
function stepSingle(key, no) {
  const c = MENU[key];
  return `
  <div class="bstep${c.required ? " bstep--required" : ""}" id="step-${key}">
    <div class="bstep__title"><span>${c.emoji}</span> ${no}. ${t(c.step + ".title")}</div>
    <p class="bstep__sub">${t(c.step + ".sub")}</p>
    <div class="bstep__opts">
      ${c.items.filter((it) => !it.comingSoon).map((it) => `
        <label class="opt opt--single${state[key] === it.id ? " is-on" : ""}" data-key="${key}" data-id="${it.id}">
          <input type="radio" name="${key}" value="${it.id}"${state[key] === it.id ? " checked" : ""}>
          ${name(it)}${badge(it)} <span class="opt__price">${it.price ? fmt(it.price) : t("cart.free")}</span>
        </label>`).join("")}
    </div>
  </div>`;
}

/* Tick-box group for the included toppings. No price is rendered at all —
   see the `free` note on MENU.toppings. */
function stepCheck(key, no) {
  const c = MENU[key];
  return `
  <div class="bstep" id="step-${key}">
    <div class="bstep__title"><span>${c.emoji}</span> ${no}. ${t(c.step + ".title")}</div>
    <p class="bstep__sub">${t(c.step + ".sub")}</p>
    <div class="bstep__opts">
      ${c.items.map((it) => `
        <label class="opt opt--check${state[key][it.id] ? " is-on" : ""}" data-key="${key}" data-id="${it.id}">
          <input type="checkbox"${state[key][it.id] ? " checked" : ""}>
          <span class="opt__box" aria-hidden="true"></span>${name(it)}
        </label>`).join("")}
    </div>
  </div>`;
}

function stepQty(key, no) {
  const c = MENU[key];
  return `
  <div class="bstep">
    <div class="bstep__title"><span>${c.emoji}</span> ${no}. ${t(c.step + ".title")}</div>
    <p class="bstep__sub">${t(c.step + ".sub")}</p>
    <div class="bstep__opts">
      ${c.items.map((it) => {
        const qty = state[key][it.id] || 0;
        return `
        <div class="opt opt--qty${qty > 0 ? " is-on" : ""}" data-key="${key}" data-id="${it.id}">
          <span>${name(it)} <span class="opt__price">${fmt(it.price)}</span></span>
          <span class="qty">
            <button type="button" data-act="minus" aria-label="−1 ${name(it)}">−</button>
            <span data-count>${qty}</span>
            <button type="button" data-act="plus" aria-label="+1 ${name(it)}">+</button>
          </span>
        </div>`;
      }).join("")}
    </div>
  </div>`;
}

function bindBuilder() {
  /* Every radio group (currently just the chip base) binds here.
     Scoped by data-key so groups never clear each other's selection. */
  document.querySelectorAll(".opt--single").forEach((el) => {
    const key = el.dataset.key;
    el.addEventListener("click", () => {
      // A click on the <label> is forwarded to the radio it wraps, and that
      // click bubbles back up — so this fires twice per tap. Re-selecting the
      // option that is already on is a no-op, which collapses the pair into one.
      if (state[key] === el.dataset.id) {
        el.querySelector("input").checked = true;
        return;
      }
      state[key] = el.dataset.id;
      document.querySelectorAll(`.opt--single[data-key="${key}"]`).forEach((o) => o.classList.remove("is-on"));
      el.classList.add("is-on");
      el.querySelector("input").checked = true;
      updateCart();
    });
  });

  /* Checkboxes bind to the input's change event rather than the label's click.
     The label-forwarding double-fire above does not apply, and `change` gives
     the already-toggled state directly instead of having to infer it. */
  document.querySelectorAll(".opt--check input").forEach((input) => {
    const el = input.closest(".opt");
    const key = el.dataset.key, id = el.dataset.id;
    input.addEventListener("change", () => {
      if (input.checked) state[key][id] = true;
      else delete state[key][id];
      el.classList.toggle("is-on", input.checked);
      updateCart();
    });
  });
  document.querySelectorAll(".opt--qty").forEach((el) => {
    const key = el.dataset.key, id = el.dataset.id;
    const countEl = el.querySelector("[data-count]");
    el.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cur = state[key][id] || 0;
        const next = Math.max(0, cur + (btn.dataset.act === "plus" ? 1 : -1));
        if (next === 0) delete state[key][id];
        else state[key][id] = next;
        countEl.textContent = next;
        el.classList.toggle("is-on", next > 0);
        updateCart();
        if (btn.dataset.act === "plus") meatNudge(key, id);
      });
    });
  });
}

/* ---------- "add more Beef" nudge ----------
   Fires when the customer ADDS an add-on that is not Beef — i.e. Strips or
   Hot Dog. Sauces, chips and juices stay silent: picking a sauce is not a
   protein decision, and popping the prompt on every one of those taps turned
   an upsell into nagging.

   It keys off the item just picked, NOT off what the box already holds. An
   earlier version gated on "box contains no Beef", which meant that once Beef
   was in the box every later Hot Dog or Strips tap went silent — the opposite
   of the point. Beef in the box is no reason to stop suggesting more of it.

   Only adding counts. The − button is a removal, not a choice, so it stays
   quiet: nobody wants an upsell for taking something out.

   The whole rule lives here rather than at the call site, because the qty
   handler is shared by sauces, add-ons and juices — the group check has to
   happen somewhere, and one function is easier to re-read than three guards.

   Hooked into the click handler rather than into updateCart(), because
   updateCart() also runs on first render and on every language switch, and
   neither is a customer choosing something. */
function meatNudge(key, id) {
  if (key !== "addons" || id === "beef") return;
  toast(t("nudge.meat"));
}

let toastTimer;
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    /* role=status is announced by screen readers without stealing focus, so a
       keyboard customer is not thrown out of the option they just picked. */
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-on"), 3600);
}

const findItem = (key, id) => MENU[key].items.find((it) => it.id === id);

function lineItems() {
  const lines = [];
  if (state.chips) {
    const it = findItem("chips", state.chips);
    if (it) lines.push({ label: `${t("cart.chipsLine")} — ${name(it)}`, qty: 1, price: it.price });
  }
  for (const grp of ["sauces", "addons", "juices"]) {
    for (const [id, qty] of Object.entries(state[grp])) {
      const it = findItem(grp, id);
      if (it) lines.push({ label: name(it), qty, price: it.price });
    }
  }
  /* Flagged rather than kept in a separate array, so one list still drives the
     cart, the total and the message — each just reads the flag it cares about. */
  for (const id of Object.keys(state.toppings)) {
    const it = findItem("toppings", id);
    if (it) lines.push({ label: name(it), qty: 1, price: 0, free: true });
  }
  if (state.delivery) {
    const it = findItem("delivery", state.delivery);
    if (it) lines.push({ label: name(it), qty: 1, price: it.price, method: true });
  }
  return lines;
}

/* A box is only a real order once something priced is in it. Toppings are free
   and pickup is always set, so neither counts on its own — otherwise the
   empty box would show a lone "Pickup" line. */
const hasFood = (lines) => lines.some((l) => !l.method && l.price > 0);

let _lastTotal = 0;
function updateCart() {
  const lines = lineItems();
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  let total = 0;

  if (!hasFood(lines)) {
    list.innerHTML = `<li class="cart__empty" data-i18n="cart.empty">${t("cart.empty")}</li>`;
  } else {
    list.innerHTML = lines.map((l) => {
      const sum = l.qty * l.price;
      total += sum;
      /* Free toppings show no amount at all — not "0.000", not "Free". The
         pickup line shows "Free" so the customer knows there is no extra charge. */
      const right = l.free ? "" : (l.price ? fmt(sum) : t("cart.free"));
      const qty   = l.free || l.method ? "" : `${l.qty}× `;
      return `<li class="${l.method ? "cart__method" : ""}"><span>${qty}${l.label}</span><span>${right}</span></li>`;
    }).join("");
  }

  animateTotal(totalEl, _lastTotal, total);
  _lastTotal = total;
  buildWhatsAppLink(lines, total);
}

/* the ONLY animation on the conversion path: a quick count-up.
   The proxy is module-level on purpose: a proxy created inside the function
   is a brand-new object every call, so killTweensOf() had nothing to kill and
   every tap left another live tween writing to #cartTotal. Three overlapping
   count-ups would fight over the same element and the last one to finish won,
   which could leave a total that disagreed with the line items. */
const _totalProxy = { v: 0 };
let _totalGuard;
function animateTotal(el, from, to) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const settle = () => (el.textContent = fmt(to));

  clearTimeout(_totalGuard);
  if (typeof gsap !== "undefined") {
    gsap.killTweensOf(_totalProxy);   // cancel the count-up still in flight
    gsap.killTweensOf(el);            // …and its scale pop
  }

  if (reduce || typeof gsap === "undefined" || from === to) {
    if (typeof gsap !== "undefined") gsap.set(el, { clearProps: "transform" });
    settle();
    return;
  }

  _totalProxy.v = from;
  const countUp = gsap.to(_totalProxy, {
    v: to, duration: 0.35, ease: "power2.out",
    onUpdate: () => (el.textContent = fmt(_totalProxy.v)),
    onComplete: settle,
  });
  const pop = gsap.fromTo(el, { scale: 1.12 }, { scale: 1, duration: 0.35, ease: "power2.out" });

  /* Same guard as the hero entrance. This tween depends on GSAP's rAF ticker;
     if the ticker is frozen or throttled the count-up never lands and a stale
     number sits on the conversion path. Force the real total after 1.2s — a
     no-op whenever the 0.35s animation actually ran. */
  _totalGuard = setTimeout(() => {
    if (countUp.progress() < 1) countUp.progress(1);
    if (pop.progress() < 1) pop.progress(1);
    settle();
  }, 1200);
}

function buildWhatsAppLink(lines, total) {
  const orderBtn = document.getElementById("orderBtn");
  const waCard = document.getElementById("waCard");

  const priced  = lines.filter((l) => !l.free && !l.method);
  const free    = lines.filter((l) => l.free);
  const method  = lines.find((l) => l.method);

  let msg = t("wa.greeting") + "\n";
  if (hasFood(lines)) {
    msg += priced.map((l) => `\n• ${l.qty}× ${l.label} (${fmt(l.qty * l.price)})`).join("");
    /* Listed by name with no amounts — the kitchen needs to know what goes on
       the box, and the customer never sees a price against them. */
    /* Arabic uses its own comma (U+060C); a Latin one reads as a typo in RTL. */
    if (free.length) msg += `\n\n${t("wa.toppings")}: ${free.map((l) => l.label).join(LANG === "ar" ? "، " : ", ")}`;
    if (method) msg += `\n\n🛍️ ${method.label}`;
    msg += `\n\n${t("wa.total")}: ${fmt(total)}`;
  } else {
    msg += "\n" + t("wa.building");
  }
  msg += `\n\n${t("wa.name")}`;

  orderBtn.href = waLink(msg);
  if (waCard) {
    waCard.href = waLink(t("wa.short"));
    /* The card opens in a new tab on desktop, but a `whatsapp://` link has no
       page to show — target="_blank" would hand the app the order and leave an
       empty tab sitting on the customer's phone. Fire it in place instead. */
    if (isMobile()) waCard.removeAttribute("target");
  }

  orderBtn.onclick = (e) => {
    if (!hasFood(lines)) {
      e.preventDefault();
      document.getElementById("builder").scrollIntoView({ behavior: "smooth" });
      orderBtn.textContent = t("cart.pickFirst");
      setTimeout(() => (orderBtn.textContent = t("cart.order")), 1600);
      return;
    }
    logPendingOrder(lines, total);
  };
}

/* ---------- send the order to the owner's money sheet ---------- */
function logPendingOrder(lines, total) {
  if (!SHEET_API) return;
  try {
    const payload = JSON.stringify({
      key: API_KEY, action: "addSale",
      items: lines.map((l) => `${l.qty}× ${l.label}`),
      amount: Number(total.toFixed(3)),
      source: "website", status: "pending",
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(SHEET_API, new Blob([payload], { type: "text/plain;charset=utf-8" }));
    } else {
      fetch(SHEET_API, { method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" }, body: payload });
    }
  } catch (err) { /* never block the customer's order */ }
}

/* ===========================================================
   🌗  THEME  — light by default, dark on request, remembered.
   The class is written to <html> by the inline head script before
   first paint; this only handles the toggling afterwards.
   =========================================================== */
const THEME_COLOR = { light: "#EBE7DD", dark: "#141310" };

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function setTheme(theme, persist = true) {
  const dark = theme === "dark";
  if (dark) document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");

  const meta = document.getElementById("themeColor");
  if (meta) meta.setAttribute("content", THEME_COLOR[dark ? "dark" : "light"]);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.setAttribute("aria-pressed", String(dark));
    btn.setAttribute("aria-label", t(dark ? "a11y.themeOff" : "a11y.theme"));
  }
  if (persist) { try { localStorage.setItem("sc-theme", dark ? "dark" : "light"); } catch (e) {} }
}

/* ===========================================================
   🌍  LANGUAGE SWITCH
   =========================================================== */
function applyI18n() {
  document.title = t("doc.title");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
  });

  const label = document.getElementById("langLabel");
  if (label) label.textContent = LANG === "ar" ? "EN" : "ع";

  // the theme button's label is language-dependent too
  const btn = document.getElementById("themeToggle");
  if (btn) btn.setAttribute("aria-label", t(currentTheme() === "dark" ? "a11y.themeOff" : "a11y.theme"));
}

function setLang(lang, persist = true) {
  LANG = lang === "ar" ? "ar" : "en";
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  if (persist) { try { localStorage.setItem("sc-lang", LANG); } catch (e) {} }

  applyI18n();
  renderMenu();
  renderBuilder();   // reads `state`, so the box in progress survives the switch

  // Arabic sets in a different font at a different size, so section heights
  // move — every scroll trigger has to re-measure against the new layout.
  motionRefresh();
}

/* ---------- nav / misc ---------- */
function initUI() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  document.getElementById("themeToggle").addEventListener("click", () => {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  });
  document.getElementById("langToggle").addEventListener("click", () => {
    setLang(LANG === "ar" ? "en" : "ar");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
}

/* ===========================================================
   MOTION — GSAP + ScrollTrigger + Lenis
   Everything here is scroll-DRIVEN (tied to scroll position,
   reverses on the way back up), not fire-once fades.
   =========================================================== */
let motionRefresh = () => {};   // replaced by initMotion once ScrollTrigger is up

function initMotion() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ready = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  // No GSAP or reduced motion → everything already sits in its final state.
  if (!ready || reduce) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis: one RAF loop, driven by GSAP's ticker ---- */
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.6 });
    lenis.on("scroll", ScrollTrigger.update);
    // NB: not `t` — that name is the translator at module scope.
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // anchor links must still work with smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const el = document.querySelector(a.getAttribute("href"));
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -70 });
      });
    });
  }

  /* ---- hero entrance: one orchestrated sequence ---- */
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.75 } })
    .from(".hero__el", { y: 26, opacity: 0, stagger: 0.08 });

  /* Safety net for the load entrance only (NOT a scroll reveal):
     if the rAF ticker never runs — page opened in a background tab, or a
     browser that throttles animation — land on the final state instead of
     leaving the hero invisible. Waits until the page is actually visible so
     a real visitor still sees the animation play. */
  const settleHero = () => { if (heroTl.progress() < 1) heroTl.progress(1); };
  const armHeroGuard = () => setTimeout(settleHero, 2500);
  if (document.hidden) {
    document.addEventListener("visibilitychange", function once() {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", once);
      armHeroGuard();
    });
  } else {
    armHeroGuard();
  }

  // draw the hero drizzle once, as a signature intro
  const heroPath = document.querySelector(".hero__path");
  if (heroPath) {
    const L = heroPath.getTotalLength();
    gsap.set(heroPath, { strokeDasharray: L, strokeDashoffset: L });
    gsap.to(heroPath, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut", delay: 0.25 });
  }

  /* ---- hero on scroll: headline leaves faster than the motif (depth) ---- */
  gsap.to(".hero__inner", {
    yPercent: -30, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__drizzle", {
    yPercent: 8, scale: 0.88, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---- nav settles (class toggle → CSS transition, no per-frame layout) ----
     end:"max" keeps the trigger active for the whole page. Without it the end
     defaulted to "bottom top", which stopped updating roughly a screen before
     the footer. ---- */
  ScrollTrigger.create({
    start: "top -60",
    end: "max",
    onUpdate: (self) => document.getElementById("nav").classList.toggle("is-solid", self.scroll() > 60),
  });

  /* ---- marquee ----
     Loop on the measured width of one phrase set, not xPercent:-50. The flex
     gap sitting between the two sets is not part of "half the track", so -50%
     stopped half a gap short and the band jumped 15px every lap. Measured
     lazily so the value is right once the display font has swapped in — which
     now includes the Anton→Cairo swap when the page turns Arabic. ---- */
  const track = document.getElementById("marqueeTrack");
  let marqueeTween = null;
  if (track && track.children.length >= 2) {
    const half = track.children.length / 2;
    const loopX = () => track.children[half].offsetLeft - track.children[0].offsetLeft;
    marqueeTween = gsap.to(track, {
      x: () => -loopX(), duration: 24, ease: "none", repeat: -1,
    });
  }

  /* ---- menu / story / find us: quiet reveals.
     immediateRender:false means the element keeps its natural (visible)
     state until the trigger actually fires — so a trigger that never runs
     can never leave the page blank. ---- */
  const quiet = (target, trigger, start, stagger = 0) =>
    gsap.fromTo(target,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger, ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger, start, once: true } });

  quiet(".menu-card", "#menu", "top 78%", 0.07);
  quiet("#storyInner", "#story", "top 78%");
  quiet("#orderGrid", "#order", "top 80%");

  /* ---- keep pins honest ---- */
  let rt;
  const refresh = () => {
    // re-measure the marquee too: its loop distance moves with the font swap
    if (marqueeTween) marqueeTween.invalidate();
    ScrollTrigger.refresh();
  };
  motionRefresh = () => { clearTimeout(rt); rt = setTimeout(refresh, 60); };

  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(refresh, 200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh);
}

/* ---------- go ---------- */
applyI18n();          // the markup ships English; swap it if AR was remembered
setTheme(currentTheme(), false);   // sync the toggle's label/state with <html>
renderMenu();
renderBuilder();
initUI();

/* If anything in the motion layer throws, strip every inline opacity/transform
   GSAP may have left behind so the page is guaranteed readable. */
try {
  initMotion();
} catch (err) {
  console.error("motion disabled:", err);
  document.querySelectorAll('[style*="opacity"]').forEach((el) => {
    el.style.opacity = "";
    el.style.transform = "";
  });
}
