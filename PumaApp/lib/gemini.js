import * as ImagePicker from "expo-image-picker";

const MODEL = "gemini-3.5-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const PROMPT = `You help identify Swedish mushrooms and berries from a photo.
Respond ONLY with JSON in this exact format:
{"found": true/false,
 "suggestions": [{"swedishName": "", "scientificName": "", "confidence": "high/medium/low"}],
 "poisonousLookalikes": [""],
 "comment": ""}
Give at most 3 suggestions. If the photo does not show a mushroom or a berry, set "found" to false.
Never state that anything is safe to eat.
Write all text values in Swedish, except scientificName. Keep the JSON keys and the confidence values in English.`;

export async function identify(source)
{
	const options = { base64: true, quality: 0.4, mediaTypes: ["images"] };
	let result;

	if (source === "camera")
	{
		const permission = await ImagePicker.requestCameraPermissionsAsync();
		if (!permission.granted)
		{
			throw new Error("Appen behöver tillgång till telefonens kamera");
		}
		result = await ImagePicker.launchCameraAsync(options);
	}
	else
	{
		result = await ImagePicker.launchImageLibraryAsync(options);
	}

	if (result.canceled)
	{
		return null;
	}

	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-goog-api-key": process.env.EXPO_PUBLIC_GEMINI_KEY,
		},
		body: JSON.stringify({
			contents: [{ parts: [
				{ inline_data: { mime_type: "image/jpeg", data: result.assets[0].base64 } },
				{ text: PROMPT },
			]}],
			generationConfig: { responseMimeType: "application/json" },
		}),
	});

	if (response.status === 429)
	{
		throw new Error("Gränsen för antal identifieringar är nådd, försök igen senare");
	}

	if (!response.ok)
	{
		const details = await response.text();
		throw new Error(`Något gick fel (felkod ${response.status}).\nURL: ${API_URL}\n${details}`);
	}

	const data = await response.json();
	return JSON.parse(data.candidates[0].content.parts[0].text);
}