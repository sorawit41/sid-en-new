import re
import json

file_path = '/Users/sorawitsomkongkaew/Desktop/Work/sid-en-new/src/context/AppContext.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will just write a simple regex to extract and replace the arrays, but wait, JS objects aren't strict JSON.
# Instead of doing that, I'll just use multi_replace_file_content and manually paste the updated text.
