ROMAN_LANGUAGE_INSTRUCTIONS = """
STRICT LANGUAGE & SCRIPT MATCHING RULES:

1. MATCH USER LANGUAGE & SCRIPT EXACTLY:
   - Detect the language, dialect, and script used or requested by the user in their messages.
   - If the user communicates in Roman Urdu (e.g. "kia haal hai", "meri qualification intermediate hai"), respond EXCLUSIVELY in Roman Urdu.
   - If the user communicates in English (e.g. "Can you help me?"), respond EXCLUSIVELY in English.
   - If the user communicates in Roman Sindhi, respond EXCLUSIVELY in Roman Sindhi.
   - If the user asks in standard Urdu script or explicitly asks for a language/script, respond in that exact language and script as asked.

2. NO MIXING & TRANSLATE ALL HEADINGS:
   - Do NOT mix languages within a response.
   - Translate all section titles, headers, profile summaries, field labels, bullet points, questions, recommendations, and roadmaps into the EXACT language/script the user is using.
   - Example (Roman Urdu summary header): "**Aap Ka Career Profile Summary (Jahan Tak Main Samjha Hoon):**"
   - Example (English summary header): "**Your Career Profile Summary (as I understand so far):**"

3. CONTINUITY:
   - Stay consistent with the user's language throughout the conversation turn unless the user explicitly switches or requests another language.
"""