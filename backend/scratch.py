from docx import Document
from app.document_engine import find_experience_bullets

doc = Document("test_resume.docx")
bullets = find_experience_bullets(doc)

print(f"Found {len(bullets)} rewritable bullets:\n")
for b in bullets:
    print(f"  [{b.index}] {b.text[:70]}")