from flask import Flask, render_template, request, jsonify
import uuid
from rbtree import RBTree

app = Flask(__name__)
trees = {}

def get_tree(session_id):
    if not session_id or session_id not in trees:
        trees[session_id] = RBTree()
    return trees[session_id]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/insert', methods=['POST'])
def insert():
    data = request.json
    session_id = data.get('session_id')
    val = int(data['value'])
    tree = get_tree(session_id)
    snapshots = tree.insert(val)
    return jsonify({"snapshots": snapshots, "status": "success"})

@app.route('/delete', methods=['POST'])
def delete():
    data = request.json
    session_id = data.get('session_id')
    val = int(data['value'])
    tree = get_tree(session_id)
    snapshots = tree.delete(val)
    return jsonify({"snapshots": snapshots, "status": "success"})

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    session_id = data.get('session_id')
    val = int(data['value'])
    tree = get_tree(session_id)
    snapshots, found = tree.search(val)
    return jsonify({"snapshots": snapshots, "found": found, "status": "success"})

@app.route('/traverse', methods=['POST'])
def traverse():
    data = request.json
    session_id = data.get('session_id')
    order = data.get('order')
    tree = get_tree(session_id)
    
    if order == 'inorder':
        result = tree.inorder()
    elif order == 'preorder':
        result = tree.preorder()
    elif order == 'postorder':
        result = tree.postorder()
    elif order == 'levelorder':
        result = tree.level_order()
    else:
        result = []
        
    return jsonify({"result": result, "status": "success"})

@app.route('/reset', methods=['POST'])
def reset():
    data = request.json
    session_id = data.get('session_id')
    trees[session_id] = RBTree()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
