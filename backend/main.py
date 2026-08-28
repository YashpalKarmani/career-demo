import asyncio
import os
import sys
from dotenv import load_dotenv

# Ensure standard output handles UTF-8 (emojis, etc.) correctly on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel, function_tool, set_tracing_disabled
from database import create_session, save_message, save_user_profile_tool, save_career_recommendation_tool
from instructions.base import BASE_INSTRUCTIONS
from instructions.analysis import ANALYSIS_INSTRUCTIONS
from instructions.recommendations import CAREER_RECOMMENDATION_INSTRUCTIONS
from instructions.roadmap import CAREER_ROADMAP_INSTRUCTIONS
from instructions.save import SAVE_RECOMMENDATIONS_INSTRUCTIONS
from instructions.info_gathering import INFO_GATHERING_INSTRUCTIONS
from instructions.profile_summary import PROFILE_SUMMARY_INSTRUCTIONS
from instructions.roman_language_instructions import ROMAN_LANGUAGE_INSTRUCTIONS

load_dotenv()
set_tracing_disabled(True)

# =========================
# ENV VALIDATION
# =========================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BASE_URL = os.getenv("BASE_URL")
MODEL_NAME = os.getenv("MODEL_NAME")

if not GEMINI_API_KEY or not BASE_URL or not MODEL_NAME:
    raise ValueError("Missing environment variables in .env")

client = AsyncOpenAI(api_key=GEMINI_API_KEY, base_url=BASE_URL)
model = OpenAIChatCompletionsModel(openai_client=client, model=MODEL_NAME)

# =========================
# TOOLS
# =========================

@function_tool
async def fetch_job_recommendations(education: str, skills: str, interests: str, location: str = "Pakistan") -> str:
    import httpx
    RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
    if not RAPIDAPI_KEY:
        return "Job API key not configured."

    query_parts = [skills, education, location]
    keywords = " ".join(filter(None, query_parts)).strip()
    if not keywords:
        keywords = f"software entry level jobs in {location}"
    else:
        keywords = f"{keywords} jobs"

    url = "https://jsearch.p.rapidapi.com/search"
    querystring = {"query": keywords, "page": "1", "num_pages": "1"}
    headers = {"X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": "jsearch.p.rapidapi.com"}

    try:
        async with httpx.AsyncClient(timeout=15) as client_http:
            response = await client_http.get(url, headers=headers, params=querystring)
            response.raise_for_status()
            data = response.json()

        raw_jobs = data.get("data") or []
        jobs = raw_jobs[:5]
        if not jobs:
            return "No recent jobs found for your profile."

        output = "**Recommended Jobs Matching Your Profile**\n\n"
        for i, job in enumerate(jobs, 1):
            title = job.get('job_title') or 'N/A'
            company = job.get('employer_name') or 'N/A'
            city = job.get('job_city') or ''
            country = job.get('job_country') or ''
            loc_parts = list(filter(None, [city, country]))
            location_str = ", ".join(loc_parts) or "N/A"
            apply_link = job.get('job_apply_link') or job.get('job_google_link') or '#'

            output += f"{i}. **{title}**\n"
            output += f"   • Company: {company}\n"
            output += f"   • Location: {location_str}\n"
            output += f"   • Apply: {apply_link}\n\n"
        return output
    except Exception as e:
        return f"Could not fetch jobs right now ({str(e)})"

# =========================
# AGENT CONFIG
# =========================

def create_career_agent(session_id="local_session"):
    dynamic_instructions = f"""
    {BASE_INSTRUCTIONS}
    {INFO_GATHERING_INSTRUCTIONS}
    {PROFILE_SUMMARY_INSTRUCTIONS}
    {ANALYSIS_INSTRUCTIONS}
    {CAREER_RECOMMENDATION_INSTRUCTIONS}
    {CAREER_ROADMAP_INSTRUCTIONS}
    {SAVE_RECOMMENDATIONS_INSTRUCTIONS}
    {ROMAN_LANGUAGE_INSTRUCTIONS}

    CURRENT SESSION ID: {session_id}
    """

    return Agent(
        name="Career Counselor",
        instructions=dynamic_instructions,
        tools=[
            fetch_job_recommendations,
            function_tool(save_user_profile_tool),
            function_tool(save_career_recommendation_tool)
        ],
        model=model
    )

# =========================
# MAIN LOOP
# =========================

async def main():
    session_id = create_session()
    agent = create_career_agent(session_id)
    
    # Initialize messages list for conversation history
    messages = []

    print("\n🎓 Welcome to Career Counselor")
    print("---------------------------------")
    print("Agent: Hello! I'm your career advisor. To start, how can I help you today?")

    try:
        while True:
            try:
                user_input = input("\nYou: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n\nAgent: Goodbye! Best of luck with your career.")
                break

            if not user_input:
                continue

            if user_input.lower() in ["exit", "quit", "bye", "end counselling"]:
                print("Agent: Goodbye! Best of luck with your career.")
                break

            # Save user message to DB
            try:
                save_message(session_id, "user", user_input)
            except Exception:
                pass
            
            # Append user input to history
            messages.append({"role": "user", "content": user_input})

            # Run agent
            try:
                result = await Runner.run(agent, input=messages)
                
                # If the agent executed a tool without returning user text, prompt it to generate recommendations
                if not result.final_output:
                    messages = result.to_input_list()
                    messages.append({"role": "user", "content": "Please generate and present 3-5 tailored career recommendations for my profile."})
                    result = await Runner.run(agent, input=messages)

                agent_response = result.final_output if result.final_output else ""

                # Check if response asks user to choose an option or claims options were saved without actually displaying them in text
                lowered_resp = agent_response.lower()
                is_premature = any(p in lowered_resp for p in ["spark your interest", "which of these", "recommendations have been saved", "delve deeper into"])
                has_content = any(c in lowered_resp for c in ["recommended career", "career 1", "option 1", "why it fits"])

                if is_premature and not has_content:
                    messages = result.to_input_list()
                    messages.append({"role": "user", "content": "Please list the 3-5 tailored career recommendations directly in your chat response text so I can view them."})
                    result = await Runner.run(agent, input=messages)
                    agent_response = result.final_output if result.final_output else agent_response

                if not agent_response:
                    agent_response = "Profile details saved. Let's proceed with your tailored career recommendations."

                print(f"\nAgent: {agent_response}")
                
                # Update conversation history for next turn
                messages = result.to_input_list()
                if not result.final_output:
                    messages.append({"role": "assistant", "content": agent_response})

                # Save assistant message to DB
                try:
                    save_message(session_id, "assistant", agent_response)
                except Exception:
                    pass
            except Exception as e:
                print(f"\n Error during agent execution: {e}")
                print("Agent: I'm sorry, I encountered an internal error. Could you try rephrasing that?")

    except Exception as e:
        print(f"\n Critical Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nAgent stopped. Goodbye!")