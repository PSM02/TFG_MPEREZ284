import chromadb
import json
import os

cwd = os.getcwd()

with open(cwd + '/chroma_python/data/sortedTechniques.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chroma_client = chromadb.PersistentClient(path="./db")
collection = chroma_client.get_or_create_collection(name="techniques_collection")

def techniquesCollection():  
    documents = []
    criterias = []
    ids = []
    i = 0
    for key, value in data.items():
        documents.append(key)
        criterias.append(value)
        ids.append("doc"+i)
        i += 1
    
    collection.upsert(
        documents=documents,
        ids=ids,
        metadatas=criterias
    )
    print("Data inserted")

if __name__ == '__main__':
    # Populate the database before starting the Flask app
    techniquesCollection()
    print("Database populated successfully.")