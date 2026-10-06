import { useState } from "react";
import { View, Text, Button, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { identify } from "../../../../lib/gemini";

// Maps Gemini's English confidence values to Swedish labels and colors
const CONFIDENCE_LABELS = {
	high: { text: "Hög säkerhet", color: "#2e7d32" },
	medium: { text: "Medel säkerhet", color: "#ef6c00" },
	low: { text: "Låg säkerhet", color: "#757575" },
};

function SuggestionCard({ suggestion, isTopMatch })
{
	const confidence = CONFIDENCE_LABELS[suggestion.confidence] ?? CONFIDENCE_LABELS.low;

	return (
		<View style={[styles.card, isTopMatch && styles.topCard]}>
			{isTopMatch && <Text style={styles.topLabel}>Mest troligt</Text>}
			<Text style={styles.swedishName}>{suggestion.swedishName}</Text>
			<Text style={styles.scientificName}>{suggestion.scientificName}</Text>
			<View style={[styles.badge, { backgroundColor: confidence.color }]}>
				<Text style={styles.badgeText}>{confidence.text}</Text>
			</View>
		</View>
	);
}

function ResultView({ result })
{
	if (!result.found)
	{
		return (
			<View style={styles.card}>
				<Text>Ingen svamp eller bär hittades på bilden. Prova att ta en tydligare bild närmare objektet.</Text>
			</View>
		);
	}

	const suggestions = result.suggestions ?? [];
	const lookalikes = (result.poisonousLookalikes ?? []).filter((name) => name.trim() !== "");

	return (
		<View style={styles.resultContainer}>
			{suggestions.map((suggestion, index) => (
				<SuggestionCard key={index} suggestion={suggestion} isTopMatch={index === 0} />
			))}

			{lookalikes.length > 0 && (
				<View style={styles.warningBox}>
					<Text style={styles.warningTitle}>⚠️ Kan förväxlas med giftiga arter</Text>
					{lookalikes.map((name, index) => (
						<Text key={index} style={styles.warningText}>• {name}</Text>
					))}
				</View>
			)}

			{result.comment ? <Text style={styles.comment}>{result.comment}</Text> : null}

			<Text style={styles.disclaimer}>
				Ät aldrig svamp eller bär enbart utifrån appens förslag. Kontrollera alltid med en kunnig person eller en svampbok.
			</Text>
		</View>
	);
}

export default function IdentifyScreen()
{
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	async function handleIdentify(source)
	{
		setLoading(true);
		setError(null);
		setResult(null);

		try
		{
			const response = await identify(source);
			if (response === null)
			{
				setError("Ingen bild valdes.");
			}
			else
			{
				setResult(response);
			}
		}
		catch (e)
		{
			setError(e.message);
		}
		finally
		{
			setLoading(false);
		}
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Identifiera</Text>

			<Button title="Ta foto" onPress={() => handleIdentify("camera")} disabled={loading} />
			<Button title="Välj från bibliotek" onPress={() => handleIdentify("library")} disabled={loading} />

			{loading && <ActivityIndicator size="large" style={styles.spacing} />}

			{error && <Text style={styles.error}>{error}</Text>}

			{result && <ResultView result={result} />}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 20, gap: 12 },
	title: { fontSize: 24, fontWeight: "bold" },
	spacing: { marginTop: 20 },
	error: { color: "red", marginTop: 20 },

	resultContainer: { gap: 12, marginTop: 8 },
	card: { padding: 16, borderRadius: 12, backgroundColor: "#f5f5f5" },
	topCard: { borderWidth: 2, borderColor: "#2e7d32" },
	topLabel: { fontSize: 12, fontWeight: "bold", color: "#2e7d32", textTransform: "uppercase", marginBottom: 4 },
	swedishName: { fontSize: 20, fontWeight: "bold" },
	scientificName: { fontStyle: "italic", color: "#555", marginBottom: 8 },
	badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	badgeText: { color: "white", fontSize: 12, fontWeight: "bold" },

	warningBox: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#c62828", backgroundColor: "#fdecea" },
	warningTitle: { fontWeight: "bold", color: "#c62828", marginBottom: 6 },
	warningText: { color: "#c62828" },

	comment: { fontSize: 14, color: "#333" },
	disclaimer: { fontSize: 12, color: "#777", fontStyle: "italic" },
});