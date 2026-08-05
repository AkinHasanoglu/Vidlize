export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_USER = {
  id: "demo-user-001",
  email: "demo@ugcstudio.co",
  fullName: "Demo Kullanıcı",
  avatarUrl: null,
  credits: 12,
  role: "USER" as const,
  locale: "tr",
  createdAt: new Date(),
  updatedAt: new Date(),
};
