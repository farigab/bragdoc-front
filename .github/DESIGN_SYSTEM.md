# Design System – Angular + PrimeNG (Apple-like, Dark Mode Roxo)

## 1. Princípios
- Minimalismo funcional
- Conteúdo primeiro
- Interface limpa e silenciosa
- Consistência acima de customização
- UX previsível

---

## 2. Stack
- Framework: Angular
- UI Library: PrimeNG
- Tema base: lara-dark-purple (customizado)
- Estilo: Apple-like UI

---

## 3. Tokens de Cores

### Core
- --primary: #6B5DD3        <!-- Roxo principal -->
- --primary-hover: #7B69E0  <!-- Hover roxo mais claro -->
- --bg: #1C1B29             <!-- Fundo escuro -->
- --surface: #2A273D        <!-- Cards e superfícies -->
- --border: #443F5E         <!-- Borda suave roxa -->

### Texto
- --text-primary: #E0DAFF   <!-- Roxo claro -->
- --text-secondary: #D7D1F8 <!-- Roxo médio (clareado para melhor contraste) -->
- --text-disabled: #9B8FE2  <!-- Roxo apagado (ajustado) -->

### Estados
- --success: #9BFFA1        <!-- Verde pastel -->
- --warning: #FFD37F        <!-- Amarelo suave -->
- --error: #FF6B6B          <!-- Vermelho/aviso menos saturado (melhor em dark) -->

**Regras**
- Roxo é base para tudo, inclusive estados.
- Sem cores neutras ou gradientes fora da paleta.
- Contraste mínimo WCAG 4.5:1.

---

## 4. Tipografia

### Fonte
- system-ui, -apple-system, BlinkMacSystemFont

### Escala
| Uso | Size | Weight |
|----|------|--------|
| Title | 32px | 600 |
| Section | 24px | 600 |
| Subtitle | 20px | 500 |
| Body | 16px | 400 |
| Caption | 13px | 400 |

Line-height mínimo: 1.5

---

## 5. Espaçamento

- Base: 8px
- Layout: 24–32px
- Cards padding: 24px
- Gap entre seções: 32px

Tudo em múltiplos de 8.

---

## 6. PrimeNG – Overrides Obrigatórios

### Botões (`p-button`)
- Border-radius: 10px
- Altura: 40px
- Primary:
  - background: var(--primary)
  - color: #fff
- Secondary:
  - background: var(--surface)
  - border: 1px solid var(--border)
  - color: var(--text-primary)

Hover:
- background: var(--primary-hover)
- Sem animação exagerada

---

### Inputs (`p-inputtext`, `p-dropdown`, `p-calendar`)
- Altura: 40px
- Border: 1px solid var(--border)
- Radius: 8px
- Background: var(--surface)
- Text: var(--text-primary)
- Focus:
  - Border-color: var(--primary)
  - Box-shadow leve: `0 0 6px rgba(107, 93, 211, 0.3)`

---

### Cards (`p-card`)
- Radius: 12px
- Padding: 24px
- Background: var(--surface)
- Shadow: `0 4px 12px rgba(107, 93, 211, 0.3)`

---

### Tables (`p-table`)
- Header: fundo transparente
- Linhas:
  - Hover: `rgba(107, 93, 211, 0.05)`
- Nada de zebra forte

---

## 7. UX Rules
- Sempre mostrar estado vazio
- Feedback visual em ações
- Hover e focus obrigatórios
- Sem loaders agressivos
- Animações < 200ms
- Contraste mínimo sempre respeitado

---

## 8. Proibições
- ❌ Cores fora da paleta roxa
- ❌ Gradientes exagerados
- ❌ Ícones decorativos coloridos
- ❌ Componentes densos
- ❌ Ruído visual
- ❌ Textos sem contraste suficiente

---

## 9. Regra da IA
Este arquivo define **o design completo para Dark Mode**.
Não criar variações fora dessa paleta.
Sempre seguir tokens e overrides PrimeNG.
