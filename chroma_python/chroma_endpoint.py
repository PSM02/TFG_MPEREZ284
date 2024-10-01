from flask import Flask, request, jsonify
import chromadb
import json
import os

app = Flask(__name__)

# Initialize your Chroma collection here
chroma_client = chromadb.PersistentClient(path="./chroma_python/db")
collection = chroma_client.get_or_create_collection(name="techniques_collection")

# Sample data
cwd = os.getcwd()
with open(cwd + '/chroma_python/data/sortedTechniques.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def techniquesCollection():  
    documents = []
    criterias = []
    ids = []
    i = 0
    for key, value in data.items():
        item ={}
        item["criterias"] = "_".join(value)
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

@app.route('/query', methods=['GET'])
def query_collection():
    query_text = request.args.get('query_text', default='', type=str)
    n_results = request.args.get('n_results', default=5, type=int)
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    print("Query results:", results)
    return jsonify(results), 200

if __name__ == '__main__':
    # Populate the database before starting the Flask app
    techniquesCollection()
    print("Database populated successfully.")
    
    # Run the Flask app
    app.run(port=5000)