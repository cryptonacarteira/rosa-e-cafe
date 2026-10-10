/* ===== Rosa & Café — Conexão com Planilha Google ===== */
const CONFIG = {
  planilhaUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR24vNL7fob94KI1GFBUunU0f0NWALQtxu1j-ugrjAzphFAlHoDbw2KXIQiKduQ76CW85uWxIQ_7_vl/pub?output=csv",
  
  whatsapp: "55DDDNÚMERO",       // ← TROCA pelo seu número com DDD, só dígitos
  telefoneExibicao: "(00) 00000-0000",
  telefoneLink: "+55DDDNÚMERO",
  endereco: "Rua Exemplo, 123 - Centro",
  instagram: "#",
  facebook: "#",
  tiktok: "#",
};

let PRODUTOS_ATIVOS = [];

async function carregarPlanilha() {
  try {
    const res = await fetch(CONFIG.planilhaUrl);
    const texto = await res.text();
    const linhas = texto.trim().split("\n").slice(1);
    
    PRODUTOS_ATIVOS = linhas.map(linha => {
      const cols = linha.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      const [nome, cat, tipo, precoStr, tag, img] = cols.map(c => 
        c ? c.replace(/^"|"$/g, "").trim() : ""
      );
      
      const preco = parseFloat(precoStr.replace(",", "."));
      const tipoFiltro = tipo.toLowerCase().includes("masc") ? "masc" : "fem";
      
      return {
        nome,
        cat,
        tipo: tipoFiltro,
        preco,
        tag: tag ? tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase() : "",
        img
      };
    }).filter(p => p.nome);
    
    renderProdutos();
  } catch (erro) {
    console.warn("Erro ao carregar planilha:", erro);
  }
}

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const money = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function linkWhats(texto = "") {
  const base = `https://wa.me/${CONFIG.whatsapp}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

function aplicarConfig() {
  const fone = $("#contactPhone");
  if (fone) { fone.href = "tel:" + CONFIG.telefoneLink; fone.textContent = CONFIG.telefoneExibicao; }
  const addr = $("#contactAddr");
  if (addr) addr.textContent = CONFIG.endereco;
  const ano = $("#ano");
  if (ano) ano.textContent = new Date().getFullYear();
  
  ["headerWhats", "ctaWhats", "whatsFloat"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = linkWhats("Olá! Vim pelo site da Rosa & Café!");
  });
}

function renderProdutos(filtro = "all") {
  const box = $("#products");
  if (!box) return;
  const lista = PRODUTOS_ATIVOS.filter(p => filtro === "all" || p.tipo === filtro);
  
  box.innerHTML = lista.map(p => `
    <article class="product">
      <div class="product__img">
        ${p.tag ? `<span class="product__tag">${p.tag}</span>` : ""}
        ${p.img ? `<img src="${p.img}" alt="${p.nome}" loading="lazy" />` 
                 : `<div style="padding:3rem;background:#f5f5f5;text-align:center;color:#999">📷 Em breve</div>`}
      </div>
      <div class="product__body">
        <span class="product__cat">${p.cat}</span>
        <h3 class="product__name">${p.nome}</h3>
        <p class="product__price">${money(p.preco)} <small>ou 3x s/ juros</small></p>
        <a class="product__btn" target="_blank" rel="noopener"
           href="${linkWhats(`Olá! Tenho interesse em: ${p.nome} - ${money(p.preco)}`)}">
          Tenho interesse
        </a>
      </div>
    </article>
  `).join("");
}

function initFiltros() {
  $$(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderProdutos(btn.dataset.filter);
    });
  });
}

function initHeader() {
  const header = $("#header");
  const toggle = $("#menuToggle");
  const nav = $("#nav");
  if (!header || !toggle || !nav) return;
  
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll);
  
  toggle.addEventListener("click", () => {
    const aberto = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", aberto);
  });
  
  $$("#nav a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
  }));
}

document.addEventListener("DOMContentLoaded", async () => {
  aplicarConfig();
  await carregarPlanilha();
  if ($("#filters")) initFiltros();
  initHeader();
});
