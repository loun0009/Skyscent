import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import { useRouter } from "expo-router";
import { useAppTheme } from "../src/theme";

export default function AuthScreen() {
  const { signIn, signUp, loading, error, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const colors = useAppTheme();
  const styles = makeStyles(colors);

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
      if (success) router.replace("/(tabs)");
    } else {
      const success = await signUp(email, password);
      if (success) setEmailSent(true);
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

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setEmailSent(false);
              setIsLogin(true);
              setPassword("");
              setConfirmPassword("");
            }}
          >
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => signUp(email, password)}
          >
            <Text style={styles.resendText}>Renvoyer l'email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🌸</Text>
          <Text style={styles.title}>Skyscent</Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Connecte-toi pour retrouver tes favoris"
              : "Crée ton compte gratuitement"}
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
            placeholderTextColor={colors.placeholder}
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
            placeholderTextColor={colors.placeholder}
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
                  confirmPassword && password !== confirmPassword
                    ? styles.inputError
                    : null,
                ]}
                placeholder="********"
                placeholderTextColor={colors.placeholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? "Se connecter" : "S'inscrire"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin ? "Pas de compte ?" : "Déjà un compte ?"}
          </Text>
          <TouchableOpacity onPress={switchMode}>
            <Text style={styles.switchText}>
              {isLogin ? "Inscris-toi" : "Connecte-toi"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 24,
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: 40,
    },
    emoji: {
      fontSize: 56,
      marginBottom: 12,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },
    form: {
      marginBottom: 24,
    },
    errorBox: {
      backgroundColor: colors.error10,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: colors.error,
      fontSize: 13,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    inputError: {
      borderColor: colors.error,
    },
    button: {
      backgroundColor: colors.gold,
      padding: 16,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 24,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.white,
      fontWeight: "bold",
      fontSize: 16,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    switchText: {
      color: colors.gold,
      fontWeight: "600",
      fontSize: 14,
    },
    emailHighlight: {
      color: colors.gold,
      fontWeight: "600",
    },
    resendButton: {
      alignItems: "center",
      padding: 12,
      marginTop: 8,
    },
    resendText: {
      color: colors.textSecondary,
      fontSize: 14,
      textDecorationLine: "underline",
    },
  });