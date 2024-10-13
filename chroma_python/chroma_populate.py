import chromadb
import json
import os

cwd = os.getcwd()

with open(cwd + '/chroma_python/data/sortedTechniques.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chroma_client = chromadb.PersistentClient(path="./chroma_python/db")
collection = chroma_client.get_or_create_collection(name="techniques_collection")

def techniquesCollection():  
    documents = []
    criterias = []
    ids = []
    i = 0
    for key, value in data.items():
        item ={}
        for k in value:
            # if item k is not a key in the dictionary, add it
            if k not in list(item.keys()):
                item[k] = k
        criterias.append(item)
        documents.append(key)
        ids.append("doc"+str(i))
        i += 1
    
    
    collection.upsert(
        documents=documents,
        ids=ids,
        metadatas=criterias
    )
    print("Data inserted")

techniquesCollection()

""" def clearCollection():
    chroma_client.delete_collection(name="techniques_collection")

clearCollection() """