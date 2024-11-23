Guide to Install and Launch the Application

Using Docker:

    1. Make sure Docker Desktop is open. If it is not installed, download it from the following links:
        Linux: https://docs.docker.com/desktop/install/linux/
        Windows: https://docs.docker.com/desktop/install/windows-install/
        Mac: https://docs.docker.com/desktop/install/mac-install/

    2. Navigate to the project's root directory and run the following command in the terminal: docker compose up --build

Alternatively:

    1. Navigate to the backend directory via the terminal: cd .\backend\
    Inside the backend directory, perform the following steps in the terminal:
    
        1.1. Install the required packages: npm install
        1.2. Populate the MongoDB database: node src\methods\populateMongo.js
        1.3. Start the backend server: npm start

    2. Open a new terminal and navigate to the chroma_python directory: cd .\chroma_python\
    Inside the chroma_python directory, perform the following steps in the terminal:
    
        2.1. Install Flask: pip install flask
        2.2. Install ChromaDB: pip install chromadb
        2.3. Populate the Chroma database: python .\chroma_populate.py
        2.4. Launch the Chroma database endpoint: python .\chroma_endpoint.py
    
    3. Open another terminal and navigate to the frontend directory: cd .\frontend\
        Inside the frontend directory, perform the following steps in the terminal:
    
        3.1. Install the required packages: npm install
        3.2. Start the frontend server: npm start
