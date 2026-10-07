import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";

export default function Welcome()
{
	const router = useRouter();

	return (
		<SafeAreaView style={styles.screen}>
			<Text style={styles.brandTitle}>SkogsFynd</Text>

			<View style={styles.illustrationArea}>
				<Image
					source={require("../../assets/loginimages/mushroom_man.png")}
					style={styles.illustration}
					resizeMode="contain"
				/>
			</View>

			<Text style={styles.tagline}>
				Upptäck skogen. Spara fynden.{"\n"}
				<Text style={styles.taglineStrong}>Hitta tillbaka.</Text>
			</Text>

			<View style={styles.buttons}>
				<Pressable
					onPress={() => router.push("/login")}
					style={({ pressed }) => [styles.button, styles.buttonWhite, pressed && styles.buttonPressed]}
				>
					<Text style={[styles.buttonText, styles.buttonTextWhite]}>Logga in</Text>
				</Pressable>
				<Pressable
					onPress={() => router.push("/register")}
					style={({ pressed }) => [styles.button, styles.buttonBrown, pressed && styles.buttonPressed]}
				>
					<Text style={[styles.buttonText, styles.buttonTextBrown]}>Registrera dig</Text>
				</Pressable>
			</View>

			<Text style={styles.terms}>
				Genom att gå med godkänner du våra <Text style={styles.termsLink}>användarvillkor </Text>
				och <Text style={styles.termsLink}>integritetspolicy</Text>
			</Text>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 32 },
	brandTitle: { fontFamily: "Cinzel_700Bold", fontSize: 44, color: COLORS.label, textAlign: "center", paddingTop: 60 },

	illustrationArea: { flex: 1, justifyContent: "center", alignItems: "center" },
	illustration: { width: "85%", height: "100%", maxHeight: 320 },

	tagline: { fontSize: 21, fontWeight: "300", color: "#3C3C43", textAlign: "center", lineHeight: 30 },
	taglineStrong: { fontWeight: "500" },

	buttons: { gap: 22, marginTop: 44 },
	button: { height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center" },
	buttonWhite: { backgroundColor: COLORS.card },
	buttonBrown: { backgroundColor: COLORS.brown },
	buttonPressed: { opacity: 0.7 },
	buttonText: { fontSize: 19 },
	buttonTextWhite: { color: COLORS.label },
	buttonTextBrown: { color: "white" },

	terms: { fontSize: 13, fontStyle: "italic", color: "#3C3C43", textAlign: "center", marginTop: 48, marginBottom: 24 },
	termsLink: { fontWeight: "600", color: COLORS.brown },
});
