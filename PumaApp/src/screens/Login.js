import { useState } from "react";
import { View, Text, TextInput, Image, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "../constants/colors";
import { loginUser } from "../services/LogInService";

const PROVIDERS = [
	{ key: "google", image: require("../../assets/social/google.png") },
	{ key: "apple", image: require("../../assets/social/apple.png") },
	{ key: "outlook", image: require("../../assets/social/outlook.png") },
];

export default function Login()
{
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordHidden, setPasswordHidden] = useState(true);
	const [rememberMe, setRememberMe] = useState(true);

	
	function handleLogin()
		{
			async function handleLogin() {


		try {
	
		const data = await loginUser(email, password);

		console.log("Inloggad användare:", data.user);

		router.replace("/map");
	} catch (error) {
		console.log(error);

		Alert.alert(
		"Kunde inte logga in",
		error.message
		);
	}
	}
		}

	return (
		<SafeAreaView style={styles.screen} edges={["top"]}>
			{/* Cinzel ritar gemener som kapitäler, därav "SkogsFynd" -> SKOGSFYND med stora S och F. */}
			<Text style={styles.brandTitle}>SkogsFynd</Text>

			<KeyboardAvoidingView style={styles.sheet} behavior={Platform.OS === "ios" ? "padding" : undefined}>
				<Pressable onPress={() => router.back()} style={styles.closeButton} hitSlop={8}>
					<Ionicons name="close" size={28} color="#3C3C43" />
				</Pressable>

				<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
					<Text style={styles.title}>Logga in</Text>

					<View style={styles.inputs}>
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								value={email}
								onChangeText={setEmail}
								placeholder="Email"
								placeholderTextColor={COLORS.placeholder}
								autoCapitalize="none"
								autoCorrect={false}
								keyboardType="email-address"
								autoComplete="email"
								textContentType="emailAddress"
							/>
						</View>
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								value={password}
								onChangeText={setPassword}
								placeholder="Password"
								placeholderTextColor={COLORS.placeholder}
								autoCapitalize="none"
								autoCorrect={false}
								secureTextEntry={passwordHidden}
								autoComplete="current-password"
								textContentType="password"
								returnKeyType="go"
								onSubmitEditing={handleLogin}
							/>
							<Pressable onPress={() => setPasswordHidden((value) => !value)} hitSlop={8}>
								<Ionicons name={passwordHidden ? "eye-off-outline" : "eye-outline"} size={22} color={COLORS.placeholder} />
							</Pressable>
						</View>
					</View>

					<View style={styles.optionsRow}>
						<Pressable style={styles.checkboxRow} onPress={() => setRememberMe((value) => !value)} hitSlop={6}>
							<View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
								{rememberMe && <Ionicons name="checkmark" size={18} color="white" />}
							</View>
							<Text style={styles.checkboxLabel}>Kom ihåg mig</Text>
						</Pressable>
						<Pressable hitSlop={6}>
							<Text style={styles.forgotText}>Glömt lösenord? ↗</Text>
						</Pressable>
					</View>

					<Pressable onPress={handleLogin} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
						<Text style={styles.buttonText}>Logga in</Text>
					</Pressable>

					<View style={styles.dividerRow}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>Logga in med</Text>
						<View style={styles.dividerLine} />
					</View>

					<View style={styles.socialRow}>
						{PROVIDERS.map((provider) => (
							<Pressable
								key={provider.key}
								onPress={handleLogin}
								style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
							>
								<Image source={provider.image} style={styles.socialIcon} resizeMode="contain" />
							</Pressable>
						))}
					</View>

					<Text style={styles.footer}>
						Inte använt Skogsfynd tidigare?{" "}
					</Text>
					<Text style={styles.footerLink} onPress={() => router.replace("/register")}>Registrera dig här</Text>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: COLORS.background },
	brandTitle: { fontFamily: "Cinzel_700Bold", fontSize: 44, color: COLORS.label, textAlign: "center", paddingTop: 40, paddingBottom: 40 },

	sheet: {
		flex: 1,
		backgroundColor: COLORS.card,
		borderTopLeftRadius: 36,
		borderTopRightRadius: 36,
		boxShadow: "0px -2px 12px 0px rgba(0, 0, 0, 0.06)",
	},
	closeButton: {
		position: "absolute",
		top: 14,
		left: 14,
		zIndex: 1,
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: COLORS.closeButton,
		justifyContent: "center",
		alignItems: "center",
	},
	content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 },
	title: { fontSize: 26, color: COLORS.label, textAlign: "center", marginBottom: 28 },

	inputs: { gap: 16 },
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		height: 48,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 10,
		backgroundColor: COLORS.card,
	},
	input: { flex: 1, fontSize: 18, color: COLORS.label },

	optionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
	checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10 },
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 5,
		borderWidth: 1.5,
		borderColor: COLORS.border,
		justifyContent: "center",
		alignItems: "center",
	},
	checkboxChecked: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
	checkboxLabel: { fontSize: 15, color: COLORS.secondaryLabel },
	forgotText: { fontSize: 15, color: COLORS.blue },

	button: {
		height: 52,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLORS.brown,
		marginTop: 28,
		marginBottom: 28,
	},
	buttonPressed: { opacity: 0.7 },
	buttonText: { fontSize: 19, color: "white" },

	dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
	dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: COLORS.secondaryLabel },
	dividerText: { fontSize: 15, color: COLORS.secondaryLabel },

	socialRow: { flexDirection: "row", justifyContent: "center", gap: 28, marginTop: 20 },
	socialButton: {
		width: 56,
		height: 56,
		borderRadius: 28,
		borderWidth: 1,
		borderColor: "#D1D1D6",
		backgroundColor: COLORS.card,
		justifyContent: "center",
		alignItems: "center",
	},
	socialButtonPressed: { opacity: 0.6 },
	socialIcon: { width: 30, height: 30 },
	

	footer: { fontSize: 15, color: COLORS.label, textAlign: "center", marginTop: 28 },
	footerLink: { color: COLORS.brown, textAlign: "center" },
});
