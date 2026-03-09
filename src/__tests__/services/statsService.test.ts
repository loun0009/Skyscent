import { getUserStats } from "../../services/statsService";
import { supabase } from "../../services/supabaseClient";

jest.mock("../../services/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: "user-123" } } })
      ),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() =>
            Promise.resolve({
              data: [
                {
                  perfume_id: 1,
                  worn_at: "2026-03-09T10:00:00Z",
                  temperature: 15,
                  perfume: { name: "Santal 33", brand: "Le Labo", intensity: "modérée", season: ["autumn"] },
                },
                {
                  perfume_id: 1,
                  worn_at: "2026-03-08T10:00:00Z",
                  temperature: 12,
                  perfume: { name: "Santal 33", brand: "Le Labo", intensity: "modérée", season: ["autumn"] },
                },
                {
                  perfume_id: 2,
                  worn_at: "2026-03-07T10:00:00Z",
                  temperature: 18,
                  perfume: { name: "Neroli", brand: "Tom Ford", intensity: "légère", season: ["summer"] },
                },
              ],
              error: null,
            })
          ),
        })),
      })),
    })),
  },
}));

describe("getUserStats", () => {
  it("calcule le total de parfums portés", async () => {
    const stats = await getUserStats();
    expect(stats.totalWorn).toBe(3);
  });

  it("calcule le nombre de parfums uniques", async () => {
    const stats = await getUserStats();
    expect(stats.uniquePerfumes).toBe(2);
  });

  it("identifie le parfum le plus porté", async () => {
    const stats = await getUserStats();
    expect(stats.favoritePerfume?.name).toBe("Santal 33");
    expect(stats.favoritePerfume?.count).toBe(2);
  });

  it("calcule la température moyenne", async () => {
    const stats = await getUserStats();
    expect(stats.averageTemperature).toBe(15);
  });
});