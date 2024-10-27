Aplikazioaren instalazio eta martxan jartzeko gida

    Lehendabizi aukeratu version2.0 proiektuaren bertsioa

    Docker bidez:

        1. Irekita izan docker desktop, instalatuta ez baduzu hemendik descargatu: 
            - Linux: https://docs.docker.com/desktop/install/linux/
            - Windows : https://docs.docker.com/desktop/install/windows-install/
            - Mac : https://docs.docker.com/desktop/install/mac-install/

        2. Proiektuaren erroan egonda hurrengo comandoa exekutatu terminalaren bidez: docker-compose up --build

    Bestela:

        1. Jo backend direktoriora, terminaletik: cd .\backend\

        Backend direktorioan terminaletik hurrengoa egin:

            1. Instalatu beharrezko paketeak: npm install
            2. Mongo datu-basea bete: node src\methods\populateMongo.js
            3. Martxan jarri: npm start
        
        2. Beste terminal bat ireki, eta chroma_python direktoriora jo, terminaletik: cd .\chroma_python\

        Chroma_python direktorioan terminaletik hurrengoa egin:

            1. flask instalatu: pip install flask
            2. chromadb instalatu: pip install chromadb
            3. Datubasea bete: python .\chroma_populate.py
            4. Datubasea martxan jarri: python .\chroma_endpoint.py

       2. Beste terminal bat ireki, eta chroma_python direktoriora jo, terminaletik: cd .\chroma_python\  

            1. Instalatu beharrezko paketeak: npm install
            3. Martxan jarri: npm start