import google.generativeai as genai

genai.configure(api_key="AIzaSyBTGPfjfo1LkLtfbq5qBhxOD0FiZnsE9uI")

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"Model Name: {m.name}")
