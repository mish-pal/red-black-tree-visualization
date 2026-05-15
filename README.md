# Red-Black Tree Visualization System

A complete, professional web-based visualization tool for Red-Black Trees. Built with Python (Flask) for backend logic and HTML/CSS/JavaScript (D3.js) for an interactive and visually appealing frontend. 

This project is perfect for students, educators, and developers who want to understand the inner workings of Red-Black Trees, including self-balancing mechanisms, rotations, and recoloring.

## 🚀 Features

### 1. Core Functionalities
- **Insert nodes**: Dynamically add nodes to the Red-Black Tree.
- **Delete nodes**: Remove nodes while maintaining all Red-Black Tree properties.
- **Search nodes**: Visually trace the search path to find a specific node.
- **Traversals**: Execute and display Inorder, Preorder, Postorder, and Level Order traversals.
- **Self-Balancing Animations**: Step-by-step animations for:
  - Left & Right Rotations
  - Node Recoloring (Red/Black)
  - Uncle/Parent/Grandparent checks

### 2. Visualization Requirements
- **D3.js Integration**: Smooth SVG-based tree rendering.
- **Responsive Design**: Auto-adjusting node spacing to prevent overlaps.
- **Interactive UI**: Draggable and zoomable canvas.
- **Highlighting**: Affected nodes are highlighted during operations.

### 3. Educational Enhancements
- **Step-by-step Explanation**: An operation log dynamically updates to explain the algorithmic steps taking place.
- **Complexity Analysis**: Big-O notations displayed for quick reference.
- **Real-Time Statistics**: Tracks tree height, black height, and total number of nodes.

### 4. Professional User Interface
- **Modern Styling**: Dark theme default with a toggleable light mode.
- **Animation Controls**: Adjustable playback speed (Slow, Medium, Fast).
- **Export to SVG**: Download the current tree layout as an image.

## 🛠️ Technology Stack

- **Backend**: Python 3, Flask
- **Frontend**: HTML5, CSS3 (Custom Variables, Flexbox/Grid), Vanilla JavaScript
- **Visualization**: D3.js (Data-Driven Documents)

## 📂 Project Structure

```text
RED_BLACK_TREE/
│
├── static/
│   ├── css/
│   │   └── style.css       # Main UI styling and themes
│   └── js/
│       └── main.js         # Frontend logic, API calls, and D3.js rendering
│
├── templates/
│   └── index.html          # Main HTML structure
│
├── app.py                  # Flask backend server
├── rbtree.py               # Red-Black Tree algorithm implementation
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

## ⚙️ Installation & Usage

### Prerequisites
- Python 3.8+ installed on your system.
- Modern Web Browser (Chrome, Firefox, Safari, Edge).

### Steps to Run Locally

1. **Clone or Download the Repository:**
   ```bash
   git clone <repository_url>
   cd RED_BLACK_TREE
   ```

2. **Create a Virtual Environment (Optional but recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Flask Server:**
   ```bash
   python3 app.py
   ```

5. **Open the Application:**
   Open your web browser and navigate to `http://127.0.0.1:5000`

## 📸 Screenshots
*(Add your screenshots here)*
- **Dark Mode Visualization**
- **Light Mode UI**
- **Rotation Animation Sequence**

## 🔮 Future Enhancements
- Add step-back functionality to reverse operations.
- Support importing trees from JSON or CSV.
- Add specific subtree deletion capabilities.
- Implement an interactive code snippet panel highlighting the executed line of code.

## 📜 License
This project is open-source and available under the MIT License.
