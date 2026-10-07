import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { identify } from "../../lib/gemini";

const COLORS = {
	background: "#F5F5F7",
	card: "#FFFFFF",
	label: "#000000",
	secondaryLabel: "#6E6E73",
	separator: "#C6C6C8",
	green: "#0E7C1C",
	red: "#FF3B30",
};

const CONFIDENCE_LABELS = {
	high: { text: "Hög säkerhet", textColor: "#248A3D", background: "#34C75926" },
	medium: { text: "Medel säkerhet", textColor: "#C93400", background: "#FF950026" },
	low: { text: "Låg säkerhet", textColor: "#6E6E73", background: "#8E8E9326" },
};

function ActionButton({ title, onPress, disabled, variant = "filled" })
{
	const isFilled = variant === "filled";

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.button,
				isFilled ? styles.buttonFilled : styles.buttonTinted,
				(pressed || disabled) && styles.buttonDimmed,
			]}
		>
			<Text style={[styles.buttonText, isFilled ? styles.buttonTextFilled : styles.buttonTextTinted]}>
				{title}
			</Text>
		</Pressable>
	);
}

function ConfidenceBadge({ value })
{
	const confidence = CONFIDENCE_LABELS[value] ?? CONFIDENCE_LABELS.low;

	return (
		<View style={[styles.badge, { backgroundColor: confidence.background }]}>
			<Text style={[styles.badgeText, { color: confidence.textColor }]}>{confidence.text}</Text>
		</View>
	);
}

function SectionHeader({ title })
{
	return <Text style={styles.sectionHeader}>{title}</Text>;
}

function ResultView({ result })
{
	if (!result.found)
	{
		return (
			<View style={[styles.card, styles.spacedCard]}>
				<Text style={styles.cardTitle}>Ingen svamp eller bär hittades</Text>
				<Text style={styles.bodySecondary}>Prova att ta en tydligare bild närmare objektet.</Text>
			</View>
		);
	}

	const suggestions = result.suggestions ?? [];
	const topMatch = suggestions[0];
	const otherSuggestions = suggestions.slice(1);
	const lookalikes = (result.poisonousLookalikes ?? []).filter((name) => name.trim() !== "");

	return (
		<View>
			{topMatch && (
				<>
					<SectionHeader title="Mest troligt" />
					<View style={styles.card}>
						<Text style={styles.topName}>{topMatch.swedishName}</Text>
						<Text style={styles.scientificName}>{topMatch.scientificName}</Text>
						<View style={styles.badgeRow}>
							<ConfidenceBadge value={topMatch.confidence} />
						</View>
						{result.comment ? <Text style={styles.comment}>{result.comment}</Text> : null}
					</View>
				</>
			)}

			{otherSuggestions.length > 0 && (
				<>
					<SectionHeader title="Andra resultat" />
					<View style={styles.groupedList}>
						{otherSuggestions.map((suggestion, index) => (
							<View key={index} style={[styles.row, index > 0 && styles.rowSeparator]}>
								<View style={styles.rowText}>
									<Text style={styles.rowTitle}>{suggestion.swedishName}</Text>
									<Text style={styles.rowSubtitle}>{suggestion.scientificName}</Text>
								</View>
								<ConfidenceBadge value={suggestion.confidence} />
							</View>
						))}
					</View>
				</>
			)}

			{lookalikes.length > 0 && (
				<>
					<SectionHeader title="Kan förväxlas med giftiga arter" />
					<View style={styles.warningCard}>
						{lookalikes.map((name, index) => (
							<Text key={index} style={styles.warningText}>• {name}</Text>
						))}
					</View>
				</>
			)}

			<Text style={styles.footnote}>
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
		<ScrollView style={styles.screen} contentContainerStyle={styles.container}>
			<Text style={styles.largeTitle}>Identifiera</Text>
			<Text style={styles.subtitle}>Fotografera eller välj en bild på en svamp eller ett bär.</Text>

			<View style={styles.buttonGroup}>
				<ActionButton title="Ta foto" onPress={() => handleIdentify("camera")} disabled={loading} />
				<ActionButton title="Välj från bibliotek" variant="tinted" onPress={() => handleIdentify("library")} disabled={loading} />
			</View>

			{loading && (
				<View style={[styles.card, styles.spacedCard, styles.loadingCard]}>
					<ActivityIndicator />
					<Text style={styles.bodySecondary}>Analyserar bilden…</Text>
				</View>
			)}

			{error && (
				<View style={[styles.card, styles.spacedCard]}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			)}

			{result && <ResultView result={result} />}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: COLORS.background },
	container: { padding: 16, paddingBottom: 40 },

	largeTitle: { fontSize: 34, fontWeight: "700", letterSpacing: 0.4, color: COLORS.label, marginTop: 8 },
	subtitle: { fontSize: 15, color: COLORS.secondaryLabel, marginTop: 4, marginBottom: 20 },

	buttonGroup: { gap: 10 },
	button: { height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center" },
	buttonFilled: { backgroundColor: COLORS.green },
	buttonTinted: { backgroundColor: "#FFFFFF"},
	buttonDimmed: { opacity: 0.6 },
	buttonText: { fontSize: 17, fontWeight: "600" },
	buttonTextFilled: { color: "white" },
	buttonTextTinted: { color: COLORS.green },

	sectionHeader: {
		fontSize: 13,
		color: COLORS.secondaryLabel,
		textTransform: "uppercase",
		marginTop: 28,
		marginBottom: 6,
		marginLeft: 16,
	},

	card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16 },
	spacedCard: { marginTop: 20 },
	loadingCard: { flexDirection: "row", alignItems: "center", gap: 12 },
	cardTitle: { fontSize: 17, fontWeight: "600", color: COLORS.label, marginBottom: 4 },
	bodySecondary: { fontSize: 15, color: COLORS.secondaryLabel },
	errorText: { fontSize: 15, color: COLORS.red },

	topName: { fontSize: 28, fontWeight: "700", color: COLORS.label },
	scientificName: { fontSize: 15, fontStyle: "italic", color: COLORS.secondaryLabel, marginTop: 2, marginBottom: 12 },
	comment: { fontSize: 15, color: COLORS.label, lineHeight: 21, marginTop: 14 },

	badgeRow: { flexDirection: "row" },
	badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
	badgeText: { fontSize: 13, fontWeight: "600" },

	groupedList: { backgroundColor: COLORS.card, borderRadius: 12, overflow: "hidden" },
	groupedList: { backgroundColor: COLORS.card, borderRadius: 12, boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.2)" },
	row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
	rowSeparator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.separator },
	rowText: { flex: 1 },
	rowTitle: { fontSize: 17, color: COLORS.label },
	rowSubtitle: { fontSize: 13, fontStyle: "italic", color: COLORS.secondaryLabel, marginTop: 2 },
	card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.2)" },

	warningCard: { backgroundColor: "#FF3B301A", borderRadius: 12, padding: 16, gap: 4 },
	warningText: { fontSize: 15, color: "#D70015" },
	warningCard: { backgroundColor: "#FF3B301A", borderRadius: 12, padding: 16, gap: 4, boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.2)" },

	footnote: { fontSize: 13, color: COLORS.secondaryLabel, lineHeight: 18, marginTop: 24, marginHorizontal: 16 },
});