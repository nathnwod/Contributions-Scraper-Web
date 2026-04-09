from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from matcher import findContributions

# backend flask server that takes files and runs them through a python function findContributions 

app = Flask(__name__)
CORS(app)  # allows React to talk to Flask

@app.route('/scrape', methods=['POST'])
def scrape():
    files = request.files.getlist('pdfs')
    
    if not files:
        return jsonify({'error': 'No files uploaded'}), 400

    # save uploaded files temporarily so matcher.py can read them
    temp_paths = []
    for file in files:
        temp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        file.save(temp.name)
        temp.close()
        temp_paths.append(temp.name)
        

    try:
        results = findContributions(temp_paths)
        return jsonify(results) #puts results into json format so data can be sent by HTTP
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # clean up temp files after we're done
        for path in temp_paths:
            os.unlink(path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)