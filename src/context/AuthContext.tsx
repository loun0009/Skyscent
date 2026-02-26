import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../services/supabaseClient";
import { User } from "../types";
import { fetchProfile, updateProfile } from "../services/profileService";


interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    clearError: () => void;
    updateUserProfile: (updates: {
        first_name?: string;
        last_name?:string;
        age?: number;
        gender?: "homme" | "femme" | "autre";
    }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const buildUser = async (supabaseUser: any): Promise<User> => {
        const profile = await fetchProfile(supabaseUser.id);
        return {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            created_at: supabaseUser.created_at,
            first_name: profile?.first_name ?? null,
            last_name: profile?.last_name ?? null,
            age: profile?.age ?? null,
            gender: profile?.gender ?? null,
        };
  };

    // Récupère la session active au démarrage
    useEffect(() => {
       supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
            const user = await buildUser(session.user);
            setUser(user);
        }
        setLoading(false);
    });
         // Écoute les changements d'authentification
        const { data: {subscription} } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            const user = await buildUser(session.user);
            setUser(user);
        } else {
            setUser(null);
        }
        setLoading(false);
    });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string): Promise<boolean> => {
        try {
            setError(null);
            setLoading(true);
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            return true;
        } catch (error: any) {
            setError(error.message || "Une erreur est survenue lors de l'inscription.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string): Promise<boolean> => {
        try {
            setError(null);
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return true;
        } catch (error: any) {
            setError(error.message || "Une erreur est survenue lors de la connexion.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => { 
        await supabase.auth.signOut();
        setUser(null);
    }
    
    const clearError = () => setError(null);

    const updateUserProfile = async (updates: {
        first_name?: string;
        last_name?: string;
        age?: number;
        gender?: "homme" | "femme" | "autre";
    }): Promise<boolean> => {
        if (!user) return false;
        const success = await updateProfile(user.id, updates);
        if (success) {
            setUser((prev) => (prev ? {...prev, ...updates} : null));
        }
        return success;
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, clearError, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
};
