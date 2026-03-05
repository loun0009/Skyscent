import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Review, PerfumeRating } from "../types";
import { getReviewsForPerfume, getUserReview, upsertReview, deleteReview, getPerfumeRating } from "../services/reviewsService";

interface ReviewsContextType {
    reviews: Review[];
    userReview: Review | null;
    rating: PerfumeRating | null;
    loading: boolean;
    loadReviews: (perfumeId: number) => Promise<void>;
    submitReview: (perfumeId: number, rating: number, comment: string | null) => Promise<void>;
    removeReview: (perfumeId: number) => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextType | null>(null);

export const ReviewsProvider = ({ children }: { children: ReactNode }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [rating, setRating] = useState<PerfumeRating | null>({average: 0, count: 0});
    const [loading, setLoading] = useState(false);

    const loadReviews = useCallback(async (perfumeId: number) => {
        setLoading(true);
        const [allReviews, myReview, perfumeRating] = await Promise.all([
            getReviewsForPerfume(perfumeId),
            getUserReview(perfumeId),
            getPerfumeRating(perfumeId),
        ]);
        setReviews(allReviews);
        setUserReview(myReview);
        setRating(perfumeRating);
        setLoading(false);
    }, []);

    const submitReview = async (perfumeId: number, rating: number, comment: string | null) => {
        await upsertReview(perfumeId, rating, comment);
        await loadReviews(perfumeId);
    };

    const removeReview = async (perfumeId: number) => {
        await deleteReview(perfumeId);
        await loadReviews(perfumeId);
    };

    return (
        <ReviewsContext.Provider value={{ reviews, userReview, rating, loading, loadReviews, submitReview, removeReview }}>
            {children}
        </ReviewsContext.Provider>
    );
};

export const useReviews = (): ReviewsContextType => {
        const context = useContext(ReviewsContext);
        if (!context) {
            throw new Error("useReviews must be used within a ReviewsProvider");
        }
        return context;
    };