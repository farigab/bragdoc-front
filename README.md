# BragDoc Frontend

Frontend web do BragDoc: aplicação Angular para gerenciar e visualizar conquistas profissionais e relatórios.

## 🚀 Tecnologias (versões atuais)

- **Angular 21.1.0** — Standalone components e recursos modernos
- **PrimeNG 21.0.4** — Biblioteca de componentes UI
- **TypeScript 5.9.2** — Tipagem rígida
- **Chart.js 4.4.0** — Visualização de dados
- **PrimeFlex** — Utilitários Flexbox
- **PrimeIcons 7.0.0** — Ícones

## ✨ Recursos principais

- Apple-inspired UI com foco em clareza e tipografia
- Componentes standalone e arquitetura moderna
- Gerenciamento reativo por sinais (`signal`, `computed`)
- Lazy loading de rotas para otimização de bundling
- Formulários reativos tipados
- Acessibilidade e responsividade (WCAG AA)

## 📁 Estrutura resumida

```
src/
├── app/
│   ├── components/
│   ├── models/
│   ├── services/
│   ├── app.component.ts
│   └── app.routes.ts
├── environments/
├── styles.css
├── main.ts
└── index.html
```

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+ (recomendado)
- npm (ou pnpm)

### Instalação

```bash
npm install
```

### Executar em desenvolvimento

```bash
npm start
```

Abra http://localhost:4200/ (ou conforme configuração do projeto).

### Build de produção

```bash
npm run build
```

### Scripts comuns

```bash
npm start          # servidor de desenvolvimento
npm run build      # build de produção
npm run watch      # build em modo watch
npm test           # executar testes (jest/vitest)
npm test:watch     # testes em watch
```

## 🔧 Configuração

Atualize a URL da API em `src/environments/environment.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api'
};
```

## 🤝 Contribuições

- Crie uma branch `feature/descricao` ou `fix/descricao`.
- Abra um PR descrevendo mudanças e como testar.
- Siga as diretrizes do projeto (componentes standalone, sinais, OnPush, TypeScript estrito, acessibilidade).

## 📄 Licença

Projeto privado

## 🎨 Design System — Dark Mode (Roxo)

Seguem as diretrizes oficiais do Design System do projeto para o modo escuro. Esta paleta e regras devem ser seguidas rigidamente para garantir consistência visual e acessibilidade.

### Tokens de cores (core)

- `--primary`: #6B5DD3        — Roxo principal
- `--primary-hover`: #7B69E0  — Hover roxo
- `--bg`: #1C1B29             — Fundo escuro
- `--surface`: #2A273D        — Superfícies / cards
- `--border`: #443F5E         — Bordas suaves

### Texto

- `--text-primary`: #E0DAFF   — Texto principal (roxo claro)
- `--text-secondary`: #BFB3F2 — Texto secundário
- `--text-disabled`: #7F6FD1  — Texto desabilitado

### Estados

- `--success`: #9BFFA1
- `--warning`: #FFD37F
- `--error`: #FF9BFF

> Regra: roxo é a base para a identidade visual; não usar cores fora da paleta.

### Tipografia

- Família: `system-ui, -apple-system, BlinkMacSystemFont`
- Escala recomendada:
  - Title: 32px / 600
  - Section: 24px / 600
  - Subtitle: 20px / 500
  - Body: 16px / 400
  - Caption: 13px / 400

Line-height mínimo: 1.5

### Espaçamento

- Base: 8px — usar múltiplos de 8 para margens e gaps
- Layout: 24–32px
- Padding de cards: 24px

### PrimeNG — Overrides obrigatórios

- Botões (`p-button`):
  - `border-radius: 10px`, altura 40px
  - Primary: `background: var(--primary)`, `color: #fff`
  - Secondary: `background: var(--surface)`, `border: 1px solid var(--border)`, `color: var(--text-primary)`
  - Hover: `background: var(--primary-hover)`

- Inputs (`p-inputtext`, `p-dropdown`, `p-calendar`):
  - Altura 40px, `border: 1px solid var(--border)`, `border-radius: 8px`, `background: var(--surface)`, `color: var(--text-primary)`
  - Focus: `border-color: var(--primary)`, `box-shadow: 0 0 6px rgba(107,93,211,0.3)`

- Cards (`p-card`):
  - `border-radius: 12px`, `padding: 24px`, `background: var(--surface)`, `box-shadow: 0 4px 12px rgba(107,93,211,0.3)`

- Tables (`p-table`):
  - Header transparente, hover suave: `rgba(107,93,211,0.05)`

### UX Rules

- Sempre mostrar estado vazio
- Feedback visual em ações (sucesso/erro)
- Hover e focus visíveis
- Animações curtas (<200ms)
- Evitar loaders agressivos
- Garantir contraste mínimo WCAG 4.5:1

### Proibições

- ❌ Cores fora da paleta roxa
- ❌ Gradientes exagerados
- ❌ Ícones coloridos decorativos
- ❌ Componentes densos ou ruidosos

### Regra da fonte (autoridade)

Este arquivo define o design completo para o Dark Mode Roxo. Não criar variações fora dessa paleta; seguir tokens, espaçamento e overrides PrimeNG.

---


## 📦 Key Components

### Dashboard

- Overview statistics cards
- Category distribution chart
- Recent achievements list
- Quick action buttons

### Achievement List

- Data table with sorting and filtering
- Search functionality
- Category filtering
- CRUD operations with confirmations

### Achievement Form

- Reactive form validation
- Date picker
- Category dropdown

### Layout

- Sticky header with blur effect
- Responsive navigation
- Mobile sidebar
- Apple-style footer

## 🔧 Scripts

```bash
npm start          # Start development server
npm run build      # Production build
npm run watch      # Build in watch mode
npm test           # Run tests
npm test:watch     # Run tests in watch mode
```

## 📝 Environment Variables

- `apiUrl`: Backend API URL (default: `http://localhost:8080/api`)

## 🤝 Contributing

Follow the coding standards defined in `.github/instructions/frontend.md`:

1. Use standalone components
2. Use signals for state management
3. Implement OnPush change detection
4. Follow strict TypeScript practices
5. Ensure WCAG AA accessibility
6. Keep components small and focused

## 📄 License

Private project

---

**Built with ❤️ using Angular 21 and PrimeNG**
