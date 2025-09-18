import os, tkinter as tk
from tkinter import ttk, messagebox

SEPARATOR = "-" * 52
OUTPUT_FILE = "selected_files.txt"

def build_tree_dict(root="."):
    tree = {}
    for dirpath, dirnames, filenames in os.walk(root):
        parts = os.path.relpath(dirpath, root).split(os.sep)
        node = tree
        if parts != ['.']:
            for p in parts:
                node = node.setdefault(p, {})
        for f in filenames:
            node.setdefault('__files__', []).append(f)
    return tree

class TreeCheckApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Select Files")
        self.geometry("600x400")
        self.tree = ttk.Treeview(self, columns=('checked',), show='tree')
        self.tree.pack(fill='both', expand=True)
        self.checked = {}  # item_id -> bool

        # build the underlying dict
        tree_dict = build_tree_dict('.')
        self._populate('', tree_dict)
        self.tree.bind('<Double-1>', self._on_toggle)

        submit = ttk.Button(self, text="Submit", command=self._on_submit)
        submit.pack(pady=5)

    def _populate(self, parent_id, subtree):
        # first add subdirs
        for name, branch in subtree.items():
            if name == '__files__':
                continue
            node_id = self.tree.insert(parent_id, 'end', text=name, open=False)
            self._populate(node_id, branch)
        # then add files
        for fname in subtree.get('__files__', []):
            full = self._full_path(parent_id, fname)
            item_id = self.tree.insert(parent_id, 'end', text=fname)
            self.checked[item_id] = False
            self.tree.set(item_id, 'checked', '☐')  # start unchecked

    def _full_path(self, item_id, fname):
        # reconstruct the path from the tree
        parts = []
        while item_id:
            parts.append(self.tree.item(item_id, 'text'))
            item_id = self.tree.parent(item_id)
        parts.reverse()
        return os.path.join(*parts, fname)

    def _on_toggle(self, event):
        iid = self.tree.focus()
        if iid in self.checked:
            self.checked[iid] = not self.checked[iid]
            self.tree.set(iid, 'checked', '☑' if self.checked[iid] else '☐')

    def _on_submit(self):
        selected = [iid for iid, ok in self.checked.items() if ok]
        if not selected:
            messagebox.showinfo("No selection", "Please check at least one file.")
            return

        with open(OUTPUT_FILE, 'w', encoding='utf-8') as outf:
            for idx, iid in enumerate(selected):
                rel = self._full_path(self.tree.parent(iid), self.tree.item(iid, 'text'))
                outf.write(rel + "\n")
                try:
                    with open(rel, 'r', encoding='utf-8') as inf:
                        outf.write(inf.read())
                except Exception as e:
                    outf.write(f"[ERROR reading file: {e}]\n")
                if idx < len(selected) - 1:
                    outf.write(f"\n{SEPARATOR}\n\n")
        messagebox.showinfo("Done", f"Wrote {len(selected)} files to {OUTPUT_FILE}")

if __name__ == "__main__":
    TreeCheckApp().mainloop()