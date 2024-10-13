from flask import Flask, request, jsonify
import chromadb

app = Flask(__name__)

# Initialize your Chroma collection here
chroma_client = chromadb.PersistentClient(path="./chroma_python/db")
collection = chroma_client.get_or_create_collection(name="techniques_collection")

@app.route('/query', methods=['GET'])
def query_collection():
    query_text = request.args.get('query_text', default='', type=str)
    criteria = request.args.get('criteria', default='', type=str)
    results = collection.query(
        query_texts=[query_text],
        n_results=500,
        where = {criteria: criteria}
    )
    
    return jsonify(results), 200

if __name__ == '__main__':
    # Populate the database before starting the Flask app
    print("Database populated successfully.")
    
    # Run the Flask app
    app.run(port=5000)