import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import { useRouter } from "expo-router";
import { theme } from "../src/theme";

export default function AuthScreen() {
    const { signIn, signUp, loading, error, clearError } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!email || !password) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        if (!isLogin && password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas.");
            return;
        }

        if (isLogin) {
            const success = await signIn(email, password);
        if (success) {
          router.replace("/");
        } 
        } else {
        const success = await signUp(email, password);
        if (success) setEmailSent(true); // ← affiche l'écran de confirmation
        }
    };

    const switchMode = () => {
        clearError();
        setIsLogin(!isLogin);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    if (emailSent) {
        return (
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.emoji}>📬</Text>
                        <Text style={styles.title}>Vérifie tes emails</Text>
                        <Text style={styles.subtitle}>
                            Un email de confirmation a été envoyé à{" "}
                            <Text style={styles.emailHighlight}>{email}</Text>
                            {"\n\n"}
                            Clique sur le lien dans l'email pour activer ton compte.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => {
                            setEmailSent(false);
                            setIsLogin(true);
                            setPassword("");
                            setConfirmPassword("");
                        }}
                    >
                        <Text style={styles.buttonText}>Se connecter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.resendButton} onPress={() => signUp(email, password)}>
                        <Text style={styles.resendText}>Renvoyer l'email</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.emoji}>🌸</Text>
                    <Text style={styles.title}>Skyscent</Text>
                    <Text style={styles.subtitle}>
                        {isLogin ?"Connecte-toi pour retrouver tes favoris": "Crée ton compte gratuitement"}
                    </Text>
                </View>

                <View style={styles.form}>
                    {error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ton@gmail.com"
                        placeholderTextColor="#aaaaaa"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}     
                    />
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        placeholderTextColor="#aaaaaa"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {!isLogin && (
                        <>
                            <Text style={styles.label}>Confirme le mot de passe</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    confirmPassword && password !== confirmPassword ? styles.inputError : null,
                                ]}
                                placeholder="********"
                                placeholderTextColor="#aaaaaa"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </>
                    )}

                    <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={theme.colors.card} />
                        ) : (
                        <Text style={styles.buttonText}>{isLogin ? "Se connecter" : "S'inscrire"}</Text>
                        )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {isLogin ? "Pas de compte ?" : "Déjà un compte ?"}
                        </Text>
                        <TouchableOpacity onPress={switchMode}>
                            <Text style={styles.switchText}>{isLogin ? "Inscris-toi" : "Connecte-toi"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
},
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
},
  header: { 
    alignItems: "center", 
    marginBottom: 40 
},
  emoji: { 
    fontSize: 56, 
    marginBottom: 12 
},
  title: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary 
},
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
},
  form: { 
    marginBottom: 24 
},
  errorBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
},
  errorText: { 
    color: theme.colors.error, 
    fontSize: 13 
},
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  inputError: { 
    borderColor: "#e53e3e" 
},
  fieldError: { 
    color: "#e53e3e", 
    fontSize: 12, 
    marginTop: 4 
},
  button: {
    backgroundColor: theme.colors.gold,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { 
    opacity: 0.6 
},
  buttonText: { 
    color: theme.colors.card, 
    fontWeight: "bold", 
    fontSize: 16 
},
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: { 
    color: theme.colors.textSecondary,
    fontSize: 14 
},
  switchText: { 
    color: theme.colors.gold, 
    fontWeight: "600", 
    fontSize: 14 
},
emailHighlight: {
  color: theme.colors.gold,
  fontWeight: "600",
},
resendButton: {
  alignItems: "center",
  padding: 12,
  marginTop: 8,
},
resendText: {
  color: theme.colors.textSecondary,
  fontSize: 14,
  textDecorationLine: "underline",
},
});