import type { Book, Review, User } from "./types";

export const CATEGORIES = [
  "All",
  "Fiction",
  "Philosophy",
  "Science",
  "Technology",
  "History",
  "Poetry",
] as const;

const lorem = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    `Chapter ${i + 1}. ${"In the quiet hum of midnight, ideas drifted between pages like aurora across an indigo sky. Each paragraph a doorway, each sentence a small luminous door. ".repeat(6)}`,
  );

export const MOCK_BOOKS: Book[] = [
  {
    id: "b1",
    title: "The Cartographer of Silences",
    author: "Ines Mavrou",
    category: "Fiction",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    description: "A lyrical novel mapping the unspoken geographies between two strangers in post-war Athens.",
    year: 2022,
    pages: lorem(8),
    fileUrl: "#",
  },
  {
    id: "b2",
    title: "Machines That Dream",
    author: "Dr. Hana Okafor",
    category: "Technology",
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    description: "A field guide to emergent cognition in modern neural systems — accessible, rigorous, urgent.",
    year: 2024,
    pages: lorem(10),
    fileUrl: "#",
  },
  {
    id: "b3",
    title: "On Stillness",
    author: "Marcus Vale",
    category: "Philosophy",
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80",
    description: "Twelve essays on attention, slowness, and the moral weight of the present moment.",
    year: 2021,
    pages: lorem(6),
    fileUrl: "#",
  },
  {
    id: "b4",
    title: "Architectures of Light",
    author: "Sofia Lindqvist",
    category: "Science",
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80",
    description: "From photons to perception — a sweeping tour of how light shapes physics, biology, and art.",
    year: 2023,
    pages: lorem(9),
    fileUrl: "#",
  },
  {
    id: "b5",
    title: "Empire of Hours",
    author: "Tomás Reyes",
    category: "History",
    cover: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=80",
    description: "A century retold through the small, stubborn rituals that survived its catastrophes.",
    year: 2020,
    pages: lorem(7),
    fileUrl: "#",
  },
  {
    id: "b6",
    title: "Indigo Notebooks",
    author: "Aiko Tanaka",
    category: "Poetry",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80",
    description: "Eighty-one short poems written between midnight and the first blue minute of morning.",
    year: 2024,
    pages: lorem(5),
    fileUrl: "#",
  },
  {
    id: "b7",
    title: "The Quiet Algorithm",
    author: "Eli Brandt",
    category: "Technology",
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    description: "How invisible decisions ripple outward — a humane introduction to systems thinking.",
    year: 2023,
    pages: lorem(8),
    fileUrl: "#",
  },
  {
    id: "b8",
    title: "Gardens of Reason",
    author: "Beatrice Hall",
    category: "Philosophy",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",
    description: "A reasoned defense of curiosity in an age of certainty.",
    year: 2022,
    pages: lorem(7),
    fileUrl: "#",
  },
];

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Reader Demo", email: "reader@smartlib.dev", role: "READER", createdAt: "2025-01-10" },
  { id: "u2", name: "Admin Demo", email: "admin@smartlib.dev", role: "ADMIN", createdAt: "2024-11-02" },
  { id: "u3", name: "Lina Park", email: "lina@example.com", role: "READER", createdAt: "2025-03-22" },
  { id: "u4", name: "Jules Moreau", email: "jules@example.com", role: "READER", createdAt: "2025-04-08" },
];

export const MOCK_REVIEWS: Review[] = [
  { id: "r1", bookId: "b1", userId: "u3", userName: "Lina Park", rating: 5, comment: "Heartbreakingly beautiful — read it in one sitting.", createdAt: "2025-05-01" },
  { id: "r2", bookId: "b1", userId: "u4", userName: "Jules Moreau", rating: 4, comment: "Slow start, but the final chapter is masterful.", createdAt: "2025-05-12" },
  { id: "r3", bookId: "b2", userId: "u3", userName: "Lina Park", rating: 5, comment: "The clearest explanation of transformers I've read.", createdAt: "2025-05-20" },
];
