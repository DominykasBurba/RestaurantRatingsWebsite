Restaurant Platform Frontend

React frontend aplikacija restoranų valdymo platformai.

Funkcijos

Autentifikacija (Prisijungimas / Registracija)
Restoranų sąrašas ir detalės
Patiekalų peržiūra
Atsiliepimų sistema
Responsive dizainas (mobile-first)
Role-based prieiga (Admin, RestaurantOwner, User)
Modaliniai langai
Animacijos ir transitions

Technologijos

- React 18
- React Router DOM
- Fetch API
- CSS3 (Grid, Flexbox)
- Font Awesome ikonos

Paleidimas

npm install
npm run dev
npm run build

API

Aplikacija naudoja REST API:
- Base URL: `https://kturestaurant-api-b0fvgtegandhhhew.germanywestcentral-01.azurewebsites.net/api`

Responsive Breakpoints

- Mobile: < 768px
- Tablet: ≥ 768px
- Desktop: ≥ 1024px

## Struktūra

src/
├── components/     # Komponentai (Header, Footer, Modal)
├── contexts/       # React Context (AuthContext)
├── pages/          # Puslapiai (Home, Login, Dashboard, RestaurantDetails)
├── services/       # API servisas
├── App.jsx         # Pagrindinis komponentas
└── main.jsx        # Entry point

