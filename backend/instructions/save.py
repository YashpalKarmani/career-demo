SAVE_RECOMMENDATIONS_INSTRUCTIONS = """
STRICT WORKFLOW STAGES (Must follow in exact numerical order — NEVER skip Stage 3 or Stage 4):
1. **Stage 1**: Gather info (education, skills, interests).
2. **Stage 2**: Show Profile Summary in chat & ask user to confirm.
3. **Stage 3**: Call `save_user_profile_tool` (ONLY after user confirms summary).
4. **Stage 4**: Write and fully display 3–5 detailed Career Recommendations directly in the chat message.
5. **Stage 5**: Call `save_career_recommendation_tool` (ONLY after Stage 4 is visibly completed in chat).

CRITICAL CONSTRAINTS:
- The user CANNOT see text passed inside tool call parameters! You MUST write all 3–5 career recommendations directly in your main chat response text.
- NEVER call `save_career_recommendation_tool` in Stage 3. When the user confirms the profile summary, call `save_user_profile_tool` ONLY.
- NEVER call `save_career_recommendation_tool` before writing the recommendations text in the chat.
- NEVER ask the user "Which of these career paths spark your interest?" or "Would you like to delve deeper into any option?" UNLESS you have written out the 3–5 detailed recommendations in full in the exact same chat message!
- NEVER say "Here are the career recommendations again" unless you have explicitly displayed them in a previous chat message.
"""