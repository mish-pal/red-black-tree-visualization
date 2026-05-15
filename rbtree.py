class Node:
    def __init__(self, data):
        self.data = data
        self.parent = None
        self.left = None
        self.right = None
        self.color = 1 # 1 is Red, 0 is Black

class RBTree:
    def __init__(self):
        self.TNULL = Node(0)
        self.TNULL.color = 0
        self.TNULL.left = None
        self.TNULL.right = None
        self.root = self.TNULL
        self.snapshots = []

    def get_dict(self, node):
        if node == self.TNULL or node is None:
            return {"val": "NIL", "color": "black", "isNull": True}
        return {
            "val": node.data,
            "color": "red" if node.color == 1 else "black",
            "left": self.get_dict(node.left),
            "right": self.get_dict(node.right),
            "isNull": False
        }

    def take_snapshot(self, message, highlight=None, code_line=""):
        if highlight is None:
            highlight = []
        self.snapshots.append({
            "tree": self.get_dict(self.root),
            "message": message,
            "highlight": highlight,
            "code_line": code_line
        })

    def insert(self, key):
        self.snapshots = []
        node = Node(key)
        node.parent = None
        node.data = key
        node.left = self.TNULL
        node.right = self.TNULL
        node.color = 1 
        
        y = None
        x = self.root
        
        while x != self.TNULL:
            y = x
            self.take_snapshot(f"Comparing {key} with {x.data}...", [x.data], "line-i2")
            if node.data < x.data:
                x = x.left
            elif node.data > x.data:
                x = x.right
            else:
                self.take_snapshot(f"Node {key} already exists.", [key], "line-i2")
                return self.snapshots
        
        node.parent = y
        if y == None:
            self.root = node
        elif node.data < y.data:
            y.left = node
        else:
            y.right = node
            
        self.take_snapshot(f"Inserted node {key} as RED.", [key], "line-i3")
            
        if node.parent == None:
            node.color = 0
            self.take_snapshot(f"Root node {key} recolored to BLACK.", [key], "line-i13")
            return self.snapshots
            
        if node.parent.parent == None:
            return self.snapshots
            
        self.take_snapshot(f"Checking properties...", [key], "line-i4")
        self.fix_insert(node)
        return self.snapshots

    def fix_insert(self, k):
        while k.parent.color == 1:
            if k.parent == k.parent.parent.right:
                u = k.parent.parent.left 
                self.take_snapshot(f"Fetching Uncle...", [u.data if u != self.TNULL else "NIL"], "line-i5")
                if u.color == 1:
                    self.take_snapshot(f"Uncle {u.data if u != self.TNULL else 'NIL'} is RED. Recoloring parent, uncle, and grandparent.", [k.data, k.parent.data, u.data, k.parent.parent.data], "line-i7")
                    u.color = 0
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    k = k.parent.parent
                    self.take_snapshot(f"Now checking grandparent {k.data}.", [k.data], "line-i8")
                else:
                    if k == k.parent.left:
                        self.take_snapshot(f"Triangle Case: Node {k.data} is Left child, Parent is Right. Right Rotation on Parent.", [k.data, k.parent.data], "line-i10")
                        k = k.parent
                        self.right_rotate(k)
                        self.take_snapshot(f"After Right Rotation.", [k.data], "line-i10")
                    self.take_snapshot(f"Line Case: Recoloring Parent to BLACK, Grandparent to RED, and Left Rotation on Grandparent.", [k.parent.data, k.parent.parent.data], "line-i11")
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    self.left_rotate(k.parent.parent)
                    self.take_snapshot(f"After Left Rotation and Recoloring.", [k.parent.data], "line-i12")
            else:
                u = k.parent.parent.right 
                self.take_snapshot(f"Fetching Uncle...", [u.data if u != self.TNULL else "NIL"], "line-i5")
                if u.color == 1:
                    self.take_snapshot(f"Uncle {u.data if u != self.TNULL else 'NIL'} is RED. Recoloring parent, uncle, and grandparent.", [k.data, k.parent.data, u.data, k.parent.parent.data], "line-i7")
                    u.color = 0
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    k = k.parent.parent
                    self.take_snapshot(f"Now checking grandparent {k.data}.", [k.data], "line-i8")
                else:
                    if k == k.parent.right:
                        self.take_snapshot(f"Triangle Case: Node {k.data} is Right child, Parent is Left. Left Rotation on Parent.", [k.data, k.parent.data], "line-i10")
                        k = k.parent
                        self.left_rotate(k)
                        self.take_snapshot(f"After Left Rotation.", [k.data], "line-i10")
                    self.take_snapshot(f"Line Case: Recoloring Parent to BLACK, Grandparent to RED, and Right Rotation on Grandparent.", [k.parent.data, k.parent.parent.data], "line-i11")
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    self.right_rotate(k.parent.parent)
                    self.take_snapshot(f"After Right Rotation and Recoloring.", [k.parent.data], "line-i12")
            if k == self.root:
                break
            self.take_snapshot(f"Checking properties...", [k.data], "line-i4")
        if self.root.color == 1:
            self.root.color = 0
            self.take_snapshot("Root property restored: Root is BLACK.", [self.root.data], "line-i13")

    def left_rotate(self, x):
        y = x.right
        x.right = y.left
        if y.left != self.TNULL:
            y.left.parent = x
            
        y.parent = x.parent
        if x.parent == None:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y

    def right_rotate(self, x):
        y = x.left
        x.left = y.right
        if y.right != self.TNULL:
            y.right.parent = x
            
        y.parent = x.parent
        if x.parent == None:
            self.root = y
        elif x == x.parent.right:
            x.parent.right = y
        else:
            x.parent.left = y
        y.right = x
        x.parent = y

    def search(self, key):
        self.snapshots = []
        node = self.root
        path = []
        while node != self.TNULL:
            path.append(node.data)
            self.take_snapshot(f"Comparing with {node.data}...", path.copy(), "line-i2")
            if key == node.data:
                self.take_snapshot(f"Found {key}!", path.copy(), "line-i2")
                return self.snapshots, True
            elif key < node.data:
                node = node.left
            else:
                node = node.right
        self.take_snapshot(f"{key} not found.", path.copy(), "line-i2")
        return self.snapshots, False

    def delete(self, key):
        self.snapshots = []
        self.__delete_node_helper(self.root, key)
        return self.snapshots

    def rb_transplant(self, u, v):
        if u.parent == None:
            self.root = v
        elif u == u.parent.left:
            u.parent.left = v
        else:
            u.parent.right = v
        v.parent = u.parent

    def minimum(self, node):
        while node.left != self.TNULL:
            node = node.left
        return node

    def __delete_node_helper(self, node, key):
        z = self.TNULL
        while node != self.TNULL:
            if node.data == key:
                z = node
                break
            if node.data < key:
                node = node.right
            else:
                node = node.left

        if z == self.TNULL:
            self.take_snapshot(f"Node {key} not found.", [])
            return

        self.take_snapshot(f"Found node {key} to delete.", [z.data], "line-d1")
        y = z
        y_original_color = y.color
        if z.left == self.TNULL:
            x = z.right
            self.rb_transplant(z, z.right)
        elif z.right == self.TNULL:
            x = z.left
            self.rb_transplant(z, z.left)
        else:
            y = self.minimum(z.right)
            y_original_color = y.color
            x = y.right
            if y.parent == z:
                x.parent = y
            else:
                self.rb_transplant(y, y.right)
                y.right = z.right
                y.right.parent = y

            self.rb_transplant(z, y)
            y.left = z.left
            y.left.parent = y
            y.color = z.color
            
        self.take_snapshot(f"Removed node {key}. Adjusting tree...", [], "line-d2")
        if y_original_color == 0:
            self.take_snapshot(f"Deleted node was BLACK. Proceeding to fix tree...", [], "line-d3")
            self.fix_delete(x)
        self.take_snapshot(f"Deletion complete.", [])

    def fix_delete(self, x):
        while x != self.root and x.color == 0:
            if x == x.parent.left:
                s = x.parent.right
                if s.color == 1:
                    self.take_snapshot(f"Sibling is RED. Recoloring and Left Rotation.", [x.data, s.data], "line-d5")
                    s.color = 0
                    x.parent.color = 1
                    self.left_rotate(x.parent)
                    s = x.parent.right

                if s.left.color == 0 and s.right.color == 0:
                    self.take_snapshot(f"Sibling's children are BLACK. Sibling recolored to RED.", [s.data], "line-d7")
                    s.color = 1
                    x = x.parent
                else:
                    if s.right.color == 0:
                        self.take_snapshot(f"Sibling's Right is BLACK. Recoloring and Right Rotation on Sibling.", [s.data], "line-d9")
                        s.left.color = 0
                        s.color = 1
                        self.right_rotate(s)
                        s = x.parent.right

                    self.take_snapshot(f"Sibling's Right is RED. Recoloring and Left Rotation on Parent.", [x.parent.data], "line-d10")
                    s.color = x.parent.color
                    x.parent.color = 0
                    s.right.color = 0
                    self.left_rotate(x.parent)
                    x = self.root
            else:
                s = x.parent.left
                if s.color == 1:
                    self.take_snapshot(f"Sibling is RED. Recoloring and Right Rotation.", [x.data, s.data], "line-d5")
                    s.color = 0
                    x.parent.color = 1
                    self.right_rotate(x.parent)
                    s = x.parent.left

                if s.right.color == 0 and s.left.color == 0:
                    self.take_snapshot(f"Sibling's children are BLACK. Sibling recolored to RED.", [s.data], "line-d7")
                    s.color = 1
                    x = x.parent
                else:
                    if s.left.color == 0:
                        self.take_snapshot(f"Sibling's Left is BLACK. Recoloring and Left Rotation on Sibling.", [s.data], "line-d9")
                        s.right.color = 0
                        s.color = 1
                        self.left_rotate(s)
                        s = x.parent.left

                    self.take_snapshot(f"Sibling's Left is RED. Recoloring and Right Rotation on Parent.", [x.parent.data], "line-d10")
                    s.color = x.parent.color
                    x.parent.color = 0
                    s.left.color = 0
                    self.right_rotate(x.parent)
                    x = self.root
        if x.color == 1:
            self.take_snapshot(f"Node is RED, recoloring to BLACK to restore property.", [x.data if x.data != 0 else 'NIL'], "line-d11")
        x.color = 0

    def inorder(self, node=None, res=None):
        if res is None:
            node = self.root
            res = []
        if node != self.TNULL:
            self.inorder(node.left, res)
            res.append(node.data)
            self.inorder(node.right, res)
        return res

    def preorder(self, node=None, res=None):
        if res is None:
            node = self.root
            res = []
        if node != self.TNULL:
            res.append(node.data)
            self.preorder(node.left, res)
            self.preorder(node.right, res)
        return res

    def postorder(self, node=None, res=None):
        if res is None:
            node = self.root
            res = []
        if node != self.TNULL:
            self.postorder(node.left, res)
            self.postorder(node.right, res)
            res.append(node.data)
        return res

    def level_order(self):
        res = []
        if self.root == self.TNULL:
            return res
        queue = [self.root]
        while queue:
            node = queue.pop(0)
            res.append(node.data)
            if node.left != self.TNULL:
                queue.append(node.left)
            if node.right != self.TNULL:
                queue.append(node.right)
        return res
