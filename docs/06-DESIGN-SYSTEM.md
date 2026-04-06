# 06 — Design System

> Cores extraídas do escudo oficial do Resenha RFC. Identidade: **premium, esportiva, dark**.

## Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--navy-950` | `#060E1A` | Body background |
| `--navy-900` | `#0A1628` | Card background |
| `--navy-800` | `#0F1F38` | Hover, borders |
| `--navy-700` | `#162D4D` | Elevated cards |
| `--blue-600` | `#1E4D8C` | Primary accent (CTAs, links) |
| `--blue-500` | `#2563EB` | Hover accent |
| `--blue-400` | `#3B82F6` | Focus rings |
| `--cream-100` | `#F5F0E1` | Texto principal |
| `--cream-300` | `#D4C9AD` | Texto secundário |
| `--gold-400` | `#D4A843` | Destaques premium |
| `--green-500` | `#22C55E` | Vitórias, ativo |
| `--red-500` | `#EF4444` | Derrotas, erros |
| `--yellow-500` | `#EAB308` | Empates, cartão amarelo |

## CSS Variables

```css
:root {
  --bg-primary: #060E1A;
  --bg-card: #0A1628;
  --bg-elevated: #0F1F38;
  --accent: #1E4D8C;
  --accent-hover: #2563EB;
  --text-primary: #F5F0E1;
  --text-secondary: #D4C9AD;
  --text-muted: #8B7E6A;
  --gold: #D4A843;
  --border: rgba(245, 240, 225, 0.08);
  --glass: rgba(10, 22, 40, 0.7);
}
```

## Tipografia

| Uso | Família | Peso | Tamanho |
|-----|---------|------|---------|
| Display | **Outfit** | 800 | 64–80px |
| H1 | Outfit | 700 | 40–48px |
| H2 | Outfit | 700 | 28–32px |
| H3 | Outfit | 600 | 20–24px |
| Body | **Inter** | 400 | 16px |
| Small | Inter | 400 | 14px |
| Caption | Inter | 500 | 12px |
| Badge | Inter | 600 | 11px uppercase |

## Efeitos CSS

```css
/* Glassmorphism */
.glass { background: rgba(10,22,40,0.7); backdrop-filter: blur(16px); border: 1px solid rgba(245,240,225,0.06); }

/* Card hover */
.card:hover { border-color: rgba(30,77,140,0.4); box-shadow: 0 0 24px rgba(30,77,140,0.1); }

/* Glow */
.glow { box-shadow: 0 0 32px rgba(30,77,140,0.3); }

/* Gold shimmer */
.gold { background: linear-gradient(135deg, #D4A843, #B8941D); }
```

## Animações (Framer Motion)

| Elemento | Efeito | Duração |
|----------|--------|---------|
| Page enter | Fade up y:20→0 | 0.5s |
| Cards stagger | Fade up delay 0.05s | 0.4s |
| Hero logo | Scale 0.8→1 + fade | 0.8s spring |
| Card hover | Scale 1.02 + glow | 0.2s |
| Score | Count up numérico | 1s |
| Modal | Scale 0.95→1 + backdrop | 0.25s |

## Componentes (`@resenha/ui`)

### Primitives
| Componente | Variantes |
|-----------|-----------|
| `Button` | primary, secondary, ghost, destructive / sm, md, lg |
| `Input` | text, password, search / default, error, disabled |
| `Card` | default, glass, elevated / CardHeader, CardContent, CardFooter |
| `Badge` | default, success, warning, danger, accent, gold |
| `Modal` | Radix Dialog, overlay, scale animation |
| `Avatar` | fallback iniciais, border accent, sizes |
| `Tabs` | underline, pills / animated indicator |

### Composites
| Componente | Features |
|-----------|----------|
| `DataTable` | sorting, pagination, empty state, skeleton |
| `FormField` | label + input + error, integrado Zod |

### Layout
| Componente | Contexto |
|-----------|----------|
| `Header` | Web — logo, nav, hamburger, glass |
| `Footer` | Web — logo, links, redes sociais |
| `Sidebar` | Admin — nav, collapsible, active state |
| `Container` | Ambos — max-w 1280px, padding responsivo |
