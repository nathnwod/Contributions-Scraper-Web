from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
from matcher import findContributions, exportExcel


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


@app.route('/exportExcel', methods=['POST'])
def export_excel_route():
    data = request.get_json()
    results = data['results']
    mode = data.get('mode', 'default') #falls back to 'default'
    buffer = exportExcel(results, mode)
    
    return send_file(
        buffer,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='contributions.xlsx'  # fallback 
    )
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)