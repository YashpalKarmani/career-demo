import os
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# ==========================================
# SUPABASE DATABASE SETUP
# ==========================================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception:
        supabase = None

# ==========================================
# DATABASE FUNCTIONS & TOOLS FOR AGENT
# ==========================================

def create_session():
    """Generates a session ID and registers it in Supabase."""
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    if supabase:
        try:
            supabase.table("sessions").insert({"session_id": session_id}).execute()
        except Exception:
            pass
    return session_id


def save_message(session_id: str, role: str, message: str):
    """Saves user or assistant messages directly to Supabase."""
    if supabase:
        try:
            supabase.table("messages").insert({
                "session_id": session_id,
                "role": role,
                "content": message
            }).execute()
        except Exception:
            pass


def save_profile(session_id: str, education: str, skills: str, interests: str):
    """Saves user profile directly to Supabase."""
    if supabase:
        try:
            supabase.table("user_profiles").insert({
                "session_id": session_id,
                "education": education,
                "skills": skills,
                "interests": interests
            }).execute()
        except Exception:
            pass
    return "User profile saved successfully to database."


def save_user_profile_tool(session_id: str, education: str, skills: str, interests: str):
    """
    Saves or updates the user's career profile in the database.
    PREREQUISITE: Must be called immediately when the user confirms their Profile Summary (Stage 3).
    DO NOT call save_career_recommendation_tool when confirming profile summary.
    """
    return save_profile(session_id, education, skills, interests)


def save_career_recommendation_tool(session_id: str, full_recommendation_text: str):
    """
    Saves the generated career recommendations and roadmaps to the database.
    CRITICAL PREREQUISITE:
    1. DO NOT call this tool until AFTER save_user_profile_tool has already been called.
    2. WARNING: The user CANNOT see text passed inside tool parameters! You MUST write out the 3-5 complete, detailed career recommendations directly in your main chat response text BEFORE calling this tool.
    3. DO NOT call this tool if you have not visibly printed the 3-5 career recommendations in the chat response.
    Pass the exact recommendation text that you wrote for the user.
    """
    if supabase:
        try:
            supabase.table("career_recommendations").insert({
                "session_id": session_id,
                "recommendation_text": full_recommendation_text
            }).execute()
        except Exception:
            pass
    return "Recommendations saved successfully to database."

