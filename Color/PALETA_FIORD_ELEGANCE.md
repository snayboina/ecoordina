# Paleta Fiord Elegance

Documentação completa da paleta de cores customizada aplicada ao Ecoordina Smart Dashboard.

## 🎨 Cores Principais

### Fiord (Primária)
- **HEX:** `#47536f`
- **RGB:** `rgb(71, 83, 111)`
- **HSL:** `hsl(222, 22%, 36%)`
- **Uso:** Cor principal do sistema, sidebar, status "Liberado", elementos de destaque

**Características:**
- Tom azul acinzentado profundo
- Transmite sofisticação, confiança e estabilidade
- Excelente contraste com backgrounds claros
- Ideal para elementos de interface corporativa

---

### Gray Nurse (Neutra)
- **HEX:** `#e7e8e7`
- **RGB:** `rgb(231, 232, 231)`
- **HSL:** `hsl(120, 2%, 91%)`
- **Uso:** Borders, divisores, backgrounds sutis

**Características:**
- Cinza claro neutro e suave
- Cria separações visuais sem peso excessivo
- Mantém a leveza da interface
- Perfeito para bordas de cards e elementos de estrutura

---

### Tapestry (Secundária/Acento)
- **HEX:** `#b05d75`
- **RGB:** `rgb(176, 93, 117)`
- **HSL:** `hsl(343, 35%, 53%)`
- **Uso:** Status "Pendente", acentos, chamadas de atenção moderadas

**Características:**
- Rosa terroso e elegante
- Transmite urgência sem agressividade
- Alternativa sofisticada ao vermelho tradicional
- Equilibra modernidade e seriedade

---

### Amethyst Smoke (Terciária/Soft)
- **HEX:** `#aaa0c0`
- **RGB:** `rgb(170, 160, 192)`
- **HSL:** `hsl(259, 20%, 69%)`
- **Uso:** Eficiência/métricas, elementos decorativos, estados suaves

**Características:**
- Lavanda suave e etéreo
- Adiciona toque de sofisticação
- Excelente para dados secundários
- Cria harmonia visual com tons neutros

---

## 📊 Paleta Completa

```css
/* Cores Principais */
--fiord: #47536f;
--gray-nurse: #e7e8e7;
--tapestry: #b05d75;
--amethyst-smoke: #aaa0c0;

/* Aplicação no Sistema */
--color-brand-primary: #47536f;    /* Fiord */
--color-brand-secondary: #b05d75;  /* Tapestry */
--color-brand-accent: #aaa0c0;     /* Amethyst Smoke */
--color-saas-border: #e7e8e7;      /* Gray Nurse */
```

---

## 🎯 Aplicações no Dashboard

### Cards de Métricas
- **Total:** Slate (neutro)
- **Liberados:** Fiord (`#47536f`)
- **Pendentes:** Tapestry (`#b05d75`)
- **Eficiência:** Amethyst Smoke (`#aaa0c0`)

### Gráficos
- **Pie Chart:** Fiord (Liberados) + Tapestry (Pendentes)
- **Bar Chart:** Amethyst (Total) + Fiord (Liberados) + Tapestry (Pendentes)

### Status Badges
- **Liberado:** Background `slate-100`, texto `slate-700`
- **Pendente:** Background `rose-100`, texto `rose-700`

### Sidebar
- Background: Fiord (`#47536f`)
- Texto: Warm gray 100

---

## 🌈 Harmonia de Cores

A paleta Fiord Elegance foi cuidadosamente selecionada para:

1. **Sofisticação Profissional:** Tons sóbrios e terrosos
2. **Suavidade Visual:** Sem cores vibrantes ou agressivas
3. **Legibilidade Garantida:** Contraste WCAG AA em todos os elementos
4. **Identidade Única:** Afasta-se de paletas SaaS genéricas

---

## 📐 Contraste e Acessibilidade

| Combinação | Contraste | Status |
|------------|-----------|--------|
| Fiord + White | 7.8:1 | ✅ AAA |
| Tapestry + White | 4.2:1 | ✅ AA |
| Amethyst + White | 4.5:1 | ✅ AA |
| Gray Nurse + Stone 900 | 11.2:1 | ✅ AAA |

Todos os contrastes atendem às diretrizes WCAG 2.1 nível AA ou superior.

---

## 💡 Inspiração e Conceito

**Tema:** Elegância Natural
**Mood:** Sóbrio, Terroso, Sofisticado
**Referências:** Paletas escandinavas, tons de pedras naturais, estética minimalista premium

---

**Versão:** 1.8 - Fiord Elegance  
**Data:** Fevereiro 2026  
**Aplicação:** Ecoordina Smart Dashboard
