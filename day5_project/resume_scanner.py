import os
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel

load_dotenv()
my_api_key = os.getenv("GROQ_API_KEY")

if not my_api_key:
    raise ValueError("API key nhi h veere !!")
    
client = Groq(api_key=my_api_key)
model = "llama-3.3-70b-versatile"

class Resume(BaseModel):
    skills:str
    match_percent:str
    top_2:bool
schema = Resume.model_json_schema()

response_format={
    "type": "json_object"
}

system_prompt=f"""
    Extract information from the Resume strictly based on this {schema} and give me a json output
"""
message_system={
    "role":"system",
    "content":system_prompt
}


job_description=""
resume_text = f"""
    Job Title: Junior Frontend Developer

Location: Bangalore, India
Experience: 0-2 Years
Employment Type: Full-Time

About the Role

We are looking for a passionate Junior Frontend Developer to join our engineering team. The ideal candidate should have a strong understanding of modern web development, be eager to learn new technologies, and enjoy building responsive and user-friendly web applications.

Responsibilities

- Develop responsive web applications using React.js.
- Build reusable UI components.
- Convert Figma designs into pixel-perfect interfaces.
- Collaborate with designers and backend developers.
- Consume REST APIs and display dynamic data.
- Debug and fix frontend issues.
- Optimize applications for speed and performance.
- Write clean, maintainable, and reusable code.
- Participate in code reviews and team discussions.
- Learn and adopt best development practices.

Required Skills

- HTML5
- CSS3
- JavaScript (ES6+)
- React.js
- Responsive Web Design
- Git & GitHub
- REST APIs
- npm
- Basic debugging skills
- Problem-solving ability

Preferred Skills

- TypeScript
- Tailwind CSS
- Material UI
- Redux or Context API
- Next.js
- Vite
- Basic Node.js knowledge
- MongoDB basics
- SQL fundamentals

Qualifications

- Bachelor's degree in Computer Science or related field.
- Strong understanding of frontend fundamentals.
- Good communication skills.
- Ability to work in a collaborative environment.
- Willingness to learn and adapt.

Nice to Have

- Personal projects on GitHub.
- Internship experience.
- Familiarity with Agile development.
- Understanding of web accessibility.
- Knowledge of browser developer tools.

Benefits

- Flexible work hours
- Hybrid work model
- Health insurance
- Learning and certification support
- Mentorship from senior engineers
- Career growth opportunities
"""
from pypdf import PdfReader
reader = PdfReader("resume_Chayan_Sehgal.pdf")
for page in reader.pages:
    resume_text += page.extract_text() + "\n"

prompt = f"""
Resume:

{resume_text}

Extract:
- skills
- match_percent based on this {job_description}
- top_2

Return only JSON.
"""
message={
        "role": "user",
        "content": prompt
    }
messages = [message_system, message]
response = client.chat.completions.create(model=model, messages=messages, response_format=response_format) 
answer = response.choices[0].message.content
print(answer)

# isko padhna kaise h lekin ?
# import json
# raw_json=answer
# data_file=json.loads(raw_json) #json.loads-> converts json string to python dictionary
# resume=Resume(**data_file) # **data_file -> unpacking the dictionary and passing the values to the Ticket class constructor
# print(resume.skills)
# print(resume.match_percent)
# print(resume.top_2)