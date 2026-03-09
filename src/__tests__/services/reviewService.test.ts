import { getPerfumeRating } from "../../services/reviewsService";
import { supabase } from "../../services/supabaseClient";

// Mock Supabase
jest.mock("../../services/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() =>
          Promise.resolve({
            data: [{ rating: 4 }, { rating: 5 }, { rating: 3 }],
            error: null,
          })
        ),
      })),
    })),
  },
}));

describe("getPerfumeRating", () => {
  it("calcule correctement la moyenne", async () => {
    const result = await getPerfumeRating(1);
    expect(result.average).toBe(4);
    expect(result.count).toBe(3);
  });

  it("retourne 0 si aucun avis", async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() =>
          Promise.resolve({ data: [], error: null })
        ),
      })),
    });
    const result = await getPerfumeRating(999);
    expect(result.average).toBe(0);
    expect(result.count).toBe(0);
  });
});